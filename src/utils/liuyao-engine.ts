/**
 * liuyao-engine.ts — 六爻排盘核心引擎
 *
 * 算法流程：摇卦→排卦→定世应→安六亲→装六兽→断吉凶
 */

import type { HeavenlyStem, EarthlyBranch } from '@/types/bazi'
import { Solar } from 'lunar-javascript'
import { GUACI_64, YAO_DIZHI, GONG_GUA, getLiuQin, getLiuShouOrder, type GuaEntry64 } from '@/constants/liuyao-dict'
import { getDuanYu, GUA_JIXIONG, type DuanYuEntry } from '@/constants/liuyao-guaci'

// ===== 类型 =====

export type YongShenStrength = '旺相' | '休囚' | '中和'

export interface YaoLine {
  index: number         // 1-6（初爻=1, 上爻=6）
  value: number         // 6老阴 7少阳 8少阴 9老阳
  isDong: boolean       // 是否动爻
  original: string      // 原爻象（阴爻/阳爻）
  changed: string       // 变爻象
  dizhi: string         // 地支
  liuqin: string        // 六亲
  liushou: string       // 六兽
}

export interface LiuyaoPan {
  coins: number[][]     // 6次摇卦结果 (3枚铜钱×6次)
  yaoList: YaoLine[]    // 六爻列表
  benGua: GuaEntry64    // 本卦
  bianGua?: GuaEntry64  // 变卦
  dongYaoCount: number  // 动爻数量
  shiYao: number        // 世爻位
  yingYao: number       // 应爻位
  yongShen: string      // 用神（按问事类型固定映射）
  yongShenStrength: YongShenStrength  // 用神旺衰
  yongShenScore: number  // ★ 用神量化得分 0-100
  liushouScore: number   // ★ 六神加权修正
  source: string         // ★ 断语古籍溯源
  duanYu: DuanYuEntry   // 断语
  specialAdvice?: string // 专项断语
  careerTiming?: string   // ★ 求职应期
}

// ===== 摇卦 =====

/** 摇一次：3枚铜钱结果 */
function shake(): number[] {
  return [coin(), coin(), coin()]
}

function coin(): number {
  return Math.random() > 0.5 ? 3 : 2 // 正面3分，反面2分
}

/** 6次摇卦 */
export function shakeSixTimes(): number[][] {
  return [shake(), shake(), shake(), shake(), shake(), shake()]
}

// ===== 排卦 =====

const UPPER_GUA: Record<number, string> = { 7:'乾',6:'兑',5:'离',4:'震',3:'巽',2:'坎',1:'艮',0:'坤' }
const LOWER_GUA: Record<number, string> = { 7:'乾',6:'兑',5:'离',4:'震',3:'巽',2:'坎',1:'艮',0:'坤' }

/** 铜钱和转爻值 */
function sumToYao(sum: number): { value: number; isDong: boolean; symbol: string } {
  if (sum === 6) return { value:6, isDong:true, symbol:'老阴 ▅▅ ▅▅ ×' }
  if (sum === 7) return { value:7, isDong:false, symbol:'少阳 ▅▅▅▅▅' }
  if (sum === 8) return { value:8, isDong:false, symbol:'少阴 ▅▅ ▅▅' }
  return { value:9, isDong:true, symbol:'老阳 ▅▅▅▅▅ ○' }
}

/** 动爻变化：老阳变阴，老阴变阳 */
function changeYao(v: number): number {
  if (v === 6) return 7  // 老阴→少阳
  if (v === 9) return 8  // 老阳→少阴
  return v
}

/** 六爻值→上卦下卦名 */
function yaoListToGua(yaoValues: number[]): string {
  let upperNum = 0
  let lowerNum = 0
  for (let i = 0; i < 3; i++) {
    if (yaoValues[i] % 2 === 1) lowerNum += (1 << i)
  }
  for (let i = 3; i < 6; i++) {
    if (yaoValues[i] % 2 === 1) upperNum += (1 << (i - 3))
  }
  return UPPER_GUA[upperNum] + LOWER_GUA[lowerNum]
}

// ===== 主入口 =====

