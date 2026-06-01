/**
 * 压力测试脚本 — 模拟3种极端盘面
 * Run: npx tsx test/stress-test.ts
 */
import { buildDimScores, } from '../src/constants/fortuneDatabase.js'

type DimName = '财富' | '事业' | '情感' | '学业'

/** 模拟三种盘面 */
const testCases = [
  {
    label: 'A: 全吉星 · 用神旺相',
    hitNames: [
      '天乙贵人','天德贵人','月德合','天德合','三奇贵人','天赦',
      '禄神','文昌贵人','将星','金舆贵人','天官贵人','金神',
      '红鸾','天喜','天作之合','五行正印',
    ],
    todayTenGod: '正财',
    dayMaster: '丙' as any,
    dailyGan: '甲' as any,
    dailyGanZhi: '甲子',
  },
  {
    label: 'B: 全凶星 · 用神休囚 · 世爻空亡',
    hitNames: [
      '羊刃','飞刃','血支','血忌','天罗地网','阴阳差错',
      '孤辰','寡宿','亡神','劫煞','元辰','四废','十恶大败',
      '丧门','白虎','大耗','小耗','病符','太岁','岁破',
      '空亡','童子','血刃','六厄','灾煞',
    ],
    todayTenGod: '七杀',
    dayMaster: '甲' as any,
    dailyGan: '庚' as any,
    dailyGanZhi: '庚申',
  },
  {
    label: 'C: 吉凶混杂 · 中性',
    hitNames: [
      '天乙贵人','月德贵人','禄神','将星','华盖','金舆贵人',
      '羊刃','劫煞','亡神','孤辰','空亡',
      '驿马','咸池桃花','天马',
    ],
    todayTenGod: '食神',
    dayMaster: '戊' as any,
    dailyGan: '丙' as any,
    dailyGanZhi: '丙午',
  },
]

console.log('')

for (const tc of testCases) {
  console.log(`╔═══════════════════════════════════════════════╗`)
  console.log(`║  ${tc.label.padEnd(44)}║`)
  console.log(`╚═══════════════════════════════════════════════╝`)
  console.log(`神煞列表: ${tc.hitNames.join(', ')}`)
  console.log(`今日十神: ${tc.todayTenGod}  日主: ${tc.dayMaster}  流日: ${tc.dailyGanZhi}`)
  console.log('')

  // 四维明细（与 fortuneDatabase.ts 中 TEN_GOD_DIM_OFFSET 同步）
  const tgOffset: any = {
    '正财':{wealth:10,career:4,emotion:0,study:2},
    '偏财':{wealth:12,career:4,emotion:3,study:0},
    '正官':{wealth:3,career:10,emotion:0,study:3},
    '七杀':{wealth:3,career:12,emotion:-2,study:3},
    '正印':{wealth:2,career:2,emotion:5,study:12},
    '偏印':{wealth:0,career:2,emotion:4,study:14},
    '比肩':{wealth:2,career:3,emotion:2,study:2},
    '劫财':{wealth:-3,career:4,emotion:4,study:0},
    '食神':{wealth:4,career:2,emotion:10,study:10},
    '伤官':{wealth:4,career:0,emotion:10,study:12},
    '日主':{wealth:3,career:3,emotion:3,study:3},
  }[tc.todayTenGod] || {wealth:0,career:0,emotion:0,study:0}

  const dims = buildDimScores(tc.hitNames, tgOffset)

  const dimLabels: Record<string, string> = {wealth:'财富',career:'事业',emotion:'情感',study:'学业'}
  const colors: Record<string, string> = {wealth:'#f0c040',career:'#6c5ce7',emotion:'#f472b6',study:'#4ecdc4'}

  for (const d of dims) {
    console.log(`  ${d.label}: ${d.value}分  ${d.color}`)
  }

  // 总分
  let total = 0
  for (const d of dims) total += d.value
  const avg = Math.round(total / dims.length)
  console.log(`  ── 四维均分: ${avg}分`)
  console.log('')
}
