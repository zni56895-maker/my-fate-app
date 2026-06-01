/**
 * fortuneDatabase.ts — 72神煞完整算法引擎 + 字典数据库
 *
 * 每个神煞 = 独立计算函数 + 完整字典条目(name/type/desc/rarity/tag)
 * 全网最硬核离线玄学系统
 */

import type { HeavenlyStem, EarthlyBranch, BaziChart, PillarData, Gender } from '@/types/bazi'
import { SHENSHA_TEXT_DICT } from '@/constants/shenshaDict'
import { NA_YIN_WU_XING_60, TONGZI_RULE_NAYIN, TONGZI_RULE_SEASON, TONGZI_RULE_DANGAN } from '@/constants/tongziRules'

// ============================================================
// 一、基础常量与查表工具
// ============================================================

const STEMS: HeavenlyStem[] = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES: EarthlyBranch[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

const STEM_WUXING: Record<HeavenlyStem, string> = {
  '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水',
}
const STEM_YY: Record<HeavenlyStem, string> = {
  '甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳','己':'阴','庚':'阳','辛':'阴','壬':'阳','癸':'阴',
}
const BRANCH_WUXING: Record<EarthlyBranch, string> = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水',
}

const WU_HE: Record<HeavenlyStem, HeavenlyStem> = {
  '甲':'己','己':'甲','乙':'庚','庚':'乙','丙':'辛','辛':'丙','丁':'壬','壬':'丁','戊':'癸','癸':'戊',
}
const LIU_CHONG: Record<EarthlyBranch, EarthlyBranch> = {
  '子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳',
}
const LIU_HE: Record<EarthlyBranch, EarthlyBranch> = {
  '子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午',
}

// 三合局
const SANHE_GROUPS: Record<EarthlyBranch, EarthlyBranch[]> = {
  '申':['申','子','辰'],'子':['申','子','辰'],'辰':['申','子','辰'],
  '亥':['亥','卯','未'],'卯':['亥','卯','未'],'未':['亥','卯','未'],
  '寅':['寅','午','戌'],'午':['寅','午','戌'],'戌':['寅','午','戌'],
  '巳':['巳','酉','丑'],'酉':['巳','酉','丑'],'丑':['巳','酉','丑'],
}
const SANHE_CHANGSHENG: Record<EarthlyBranch, EarthlyBranch> = {
  '申':'申','子':'申','辰':'申','亥':'亥','卯':'亥','未':'亥',
  '寅':'寅','午':'寅','戌':'寅','巳':'巳','酉':'巳','丑':'巳',
}
const SANHE_DIWANG: Record<EarthlyBranch, EarthlyBranch> = {
  '申':'子','子':'子','辰':'子','亥':'卯','卯':'卯','未':'卯',
  '寅':'午','午':'午','戌':'午','巳':'酉','酉':'酉','丑':'酉',
}
const SANHE_MUKU: Record<EarthlyBranch, EarthlyBranch> = {
  '申':'辰','子':'辰','辰':'辰','亥':'未','卯':'未','未':'未',
  '寅':'戌','午':'戌','戌':'戌','巳':'丑','酉':'丑','丑':'丑',
}

// 驿马（长生位对冲）
const YIMA_MAP: Record<EarthlyBranch, EarthlyBranch> = {
  '申':'寅','子':'寅','辰':'寅','亥':'巳','卯':'巳','未':'巳',
  '寅':'申','午':'申','戌':'申','巳':'亥','酉':'亥','丑':'亥',
}

// 十二长生沐浴位（用于沐浴桃花）
const MUYU_MAP: Record<HeavenlyStem, EarthlyBranch> = {
  '甲':'子','乙':'巳','丙':'卯','丁':'申','戊':'卯','己':'申','庚':'午','辛':'亥','壬':'酉','癸':'寅',
}

// 十干禄位
const LU_MAP: Record<HeavenlyStem, EarthlyBranch> = {
  '甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子',
}

// 羊刃位
const YANGREN_MAP: Record<HeavenlyStem, EarthlyBranch> = {
  '甲':'卯','乙':'辰','丙':'午','丁':'未','戊':'午','己':'未','庚':'酉','辛':'戌','壬':'子','癸':'丑',
}

// 天德表（月支→天干）
const TIANDE_TABLE: Record<EarthlyBranch, HeavenlyStem[]> = {
  '寅':['丁'],'卯':['申' as any],'辰':['壬'],'巳':['辛'],
  '午':['亥' as any],'未':['甲'],'申':['癸'],'酉':['寅' as any],
  '戌':['丙'],'亥':['乙'],'子':['巳' as any],'丑':['庚'],
}

// 月德表（月支→天干）
const YUEDE_TABLE: Record<EarthlyBranch, HeavenlyStem> = {
  '寅':'丙','午':'丙','戌':'丙','申':'壬','子':'壬','辰':'壬',
  '亥':'甲','卯':'甲','未':'甲','巳':'庚','酉':'庚','丑':'庚',
}

// 十二长生位置序列
const CHANGSHENG_SEQ: EarthlyBranch[] = ['亥','子','丑','寅','卯','辰','巳','午','未','申','酉','戌']
const CHANGSHENG_NAMES: string[] = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养']

function branchIdx(b: EarthlyBranch): number { return BRANCHES.indexOf(b) }
function stemIdx(s: HeavenlyStem): number { return STEMS.indexOf(s) }
function branchAt(idx: number): EarthlyBranch { return BRANCHES[((idx%12)+12)%12] }
function stemAt(idx: number): HeavenlyStem { return STEMS[((idx%10)+10)%10] }

// 日柱干支转索引
function ganZhiIdx(gan: HeavenlyStem, zhi: EarthlyBranch): number {
  return (stemIdx(gan) * 12 + branchIdx(zhi)) % 60
}

// ============================================================
// 二、结果类型
// ============================================================

export interface ShenShaEntry72 {
  name: string        // 神煞名称
  type: string        // 阵营：吉星高照/财富才华/浪漫桃花/硬核凶煞/运势波动
  desc: string        // 现代白话解析
  rarity: string      // 稀有度百分比
  tag: string         // 现代标签
  jiXiong: '吉'|'凶'|'中性'
}

// ============================================================
// 三、上下文类型
// ============================================================

interface Ctx {
  p: PillarData; pi: number // 0年 1月 2日 3时
  ds: HeavenlyStem; dz: EarthlyBranch  // 日干/日支
  ys: HeavenlyStem; yz: EarthlyBranch  // 年干/年支
  ms: HeavenlyStem; mz: EarthlyBranch  // 月干/月支
  hs: HeavenlyStem; hz: EarthlyBranch  // 时干/时支
  g: Gender
}

function makeCtx(chart: BaziChart): Ctx {
  return {
    p: chart.pillars[0], pi: 0,
    ds: chart.dayMaster, dz: chart.pillars[2].zhi,
    ys: chart.pillars[0].gan, yz: chart.pillars[0].zhi,
    ms: chart.pillars[1].gan, mz: chart.pillars[1].zhi,
    hs: chart.pillars[3].gan, hz: chart.pillars[3].zhi,
    g: chart.birthInfo.gender,
  }
}

// ============================================================
// 四、72个神煞 — 逐个完整计算函数（无省略，全部写死）
// ============================================================

// ---- 吉星高照 16个 ----

function check1_TianYi(c: Ctx): boolean {
  const b = c.p.zhi
  const s = c.ds; const y = c.ys
  if ((b==='丑'||b==='未') && ('甲戊庚'.includes(s)||'甲戊庚'.includes(y))) return true
  if ((b==='子'||b==='申') && ('乙己'.includes(s)||'乙己'.includes(y))) return true
  if ((b==='亥'||b==='酉') && ('丙丁'.includes(s)||'丙丁'.includes(y))) return true
  if ((b==='卯'||b==='巳') && ('壬癸'.includes(s)||'壬癸'.includes(y))) return true
  if ((b==='午'||b==='寅') && (s==='辛'||y==='辛')) return true
  return false
}

function check2_TianDe(c: Ctx): boolean {
  const arr = TIANDE_TABLE[c.mz]
  return arr ? arr.some(x => x === c.ds) : false
}

function check3_YueDe(c: Ctx): boolean {
  return YUEDE_TABLE[c.mz] === c.ds
}

function check4_TianDeHe(c: Ctx): boolean {
  const arr = TIANDE_TABLE[c.mz]
  if (!arr || arr.length===0) return false
  const tdStem = arr[0] as HeavenlyStem
  const he = WU_HE[tdStem]
  return he ? he === c.ds : false
}

function check5_YueDeHe(c: Ctx): boolean {
  const mdStem = YUEDE_TABLE[c.mz]
  if (!mdStem) return false
  const he = WU_HE[mdStem]
  return he ? he === c.ds : false
}

function check6_TaiJi(c: Ctx): boolean {
  const b = c.p.zhi; const s = c.ds; const y = c.ys
  if (['子','午'].includes(b) && ('甲乙'.includes(s)||'甲乙'.includes(y))) return true
  if (['卯','酉'].includes(b) && ('丙丁'.includes(s)||'丙丁'.includes(y))) return true
  if (['辰','戌','丑','未'].includes(b) && ('戊己'.includes(s)||'戊己'.includes(y))) return true
  if (['寅','亥'].includes(b) && ('庚辛'.includes(s)||'庚辛'.includes(y))) return true
  if (['巳','申'].includes(b) && ('壬癸'.includes(s)||'壬癸'.includes(y))) return true
  return false
}

function check7_FuXing(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'寅','丙':'寅','戊':'申','己':'未','丁':'亥','乙':'丑','癸':'丑','庚':'午','辛':'巳','壬':'辰',
  }
  return m[c.ds]===c.p.zhi || m[c.ys]===c.p.zhi
}

function check8_WenChang(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'巳','乙':'午','丙':'申','丁':'酉','戊':'申','己':'酉','庚':'亥','辛':'子','壬':'寅','癸':'卯',
  }
  return m[c.ds]===c.p.zhi || m[c.ys]===c.p.zhi
}

function check9_GuoYin(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'戌','乙':'亥','丙':'丑','丁':'寅','戊':'丑','己':'寅','庚':'辰','辛':'巳','壬':'未','癸':'申',
  }
  return m[c.ds]===c.p.zhi || m[c.ys]===c.p.zhi
}

function check10_SanQi(c: Ctx): boolean {
  if (c.pi !== 0) return false // 年柱触发
  const g = [c.ys, c.ms, c.ds]
  if (g.includes('甲')&&g.includes('戊')&&g.includes('庚')) return true
  if (g.includes('乙')&&g.includes('丙')&&g.includes('丁')) return true
  if (g.includes('壬')&&g.includes('癸')&&g.includes('辛')) return true
  return false
}

function check11_TianYiGui(c: Ctx): boolean {
  // ★ 天医贵人：《三命通会》月支→地支
  // 口诀：正月起丑，顺行十二辰（寅月丑、卯月寅、辰月卯...）
  const targets: EarthlyBranch[] = ['丑','寅','卯','辰','巳','午','未','申','酉','戌','亥','子']
  const monthOrder: EarthlyBranch[] = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑']
  const idx = monthOrder.indexOf(c.mz)
  return idx >= 0 && targets[idx] === c.p.zhi
}

function check12_SuiDian(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'丑','丑':'寅','寅':'卯','卯':'辰','辰':'巳','巳':'午',
    '午':'未','未':'申','申':'酉','酉':'戌','戌':'亥','亥':'子',
  }
  return m[c.yz] === c.p.zhi
}