export function calcLiuyao(dayGan: string, questionType?: string, lostScene?: string, lostDateStr?: string, marriageGender?: string, marriageGoal?: string, careerStatus?: string): LiuyaoPan {
  // ★ 更新性别状态（给用神函数使用）
  _marriageGender = marriageGender || '男'

  const coins = shakeSixTimes()

  // 六次结果
  const sums = coins.map(c => c[0] + c[1] + c[2])
  const yaoData = sums.map(s => sumToYao(s))

  // 本卦
  const benYaoValues = yaoData.map(y => y.value)
  const benUpper = UPPER_GUA[getUpperNum(benYaoValues)] || '乾'
  const benLower = LOWER_GUA[getLowerNum(benYaoValues)] || '乾'

  // 拼接卦名
  let benGuaName = ''
  for (const [k, v] of Object.entries(GUACI_64)) {
    if (v.upper === benUpper && v.lower === benLower) { benGuaName = k; break }
  }
  if (!benGuaName) benGuaName = `${benUpper}${benLower}`

  // 变卦
  const bianYaoValues = yaoData.map(y => changeYao(y.value))
  const bianUpper = UPPER_GUA[getUpperNum(bianYaoValues)] || '乾'
  const bianLower = LOWER_GUA[getLowerNum(bianYaoValues)] || '乾'
  let bianGuaName = ''
  for (const [k, v] of Object.entries(GUACI_64)) {
    if (v.upper === bianUpper && v.lower === bianLower) { bianGuaName = k; break }
  }

  const benGua = GUACI_64[benGuaName] || { name: benGuaName, upper: benUpper, lower: benLower, shi: 3, ying: 6, gong: benUpper, guaCi: '', baiHua: '' }
  const bianGua = GUACI_64[bianGuaName]

  // 六爻列表
  const dongCount = yaoData.filter(y => y.isDong).length
  const liuShouOrder = getLiuShouOrder(dayGan)
  const benGong = GONG_GUA[benGuaName] || benUpper
  const gongWx = BA_GUA_WX[benGong] || '金'
  const yaoDizhiArr = YAO_DIZHI[benGong] || YAO_DIZHI['乾']

  const yaoList: YaoLine[] = yaoData.map((y, i) => ({
    index: i + 1,
    value: y.value,
    isDong: y.isDong,
    original: y.symbol,
    changed: y.isDong ? (changeYao(y.value) % 2 === 1 ? '少阳 ▅▅▅▅▅' : '少阴 ▅▅ ▅▅') : y.symbol,
    dizhi: yaoDizhiArr[i],
    liuqin: getLiuQin(gongWx, yaoDizhiArr[i]),
    liushou: liuShouOrder[i],
  }))

  // ★ 《增删卜易》用神映射表 — 按问事类型强制固定用神
  let yongShenFixed: string
  if (questionType === '事业求职') { yongShenFixed = '官鬼' }
  else if (questionType === '财运') { yongShenFixed = '妻财' }
  else if (questionType === '健康') { yongShenFixed = '子孙' }
  else {
    const YONG_SHEN_MAP: Record<string, string> = {
      '感情缘分': (marriageGender && marriageGender !== '男') ? '官鬼' : '妻财',
      '学业': '父母', '综合': '妻财',
      '寻物-数码': '妻财', '寻物-金银': '妻财',
      '寻物-证件': '父母', '寻物-钥匙': '父母',
      '寻物-宠物': '子孙', '寻物-交通': '父母',
    }
    yongShenFixed = YONG_SHEN_MAP[questionType || ''] || getLostYongShen(questionType || '')
  }

  const yongShenYaoData = yaoList.find(y => y.liuqin === yongShenFixed) || yaoList[benGua.shi - 1]
  const yongShenYao = yongShenYaoData?.index || benGua.shi
  const yongShenStrength = yongShenYaoData ? calcYongShenStrength(yongShenYaoData) : '中和'

  // ★ 用神旺衰量化得分（旺相=80-95 / 中和=60-70 / 休囚=35-50）
  const strengthToScore: Record<string, number> = { '旺相': 85, '中和': 65, '休囚': 42 }
  const yongShenScore = strengthToScore[yongShenStrength] || 60

  // ★ 六神加权修正
  const liuShouWx: Record<string, number> = {
    '青龙': questionType === '财运' || questionType === '事业求职' ? 8 : 4,
    '白虎': questionType === '健康' ? -10 : (questionType === '事业求职' ? -6 : -2),
    '朱雀': questionType === '事业求职' ? 6 : 2,
    '玄武': questionType === '感情缘分' ? -4 : 0,
    '勾陈': -2,
    '螣蛇': 0,
  }
  let liushouScore = 0
  const yongShenYaoLiushou = yongShenYaoData?.liushou || ''
  liushouScore = liuShouWx[yongShenYaoLiushou] || 0

  // ★ 古籍溯源文案
  const source = buildYongShenSource(questionType || '', yongShenFixed, yongShenStrength, yongShenYaoLiushou, yongShenYaoData)

  // 断语
  const duanYu = getDuanYu(benGuaName, yongShenFixed, yongShenYao, benGua.shi, dongCount, yongShenStrength)

  // ★ 专项判定
  let specialAdvice: string | undefined

  if (questionType?.startsWith('失物') || questionType?.startsWith('寻物')) {
    const lostCtx: LostItemContext = {
      itemType: questionType.includes('宠物') ? 'pet' : questionType.includes('数码')||questionType.includes('金银') ? 'valuables' : 'documents',
      itemSubtype: questionType.replace('寻物-',''),
      scene: (lostScene || 'indoor') as 'indoor' | 'office' | 'outdoor',
      lostDate: lostDateStr,
    }
    specialAdvice = getLostItemAdvice(yaoList, yongShenFixed, yongShenYaoData, benGua, lostCtx)
  } else if (questionType === '事业求职') {
    specialAdvice = getCareerAdvice(yaoList, benGua, careerStatus || '待业', yongShenStrength)
  } else if (questionType === '感情缘分') {
    specialAdvice = getMarriageAdvice(yaoList, benGua, marriageGender || '男', marriageGoal || '单身求正缘')
  }

  // ★ 求职应期
  let careerTiming: string | undefined
  if (questionType === '事业求职') {
    careerTiming = getCareerTiming(yaoList)
  }

  return {
    coins,
    yaoList,
    benGua,
    bianGua,
    dongYaoCount: dongCount,
    shiYao: benGua.shi,
    yingYao: benGua.ying,
    yongShen: yongShenFixed,
    yongShenStrength,
    yongShenScore,
    liushouScore,
    source,
    duanYu,
    specialAdvice,
    careerTiming,
  }
}

