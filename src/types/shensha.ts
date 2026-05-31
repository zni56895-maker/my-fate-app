/**
 * 神煞 — TypeScript 类型定义
 */

import type { JiXiong } from './bazi'

/** 神煞计算结果 */
export interface ShenShaResult {
  name: string             // 中文名，如"文昌贵人"
  type: JiXiong            // 吉/凶/中性
  category: 'library' | 'custom'  // 来源：库自带 或 自定义
  meaning: string          // 现代心理学释义（从字典提取）
}

/** 扩展神煞结果（含心理学关键词和建议） */
export interface ShenShaResultExtended extends ShenShaResult {
  psychKeywords: string[]  // 如 ["艺术", "孤独", "创造力"]
  adviceText: string       // AI 风格的建议文本
}

/** 神煞字典条目 */
export interface ShenShaDictEntry {
  name: string
  type: JiXiong
  meaning: string           // 纯命理解释
  psychKeywords: string[]   // 心理学关键词
  modernInterpretation: string // 现代心理学释义（完整版）
  adviceText: string        // 友好建议
}