function check13_SuiDe(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'未','乙':'申','丙':'戌','丁':'亥','戊':'丑','己':'寅','庚':'辰','辛':'巳','壬':'未','癸':'申',
  }
  return m[c.ys] === c.p.zhi
}

function check14_DeXiu(c: Ctx): boolean {
  const mz = c.mz; const g = c.p.gan
  if (['寅','卯','辰'].includes(mz) && '甲乙'.includes(g)) return true
  if (['巳','午','未'].includes(mz) && '丙丁'.includes(g)) return true
  if (['申','酉','戌'].includes(mz) && '庚辛'.includes(g)) return true
  if (['亥','子','丑'].includes(mz) && '壬癸'.includes(g)) return true
  return false
}

function check15_ShiLing(c: Ctx): boolean {
  if (c.pi !== 2) return false
  const set = ['甲辰','乙巳','丙辰','丁巳','戊寅','己卯','庚辰','辛巳','壬申','癸未']
  return set.includes(c.p.ganZhi)
}

function check16_TianShe(c: Ctx): boolean {
  if (c.pi !== 2) return false
  const mz = c.mz; const gz = c.p.ganZhi
  if (['寅','卯','辰'].includes(mz) && gz==='戊寅') return true
  if (['巳','午','未'].includes(mz) && gz==='甲午') return true
  if (['申','酉','戌'].includes(mz) && gz==='戊申') return true
  if (['亥','子','丑'].includes(mz) && gz==='甲子') return true
  return false
}

// ---- 财富才华 11个 ----

function check17_LuShen(c: Ctx): boolean {
  return LU_MAP[c.ds] === c.p.zhi || LU_MAP[c.ys] === c.p.zhi
}

function check18_JianLu(c: Ctx): boolean {
  return c.pi === 1 && LU_MAP[c.ds] === c.mz
}

function check19_ZhuanLu(c: Ctx): boolean {
  if (c.pi !== 2) return false
  const set = ['甲寅','乙卯','丙午','丁巳','戊午','己巳','庚申','辛酉','壬子','癸亥']
  return set.includes(c.p.ganZhi)
}

function check20_GuiLu(c: Ctx): boolean {
  return c.pi === 3 && LU_MAP[c.ds] === c.p.zhi
}

function check21_JinYu(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'辰','乙':'巳','丙':'未','丁':'申','戊':'未','己':'申','庚':'戌','辛':'亥','壬':'丑','癸':'寅',
  }
  return m[c.ds]===c.p.zhi || m[c.ys]===c.p.zhi
}

function check22_JiangXing(c: Ctx): boolean {
  return SANHE_DIWANG[c.p.zhi] === c.p.zhi
}

function check23_HuaGai(c: Ctx): boolean {
  return SANHE_MUKU[c.p.zhi] === c.p.zhi
}

function check24_TianGuan(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'丑','乙':'寅','丙':'辰','丁':'巳','戊':'辰','己':'巳','庚':'未','辛':'申','壬':'戌','癸':'亥',
  }
  return m[c.ds]===c.p.zhi || m[c.ys]===c.p.zhi
}

function check25_CiGuan(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'巳','乙':'午','丙':'申','丁':'酉','戊':'申','己':'酉','庚':'亥','辛':'子','壬':'寅','癸':'卯',
  }
  return m[c.ds]===c.p.zhi || m[c.ys]===c.p.zhi
}

function check26_XueTang(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'亥','乙':'午','丙':'寅','丁':'酉','戊':'寅','己':'酉','庚':'巳','辛':'子','壬':'申','癸':'卯',
  }
  return m[c.ds]===c.p.zhi || m[c.ys]===c.p.zhi
}

function check27_JinShen(c: Ctx): boolean {
  return c.pi === 3 && ['乙丑','己巳','癸酉'].includes(c.p.ganZhi)
}

// ---- 浪漫桃花 10个 ----

function check28_XianChi(c: Ctx): boolean {
  return SANHE_DIWANG[c.p.zhi] === c.p.zhi
}

function check29_HongYan(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'午','乙':'午','丙':'寅','丁':'未','戊':'辰','己':'辰','庚':'戌','辛':'酉','壬':'子','癸':'申',
  }
  return m[c.ds] === c.p.zhi
}

function check30_MuYuTaoHua(c: Ctx): boolean {
  return MUYU_MAP[c.ds] === c.p.zhi
}

function check31_DaoChaTaoHua(allNames: Set<string>, c: Ctx, taoHuaPillars: Set<number>): boolean {
  const yth = taoHuaPillars.has(0) || taoHuaPillars.has(1)
  const dth = taoHuaPillars.has(2) || taoHuaPillars.has(3)
  return yth && dth && (c.pi===2||c.pi===3) && taoHuaPillars.has(c.pi)
}

function check32_GunLangTaoHua(allNames: Set<string>, c: Ctx, taoHuaPillars: Set<number>): boolean {
  return allNames.has('咸池桃花') && allNames.has('驿马') && taoHuaPillars.has(c.pi)
}

function check33_LuoXingTaoHua(allNames: Set<string>, c: Ctx, taoHuaPillars: Set<number>): boolean {
  return allNames.has('咸池桃花') && allNames.has('沐浴桃花') && taoHuaPillars.has(c.pi)
}

function check34_HongLuan(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'卯','丑':'寅','寅':'丑','卯':'子','辰':'亥','巳':'戌',
    '午':'酉','未':'申','申':'未','酉':'午','戌':'巳','亥':'辰',
  }
  return m[c.yz] === c.p.zhi
}

function check35_TianXi(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'酉','丑':'申','寅':'未','卯':'午','辰':'巳','巳':'辰',
    '午':'卯','未':'寅','申':'丑','酉':'子','戌':'亥','亥':'戌',
  }
  return m[c.yz] === c.p.zhi
}

function check36_TianZuoZhiHe(c: Ctx): boolean {
  return c.pi === 2 && LIU_HE[c.dz] === c.mz
}

function check37_HongWu(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'酉','丑':'戌','寅':'亥','卯':'子','辰':'丑','巳':'寅',
    '午':'卯','未':'辰','申':'巳','酉':'午','戌':'未','亥':'申',
  }
  return m[c.dz] === c.p.zhi
}

// ---- 硬核凶煞 18个 ----

function check38_KuiGang(c: Ctx): boolean {
  return c.pi === 2 && ['庚辰','壬辰','戊戌','庚戌'].includes(c.p.ganZhi)
}

function check39_YangRen(c: Ctx): boolean {
  return YANGREN_MAP[c.ds] === c.p.zhi
}

function check40_FeiRen(c: Ctx): boolean {
  const yr = YANGREN_MAP[c.ds]
  return yr ? LIU_CHONG[yr] === c.p.zhi : false
}

function check41_XueZhi(c: Ctx): boolean {
  const targets: EarthlyBranch[] = ['丑','寅','卯','辰','巳','午','未','申','酉','戌','亥','子']
  const idx = branchIdx(c.mz)
  return targets[idx] === c.p.zhi
}

function check42_XueJi(c: Ctx): boolean {
  const targets: EarthlyBranch[] = ['丑','未','寅','申','卯','酉','辰','戌','巳','亥','午','子']
  const idx = branchIdx(c.mz)
  return targets[idx] === c.p.zhi
}

function check43_TianLuoDiWang(c: Ctx): boolean {
  return ['戌','亥','辰','巳'].includes(c.p.zhi)
}

function check44_YinYangChaCuo(c: Ctx): boolean {
  if (c.pi !== 2) return false
  const set = ['丙子','丁丑','戊寅','辛卯','壬辰','癸巳','丙午','丁未','戊申','辛酉','壬戌','癸亥']
  return set.includes(c.p.ganZhi)
}

function check45_GuChen(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '亥':'寅','子':'寅','丑':'寅','寅':'巳','卯':'巳','辰':'巳',
    '巳':'申','午':'申','未':'申','申':'亥','酉':'亥','戌':'亥',
  }
  return m[c.p.zhi] === c.p.zhi
}

function check46_GuaSu(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '亥':'戌','子':'戌','丑':'戌','寅':'丑','卯':'丑','辰':'丑',
    '巳':'辰','午':'辰','未':'辰','申':'未','酉':'未','戌':'未',
  }
  return m[c.p.zhi] === c.p.zhi
}

function check47_WangShen(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '申':'亥','子':'亥','辰':'亥','亥':'寅','卯':'寅','未':'寅',
    '寅':'巳','午':'巳','戌':'巳','巳':'申','酉':'申','丑':'申',
  }
  return m[c.p.zhi] === c.p.zhi
}

function check48_JieSha(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '申':'巳','子':'巳','辰':'巳','亥':'申','卯':'申','未':'申',
    '寅':'亥','午':'亥','戌':'亥','巳':'寅','酉':'寅','丑':'寅',
  }
  return m[c.p.zhi] === c.p.zhi
}

function check49_YuanChen(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'巳','丑':'午','寅':'未','卯':'申','辰':'酉','巳':'戌',
    '午':'亥','未':'子','申':'丑','酉':'寅','戌':'卯','亥':'辰',
  }
  return m[c.yz] === c.p.zhi
}

function check50_LiuXia(c: Ctx): boolean {
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'酉','乙':'戌','丙':'未','丁':'申','戊':'巳','己':'午','庚':'辰','辛':'卯','壬':'亥','癸':'寅',
  }
  return m[c.ds] === c.p.zhi
}

function check51_GouJiao(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch[]> = {
    '子':['卯','酉'],'丑':['辰','戌'],'寅':['巳','亥'],'卯':['午','子'],
    '辰':['未','丑'],'巳':['申','寅'],'午':['酉','卯'],'未':['戌','辰'],
    '申':['亥','巳'],'酉':['子','午'],'戌':['丑','未'],'亥':['寅','申'],
  }
  const arr = m[c.yz]
  return arr ? arr.includes(c.p.zhi) : false
}

function check52_ZaiSha(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '申':'午','子':'午','辰':'午','亥':'酉','卯':'酉','未':'酉',
    '寅':'子','午':'子','戌':'子','巳':'卯','酉':'卯','丑':'卯',
  }
  return m[c.p.zhi] === c.p.zhi
}

function check53_SiFei(c: Ctx): boolean {
  // ★ 四废日：《三命通会》卷三 — 以日柱干支判定
  // 春（寅卯辰月）：庚申、辛酉日
  // 夏（巳午未月）：壬子、癸亥日
  // 秋（申酉戌月）：甲寅、乙卯日
  // 冬（亥子丑月）：丙午、丁巳日
  if (c.pi !== 2) return false
  const mz = c.mz; const gz = c.p.ganZhi
  if (['寅','卯','辰'].includes(mz) && (gz === '庚申' || gz === '辛酉')) return true
  if (['巳','午','未'].includes(mz) && (gz === '壬子' || gz === '癸亥')) return true
  if (['申','酉','戌'].includes(mz) && (gz === '甲寅' || gz === '乙卯')) return true
  if (['亥','子','丑'].includes(mz) && (gz === '丙午' || gz === '丁巳')) return true
  return false
}

function check54_ShiEDaBai(c: Ctx): boolean {
  if (c.pi !== 2) return false
  const set = ['甲辰','乙巳','丙申','丁亥','戊戌','己丑','庚辰','辛巳','壬申','癸亥']
  return set.includes(c.p.ganZhi)
}

function check55_TianXing(c: Ctx): boolean {
  const targets: EarthlyBranch[] = ['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰']
  const idx = branchIdx(c.mz)
  return targets[idx] === c.p.zhi
}

// ---- 运势波动 17个 ----

function check56_YiMa(c: Ctx): boolean {
  return YIMA_MAP[c.p.zhi] === c.p.zhi
}