// helpers
function getUpperNum(vals: number[]): number {
  let n = 0
  for (let i = 3; i < 6; i++) { if (vals[i] % 2 === 1) n += (1 << (i - 3)) }
  return n
}
function getLowerNum(vals: number[]): number {
  let n = 0
  for (let i = 0; i < 3; i++) { if (vals[i] % 2 === 1) n += (1 << i) }
  return n
}

const BA_GUA_WX: Record<string, string> = {
  '乾':'金','兑':'金','离':'火','震':'木','巽':'木','坎':'水','艮':'土','坤':'土',
}

// ===== 用神旺衰判定 =====

const BRANCHES: EarthlyBranch[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const BRANCH_WUXING_MAP: Record<string, string> = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水',
}
const WX_SHENG: Record<string, string> = { '木':'火','火':'土','土':'金','金':'水','水':'木' }
const WX_KE: Record<string, string>   = { '木':'土','土':'水','水':'火','火':'金','金':'木' }

/** ★ 断语溯源 — 按用神+旺衰+六神生成古籍引用文案 */
function buildYongShenSource(
  questionType: string,
  yongShen: string,
  strength: YongShenStrength,
  liushouName: string,
  yongShenYao?: YaoLine,
): string {
  const inline: string[] = ['《增删卜易》']

  // 用神
  if (questionType === '事业求职') inline.push('官鬼为用神 — "凡占功名，以官鬼为用神"')
  else if (questionType === '财运') inline.push('妻财为用神 — "凡占财，以财爻为用神。财旺持世，求财必得"')
  else if (questionType === '健康') inline.push('子孙为用神 — "凡占疾病，以子孙为用药"')
  else if (questionType === '感情缘分') inline.push(yongShen === '妻财' ? '妻财为用神 — "男占婚财为用"' : '官鬼为用神 — "女占婚官鬼为用"')
  else if (questionType.startsWith('寻物')) inline.push(yongShen === '父母' ? '父母为用神 — "凡占失物，以父母为用"' : '子孙为用神 — "凡占走失，以子孙为用"')

  // 旺衰
  if (strength === '旺相') inline.push('用神旺相 — "旺相逢生，诸事亨通"')
  else if (strength === '休囚') inline.push('用神休囚 — "休囚受克，事难成就"')

  // 六神
  if (liushouName === '青龙' && (questionType === '财运' || questionType === '事业求职')) inline.push('青龙临用神 — "青龙最吉，财运官运皆主亨通"')
  if (liushouName === '白虎' && questionType === '健康') inline.push('白虎临用神 — "白虎主血光，占病大忌"')
  if (liushouName === '朱雀' && questionType === '事业求职') inline.push('朱雀临官 — "朱雀临官，主口舌文书"')

  return inline.join('；')
}
function getCurrentMonthZhi(): string {
  const now = new Date()
  const solar = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate())
  return solar.getLunar().getEightChar().getMonthZhi()
}

/** 获取当前日辰地支 */
function getCurrentDayZhi(): string {
  const now = new Date()
  const solar = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate())
  return solar.getLunar().getEightChar().getDayZhi()
}

/**
 * 判定用神旺衰（月建为纲，日辰为权）
 * 旺相: 月建生扶或日辰生扶（二得其一）
 * 休囚: 月建克之，日辰亦无生扶
 * 中和: 其余
 */
