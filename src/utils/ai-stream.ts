/**
 * AI 流式请求工具
 *
 * 使用 fetch + ReadableStream + AsyncGenerator 实现 SSE 流式请求。
 * 兼容 OpenAI / DeepSeek 等兼容 API 格式。
 *
 * 标准 OpenAI 流式响应格式：
 *   data: {"id":"...","choices":[{"delta":{"content":"你好"}}]}
 *   data: {"id":"...","choices":[{"delta":{"content":"世界"}}]}
 *   data: [DONE]
 */

import type { APIConfig } from '@/types/config'

/** 流式响应的单个 chunk */
export interface StreamChunk {
  /** 本次增量文本 */
  content: string
  /** 是否流式结束 */
  done: boolean
  /** 错误信息（如果发生错误） */
  error?: string
}

/**
 * 流式请求的 AsyncGenerator
 *
 * 使用示例：
 * ```ts
 * for await (const chunk of streamAIResponse(config, messages)) {
 *   if (chunk.error) { /* 处理错误 *​/ }
 *   console.log(chunk.content) // 增量文本
 * }
 * ```
 */
export async function* streamAIResponse(
  apiConfig: APIConfig,
  messages: Array<{ role: string; content: string }>,
): AsyncGenerator<StreamChunk> {
  const { apiKey, baseUrl, modelName } = apiConfig

  // 拼接请求地址
  const url = `${baseUrl.replace(/\/+$/, '')}/v1/chat/completions`

  const body = {
    model: modelName,
    messages,
    stream: true,
    temperature: 0.8,
    max_tokens: 2048,
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
  } catch (err: any) {
    yield { content: '', done: true, error: `网络请求失败：${err.message || '请检查网络连接和 API 地址'}` }
    return
  }

  // 检查 HTTP 状态
  if (!response.ok) {
    let errorMsg = `API 返回错误 (${response.status})`
    try {
      const errorBody = await response.text()
      errorMsg += `：${errorBody.slice(0, 200)}`
    } catch { /* ignore */ }
    yield { content: '', done: true, error: errorMsg }
    return
  }

  // 读取流
  const reader = response.body?.getReader()
  if (!reader) {
    yield { content: '', done: true, error: '浏览器不支持流式读取（ReadableStream）' }
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // 解码数据块
      buffer += decoder.decode(value, { stream: true })

      // 按行分割
      const lines = buffer.split('\n')
      // 最后一行可能不完整，保留到下一次
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        // SSE 数据行格式：data: {...} 或 data: [DONE]
        if (!trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()

        // 流结束标记
        if (data === '[DONE]') {
          yield { content: '', done: true }
          return
        }

        // 解析 JSON
        try {
          const json = JSON.parse(data)
          const content = json?.choices?.[0]?.delta?.content
          if (content) {
            yield { content, done: false }
          }
        } catch {
          // 某些行可能是非 JSON 格式，跳过
          continue
        }
      }
    }

    // 处理 buffer 中剩余的数据
    if (buffer.trim()) {
      const trimmed = buffer.trim()
      if (trimmed.startsWith('data:') && trimmed.slice(5).trim() !== '[DONE]') {
        try {
          const json = JSON.parse(trimmed.slice(5).trim())
          const content = json?.choices?.[0]?.delta?.content
          if (content) {
            yield { content, done: false }
          }
        } catch { /* ignore */ }
      }
    }
  } catch (err: any) {
    yield { content: '', done: true, error: `流式读取中断：${err.message || '未知错误'}` }
    return
  } finally {
    reader.releaseLock()
  }

  yield { content: '', done: true }
}