function check57_TianMa(c: Ctx): boolean {
  return c.pi === 3 && YIMA_MAP[c.p.zhi] === c.p.zhi
}

function check58_DiaoKe(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'戌','丑':'亥','寅':'子','卯':'丑','辰':'寅','巳':'卯',
    '午':'辰','未':'巳','申':'午','酉':'未','戌':'申','亥':'酉',
  }
  return m[c.yz] === c.p.zhi
}

function check59_SangMen(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'寅','丑':'卯','寅':'辰','卯':'巳','辰':'午','巳':'未',
    '午':'申','未':'酉','申':'戌','酉':'亥','戌':'子','亥':'丑',
  }
  return m[c.yz] === c.p.zhi
}

function check60_BaiHu(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'申','丑':'酉','寅':'戌','卯':'亥','辰':'子','巳':'丑',
    '午':'寅','未':'卯','申':'辰','酉':'巳','戌':'午','亥':'未',
  }
  return m[c.yz] === c.p.zhi
}

function check61_TianGou(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'戌','丑':'亥','寅':'子','卯':'丑','辰':'寅','巳':'卯',
    '午':'辰','未':'巳','申':'午','酉':'未','戌':'申','亥':'酉',
  }
  return m[c.yz] === c.p.zhi
}

function check62_DaHao(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'巳','丑':'午','寅':'未','卯':'申','辰':'酉','巳':'戌',
    '午':'亥','未':'子','申':'丑','酉':'寅','戌':'卯','亥':'辰',
  }
  return m[c.yz] === c.p.zhi
}

function check63_XiaoHao(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'未','丑':'申','寅':'酉','卯':'戌','辰':'亥','巳':'子',
    '午':'丑','未':'寅','申':'卯','酉':'辰','戌':'巳','亥':'午',
  }
  return m[c.yz] === c.p.zhi
}

function check64_GuanSuo(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'卯','丑':'辰','寅':'巳','卯':'午','辰':'未','巳':'申',
    '午':'酉','未':'戌','申':'亥','酉':'子','戌':'丑','亥':'寅',
  }
  return m[c.yz] === c.p.zhi
}

function check65_GouShen(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'卯','丑':'辰','寅':'巳','卯':'午','辰':'未','巳':'申',
    '午':'酉','未':'戌','申':'亥','酉':'子','戌':'丑','亥':'寅',
  }
  return m[c.yz] === c.p.zhi
}

function check66_GuanFu(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'辰','丑':'巳','寅':'午','卯':'未','辰':'申','巳':'酉',
    '午':'戌','未':'亥','申':'子','酉':'丑','戌':'寅','亥':'卯',
  }
  return m[c.yz] === c.p.zhi
}

function check67_BingFu(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'亥','丑':'子','寅':'丑','卯':'寅','辰':'卯','巳':'辰',
    '午':'巳','未':'午','申':'未','酉':'申','戌':'酉','亥':'戌',
  }
  return m[c.yz] === c.p.zhi
}

function check68_TaiSui(c: Ctx): boolean {
  return c.p.zhi === c.yz
}

function check69_SuiPo(c: Ctx): boolean {
  return LIU_CHONG[c.yz] === c.p.zhi
}

function check70_JuanShe(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'酉','丑':'戌','寅':'亥','卯':'子','辰':'丑','巳':'寅',
    '午':'卯','未':'辰','申':'巳','酉':'午','戌':'未','亥':'申',
  }
  return m[c.yz] === c.p.zhi
}

function check71_PiMa(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '子':'酉','丑':'戌','寅':'亥','卯':'子','辰':'丑','巳':'寅',
    '午':'卯','未':'辰','申':'巳','酉':'午','戌':'未','亥':'申',
  }
  return m[c.yz] === c.p.zhi
}

function check72_LiuE(c: Ctx): boolean {
  const m: Record<EarthlyBranch, EarthlyBranch> = {
    '申':'卯','子':'卯','辰':'卯','亥':'午','卯':'午','未':'午',
    '寅':'酉','午':'酉','戌':'酉','巳':'子','酉':'子','丑':'子',
  }
  return m[c.p.zhi] === c.p.zhi
}

// ★ 补充11个传统神煞算法 (check73-check83)

function check73_TongZi(c: Ctx): boolean {
  // ★ 童子煞：《三命通会》正宗口诀
  // 口诀：春秋寅子贵，冬夏卯未辰；金木马卯合，水火鸡犬多；土命逢辰巳
  // ★ 真童子 = 季节条件 AND 纳音条件同时满足

  let seasonHit = false

  // 1. 季节口诀
  if (['寅','卯','辰','申','酉','戌'].includes(c.mz)) {
    if (c.hz === '寅' || c.hz === '子' || c.dz === '寅' || c.dz === '子') seasonHit = true
  }
  if (['巳','午','未','亥','子','丑'].includes(c.mz)) {
    if (['卯','未','辰'].includes(c.hz) || ['卯','未','辰'].includes(c.dz)) seasonHit = true
  }

  if (!seasonHit) return false

  // 2. 纳音口诀（必须同时满足）
  const nayinWx = NA_YIN_WU_XING_60[c.p.ganZhi]
  if (!nayinWx) return false

  if ((nayinWx === '金' || nayinWx === '木') && (c.hz === '午' || c.hz === '卯' || c.dz === '午' || c.dz === '卯')) return true
  if ((nayinWx === '水' || nayinWx === '火') && (c.hz === '酉' || c.hz === '戌' || c.dz === '酉' || c.dz === '戌')) return true
  if (nayinWx === '土' && (c.hz === '辰' || c.hz === '巳' || c.dz === '辰' || c.dz === '巳')) return true

  return false
}

function check74_KongWang(c: Ctx): boolean {
  // ★ 空亡：《三命通会》日柱干支所在旬空
  // 60甲子每10位一旬，每旬空两个地支
  // 甲子旬(甲子→癸酉)空戌亥，甲戌旬(甲戌→癸未)空申酉...
  const ganIdx = stemIdx(c.ds)
  const zhiIdx = branchIdx(c.dz)
  // 旬首天干索引（甲=0, 甲戌=10, 甲申=20...）
  const xunStart = Math.floor(zhiIdx / 10) * 10
  // 每旬空亡地支下标 = (旬首地支 - 1) 和 (旬首地支 - 2)
  const kong1 = branchAt(xunStart - 1)
  const kong2 = branchAt(xunStart - 2)
  return c.p.zhi === kong1 || c.p.zhi === kong2
}

function check75_GuLuan(c: Ctx): boolean {
  // 孤鸾煞：特定日干支
  const set = ['甲寅','乙卯','丙午','丁巳','戊午','己巳','庚申','辛酉','壬子','癸亥']
  return c.pi === 2 && set.includes(c.p.ganZhi)
}

function check76_XueRen(c: Ctx): boolean {
  // 血刃煞：日干见特定地支
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'卯','乙':'辰','丙':'午','丁':'未','戊':'午','己':'未','庚':'酉','辛':'戌','壬':'子','癸':'丑',
  }
  return m[c.ds] === c.p.zhi
}

function check77_LiuXiuRi(c: Ctx): boolean {
  // 六秀日：丙午、丁未、戊子、戊午、己丑、己未
  const set = ['丙午','丁未','戊子','戊午','己丑','己未']
  return c.pi === 2 && set.includes(c.p.ganZhi)
}

function check78_WuXingZhengYin(c: Ctx): boolean {
  // 五行正印：日干+日支特定组合（印星得位）
  const m: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'子','乙':'亥','丙':'卯','丁':'午','戊':'午','己':'巳','庚':'戌','辛':'丑','壬':'申','癸':'酉',
  }
  return c.pi === 2 && m[c.ds] === c.dz
}

function check79_GongLu(c: Ctx): boolean {
  // 拱禄：日干禄位的前后一位出现在年或时柱
  const luMap: Record<HeavenlyStem, EarthlyBranch> = {
    '甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子',
  }
  const lu = luMap[c.ds]
  if (!lu) return false
  const luIdx = branchIdx(lu)
  const before = branchAt(luIdx - 1)
  const after = branchAt(luIdx + 1)
  return (c.p.pillarType==='年柱'||c.p.pillarType==='时柱') && (c.p.zhi===before||c.p.zhi===after)
}

function check80_TianZhuan(c: Ctx): boolean {
  // 天转：春兔夏马秋鼠冬鸡
  const mz = c.mz; const zhi = c.p.zhi
  if (['寅','卯','辰'].includes(mz) && zhi==='卯') return true
  if (['巳','午','未'].includes(mz) && zhi==='午') return true
  if (['申','酉','戌'].includes(mz) && zhi==='子') return true
  if (['亥','子','丑'].includes(mz) && zhi==='酉') return true
  return false
}

function check81_DiZhuan(c: Ctx): boolean {
  // 地转：春午夏子秋兔冬马
  const mz = c.mz; const zhi = c.p.zhi
  if (['寅','卯','辰'].includes(mz) && zhi==='午') return true
  if (['巳','午','未'].includes(mz) && zhi==='子') return true
  if (['申','酉','戌'].includes(mz) && zhi==='卯') return true
  if (['亥','子','丑'].includes(mz) && zhi==='午') return true
  return false
}

function check82_BaZhuan(c: Ctx): boolean {
  // 八专日：甲寅、乙卯、丁未、己未、庚申、辛酉、癸丑
  const set = ['甲寅','乙卯','丁未','己未','庚申','辛酉','癸丑']
  return c.pi === 2 && set.includes(c.p.ganZhi)
}

function check83_JiuChou(c: Ctx): boolean {
  // 九丑日：戊子、戊午、壬子、壬午、丁酉、丁卯、己酉、己卯、辛酉、辛卯
  const set = ['戊子','戊午','壬子','壬午','丁酉','丁卯','己酉','己卯','辛酉','辛卯']
  return c.pi === 2 && set.includes(c.p.ganZhi)
}

// ============================================================
// 五、72神煞完整字典（name/type/desc/rarity/tag/jiXiong）
// ============================================================