export function calcYongShenStrength(yao: YaoLine): YongShenStrength {
  const monthZhi = getCurrentMonthZhi()
  const dayZhi   = getCurrentDayZhi()
  const monthWx  = BRANCH_WUXING_MAP[monthZhi] || '土'
  const dayWx    = BRANCH_WUXING_MAP[dayZhi] || '土'
  const yaoWx    = BRANCH_WUXING_MAP[yao.dizhi] || '土'

  const monthSheng = (yaoWx === monthWx || WX_SHENG[monthWx] === yaoWx)
  const daySheng   = (yaoWx === dayWx   || WX_SHENG[dayWx] === yaoWx)
  const monthKe    = (WX_SHENG[yaoWx] === monthWx || WX_KE[monthWx] === yaoWx)

  if (monthSheng || daySheng) return '旺相'
  if (monthKe) return '休囚'
  return '中和'
}

// ===== 应期计算 =====

/** 求某地支从今天起最近一次出现的日期 */
function nextZhiDate(zhi: string): Date {
  const now = new Date()
  const todayZhi = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate())
    .getLunar().getEightChar().getDayZhi()
  const targetIdx = BRANCHES.indexOf(zhi as EarthlyBranch)
  const todayIdx = BRANCHES.indexOf(todayZhi as EarthlyBranch)
  const daysToAdd = ((targetIdx - todayIdx + 12) % 12) || 12
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd)
}

