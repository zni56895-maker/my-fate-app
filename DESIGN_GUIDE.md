# 星系极简主义设计规范 (Galactic Minimalism Design System)

> 核心哲学：极高留白、统一光影、降噪层级。

---

## 1. 色板

### 文字透明度层级（唯一控制对比度的手段，禁止使用不同色相）

| 层级 | Token | 用途 | 示例 |
|------|-------|------|------|
| 0 – 极淡 | `text-white/10` | 辅助标签背景 | 四柱标签、占位符 |
| 1 – 辅助 | `text-white/20` | 副标题、非常辅助信息 | `年 月 日 时` 标签（旧版本）|
| 2 – 索引 | `text-white/30` | 导航未选中、次要数据 | SVG 图标默认色、纳音 |
| 3 – 可读 | `text-white/50` ~ `/60` | 正文数据、输入值 | 卡片内数字、神煞列表 |
| 4 – 强调 | `text-white/70` ~ `/80` | 选中项、重要信息 | 选中导航、干支辅助文字 |
| 5 – 最高 | `text-white/90` ~ `text-white` | 核心视觉锚点 | 干支大字 `text-white` |

### 功能色（极有限使用，仅用于五行/吉凶标识）

```
木: #4ecdc4 (青)    火: #ff6b6b (赤)
土: #f9ca24 (金)    金: #a0a0c0 (银)
水: #4834d4 (靛)
吉: #f0c040         凶: #e04040
```

---

## 2. 文字系统

### 字号阶

| 层级 | Class | 典型用途 |
|------|-------|----------|
| 微型 | `text-[10px]` | 滚动条标签、极次要信息 |
| 小 | `text-xs` | 副标题、纳音、辅助文字 |
| 正文 | `text-sm` | 表单标签、导航文字、神煞 |
| 中等 | `text-base` | 卡片数值 |
| 大 | `text-lg` ~ `text-xl` | 稍强调的数据 |
| 核心 | `text-3xl md:text-4xl` | **干支大字** — 唯一视觉锚点 |

### 字重

| 语境 | 字重 |
|------|------|
| 核心锚点（干支） | `font-thin` / `font-light` |
| 正文/数据 | `font-light` / `font-normal` |
| 神煞/批注 | `font-normal`（默认）|
| ❌ 禁用 | `font-bold`、`font-semibold`（无星系感）|

### 字体

- **汉字**: `PingFang SC` / `Microsoft YaHei`（默认 sans 栈）
- **数字**: `font-mono` 等宽（精密索引感）

---

## 3. 间距系统

### 核心间距倍率（每步 4px）

| Token | px | 使用场景 |
|-------|----|----------|
| `gap-1` | 4px | SVG 图标与文字间隙 |
| `gap-2` | 8px | 内联元素间隙 |
| `gap-3` | 12px | 卡片内垂直间距 |
| `gap-4`~`gap-6` | 16–24px | 段内组件间距 |
| `gap-8` | 32px | 卡片矩阵列间距（呼吸） |
| `my-16` | 64px | 大区块分隔（阴阳锚点隔离带）|
| `pt-16 md:pt-20` | 64–80px | 页面顶部留白 |

### 负空间原则

- **区块间留白优先于分割线**
- 分割线只能使用 `0.5px` 渐变光束（`linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)`）
- 禁止使用 `border-1` 或更厚的实体线

---

## 4. 容器规范

### 输入卡片

```css
bg-white/[0.04] border border-white/5 backdrop-blur-sm
h-10 rounded-sm text-base font-mono text-white/60
```

- 微透明，仅提供极微弱边界
- 无法向用户输出任何 CSS `shadow`、不设 `bg-gradient`
- 本质上是一个"刻在星空上的数值槽"

### 浮层

```css
bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-sm
```

- `max-h-40` 限制高度，选中态仅以 `text-sky-300` 文字色标记
- 出现动画 `fade-in 0.3s ease-out`（opacity 0→1, translateY -2px→0）

### ❌ 禁止项

所有组件不得出现以下格式：
- `bg-slate-900/40`、`bg-purple-500/10` 等色相背景
- `border-purple-500/20`、`border-amber-500/20` 等彩色边框
- `rounded-xl`、`rounded-2xl`
- `shadow-glow`、`shadow-lg` 等投影类
- `backdrop-blur-lg`（→ 统一为 `backdrop-blur-sm` 或 `md`）
- 任何 emoji 图标（→ 替换为 stroke-width 1 的 SVG Line Art）

---

## 5. 统一样式模式

### 光束渐变线（0.5px）

```css
background: linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent);
height: 0.5px;
```

用途：选中态下划线、输入卡片组与排盘区间隔线

### SVG 线条图标规范

```html
<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1">
```

- `viewBox="0 0 16 16"` 统一视口
- `stroke-width="1"` 极细线条
- 禁止填充色
- 颜色继承自父元素的 `text-white/30` → `text-white`（hover 或 active）

### 按钮风格

- 选中态：纯文字 `text-white` + 底部 0.5px 渐变光束线
- 未选中态：`text-white/20 border-transparent`
- 无填充背景、无圆角背景块

---

## 6. 动画

| 动画 | 时间 | 适用场景 |
|------|------|----------|
| `float 3s ease-in-out infinite` | 3s | 干支大字漂浮（参差延迟 0/0.5/1/1.5s）|
| `fade-in 0.3s ease-out forwards` | 0.3s | 浮层出现 |
| `transition-all duration-300` | 0.3s | 悬停/选中过渡 |
| `transition-colors duration-300` | 0.3s | 纯文字颜色过渡 |

---

## 7. CSS 声明顺序（推荐）

```
布局(position/display/flex/grid) → 尺寸(width/height) → 
间距(margin/padding/gap) → 背景/边框(background/border/backdrop) → 
文字(font/text/color) → 动画(transition/animation) → 杂项(outline/cursor)
```

---

*本规范自动生成于 2026-06-03，由全组件扫描 + Galactic Minimalism 约束推断形成。*