export const SHENSHA72_DICT: Record<string, ShenShaEntry72> = {
  // ---- 吉星高照 16 ----
  '天乙贵人': { name:'天乙贵人',type:'吉星高照',desc:'命中最尊贵的吉神，遇难成祥、贵人暗助，一生关键时刻总有援手。',rarity:'12.31%',tag:'贵气临门 逢凶化吉',jiXiong:'吉' },
  '天德贵人': { name:'天德贵人',type:'吉星高照',desc:'上天庇佑之吉星，化解灾厄于无形，内心自带安全感和幸运光环。',rarity:'8.33%',tag:'天佑之人 福泽深厚',jiXiong:'吉' },
  '月德贵人': { name:'月德贵人',type:'吉星高照',desc:'月之德星，温柔而有力量，女性贵人运极强，人际关系和顺美满。',rarity:'8.33%',tag:'阴德护佑 人缘天成',jiXiong:'吉' },
  '天德合': { name:'天德合',type:'吉星高照',desc:'天德贵人之五合——贵人运加倍，双重庇佑，好运连连不断。',rarity:'4.17%',tag:'双倍天恩 福运叠加',jiXiong:'吉' },
  '月德合': { name:'月德合',type:'吉星高照',desc:'月德贵人之五合——人际和谐度翻倍，团队中和事佬、润滑剂。',rarity:'4.17%',tag:'人缘加倍 和谐共融',jiXiong:'吉' },
  '太极贵人': { name:'太极贵人',type:'吉星高照',desc:'智慧超群、玄学天赋异禀，对宇宙规律有天然的好奇心和洞察力。',rarity:'16.67%',tag:'慧根深种 洞察天机',jiXiong:'吉' },
  '福星贵人': { name:'福星贵人',type:'吉星高照',desc:'天生有福之人，一生少大灾大难，衣食无忧，知足常乐中自带幸运。',rarity:'11.25%',tag:'福星高照 岁月静好',jiXiong:'吉' },
  '文昌贵人': { name:'文昌贵人',type:'吉星高照',desc:'学业文星，利于考试、写作、科研，学习能力和表达能力远超常人。',rarity:'10.00%',tag:'文曲下凡 学贯中西',jiXiong:'吉' },
  '国印贵人': { name:'国印贵人',type:'吉星高照',desc:'权力与权威的象征，利于从政考公、争取官方资源和企业晋升。',rarity:'8.33%',tag:'印信在手 权柄在握',jiXiong:'吉' },
  '三奇贵人': { name:'三奇贵人',type:'吉星高照',desc:'天上三奇甲戊庚——天赋异禀之命，在特殊领域有超出常人的绝世才华。',rarity:'2.50%',tag:'三奇聚顶 举世无双',jiXiong:'吉' },
  '天医贵人': { name:'天医贵人',type:'吉星高照',desc:'疗愈者之星——适合医学、心理、护理领域，自带救助他人的天赋。',rarity:'8.33%',tag:'悬壶济世 妙手仁心',jiXiong:'吉' },
  '岁殿贵人': { name:'岁殿贵人',type:'吉星高照',desc:'流年吉星入命，该年易有升迁、搬迁或人生阶段的重大升级。',rarity:'8.33%',tag:'岁星临殿 进阶有时',jiXiong:'吉' },
  '岁德贵人': { name:'岁德贵人',type:'吉星高照',desc:'年干吉星——天生自带福气，容易得到长辈和权威人士的赏识提携。',rarity:'8.33%',tag:'年德加持 长上提携',jiXiong:'吉' },
  '德秀贵人': { name:'德秀贵人',type:'吉星高照',desc:'品德与才华兼备——不仅聪明，更有让人信赖的人格魅力与道德底线。',rarity:'12.50%',tag:'德才双馨 君子之风',jiXiong:'吉' },
  '十灵日': { name:'十灵日',type:'吉星高照',desc:'灵性觉知日——这一天出生的人第六感极强，对玄学和艺术有天然感悟力。',rarity:'2.41%',tag:'清灵之气 卓尔不群',jiXiong:'吉' },
  '天赦': { name:'天赦',type:'吉星高照',desc:'上天赦免之命——逢凶化吉的"免罪金牌"，困境中总能找到出路。',rarity:'1.67%',tag:'天赦在命 万厄不侵',jiXiong:'吉' },

  // ---- 财富才华 11 ----
  '禄神': { name:'禄神',type:'财富才华',desc:'天干临官禄位——代表稳定的薪水、事业根基和个人能力的成熟度。',rarity:'16.67%',tag:'禄位高悬 衣食无忧',jiXiong:'吉' },
  '建禄': { name:'建禄',type:'财富才华',desc:'月令逢禄——事业有根基，代表职业生涯的稳定发展和升职潜力。',rarity:'8.33%',tag:'月禄归位 根基深厚',jiXiong:'吉' },
  '专禄': { name:'专禄',type:'财富才华',desc:'日柱自坐禄位——精力旺盛，事业心强，适合自主创业或担当核心岗位。',rarity:'4.17%',tag:'自坐禄乡 精力充沛',jiXiong:'吉' },
  '归禄': { name:'归禄',type:'财富才华',desc:'时支见禄——晚年运势好，适合做长期投资和退休规划。',rarity:'8.33%',tag:'禄归时柱 晚景荣华',jiXiong:'吉' },
  '金舆贵人': { name:'金舆贵人',type:'财富才华',desc:'如黄金马车——象征富贵双全，对价值和投资有独到的眼光。',rarity:'10.00%',tag:'金舆载福 富贵逼人',jiXiong:'吉' },
  '将星': { name:'将星',type:'财富才华',desc:'领导力之星——天生的决策者，在群体中自然成为核心，适合管理岗位。',rarity:'12.50%',tag:'将星坐镇 统领群英',jiXiong:'吉' },
  '华盖': { name:'华盖',type:'财富才华',desc:'孤高才气之星——聪明绝顶、艺术天赋异禀，在孤独中创造不朽作品。',rarity:'12.50%',tag:'华盖当空 才气逼人',jiXiong:'中性' },
  '天官贵人': { name:'天官贵人',type:'财富才华',desc:'官运之星——利于考公评职称、争取升职和企业管理层晋升。',rarity:'10.00%',tag:'官星入命 仕途通达',jiXiong:'吉' },
  '词馆': { name:'词馆',type:'财富才华',desc:'文采口才之星——有写作演讲辩论的天赋，适合文字和语言类工作。',rarity:'10.00%',tag:'词锋犀利 口吐珠玑',jiXiong:'吉' },
  '学堂': { name:'学堂',type:'财富才华',desc:'学习天赋之星——接受新知识的速度超快，适合终身学习和学术研究。',rarity:'10.00%',tag:'学海无涯 天赋异禀',jiXiong:'吉' },
  '金神': { name:'金神',type:'财富才华',desc:'金神入格——刚毅果断执行力极强，在关键时刻力挽狂澜的狠角色。',rarity:'2.50%',tag:'金神淬火 锋芒绝世',jiXiong:'吉' },

  // ---- 浪漫桃花 10 ----
  '咸池桃花': { name:'咸池桃花',type:'浪漫桃花',desc:'正桃花星——人缘魅力、异性缘、审美天赋，走到哪里都是焦点。',rarity:'12.50%',tag:'桃花灼灼 魅力天成',jiXiong:'中性' },
  '红艳煞': { name:'红艳煞',type:'浪漫桃花',desc:'魅力四射之煞——吸引力极强，但需防烂桃花，辨别真心和套路。',rarity:'10.00%',tag:'艳光四射 情关留意',jiXiong:'中性' },
  '沐浴桃花': { name:'沐浴桃花',type:'浪漫桃花',desc:'桃花中的"浪漫期"——情感丰富审美敏锐，但感情容易来得快去得快。',rarity:'10.00%',tag:'沐浴春风 情动于心',jiXiong:'中性' },
  '倒插桃花': { name:'倒插桃花',type:'浪漫桃花',desc:'桃花出现于日时柱——早年魅力不减，中晚年人缘更旺，越活越有味道。',rarity:'6.25%',tag:'倒插桃花 愈老愈俏',jiXiong:'中性' },
  '滚浪桃花': { name:'滚浪桃花',type:'浪漫桃花',desc:'桃花+驿马同现——感情变动频繁，容易异地恋或因奔波影响关系。',rarity:'4.17%',tag:'浪里桃花 动荡情缘',jiXiong:'凶' },
  '裸形桃花': { name:'裸形桃花',type:'浪漫桃花',desc:'桃花+沐浴同现——感情中容易暴露脆弱面，需注意自我保护。',rarity:'3.33%',tag:'赤子之心 情深易伤',jiXiong:'凶' },
  '红鸾': { name:'红鸾',type:'浪漫桃花',desc:'婚恋正桃花——红鸾星动代表婚期将近或遇到正缘，是感情大喜之星。',rarity:'8.33%',tag:'红鸾星动 佳期将近',jiXiong:'吉' },
  '天喜': { name:'天喜',type:'浪漫桃花',desc:'吉庆喜事之星——红鸾的"姐妹星"，代表添丁结婚乔迁等人生大喜。',rarity:'8.33%',tag:'天喜临门 好事成双',jiXiong:'吉' },
  '天作之合': { name:'天作之合',type:'浪漫桃花',desc:'日月六合——婚姻合作中的"天赐良缘"，两人配合默契度爆表。',rarity:'6.25%',tag:'天作之合 珠联璧合',jiXiong:'吉' },
  '红乌煞': { name:'红乌煞',type:'浪漫桃花',desc:'暗桃花——心照不宣的暧昧关系，需注意分寸和边界管理。',rarity:'8.33%',tag:'暗香浮动 月影朦胧',jiXiong:'中性' },

  // ---- 硬核凶煞 18 ----
  '魁罡贵人': { name:'魁罡贵人',type:'硬核凶煞',desc:'刚烈正直气场强大——双刃剑，成大事者也易得罪人，不怒自威。',rarity:'1.67%',tag:'魁罡镇世 刚猛无双',jiXiong:'中性' },
  '羊刃': { name:'羊刃',type:'硬核凶煞',desc:'锋利如刀的执着——执行力拉满但需防冲动，是将军手中的宝剑。',rarity:'10.00%',tag:'羊刃出鞘 所向披靡',jiXiong:'凶' },
  '飞刃': { name:'飞刃',type:'硬核凶煞',desc:'羊刃对冲——突发性冲突和意外，比羊刃更不可预测，需时刻警惕。',rarity:'5.00%',tag:'飞刃无影 防不胜防',jiXiong:'凶' },
  '血支': { name:'血支',type:'硬核凶煞',desc:'与血液手术相关——需注意身体健康和人身安全，定期体检很重要。',rarity:'8.33%',tag:'血支入命 安康为重',jiXiong:'凶' },
  '血忌': { name:'血忌',type:'硬核凶煞',desc:'忌见血光和手术——重大医疗决策需谨慎选择时机，避开高危行为。',rarity:'8.33%',tag:'血忌当头 避险为先',jiXiong:'凶' },
  '天罗地网': { name:'天罗地网',type:'硬核凶煞',desc:'困顿受限之感——但突破后往往大有所成，网是用来破的不是用来困的。',rarity:'12.50%',tag:'天网恢恢 破而后立',jiXiong:'凶' },
  '阴阳差错': { name:'阴阳差错',type:'硬核凶煞',desc:'阴阳能量错位——沟通易产生误会，需学会确认对方是否真正理解。',rarity:'5.00%',tag:'阴阳错位 沟通为桥',jiXiong:'凶' },
  '孤辰': { name:'孤辰',type:'硬核凶煞',desc:'性格孤僻不太合群——内心世界丰富但社交能量有限，独处即充电。',rarity:'12.50%',tag:'孤星独明 静水流深',jiXiong:'凶' },
  '寡宿': { name:'寡宿',type:'硬核凶煞',desc:'独居倾向——享受一个人的自由但也可能因此错过亲密关系的机会。',rarity:'12.50%',tag:'寡宿清辉 独善其身',jiXiong:'凶' },
  '亡神': { name:'亡神',type:'硬核凶煞',desc:'灵魂深处的波动——情绪起伏大有时莫名焦虑，但深度感受力是双刃剑。',rarity:'8.33%',tag:'亡神波动 心海泛舟',jiXiong:'凶' },
  '劫煞': { name:'劫煞',type:'硬核凶煞',desc:'意外破财和突发变故——需提前做好财务和人身安全的防范预案。',rarity:'8.33%',tag:'劫煞临门 防患未然',jiXiong:'凶' },
  '元辰': { name:'元辰',type:'硬核凶煞',desc:'盲派"大耗"——破耗之星，需特别注意财物管理和人际关系的维护。',rarity:'8.33%',tag:'元辰耗散 守成为上',jiXiong:'凶' },
  '流霞煞': { name:'流霞煞',type:'硬核凶煞',desc:'意外伤灾——多加小心交通和户外活动，相信你的危险直觉。',rarity:'10.00%',tag:'流霞易散 步步为营',jiXiong:'凶' },
  '勾绞煞': { name:'勾绞煞',type:'硬核凶煞',desc:'口舌是非和纠缠——容易卷入不必要的纠纷，法律事务需格外谨慎。',rarity:'10.00%',tag:'勾绞缠身 谨言慎行',jiXiong:'凶' },
  '灾煞': { name:'灾煞',type:'硬核凶煞',desc:'突发性灾难——需未雨绸缪，做好风险防范和应急预案，防患于未然。',rarity:'8.33%',tag:'灾煞虎视 有备无患',jiXiong:'凶' },
  '四废': { name:'四废',type:'硬核凶煞',desc:'季节能量最弱之时——在低谷期力不从心是正常的，休养生息即可。',rarity:'8.33%',tag:'四废低谷 蓄力待发',jiXiong:'凶' },
  '十恶大败': { name:'十恶大败',type:'硬核凶煞',desc:'严重失败倾向——重大决策前需多方求证，但不可因畏惧而止步不前。',rarity:'2.08%',tag:'十恶警示 慎思明辨',jiXiong:'凶' },
  '天刑': { name:'天刑',type:'硬核凶煞',desc:'与官方和法律惩罚相关——守法合规是你的护身符，不可心存侥幸。',rarity:'8.33%',tag:'天刑在上 法纪为纲',jiXiong:'凶' },

  // ---- 运势波动 17 ----
  '驿马': { name:'驿马',type:'运势波动',desc:'奔波变动之星——宜外出发展不宜守成，在流动中找到人生的方向。',rarity:'12.50%',tag:'驿马奔驰 志在四方',jiXiong:'中性' },
  '天马': { name:'天马',type:'运势波动',desc:'时柱驿马——晚年旅行运迁移运，退休后享受自由自在的"下半场"。',rarity:'4.17%',tag:'天马行空 晚景逍遥',jiXiong:'中性' },
  '吊客': { name:'吊客',type:'运势波动',desc:'探病送终之星——需多关心长辈身体，自己也注意健康定期体检。',rarity:'8.33%',tag:'吊客临门 关怀为上',jiXiong:'凶' },
  '丧门': { name:'丧门',type:'运势波动',desc:'丧事相关——需要在心理和物质上做好预备，定期关心家人健康。',rarity:'8.33%',tag:'丧门过境 家宅当心',jiXiong:'凶' },
  '白虎': { name:'白虎',type:'运势波动',desc:'凶猛之星——代表意外和血光，需格外注意人身安全，避开高风险行为。',rarity:'8.33%',tag:'白虎啸天 步步谨慎',jiXiong:'凶' },
  '天狗': { name:'天狗',type:'运势波动',desc:'被"夺"之星——注意财务损失和盗窃欺诈，保管好重要财物。',rarity:'8.33%',tag:'天狗食月 财帛留心',jiXiong:'凶' },
  '大耗': { name:'大耗',type:'运势波动',desc:'大破财——投资需极度谨慎，不是入场好时机，守住本金就是胜利。',rarity:'8.33%',tag:'大耗破财 守成为王',jiXiong:'凶' },
  '小耗': { name:'小耗',type:'运势波动',desc:'小破财——日常零散损失，需注意日常开支管理，养成记账的好习惯。',rarity:'8.33%',tag:'小耗不断 积少成多',jiXiong:'凶' },
  '贯索': { name:'贯索',type:'运势波动',desc:'被"锁住"的感觉——陷入瓶颈期需寻找突破口，破茧才能重生。',rarity:'8.33%',tag:'贯索缠身 破局为要',jiXiong:'凶' },
  '勾神': { name:'勾神',type:'运势波动',desc:'被牵连和牵制——在团队和家庭中容易受他人事务拖累，学会设限。',rarity:'8.33%',tag:'勾神牵连 界限分明',jiXiong:'凶' },
  '官符': { name:'官符',type:'运势波动',desc:'与官司纠纷有关——需特别注意法律合规和契约精神，不可心存侥幸。',rarity:'8.33%',tag:'官符在侧 守法为先',jiXiong:'凶' },
  '病符': { name:'病符',type:'运势波动',desc:'健康警示——需重视身体发出的信号，不要硬撑，及时就医体检。',rarity:'8.33%',tag:'病符入命 安康第一',jiXiong:'凶' },
  '太岁': { name:'太岁',type:'运势波动',desc:'犯太岁——需注意流年动向，做重大决策时格外谨慎，不可冒进。',rarity:'8.33%',tag:'太岁当头 诸事谨慎',jiXiong:'凶' },
  '岁破': { name:'岁破',type:'运势波动',desc:'与太岁对冲——冲突和动荡的能量，需做好应变准备，危机即转机。',rarity:'8.33%',tag:'岁破对冲 以变为进',jiXiong:'凶' },
  '卷舌煞': { name:'卷舌煞',type:'运势波动',desc:'口舌是非——需注意言多必失，与人争执时先想好再说，沉默是金。',rarity:'8.33%',tag:'卷舌招非 谨言为上',jiXiong:'凶' },
  '披麻煞': { name:'披麻煞',type:'运势波动',desc:'戴孝之星——与丧事和重病有关，需多关心家中长辈身体。',rarity:'8.33%',tag:'披麻在命 孝亲当先',jiXiong:'凶' },
  '六厄': { name:'六厄',type:'运势波动',desc:'六种困境——在多方面感到困难重重，需要调整心态和策略逐一突破。',rarity:'8.33%',tag:'六厄环伺 逐个击破',jiXiong:'凶' },
  // ★ 补充11个传统神煞
  '童子': { name:'童子',type:'硬核凶煞',desc:'童子命格，前世因果未了，对神秘事物有天然的亲和力，一生需经历特定磨炼方能圆满。',rarity:'1.50%',tag:'童真未泯 前世今生',jiXiong:'凶' },
  '空亡': { name:'空亡',type:'硬核凶煞',desc:'有虚无实之煞，计划常临门一脚落空，需学会顺势而为而非强求结果。',rarity:'8.33%',tag:'空亡入命 随缘得福',jiXiong:'凶' },
  '孤鸾': { name:'孤鸾',type:'浪漫桃花',desc:'情路波折之象，不是没有爱而是爱得比别人辛苦，经历风雨后终见彩虹。',rarity:'5.00%',tag:'孤鸾独舞 情路多舛',jiXiong:'凶' },
  '血刃': { name:'血刃',type:'硬核凶煞',desc:'血光之刃，提醒注意人身安全和意外伤害，但刀刃亦可为守护之器。',rarity:'5.00%',tag:'血刃护身 谨慎为上',jiXiong:'凶' },
  '六秀日': { name:'六秀日',type:'财富才华',desc:'六秀日出生者容貌清秀、心性聪慧，天生自带优雅气质和艺术感知力。',rarity:'2.50%',tag:'六秀当值 灵秀天成',jiXiong:'吉' },
  '五行正印': { name:'五行正印',type:'财富才华',desc:'印星得位，学业根基扎实，易得文凭证书等官方认可，知识改变命运的典范。',rarity:'5.00%',tag:'正印当权 学而有成',jiXiong:'吉' },
  '拱禄': { name:'拱禄',type:'财富才华',desc:'虚中带实之禄，虽然禄位不显但暗中有贵人推举，适合低调积蓄等待爆发。',rarity:'3.00%',tag:'拱禄暗藏 蓄势待发',jiXiong:'吉' },
  '天转': { name:'天转',type:'运势波动',desc:'天道运行轮转之时，人生进入转折期，旧的结束意味着新的开始。',rarity:'4.17%',tag:'天转地旋 时运更迭',jiXiong:'中性' },
  '地转': { name:'地转',type:'运势波动',desc:'地势轮转之机，根基和环境的变动期，不宜大兴土木或搬迁。',rarity:'4.17%',tag:'地转山移 根基待稳',jiXiong:'凶' },
  '八专': { name:'八专',type:'硬核凶煞',desc:'感情专注但易陷入执念，爱得太深反成束缚，需学会在关系中保持自我。',rarity:'3.33%',tag:'八专情深 执念可化',jiXiong:'凶' },
  '九丑': { name:'九丑',type:'硬核凶煞',desc:'外表光鲜内在波动，需注意在公众场合的形象管理和情绪控制。',rarity:'3.33%',tag:'九丑藏拙 内外兼修',jiXiong:'凶' },
}