/** 将 Date 格式化为 M月d日 */
function fmtDate(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

// ===== 卦理环境交叉校验（《黄金策》+《增删卜易》） =====

/**
 * 六神→环境特征映射表
 * 每神关联：五行、方位、典型环境关键词
 */
const LIU_SHO_ENV_MAP: Record<string, {
  wuxing: string; direction: string; keywords: string[];
  sceneHint: string; outdoorHint: string;
}> = {
  '青龙': { wuxing:'木', direction:'东方',
    keywords: ['木','树','绿','植物','花园','公园','草地','森林','木桌','书架','衣柜'],
    sceneHint:'木质家具、衣柜、书架、绿植附近',
    outdoorHint:'草地、树丛、公园长椅、绿化带' },
  '朱雀': { wuxing:'火', direction:'南方',
    keywords: ['电','光','红','热','阳光','火','充电','灯','太阳','屏幕','明'],
    sceneHint:'电器旁、充电器附近、红色物件、阳光直射处',
    outdoorHint:'阳光暴晒处、广告牌旁、红绿灯附近' },
  '勾陈': { wuxing:'土', direction:'中央',
    keywords: ['地面','桌','中','大','正','厅','门','走廊','中央','客厅','堂'],
    sceneHint:'地面、桌面、正中间、大堂',
    outdoorHint:'广场、十字路口、停车场' },
  '螣蛇': { wuxing:'土', direction:'东南',
    keywords: ['角','缝','柜顶','高','窄','弯曲','角落','隐蔽','暗格','墙缝','柜'],
    sceneHint:'角落、暗处、柜顶、窄缝',
    outdoorHint:'弯曲小径、巷子、台阶角落' },
  '白虎': { wuxing:'金', direction:'西方',
    keywords: ['金属','铁','五金','工具','机械','车','钢','机器','钥匙','锁'],
    sceneHint:'金属器皿、工具间、保险柜、铁盒',
    outdoorHint:'金属围栏、公交站、停车场、施工地' },
  '玄武': { wuxing:'水', direction:'北方',
    keywords: ['水','湿','潮','暗','阴','下','洗手间','厕所','厨房','水槽','冰','地','下水'],
    sceneHint:'洗手间、厨房水槽、冰箱、阴暗角落',
    outdoorHint:'水边、喷泉、下水道口、潮湿低洼处' },
}

/** 驿马地支 */
const YI_MA_BRANCHES = new Set(['寅','申','巳','亥'])

/**
 * matchEnvironmentalLogic — 卦理环境交叉校验
 *
 * 算法：
 * 1. 取用神爻所在六兽，映射其环境特征
 * 2. 与用户输入的 envDesc 关键词匹配，每次命中 confidence+20
 * 3. 若用户选 indoor 但应爻带驿马 → 排除提醒
 * 4. 返回动态断语
 *
 * 参考《黄金策》六神章法、《增删卜易》驿马断
 */
export function matchEnvironmentalLogic(
  yaoList: YaoLine[],
  yongShen: string,
  benGua: { gong: string; name: string },
  envDesc: string,
  scene: 'indoor' | 'office' | 'outdoor',
): { confidenceScore: number; advice: string } {
  // ★ 1. 取用神爻的六兽
  const ysYao = yaoList.find(y => y.liuqin === yongShen)
  if (!ysYao) return { confidenceScore: 0, advice: '用神不现，环境校验跳过。' }

  const liushou = ysYao.liushou
  const envEntry = LIU_SHO_ENV_MAP[liushou]
  if (!envEntry) return { confidenceScore: 30, advice: '六神定位模糊，建议扩大搜索范围。' }

  let score = 30  // 基础置信度
  const matchParts: string[] = []

  // ★ 2. 关键词匹配
  const desc = envDesc.toLowerCase()
  for (const kw of envEntry.keywords) {
    if (desc.includes(kw)) {
      score += 20
      matchParts.push(kw)
    }
  }

  // ★ 3. 排除法：室内场景但带驿马
  const yingYao = yaoList[5]  // 应爻（第6爻）
  const hasYiMa = yingYao && YI_MA_BRANCHES.has(yingYao.dizhi)
  let exclusion = ''
  if (scene === 'indoor' && hasYiMa) {
    score = Math.max(10, score - 25)
    exclusion = '⚠ 卦见驿马临应爻，物品或已被转移至室外/远处。'
  }

  // ★ 4. 动态断语拼接
  const direction = envEntry.direction
  const sceneDesc = scene === 'indoor' ? envEntry.sceneHint : envEntry.outdoorHint
  const matchInfo = matchParts.length > 0 ? `（您描述的"${matchParts.join('、')}"与卦象吻合）` : ''

  const advice = `经推演，卦临【${liushou}】（${envEntry.wuxing}性，${direction}方）${matchInfo}。` +
    `建议优先搜索${direction}方的${sceneDesc}。${exclusion}` +
    `\n《黄金策》云：${liushou}主${direction}，兼水土方位。`

  return { confidenceScore: Math.min(100, score), advice }
}

export interface LostItemContext {
  itemType: 'valuables' | 'documents' | 'pet' | 'vehicle'  // 数码/金银(caichan) | 证件/钥匙/交通(parents) | 宠物(pet) | 交通(vehicle→父母)
  lostDate?: string
  scene: 'indoor' | 'office' | 'outdoor'
  itemSubtype?: string  // 用于追加断语
}

/** get lost item yong shen */
export function getLostYongShen(questionType: string): string {
  if (questionType.includes('宠物')) return '子孙'
  if (['寻物-数码','寻物-金银'].includes(questionType)) return '妻财'
  if (questionType === '事业求职') return '官鬼'
  if (questionType === '感情缘分' && _marriageGender === '男') return '妻财'
  if (questionType === '感情缘分' && _marriageGender === '女') return '官鬼'
  return '父母'
}

// ★ 性别状态（在 calcLiuyao 中动态更新）
let _marriageGender = '男'

/** 地支→方位 */
const DIZHI_DIRECTION: Record<string, string> = {
  '子':'正北','午':'正南','卯':'正东','酉':'正西',
  '丑':'东北','寅':'东北','辰':'东南','巳':'东南',
  '未':'西南','申':'西南','戌':'西北','亥':'西北',
}

/** 旬空判定 */
function getKongWangZhi(dayGan: string, dayZhi: string): [string, string] {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  const zhiIdx = branches.indexOf(dayZhi)
  const xunStart = Math.floor(zhiIdx / 10) * 10
  const k1 = branches[((xunStart - 1) % 12 + 12) % 12]
  const k2 = branches[((xunStart - 2) % 12 + 12) % 12]
  return [k1, k2]
}

/** 宫位→场景化提示（《黄金策》） */
function getPalaceHint(gong: string, scene: string, direction: string): string {
  if (scene === 'indoor') {
    if (gong === '乾' || gong === '兑') return `物品在室内高处、金属器皿（如保险柜、铁盒）、镜子或窗台附近。往【${direction}】方向找。`
    if (gong === '坎') return `物品在洗手间、厨房水槽、冰箱、鱼缸或阴暗潮湿的角落。往【${direction}】方向找。`
    if (gong === '震' || gong === '巽') return `物品在木质家具、衣柜、书架、绿植附近，或被衣物/书本遮盖。往【${direction}】方向找。`
    if (gong === '离') return `物品在电器旁、充电器附近、红色物件或阳光直射处。往【${direction}】方向找。`
    if (gong === '坤' || gong === '艮') return `物品在地面、床底、储物箱、背包或靠近墙壁的角落。往【${direction}】方向找。`
  }
  if (scene === 'office') {
    if (gong === '乾' || gong === '兑') return `物品在办公桌抽屉、文件柜、电脑主机旁或会议室金属器物中。往【${direction}】方向找。`
    if (gong === '坎') return `物品在茶水间、洗手间、饮水机旁或空调下方。往【${direction}】方向找。`
    if (gong === '震' || gong === '巽') return `物品在书架、文件堆、绿植旁或同事的桌面杂物中。往【${direction}】方向找。`
    if (gong === '离') return `物品在打印机、复印机、屏幕后方或电源插座附近。往【${direction}】方向找。`
    if (gong === '坤' || gong === '艮') return `物品在公文包、储物柜、快递包裹或地面角落。往【${direction}】方向找。`
  }
  if (scene === 'outdoor') {
    if (gong === '乾' || gong === '兑') return `物品可能掉落在路边金属栏杆、公交站、停车场或高处台阶。往【${direction}】方向找。`
    if (gong === '坎') return `物品可能掉落在水边、喷泉、下水道口或被雨淋湿。往【${direction}】方向找。`
    if (gong === '震' || gong === '巽') return `物品掉落在草地、树丛、公园长椅或被风吹到绿化带中。往【${direction}】方向找。`
    if (gong === '离') return `物品掉落在阳光暴晒处、广告牌旁、红绿灯附近或露天餐饮区。往【${direction}】方向找。`
    if (gong === '坤' || gong === '艮') return `物品可能掉落在户外草坪、泥地、石头缝，或遗忘在别人的背包、箱子里。往【${direction}】方向找。`
  }
  return `往【${direction}】方向仔细搜索。`
}

/** 失物专项判定（《增删卜易》+《黄金策》） */
export function getLostItemAdvice(
  yaoList: YaoLine[],
  yongShen: string,
  yongShenYao: YaoLine | undefined,
  benGua: GuaEntry64,
  ctx?: LostItemContext,
): string {
  if (!yongShenYao) return '用神不现，需重摇一卦。'

  const yongZhi = yongShenYao.dizhi
  const direction = DIZHI_DIRECTION[yongZhi] || '附近'
  const scene = ctx?.scene || 'indoor'

  // 1. 旬空判定（结合丢失日期）
  if (ctx?.lostDate) {
    const d = new Date(ctx.lostDate)
    const s = Solar.fromYmd(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const l = s.getLunar(); const ec = l.getEightChar()
    const [k1, k2] = getKongWangZhi(ec.getDayGan(), ec.getDayZhi())
    if (yongZhi === k1 || yongZhi === k2) {
      return `⚠ 物品在丢失日遭遇旬空：用神"${yongShen}"在丢失当日落空亡（${yongZhi}），恐已落入他人之手或彻底遗失。建议不要抱太大希望。`
    }
  }

  // 2. 用神持世
  if (yongShenYao.index === benGua.shi) {
    return `✅ 失物持世：用神临世爻，东西就在你身边或你常去的地方，极易找到！${getPalaceHint(benGua.gong, scene, direction)}`
  }

  // 3. 入墓判定
  const muMap: Record<string, string> = {
    '子':'辰','丑':'辰','寅':'未','卯':'未','辰':'辰',
    '巳':'戌','午':'戌','未':'未','申':'辰','酉':'丑',
    '戌':'戌','亥':'未',
  }
  if (muMap[yongZhi] === yongZhi) {
    return `📦 物入墓库：东西没有丢远，只是被箱子、抽屉或其他器皿遮挡住了。${getPalaceHint(benGua.gong, scene, direction)} 请耐心翻找！`
  }

  // 4. ★ 物品类型专项断语
  const gong = benGua.gong

  // ★ 驿马速查表
  const yiMaMap: Record<string, string> = {
    '申':'寅','子':'寅','辰':'寅','亥':'巳','卯':'巳','未':'巳',
    '寅':'申','午':'申','戌':'申','巳':'亥','酉':'亥','丑':'亥',
  }

  const extraHint = getItemSpecificHint(ctx, gong, yongShenYao, yongShen, scene, direction, yiMaMap)
  return `🔍 用神"${yongShen}"在${yongZhi}位（${direction}）。${getPalaceHint(gong, scene, direction)}${extraHint}`
}

/** 物品类型专项提示 */
function getItemSpecificHint(
  ctx: LostItemContext | undefined, gong: string, yongShenYao: YaoLine,
  yongShen: string, scene: string, direction: string, yiMaMap: Record<string, string>,
): string {
  if (!ctx) return ''
  const subtype = ctx.itemSubtype || ctx.itemType

  // 数码电器：落离宫或临朱雀
  if (subtype === '数码电器' || subtype === 'digital') {
    if (gong === '离' || yongShenYao.liushou === '朱雀') {
      return ' 电子产品自带火电之气，多在电器、电源插座、充电器或灯光充足处翻找。'
    }
  }

  // 金银财宝：落乾/兑宫
  if (subtype === '金银财宝' || subtype === 'jewelry') {
    if (gong === '乾' || gong === '兑') {
      return ' 金银器物，多在金属柜、保险箱、抽屉或密闭容器中。'
    }
  }

  // 证件/钥匙：用神伏藏
  if (subtype === '证件' || subtype === '钥匙' || subtype === 'documents') {
    // 简化：用神未持世即视为"伏藏"
    return ' 随身小物件多被掩盖，请留意衣服口袋、沙发夹缝或被书本纸张压住。'
  }

  // 宠物走失：带驿马
  if (subtype === '宠物' || yongShen === '子孙') {
    const yiMaZhi = yiMaMap[yongShenYao.dizhi]
    if (yiMaZhi) {
      return ` 宠物处于奔跑状态，正往【${DIZHI_DIRECTION[yiMaZhi] || '未知方向'}】方向的户外跑去，宜速去寻找！`
    }
    return ' 宠物可能在小区或附近公园，多问问路人。'
  }

  // 交通工具
  if (subtype === '交通工具' || subtype === 'vehicle') {
    return ' 车辆/交通工具请在停车场、路边停车位或修理厂附近查找。'
  }

  return ''
}

// ===== 事业专项断语（《增删卜易》） =====

function getCareerAdvice(yaoList: YaoLine[], benGua: GuaEntry64, status: string, yongShenStrength: string = '中和'): string {
  const guanChishi = yaoList.find(y => y.liuqin === '官鬼' && y.index === benGua.shi)
  const guanGui = yaoList.find(y => y.liuqin === '官鬼' && y.isDong)
  const ziSunDong = yaoList.filter(y => y.liuqin === '子孙' && y.isDong)
  const isXiuqiu = yongShenStrength === '休囚'

  if (status === '待业求职') {
    if (guanChishi && isXiuqiu) return '官星持世，志向可嘉。但用神休囚，仍需耐心。《增删卜易》云：官来就我，亦待时而动。'
    if (guanChishi) return '官星持世旺相，求职有成。《增删卜易》云：官来就我，名利双收。'
    if (guanGui && isXiuqiu) return '官鬼发动，但用神休囚，机会尚远，宜蓄力。'
    if (guanGui) return '官鬼发动，机会渐显。用神旺相则速应。'
    if (ziSunDong.length > 0) return '子孙动克官，不利求职。《增删卜易》云：子动克官，投试不第。'
    return '官星平静，宜蓄力待时。'
  }
  if (status === '在职求晋升') {
    if (isXiuqiu && ziSunDong.length > 0) return '子孙动而官星休囚，晋升暂缓。《增删卜易》云：子动官衰，升迁无望。'
    if (guanChishi && isXiuqiu) return '官星持世但休囚，宜守不宜进。'
    if (guanChishi) return '官星持世旺相，晋升有望。'
    return '官星不显，宜稳守岗位。'
  }
  if (status === '想裸辞跳槽') {
    if (ziSunDong.length > 0 && isXiuqiu) return '子动官衰，动则不利，宜骑驴找马。《增删卜易》云：官星受伤，动则不利。'
    if (guanChishi && isXiuqiu) return '官星持世但休囚，此时跳槽变数多。'
    if (guanChishi) return '官星持世旺相，跳槽窗口可期。'
    return '官不动，变数多，宜慎重。'
  }
  return ''
}

// ===== 感情专项断语（《增删卜易》+《黄金策》） =====

function getMarriageAdvice(yaoList: YaoLine[], benGua: GuaEntry64, gender: string, goal: string): string {
  const yongShen = gender === '男' ? '妻财' : '官鬼'
  const yongYao = yaoList.find(y => y.liuqin === yongShen)
  const shiYao = yaoList.find(y => y.index === benGua.shi)
  const yingYao = yaoList.find(y => y.index === benGua.ying)

  // 六冲判定
  const chongPairs: [string,string][] = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']]
  let isLiuChong = false
  if (shiYao && yingYao) {
    isLiuChong = chongPairs.some(([a,b]) =>
      (shiYao.dizhi===a && yingYao.dizhi===b) || (shiYao.dizhi===b && yingYao.dizhi===a))
  }

  // 六合判定
  const hePairs: [string,string][] = [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']]
  let isLiuHe = false
  if (shiYao && yingYao) {
    isLiuHe = hePairs.some(([a,b]) =>
      (shiYao.dizhi===a && yingYao.dizhi===b) || (shiYao.dizhi===b && yingYao.dizhi===a))
  }

  if (goal === '单身求正缘') {
    if (yongYao && yongYao.index === benGua.shi) return `用神"${yongShen}"持世，正缘即将出现，就在你身边或即将进入你的生活圈。${yongShen === '妻财' ? '适合多参加社交活动。' : '适合留意识大局好的男性。'}`
    if (isLiuHe) return '世应六合，情投意合之象。近期遇到的对象很可能是你的正缘，发展会很顺利。'
    return '缘分正在酝酿中，不必焦虑。保持开放的心态，正缘总在不经意间到来。'
  }

  if (goal === '测现任是否正缘') {
    if (isLiuHe && yongYao) return '世应相生六合，用神有气。对方多为你的正缘，双方情投意合，发展顺利。《黄金策》云：合处有情，百年好合。'
    if (isLiuChong) return '卦逢六冲，两情相违。你们之间性格冲突较大，需要大量的磨合和包容。若问是否是正缘——还需要更多时间验证。'
    return '世应关系平平，需要更多观察和相处才能确定。感情需要时间来验证。'
  }

  if (goal === '前任能否复合') {
    if (isLiuChong) return '卦逢六冲，缘分已经被冲散。复合缘分已尽，强求反受其乱。请放下过去，迎接新的开始。'
    if (yongYao && yongYao.index === benGua.shi) return '用神持世，对方对你仍有感情。复合有一定希望，但需要你主动迈出第一步。'
    return '缘分已淡，复合的窗口正在关闭。建议释怀，向前看才是解脱。《增删卜易》云：缘分既尽，强合反伤。'
  }

  return `${gender === '男' ? '妻财' : '官鬼'}为感情用神，请选择情感现状获取精准断语。`
}

// ===== 求职应期（《增删卜易》应期法则） =====

function getLiuHe(zhi: string): string | undefined {
  for (const [a,b] of [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']] as [string,string][]) { if (a===zhi) return b; if (b===zhi) return a }
  return undefined
}

function getLiuChong(zhi: string): string | undefined {
  for (const [a,b] of [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']] as [string,string][]) { if (a===zhi) return b; if (b===zhi) return a }
  return undefined
}

/**
 * 求职应期 — 以动爻父母爻/官鬼爻为主
 * 动爻生合日支 → 近（1-14日）
 * 动爻逢冲日支 → 远（3-8周）
 * 安静 → 值日（2-4周）
 */
function getCareerTiming(yaoList: YaoLine[]): string {
  const dongYao = yaoList.filter(y => y.isDong)
  const fmYao = yaoList.find(y => y.liuqin === '父母')
  const guanDong = yaoList.find(y => y.liuqin === '官鬼' && y.isDong)
  const dayZhi = getCurrentDayZhi()

  // 优先用动爻
  if (dongYao.length > 0) {
    const dy = dongYao[0]
    const dz = dy.dizhi
    // 生合日支 → 近
    if (getLiuHe(dz) === dayZhi || getLiuHe(dayZhi) === dz) {
      const d = nextZhiDate(dz)
      return `动爻${dz}与日辰${dayZhi}六合，气近。${fmtDate(d)}前后即应。《增删卜易》云：合则速应。`
    }
    // 逢冲日支 → 远
    if (getLiuChong(dz) === dayZhi) {
      const farDays = 42 + Math.floor(Math.random() * 14)
      return `动爻${dz}与日辰${dayZhi}相冲，气散而远。约${farDays}日（${fmtDate(new Date(Date.now() + farDays * 86400000))}前后）方应。《增删卜易》云：冲则待合，缓之。`
    }
    // 安静发动 → 值日
    const d = nextZhiDate(dz)
    return `爻动在${dz}位，值${dz}日应。${fmtDate(d)}前后。《增删卜易》云：动而值日。`
  }

  // 无动爻 → 看官鬼/父母
  if (guanDong) {
    const d = nextZhiDate(guanDong.dizhi)
    return `官鬼发动（${guanDong.dizhi}），值${guanDong.dizhi}日应。${fmtDate(d)}前后。《增删卜易》云：官动值日。`
  }

  if (fmYao) {
    const z = fmYao.dizhi
    if (BRANCHES.indexOf(z as EarthlyBranch) >= 0) {
      const zhiIdx = BRANCHES.indexOf(z as EarthlyBranch)
      const xunStart = Math.floor(zhiIdx / 10) * 10
      const k1 = BRANCHES[((xunStart - 1) % 12 + 12) % 12]
      const k2 = BRANCHES[((xunStart - 2) % 12 + 12) % 12]
      if (z === k1 || z === k2) {
        const d = nextZhiDate(BRANCHES[(zhiIdx + 1) % 12])
        return `父母爻${z}旬空。出空之日${fmtDate(d)}前后应。《增删卜易》云：空则待时而应。`
      }
    }
    const d = nextZhiDate(z)
    return `父母爻安静在${z}，值${z}日应。${fmtDate(d)}前后。《增删卜易》云：静而值日。`
  }

  return '官鬼与父母俱不现，卦无影。宜静待时机，约月余后复占。《增删卜易》云：用神不现，且待时。'
}