// ============================================================
// 六、主计算函数 — 返回所有命中的神煞
// ============================================================

export interface ShenShaHit {
  name: string; type: string; desc: string; rarity: string; tag: string
  pillar: number; jiXiong: '吉'|'凶'|'中性'
}

export function computeAllShenSha72(chart: BaziChart, extraPillars: PillarData[] = []): ShenShaHit[] {
  const hits: ShenShaHit[] = []
  const added = new Set<string>()
  const ctx = makeCtx(chart)

  // ★ 合并原局四柱 + 额外柱（大运+流年），用 pi=4+ 标记
  const allPillars: Array<{ p: PillarData; pi: number }> = []
  for (let i = 0; i < 4; i++) allPillars.push({ p: chart.pillars[i], pi: i })
  for (let i = 0; i < extraPillars.length; i++) allPillars.push({ p: extraPillars[i], pi: 4 + i })

  // 第一遍：逐柱逐神煞计算
  const pillarCheckers: Array<[string, (c: Ctx) => boolean]> = [
    ['天乙贵人',check1_TianYi],['天德贵人',check2_TianDe],['月德贵人',check3_YueDe],
    ['天德合',check4_TianDeHe],['月德合',check5_YueDeHe],['太极贵人',check6_TaiJi],
    ['福星贵人',check7_FuXing],['文昌贵人',check8_WenChang],['国印贵人',check9_GuoYin],
    ['三奇贵人',check10_SanQi],['天医贵人',check11_TianYiGui],['岁殿贵人',check12_SuiDian],
    ['岁德贵人',check13_SuiDe],['德秀贵人',check14_DeXiu],['十灵日',check15_ShiLing],
    ['天赦',check16_TianShe],
    ['禄神',check17_LuShen],['建禄',check18_JianLu],['专禄',check19_ZhuanLu],
    ['归禄',check20_GuiLu],['金舆贵人',check21_JinYu],['将星',check22_JiangXing],
    ['华盖',check23_HuaGai],['天官贵人',check24_TianGuan],['词馆',check25_CiGuan],
    ['学堂',check26_XueTang],['金神',check27_JinShen],
    ['桃花',check28_XianChi],['红艳',check29_HongYan],
    ['红鸾',check34_HongLuan],['天喜',check35_TianXi],
    ['魁罡',check38_KuiGang],['羊刃',check39_YangRen],['飞刃',check40_FeiRen],
    ['天罗地网',check43_TianLuoDiWang],
    ['阴差阳错',check44_YinYangChaCuo],['孤辰',check45_GuChen],['寡宿',check46_GuaSu],
    ['亡神',check47_WangShen],['劫煞',check48_JieSha],['元辰',check49_YuanChen],
    ['流霞',check50_LiuXia],['勾绞',check51_GouJiao],['灾煞',check52_ZaiSha],
    ['四废日',check53_SiFei],['十恶大败',check54_ShiEDaBai],
    ['驿马',check56_YiMa],['吊客',check58_DiaoKe],
    ['丧门',check59_SangMen],['披麻',check71_PiMa],
    // ★ 补充11个传统神煞
    ['童子',check73_TongZi],['空亡',check74_KongWang],['孤鸾',check75_GuLuan],
    ['血刃',check76_XueRen],['六秀日',check77_LiuXiuRi],['五行正印',check78_WuXingZhengYin],
    ['拱禄',check79_GongLu],['天转',check80_TianZhuan],['地转',check81_DiZhuan],
    ['八专',check82_BaZhuan],['九丑',check83_JiuChou],
  ]

  // 逐柱计算
  for (const { p, pi } of allPillars) {
    ctx.p = p; ctx.pi = pi
    for (const [name, fn] of pillarCheckers) {
      try {
        if (fn(ctx)) {
          const entry = SHENSHA72_DICT[name]
          const text = SHENSHA_TEXT_DICT[name]
          if (entry && !added.has(name + '_' + pi)) {
            added.add(name + '_' + pi)
            hits.push({ name, type: entry.type, desc: text?.desc || entry.desc || '', rarity: text?.rarity || entry.rarity || '', tag: text?.tag || entry.tag || '', pillar: pi, jiXiong: entry.jiXiong })
          }
        }
      } catch {}
    }
  }

  // 第二遍：复合神煞（跨柱判断）
  const allHitNames = new Set(hits.map(h => h.name))
  const taoHuaPillars = new Set(hits.filter(h => h.name === '咸池桃花').map(h => h.pillar))

  // 倒插桃花：年月有桃花 + 日时有桃花
  if (taoHuaPillars.size > 0) {
    if (check31_DaoChaTaoHua(allHitNames, ctx, taoHuaPillars)) {
      for (const pi of taoHuaPillars) {
        if (pi >= 2 && !added.has('倒插桃花_' + pi)) {
          const e = SHENSHA72_DICT['倒插桃花']
          added.add('倒插桃花_' + pi)
          hits.push({ name:'倒插桃花',type:e.type,desc:e.desc,rarity:e.rarity,tag:e.tag,pillar:pi,jiXiong:e.jiXiong })
        }
      }
    }
    // 滚浪桃花：桃花+驿马同现
    if (check32_GunLangTaoHua(allHitNames, ctx, taoHuaPillars)) {
      for (const pi of taoHuaPillars) {
        if (!added.has('滚浪桃花_' + pi)) {
          const e = SHENSHA72_DICT['滚浪桃花']
          added.add('滚浪桃花_' + pi)
          hits.push({ name:'滚浪桃花',type:e.type,desc:e.desc,rarity:e.rarity,tag:e.tag,pillar:pi,jiXiong:e.jiXiong })
        }
      }
    }
    // 裸形桃花：桃花+沐浴同现
    if (check33_LuoXingTaoHua(allHitNames, ctx, taoHuaPillars)) {
      for (const pi of taoHuaPillars) {
        if (!added.has('裸形桃花_' + pi)) {
          const e = SHENSHA72_DICT['裸形桃花']
          added.add('裸形桃花_' + pi)
          hits.push({ name:'裸形桃花',type:e.type,desc:e.desc,rarity:e.rarity,tag:e.tag,pillar:pi,jiXiong:e.jiXiong })
        }
      }
    }
  }

  return hits
}

// ============================================================
// 七、兼容旧接口
// ============================================================

export function getShenshaFull(name: string): any {
  const e = SHENSHA72_DICT[name]
  if (e) {
    // ★ 从现有字典数据补全 shortMeaning / dailyGuide 字段
    const short = e.desc.length > 18 ? e.desc.slice(0, 18) + '...' : e.desc
    const guide = e.tag ? '「' + e.tag + '」' + e.desc : e.desc
    return { ...e, shortMeaning: short, dailyGuide: guide }
  }
  return { name, type:'运势波动', shortMeaning:'一种特殊的命理标记', dailyGuide:'今日可留意这方面的能量动向。' }
}

export function getShenshaEntry72(name: string): ShenShaEntry72 | undefined {
  return SHENSHA72_DICT[name]
}

// 保留旧日报接口兼容
export interface DailyFortuneV3 { theme: string; analysis: string; energy: number; suitable: string[]; avoid: string[] }
export const DAILY_TEN_SHEN_FORTUNE: Record<HeavenlyStem, Record<string, DailyFortuneV3>> = {} as any
export function getDailyTenShenFortune(ds: HeavenlyStem, tg: string): DailyFortuneV3 {
  return getDailyFortuneSuit(tg)
}

/** 十神基础宜忌表（仅模板骨架，analysis 在外面动态拼接） */
function getDailyFortuneSuit(tg: string): DailyFortuneV3 {
  const suits: Record<string, DailyFortuneV3> = {
    '比肩': { theme:'比肩日 — 自我能量充沛的一天', analysis:'', energy:78, suitable:['独立行动，相信直觉','做自己一直想做的事情','复盘个人目标和规划'], avoid:['盲从他人意见','过度社交消耗能量','冲动决策'] },
    '劫财': { theme:'劫财日 — 社交活跃，注意财务边界', analysis:'', energy:70, suitable:['社交聚会，拓展人脉','团队协作完成任务','学习新知识技能'], avoid:['大额消费或冲动购物','合伙投资','替人作保或借贷'] },
    '食神': { theme:'食神日 — 才华流淌，享受创造乐趣', analysis:'', energy:82, suitable:['发挥创造力进行创作','享用美食犒劳自己','表达内心真实想法'], avoid:['过度放纵饮食','拒绝社交机会','压抑表达欲望'] },
    '伤官': { theme:'伤官日 — 思维活跃，注意言语分寸', analysis:'', energy:75, suitable:['脑力激荡，解决问题','学习艺术或新技能','展示才华争取机会'], avoid:['与人发生口舌之争','顶撞上级或长辈','言多必失'] },
    '正财': { theme:'正财日 — 财运稳固，务实进取', analysis:'', energy:80, suitable:['处理财务和投资事务','制定预算和理财计划','踏实工作积累成果'], avoid:['投机取巧走捷径','忽视长期规划','过度吝啬'] },
    '偏财': { theme:'偏财日 — 意外之财，机会闪现', analysis:'', energy:85, suitable:['把握投资和副业机会','拓展新的收入渠道','社交应酬积累资源'], avoid:['贪心冒进孤注一掷','忽视风险管理','轻信他人推荐'] },
    '正官': { theme:'正官日 — 责任在肩，展现专业', analysis:'', energy:72, suitable:['展示专业能力和责任心','主动承担工作任务','与上级沟通争取认可'], avoid:['推卸责任或逃避挑战','违规操作走捷径','消极被动等待'] },
    '七杀': { theme:'七杀日 — 压力即动力，果敢破局', analysis:'', energy:65, suitable:['面对挑战迎难而上','做出艰难但正确的决定','锻炼领导力和决断力'], avoid:['冲动行事不计后果','与人激烈对抗','陷入焦虑和自我怀疑'] },
    '正印': { theme:'正印日 — 贵人相助，学习提升', analysis:'', energy:76, suitable:['学习新知识或技能','请教长辈或专业人士','阅读和深度思考'], avoid:['拒绝他人的善意建议','固步自封不愿学习','忽视自我提升'] },
    '偏印': { theme:'偏印日 — 深度洞察，独立思考', analysis:'', energy:74, suitable:['深度研究和思考','独立完成复杂任务','探索玄学或哲学领域'], avoid:['过度孤僻拒绝沟通','钻牛角尖走极端','忽视实际操作'] },
    '日主': { theme:'日主日 — 回归自我，确认方向', analysis:'', energy:72, suitable:['自我反思和规划','做真正喜欢的事情','与自己独处充电'], avoid:['被他人的意见左右','过度在意他人评价','勉强自己社交'] },
  }
  return suits[tg] || { theme:'日运平和', analysis:'', energy:60, suitable:['按自己节奏安排'], avoid:['强求突破'] }
}

/**
 * ★ 流日动态模板：基于今日干支 + 十神关系生成断语、调整维度
 */
export function buildDailyFortune(
  dailyGanZhi: string,
  todayTenGod: string,
  dayMaster: HeavenlyStem,
  dailyGan: HeavenlyStem,
  hitNames: string[],
): { fortune: DailyFortuneV3; dimScores: { label: string; value: number; color: string }[] } {

  // 1) 取十神骨架（theme / suitable / avoid）
  const base = getDailyFortuneSuit(todayTenGod)

  // 2) 五行生克描述模板
  const WX: Record<string, string> = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' }
  const SHENG: Record<string, string> = { '木':'火','火':'土','土':'金','金':'水','水':'木' }
  const KE: Record<string, string> = { '木':'土','火':'金','土':'水','金':'木','水':'火' }

  const dwx = WX[dayMaster] || '土'
  const twx = WX[dailyGan] || '土'

  let interaction = ''
  if (SHENG[dwx] === twx) {
    interaction = `今日${dailyGanZhi}生出你的日主${dayMaster}（${dwx}生${twx}），天地对你"加持"，是顺风顺水的一天。`
  } else if (SHENG[twx] === dwx) {
    interaction = `你的日主${dayMaster}生出今日${dailyGanZhi}（${dwx}生${twx}），你的才华和能量正在向外流淌。`
  } else if (KE[twx] === dwx) {
    interaction = `今日${dailyGanZhi}克制你的日主${dayMaster}（${twx}克${dwx}），是挑战与机遇并存的一天，压力即动力。`
  } else if (KE[dwx] === twx) {
    interaction = `你的日主${dayMaster}克制今日${dailyGanZhi}（${dwx}克${twx}），你对周围事物有很强的掌控力。`
  } else {
    interaction = `今日${dailyGanZhi}与你的日主${dayMaster}五行相同（${dwx}），是同频共振的一天。`
  }

  // ★ 十神维度侧重偏移（食伤类 → 情感/学业+，官杀类 → 事业+，财类 → 财富+）
  const TEN_GOD_DIM_OFFSET: Record<string, { wealth: number; career: number; emotion: number; study: number; health: number }> = {
    '比肩': { wealth: 2, career: 3, emotion: 2, study: 2, health: 2 },
    '劫财': { wealth: -3, career: 4, emotion: 4, study: 0, health: -2 },
    '食神': { wealth: 4, career: 2, emotion: 10, study: 10, health: 6 },
    '伤官': { wealth: 4, career: 0, emotion: 10, study: 12, health: -4 },
    '正财': { wealth: 10, career: 4, emotion: 0, study: 2, health: 2 },
    '偏财': { wealth: 12, career: 4, emotion: 3, study: 0, health: 2 },
    '正官': { wealth: 3, career: 10, emotion: 0, study: 3, health: 0 },
    '七杀': { wealth: 3, career: 12, emotion: -2, study: 3, health: -6 },
    '正印': { wealth: 2, career: 2, emotion: 5, study: 12, health: 6 },
    '偏印': { wealth: 0, career: 2, emotion: 4, study: 14, health: 4 },
    '日主': { wealth: 3, career: 3, emotion: 3, study: 3, health: 3 },
  }
  const tgOffset = TEN_GOD_DIM_OFFSET[todayTenGod] || { wealth: 0, career: 0, emotion: 0, study: 0, health: 0 }

  // 3) 组装 analysis（动态模板）
  const analysis = `${interaction}`

  base.analysis = analysis

  // 4) 四维：神煞维度分 + 十神偏移 → 限幅 50-85
  const dimScores = buildDimScores(hitNames, tgOffset)

  return { fortune: base, dimScores }
}

/**
 * 四维运算：神煞权重 + 十神偏移 → clamp 50-85
 */
export function buildDimScores(
  hitNames: string[],
  tgOffset: { wealth: number; career: number; emotion: number; study: number; health: number },
): { label: string; value: number; color: string }[] {
  const DIMS: ('wealth'|'career'|'emotion'|'study'|'health')[] = ['wealth','career','emotion','study','health']
  const LABEL: Record<string, string> = { wealth:'财富', career:'事业', emotion:'情感', study:'学业', health:'健康' }
  const COLOR: Record<string, string> = { wealth:'#f0c040', career:'#6c5ce7', emotion:'#f472b6', study:'#4ecdc4', health:'#34d399' }

  return DIMS.map(dim => {
    // 神煞维度扣分（累加模式，从 60 起算）
    let raw = 60
    const parts: string[] = [`基础 60`]

    const SUPPRESS_SET = new Set(['空亡','亡神','四废','十恶大败'])

    for (const name of hitNames) {
      // 抑制煞：跳过个体维度扣分，用 cap 统一压制
      if (SUPPRESS_SET.has(name)) continue

      // 优先用维度精确权重
      const dw = SHENSHA_DIM_WEIGHTS[name]
      if (dw) {
        const dval = dw[dim]
        if (dval !== 0) {
          const effective = (raw > 80 && dval > 0) ? Math.floor(dval / 2) : dval
          raw += effective
          parts.push(`${name} ${effective >= 0 ? '+' : ''}${effective}`)
        }
        continue
      }
      // 无维度权重 -> 从总分权重按 1/4 折算到每维（取整）
      const w = SHENSHA_WEIGHTS[name]
      if (w !== undefined && w !== 0) {
        const divided = Math.round(w / 4)
        const effective = (raw > 80 && divided > 0) ? Math.floor(divided / 2) : divided
        raw += effective
        parts.push(`${name} ${effective >= 0 ? '+' : ''}${effective}`)
      }
    }

    // 十神偏移
    const to = tgOffset[dim]
    if (to !== 0) {
      raw += to
      parts.push(`十神偏移 ${to >= 0 ? '+' : ''}${to}`)
    }

    // 强制校验：空亡/亡神/四废/十恶大败 → cap 75
    const hasSuppress = hitNames.some(n => SUPPRESS_SET.has(n))
    if (hasSuppress) {
      raw = Math.min(raw, 75)
      parts.push(`⚠ 抑制煞 cap≤75`)
    }

    // ★ clamp 53-85
    raw = Math.max(53, Math.min(85, raw))
    parts.push(`= ${Math.round(raw)}`)

    console.log(`[${LABEL[dim]}] ${parts.join(' → ')}`)
    return { label: LABEL[dim], value: Math.round(raw), color: COLOR[dim] }
  })
}

/**
 * 为每个维度生成自然语言评分逻辑说明
 */
export function buildDimExplanations(hitNames: string[], todayTenGod: string): string[] {
  const DIMS = ['财富', '事业', '情感', '学业', '健康']
  const dimKeys: ('wealth'|'career'|'emotion'|'study'|'health')[] = ['wealth','career','emotion','study','health']

  // ★ 维度核心逻辑表（包含《易林补遗》分宫断病法）
  const DIM_CORE: Record<string, { desc: string; pos: string[]; neg: string[] }> = {
    wealth: {
      desc: '妻财爻为用神，禄神与煞旺相为加分依据',
      pos: ['禄神','建禄','专禄','归禄','金舆贵人','天官贵人','天乙贵人'],
      neg: ['劫煞','元辰','大耗','小耗','天狗','空亡','羊刃'],
    },
    career: {
      desc: '官鬼爻为用神，将星与印星代表事业高度',
      pos: ['将星','天官贵人','国印贵人','禄神','天德贵人','月德贵人'],
      neg: ['羊刃','飞刃','勾绞煞','天刑','官符','贯索','卷舌煞','岁破','太岁'],
    },
    emotion: {
      desc: '妻财/官鬼为用神，红鸾天喜主感情，孤辰寡宿妨婚姻',
      pos: ['红鸾','天喜','天作之合','咸池桃花','红艳煞'],
      neg: ['孤辰','寡宿','阴阳差错','孤鸾','八专','滚浪桃花'],
    },
    study: {
      desc: '父母爻/印星为用神，文昌学堂主学运，四废童子损慧根',
      pos: ['文昌贵人','学堂','词馆','太极贵人','天医贵人','正印','偏印'],
      neg: ['四废','童子','天罗地网','亡神','血刃','病符'],
    },
    health: {
      desc: '子孙爻为用药（《易林补遗》），分宫断病法：乾兑肺、离心、震肝胆、坤脾胃、坎肾',
      pos: ['天医贵人','天德贵人','月德贵人','德秀贵人','福星贵人','天赦'],
      neg: ['血支','血忌','病符','白虎','丧门','吊客','血刃','流霞煞','灾煞','六厄','披麻煞','地转'],
    },
  }

  return DIMS.map((label, i) => {
    const k = dimKeys[i]
    const core = DIM_CORE[k]

    // 命中正面神煞
    const hitPos = hitNames.filter(n => core.pos.includes(n))
    // 命中负面神煞
    const hitNeg = hitNames.filter(n => core.neg.includes(n))
    // 抑制煞
    const hasSuppress = ['空亡','亡神','四废','十恶大败'].some(n => hitNames.includes(n))

    let explain = `【${label}】`
    if (k === 'health') {
      // ★ 健康维度的《易林补遗》分宫断病法说明
      const bloodProblems = hitNeg.filter(n => ['血支','血忌','血刃'].includes(n))
      const stasisProblems = hitNeg.filter(n => ['白虎','丧门','病符'].includes(n))
      if (bloodProblems.length > 0) explain += `\n  血光之厄（${bloodProblems.join('、')}）《易林补遗》云：血神入卦，宜谨慎外伤手术。`
      if (stasisProblems.length > 0) explain += `\n  病符入命（${stasisProblems.join('、')}）《易林补遗》云：病符临爻，虽轻亦旷日。`
    }
    explain += core.desc + '。'
    if (hitPos.length > 0) explain += `\n  ↑ 加分神煞：${hitPos.join('、')}。`
    if (hitNeg.length > 0) explain += `\n  ↓ 扣分神煞：${hitNeg.join('、')}。`
    if (hasSuppress) explain += `\n  ⚠ 抑制煞压制（空亡/亡神/四废），上限≤75。`
    explain += `\n  今日十神「${todayTenGod}」叠加偏移影响。`

    return explain
  })
}

// ============================================================
// ★ 基础神煞池（IS_BASIC）— 用于四柱神煞分级展示
// 只有标记为 true 的神煞默认显示在卡片上，其余折叠
// ============================================================

/** 核心格局神煞 — 对命局影响最大、最值得优先展示 */
export const IS_BASIC: Set<string> = new Set([
  // ★ 顶级贵人
  '天乙贵人','天德贵人','月德贵人','天德合','月德合',
  '太极贵人','三奇贵人','天赦','福星贵人',
  // ★ 财富/格局
  '禄神','建禄','专禄','归禄','金舆贵人','天官贵人',
  '将星','华盖','金神',
  // ★ 文运/慧根
  '文昌贵人','学堂','词馆','国印贵人','天医贵人','十灵日',
  // ★ 情感/婚姻
  '红鸾','天喜','天作之合',
  // ★ 凶煞（对格局影响大）
  '羊刃','魁罡贵人','天罗地网','空亡',
  // ★ 称号别名兼容
  '魁罡','天赦日','国印','金舆','天医',
])

/**
 * 神煞聚合：根据今日命中的神煞，生成 2-3 条综合决策建议
 * 不罗列神煞名，直接输出行动指引
 */
export function generateShenshaSummary(hitNames: string[], todayTenGod: string): string[] {
  const lines: string[] = []
  const ji = hitNames.filter(n => { const w = SHENSHA_WEIGHTS[n]; return w !== undefined && w > 0 })
  const xiong = hitNames.filter(n => { const w = SHENSHA_WEIGHTS[n]; return w !== undefined && w < 0 })

  if (ji.length > 0) {
    if (['天乙贵人','天德贵人','月德贵人'].some(n => ji.includes(n))) lines.push('今日贵人运较强，适合当面沟通、拜访或谈判——主动出击比等待更有效。')
    else if (['禄神','金舆贵人'].some(n => ji.includes(n))) lines.push('今日财运信号积极，适合处理财务事务、做预算或谈报价。')
    else if (ji.includes('文昌贵人')) lines.push('今日学习效率高，适合读书、写作或处理需要专注的分析类工作。')
    else if (['红鸾','天喜'].some(n => ji.includes(n))) lines.push('今日情感能量积极，适合社交活动或与伴侣增进沟通。')
    else lines.push('今日整体态势平稳，适合推进日常工作与计划。')
  }

  if (xiong.length > 0) {
    if (['羊刃','飞刃'].some(n => xiong.includes(n))) lines.push('注意控制情绪和冲动决策，重大选择建议隔夜再做决定。')
    if (['劫煞','大耗'].some(n => xiong.includes(n))) lines.push('今日财务流动较大，避免冲动消费或大额投资，守住现金流。')
    if (['白虎','病符','血刃'].some(n => xiong.includes(n))) lines.push('健康方面多留意身体信号，不要硬撑，适当休息比硬扛更有生产力。')
    if (['空亡','亡神'].some(n => xiong.includes(n))) lines.push('计划可能遇到临时变动，保持弹性心态，准备好备选方案。')
    if (['丧门','吊客','披麻'].some(n => xiong.includes(n))) lines.push('多关心长辈和家人健康，也提醒自己放慢节奏。')
    if (['勾绞煞','官符','卷舌煞'].some(n => xiong.includes(n))) lines.push('注意沟通措辞，避免卷入不必要的争论或文字纠纷。')
  }

  // 十神倾向
  if (['七杀','正官'].includes(todayTenGod)) lines.push('今日适合以专业姿态示人，承担责任、接受挑战能赢得信任。')
  else if (['食神','伤官'].includes(todayTenGod)) lines.push('创意和表达能力在线，适合写作、提案或头脑风暴。')
  else if (['正印','偏印'].includes(todayTenGod)) lines.push('适合学习、研究或与有经验的人交流，获取新视角。')
  else if (['正财','偏财'].includes(todayTenGod)) lines.push('财务相关事宜可以着手处理，务实是最佳策略。')

  if (lines.length === 0) lines.push('今日运势平稳，宜按既定计划行事，不宜冒进。')
  return [...new Set(lines)].slice(0, 3)
}

// ============================================================
// 八、神煞加权得分计算
// ============================================================

/** 神煞权重表 */
const SHENSHA_WEIGHTS: Record<string, number> = {
  // ★ 吉星高照
  '天乙贵人': 12, '天德贵人': 12, '月德贵人': 10, '天德合': 15, '月德合': 10,
  '太极贵人': 8, '福星贵人': 8, '文昌贵人': 8, '国印贵人': 6, '三奇贵人': 18,
  '天医贵人': 6, '岁殿贵人': 6, '岁德贵人': 5, '德秀贵人': 6, '十灵日': 8, '天赦': 14,
  // ★ 财富才华
  '禄神': 8, '建禄': 6, '专禄': 8, '归禄': 5, '金舆贵人': 8,
  '将星': 6, '华盖': 4, '天官贵人': 6, '词馆': 5, '学堂': 5, '金神': 10,
  // ★ 浪漫桃花（中性偏吉）
  '咸池桃花': 2, '红艳煞': 1, '沐浴桃花': 1, '倒插桃花': 2,
  '红鸾': 6, '天喜': 6, '天作之合': 8,
  // ★ 硬核凶煞
  '魁罡贵人': 2, '羊刃': -18, '飞刃': -15, '血支': -12, '血忌': -12,
  '天罗地网': -10, '阴阳差错': -12, '孤辰': -8, '寡宿': -8,
  '亡神': -10, '劫煞': -12, '元辰': -10, '流霞煞': -10, '勾绞煞': -8,
  '灾煞': -12, '四废': -15, '十恶大败': -18, '天刑': -10,
  // ★ 硬核凶煞（补）
  '童子': -15, '空亡': -10, '血刃': -12, '八专': -6, '九丑': -4,
  // ★ 运势波动（中性偏凶）
  '驿马': 0, '天马': 0, '吊客': -10, '丧门': -15, '白虎': -14,
  '天狗': -10, '大耗': -12, '小耗': -6, '贯索': -8, '勾神': -6,
  '官符': -8, '病符': -10, '太岁': -12, '岁破': -14, '卷舌煞': -6,
  '披麻煞': -8, '六厄': -10, '天转': -4, '地转': -4,
  // ★ 补
  '孤鸾': -6, '六秀日': 5, '五行正印': 6, '拱禄': 5,
}

const BRANCHES_WEIGHT: string[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

/**
 * 凶煞 → 五维扣分映射表
 * 神煞命中时，分别影响 wealth(财富) / career(事业) / emotion(情感) / study(学业) / health(健康)
 * 健康维度依据《易林补遗》分宫断病法：
 *   血支/血忌/血刃 → 血光外伤，健康 -14
 *   病符/白虎/丧门/吊客 → 疾病丧服，健康 -12~-16
 *   四废/十恶大败 → 体质极弱，健康 -15
 */
const SHENSHA_DIM_WEIGHTS: Record<string, { wealth: number; career: number; emotion: number; study: number; health: number }> = {
  // ★ 硬核凶煞
  '羊刃':      { wealth: -5, career: -18, emotion: -8, study: -4, health: -6 },
  '飞刃':      { wealth: -5, career: -15, emotion: -5, study: -4, health: -8 },
  '血支':      { wealth: -2, career: -4, emotion: -2, study: -10, health: -14 },
  '血忌':      { wealth: -2, career: -4, emotion: -2, study: -10, health: -14 },
  '天罗地网':  { wealth: -6, career: -8, emotion: -4, study: -12, health: -6 },
  '阴阳差错':  { wealth: -4, career: -6, emotion: -15, study: -6, health: -2 },
  '孤辰':      { wealth: 0, career: -4, emotion: -15, study: -4, health: -4 },
  '寡宿':      { wealth: 0, career: -4, emotion: -15, study: -4, health: -4 },
  '亡神':      { wealth: -4, career: -6, emotion: -10, study: -6, health: -6 },
  '劫煞':      { wealth: -15, career: -6, emotion: -4, study: -4, health: -6 },
  '元辰':      { wealth: -14, career: -6, emotion: -4, study: -4, health: -4 },
  '流霞煞':    { wealth: -2, career: -6, emotion: -4, study: -8, health: -10 },
  '勾绞煞':    { wealth: -4, career: -12, emotion: -6, study: -4, health: -4 },
  '灾煞':      { wealth: -8, career: -10, emotion: -4, study: -8, health: -12 },
  '四废':      { wealth: -8, career: -10, emotion: -6, study: -15, health: -14 },
  '十恶大败':  { wealth: -15, career: -15, emotion: -8, study: -10, health: -5 },
  '天刑':      { wealth: -6, career: -14, emotion: -4, study: -6, health: -6 },
  // ★ 运势波动（凶）
  '吊客':      { wealth: -2, career: -4, emotion: -10, study: -6, health: -12 },
  '丧门':      { wealth: -4, career: -6, emotion: -12, study: -8, health: -14 },
  '白虎':      { wealth: -6, career: -8, emotion: -4, study: -10, health: -16 },
  '天狗':      { wealth: -14, career: -6, emotion: -4, study: -4, health: -2 },
  '大耗':      { wealth: -18, career: -6, emotion: -4, study: -4, health: -2 },
  '小耗':      { wealth: -10, career: -2, emotion: -2, study: -2, health: -2 },
  '贯索':      { wealth: -6, career: -12, emotion: -4, study: -6, health: -4 },
  '勾神':      { wealth: -4, career: -10, emotion: -6, study: -4, health: -4 },
  '官符':      { wealth: -6, career: -14, emotion: -4, study: -6, health: -2 },
  '病符':      { wealth: -4, career: -6, emotion: -4, study: -10, health: -16 },
  '太岁':      { wealth: -8, career: -12, emotion: -6, study: -8, health: -6 },
  '岁破':      { wealth: -8, career: -14, emotion: -8, study: -8, health: -4 },
  '卷舌煞':    { wealth: -2, career: -10, emotion: -6, study: -2, health: -2 },
  '披麻煞':    { wealth: -2, career: -4, emotion: -10, study: -8, health: -12 },
  '六厄':      { wealth: -6, career: -8, emotion: -6, study: -10, health: -10 },
  '地转':      { wealth: -6, career: -8, emotion: -4, study: -6, health: -6 },
  // ★ 浪漫桃花（凶）
  '滚浪桃花':  { wealth: -4, career: -4, emotion: -12, study: -4, health: -2 },
  '裸形桃花':  { wealth: -2, career: -2, emotion: -10, study: -4, health: -2 },
  '红乌煞':    { wealth: -2, career: -2, emotion: -6, study: -2, health: -2 },
  // ★ 补充传统神煞（凶）
  '童子':      { wealth: -6, career: -8, emotion: -8, study: -12, health: -4 },
  '空亡':      { wealth: -10, career: -8, emotion: -4, study: -10, health: -6 },
  '孤鸾':      { wealth: 0, career: -2, emotion: -14, study: -4, health: -2 },
  '血刃':      { wealth: -4, career: -6, emotion: -2, study: -8, health: -14 },
  '八专':      { wealth: -2, career: -4, emotion: -12, study: -4, health: -2 },
  '九丑':      { wealth: -2, career: -4, emotion: -8, study: -4, health: -2 },
}

const DIM_NAMES: ('wealth' | 'career' | 'emotion' | 'study')[] = ['wealth', 'career', 'emotion', 'study']

// ============================================================
// 《增删卜易》运势维度权重参考表
// ============================================================
//
// 以下定义严格遵循《增删卜易》取用神体系，作为所有评分算法的核心依据：
//
// ┌─────────────────────────────────────────────────────────────────────┐
// │ ■ 财运（wealth）                                                    │
// │   用神：妻财爻（《增删卜易》云："凡占财，以财爻为用神"）             │
// │   加分依据：禄神（食禄）、金舆贵人（财帛）、天乙贵人（贵人带财）     │
// │   扣分依据：劫煞破财、大耗小耗损财、空亡财落空                      │
// │   断语原文："财旺持世，求财必得；财逢空破，货财难存"                │
// │                                                                     │
// │ ■ 事业（career）                                                    │
// │   用神：官鬼爻（《增删卜易》云："凡占功名，以官鬼为用神"）           │
// │   加分依据：将星（权力）、天官贵人（官禄）、国印贵人（官印）         │
// │   扣分依据：羊刃剉官、天刑法绳、官符诉讼、太岁岁破犯上                │
// │   断语原文："官星持世旺相，所求必遂；官逢冲克，功名有损"            │
// │                                                                     │
// │ ■ 情感（emotion）                                                   │
// │   用神：男占以妻财爻，女占以官鬼爻（《增删卜易》："男占婚财为用"）  │
// │   加分依据：红鸾（婚姻）、天喜（喜事）、天作之合（六合）、桃花（人缘）│
// │   扣分依据：孤辰寡宿妨婚姻、阴阳差错多口舌、八专九丑陷情劫          │
// │   断语原文："财官合世，婚姻可成；六冲六害，终见分离"                │
// │                                                                     │
// │ ■ 学业/慧根（study）                                                │
// │   用神：父母爻/印星（《增删卜易》："凡占学业，以父母为用神"）       │
// │   加分依据：文昌贵人（文运）、学堂词馆（学业）、太极贵人（慧根）     │
// │   扣分依据：四废日损智、童子煞障慧、病符体弱滞学                    │
// │   断语原文："父母持世，学而有成；四废逢之，聪明减半"                │
// └─────────────────────────────────────────────────────────────────────┘

// ============================================================
// 八、神煞加权得分计算（平衡模型）
// ============================================================

const SCORE_BASE = 60

/**
 * 用神旺衰校验：命中"空亡" 或 "休囚" 类凶煞，则维度上限 65
 */
const IMITATING_KEYS = new Set<string>([
  '空亡', '亡神', '四废', '十恶大败',
])

function hasImitation(hitNames: string[]): boolean {
  return hitNames.some(n => IMITATING_KEYS.has(n))
}

/**
 * 单维度计分：
 *   1. base = 60
 *   2. 累加该维度神煞权重（吉正凶负）
 *   3. >80 的部分半效（非线性衰减）
 *   4. 若命中空亡/亡神/四废等 → 强制 cap=65
 *   5. clip [5, 100]
 */
export function calcDimScore(
  dimName: 'wealth' | 'career' | 'emotion' | 'study',
  dimLabel: string,
  hitNames: string[],
): number {
  let raw = SCORE_BASE
  const detail: string[] = [`基础分 ${raw}`]

  for (const name of hitNames) {
    const w = SHENSHA_DIM_WEIGHTS[name]
    if (!w) continue
    const dw = w[dimName]
    if (dw === 0) continue

    // 非线性衰减：若当前 raw > 80 且 dw > 0（加分），只计 dw/2
    const effective = (raw > 80 && dw > 0) ? Math.floor(dw / 2) : dw
    raw += effective
    detail.push(`${name} ${effective >= 0 ? '+' : ''}${effective}`)
  }

  // 强制校验
  const imitation = hasImitation(hitNames)
  if (imitation) {
    raw = Math.min(raw, 65)
    detail.push(`⚠ 空亡/亡神/四废/十恶大败 → cap≤65`)
  }

  // 限幅
  raw = Math.max(5, Math.min(100, raw))

  detail.push(`= ${Math.round(raw)}`)
  console.log(`[${dimLabel}] ${detail.join(' → ')}`)

  return Math.round(raw)
}

/**
 * 四维全量计算（统一入口）
 */
export function calcAllDimScores(hitNames: string[]): { label: string; value: number; color: string }[] {
  const LABEL_MAP = { wealth: '财富', career: '事业', emotion: '情感', study: '学业' }
  const COLOR_MAP = { wealth: '#f0c040', career: '#6c5ce7', emotion: '#f472b6', study: '#4ecdc4' }

  return DIM_NAMES.map(dim => ({
    label: LABEL_MAP[dim],
    value: calcDimScore(dim, LABEL_MAP[dim], hitNames),
    color: COLOR_MAP[dim],
  }))
}

/**
 * 总分（四维均值，仅用于外部展示，不做强制校验）
 */
export function calcShenShaScore(hitNames: string[]): number {
  let raw = SCORE_BASE
  const detail: string[] = [`基础分 ${raw}`]

  for (const name of hitNames) {
    const w = SHENSHA_WEIGHTS[name]
    if (w === undefined || w === 0) continue

    const effective = (raw > 80 && w > 0) ? Math.floor(w / 2) : w
    raw += effective
    detail.push(`${name} ${effective >= 0 ? '+' : ''}${effective}`)
  }

  // 强制校验（总分也遵循空亡 cap）
  if (hasImitation(hitNames)) {
    raw = Math.min(raw, 65)
    detail.push(`⚠ 命中抑制煞 → cap≤65`)
  }

  raw = Math.max(5, Math.min(100, raw))

  // 微调波动：基于 hitNames hash 做 ±2
  const seed = hitNames.reduce((acc, n) => acc + n.charCodeAt(0) * 31 + n.length, 0)
  const delta = (seed % 5) - 2
  const finalVal = Math.max(5, Math.min(100, raw + delta))
  detail.push(`波动 ${delta >= 0 ? '+' : ''}${delta} = ${finalVal}`)

  console.log(`[总分] ${detail.join(' → ')}`)
  return finalVal
}
