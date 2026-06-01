/**
 * liuyao-guaci.ts — 《增删卜易》吉凶速查表
 *
 * 基于野鹤老人《增删卜易》核心断语
 * 按用神+世应关系输出断语
 */

export interface DuanYuEntry {
  /** 吉凶等级 */
  level: '大吉' | '吉' | '平' | '凶' | '大凶'
  /** ① 古籍卦理原文 */
  classicalText: string
  /** ② 现代白话解读（场景化、理性、无迷信） */
  modernInterpretation: string
  /** ③ 基于现代生活的专业建议 */
  professionalAdvice: string
}

// ===== 用神断语表 =====

export function getDuanYu(
  guaName: string,
  yongShen: string,
  yongShenYao: number,
  shiYao: number,
  dongYaoCount: number,
  yongShenStrength?: string,
): DuanYuEntry {
  const isXiuqiu = yongShenStrength === '休囚'

  // 用神临世爻
  if (yongShenYao === shiYao) {
    if (isXiuqiu) return {
      level:'平',
      classicalText: `用神"${yongShen}"持世，但时令不助。《增删卜易》云：用神休囚，虽持世亦难成。宜待生旺之月。`,
      modernInterpretation: '• 方向是对的，但外部条件尚未成熟\n• 核心阻力在于时机不对，而非选择错误\n• 强行推进的成本高于预期收益',
      professionalAdvice: '建议暂缓行动。利用这段窗口期做三件事：① 梳理可调配的资源 ② 关注行业周期变化 ③ 积累备选方案。等环境信号转正再出手。',
    }
    return {
      level:'大吉',
      classicalText: `用神"${yongShen}"临世爻。《增删卜易》云：用神持世，所求必遂。`,
      modernInterpretation: '• 你所关注的事与自身条件高度匹配\n• 当下的主客观条件都比较有利\n• 这是一个值得积极推进的信号',
      professionalAdvice: '当前处于最佳执行窗口。建议：① 制定明确的行动计划和时间节点 ② 主动争取关键资源 ③ 同时做好风险备案——顺利时更要防意外。',
    }
  }

  // 动爻 >= 3 → 多变
  if (dongYaoCount >= 3) {
    if (isXiuqiu) return {
      level:'凶',
      classicalText: `卦中${dongYaoCount}爻动，用神又休囚。《增删卜易》云：多爻乱动，事无定准。`,
      modernInterpretation: '• 当前局面不确定性很高\n• 核心条件不够稳固，缺乏支撑\n• 贸然行动的成功率偏低',
      professionalAdvice: '建议以稳为主：① 暂缓重大决策 ② 守住现有基本盘 ③ 等至少两个不确定因素消除后再评估。减少信息噪音比盲目行动更重要。',
    }
    return {
      level:'平',
      classicalText: `卦中${dongYaoCount}个动爻。《增删卜易》云：爻多动则事多变，然非尽凶。`,
      modernInterpretation: '• 变数较多，但不等于结果负面\n• 变化中往往藏有机会\n• 关键在于你如何应对不确定性',
      professionalAdvice: '建议准备多套方案：① 列出最好/最坏/最可能三种情景 ② 每个情景预设应对动作 ③ 定期复盘调整。灵活应变比死守计划更有效。',
    }
  }

  // 用神旺相但未持世→吉
  if (yongShenStrength === '旺相' && yongShenYao > 0) {
    return {
      level:'吉',
      classicalText: `用神"${yongShen}"旺相，虽不持世亦吉。《增删卜易》云：用神旺相，诸事亨通。`,
      modernInterpretation: '• 整体趋势向上，基本面扎实\n• 虽然外部环境不完全由你掌控\n• 但核心指标显示走在正确轨道上',
      professionalAdvice: '顺势而为是最优策略。把精力集中在你最擅长的环节上，短板部分通过合作补齐。保持现有节奏，不要因为趋势向好就盲目扩张。',
    }
  }

  // 用神休囚且无动爻→凶
  if (isXiuqiu) {
    return {
      level:'凶',
      classicalText: `用神"${yongShen}"休囚，无生扶。《增删卜易》云：用神休囚，逢生得助方能吉。`,
      modernInterpretation: '• 当前条件不太理想\n• 缺乏外部支持和助力\n• 强行推进可能事倍功半',
      professionalAdvice: '暂不宜大动作。建议：① 先做深度调研，摸清阻力来源 ② 寻找可以借力的资源或盟友 ③ 等待更有利的窗口期。防守也是策略。',
    }
  }

  // 默认
  return {
    level:'平',
    classicalText: '卦象中平。《增删卜易》云：卦无凶吉，事在人为。',
    modernInterpretation: '• 当前局面没有明显倾向\n• 结果更多取决于你的下一步选择\n• 这是一张白纸，主动权在你手上',
    professionalAdvice: '梳理清楚目标和路径，然后按计划执行。不要等待"完美时机"——踏实走好每一步就是最好的策略。',
  }
}

// ===== 64卦吉凶速查（一级判定） =====

export const GUA_JIXIONG: Record<string, { level: string; summary: string }> = {
  '乾为天': { level:'大吉', summary:'纯阳至健，万事亨通。宜积极进取，自强不息。' },
  '坤为地': { level:'吉', summary:'柔顺承载，厚德载物。宜顺势而为，以柔克刚。' },
  '地天泰': { level:'大吉', summary:'天地交泰，万物通达。事业财运感情皆顺遂。' },
  '天地否': { level:'凶', summary:'天地不交，闭塞不通。宜守不宜攻，俭德避难。' },
  '水火既济': { level:'吉', summary:'事已成就，但初吉终乱。成功后更需谨慎防范。' },
  '火水未济': { level:'平', summary:'事未完成，还在途中。不可操之过急，稳步推进。' },
  '地火明夷': { level:'凶', summary:'光明受伤，处于低谷。忍耐坚守，黑暗终将过去。' },
  '地山谦': { level:'大吉', summary:'六爻皆吉。谦虚待人，有实力而不张扬最有利。' },
  '雷天大壮': { level:'吉', summary:'气势正盛。但盛极易衰，宜行正道不可妄为。' },
  '泽天夬': { level:'吉', summary:'决断之时。果断处理，但施惠于人可化解风险。' },
  '水天需': { level:'平', summary:'时机未到。耐心等待，在等待中充实自己。' },
  '天水讼': { level:'凶', summary:'争讼之象。易起纠纷，见好就收不宜纠缠。' },
  '地水师': { level:'平', summary:'聚众成师。适合组织团队，需德高望重者领导。' },
  '水地比': { level:'吉', summary:'相亲相比。适合建立合作关系，以诚相待。' },
  '风天小畜': { level:'平', summary:'小有积蓄。还在准备阶段，继续积累勿急。' },
  '天泽履': { level:'平', summary:'如履虎尾。有惊无险，按规矩行事可化险为夷。' },
  '地雷复': { level:'吉', summary:'一阳来复。寒冬过去春天来了，适合重新开始。' },
  '天雷无妄': { level:'平', summary:'真实无妄。做事真诚踏实，不走捷径最稳妥。' },
  '山天大畜': { level:'吉', summary:'大积蓄之象。厚积薄发，时机即将成熟。' },
  '山雷颐': { level:'吉', summary:'颐养之象。适合休整调养，慎言语节饮食。' },
  '泽风大过': { level:'平', summary:'过度之象。压力过大，独立不惧可度难关。' },
  '雷风恒': { level:'吉', summary:'恒久之象。适合做长期规划，感情利于婚姻。' },
  '天山遁': { level:'平', summary:'退避之象。暂时收敛锋芒，远离小人。' },
  '火地晋': { level:'吉', summary:'光明上升。事业处于上升期，适合展现才华。' },
  '地泽临': { level:'吉', summary:'好运临近。适合主动出击，但时机窗口有限。' },
  '风地观': { level:'平', summary:'观察审视。适合观望收集信息，不宜急于行动。' },
  '火雷噬嗑': { level:'平', summary:'决断处理。适合处理纠纷、做裁决判断。' },
  '山火贲': { level:'平', summary:'文饰之象。适合包装美化，但内在更重要。' },
  '山地剥': { level:'凶', summary:'剥落衰颓。宜守不宜攻，巩固基础最重要。' },
  '泽雷随': { level:'吉', summary:'随从之象。顺势而为，按规律办事则无咎。' },
  '山风蛊': { level:'平', summary:'整治腐败。适合整顿内务、革新制度。' },
  '雷水解': { level:'吉', summary:'解脱化解。困难过去，适合解决遗留问题。' },
  '风雷益': { level:'大吉', summary:'增益之象。互相增益，适合学习进步投资增值。' },
  '火天大有': { level:'大吉', summary:'丰收富有。大吉大利，但需遏恶扬善。' },
  '天火同人': { level:'吉', summary:'同心同德。适合团队合作、寻找盟友。' },
  '风火家人': { level:'吉', summary:'家庭和睦。适合处理家庭事务、内部管理。' },
  '火泽睽': { level:'平', summary:'乖离之象。求同存异是化解分歧的智慧。' },
  '水山蹇': { level:'凶', summary:'艰难险阻。反身修德待时，不宜强求。' },
  '雷山小过': { level:'平', summary:'小有过越。可小事不可大事，行为宁过恭。' },
  '风水涣': { level:'平', summary:'涣散离散。适合化解矛盾、分散风险。' },
  '泽水困': { level:'凶', summary:'困穷之象。减少消耗静待时机，坚守正道。' },
  '地风升': { level:'吉', summary:'步步高升。从小处积累，以柔顺之德走向高位。' },
  '泽地萃': { level:'吉', summary:'聚集汇合。人气资源整合的好时机。' },
  '泽山咸': { level:'吉', summary:'感应之象。感情卦，以虚心待人得良缘。' },
  '雷地豫': { level:'吉', summary:'豫乐之象。适合开创事业，但需防乐极生悲。' },
  '风山渐': { level:'吉', summary:'循序渐进。不可急进，慢慢发展最稳定。' },
  '雷泽归妹': { level:'平', summary:'婚嫁之象。感情有进展但需注意名分礼仪。' },
  '火山旅': { level:'平', summary:'旅行漂泊。适合短期出差考察，不宜久留。' },
  '水风井': { level:'吉', summary:'稳定可靠。适合巩固基础，互相帮助鼓励。' },
  '泽火革': { level:'吉', summary:'变革之象。适合改革创新，选好时机行动。' },
  '火风鼎': { level:'大吉', summary:'鼎新之象。革故鼎新，适合开启新项目改革。' },
  '雷火丰': { level:'吉', summary:'丰盛之象。如日中天，但满招损需警惕。' },
  '风泽中孚': { level:'吉', summary:'诚信之象。以诚信待人万事可成。' },
  '天风姤': { level:'平', summary:'邂逅之象。意外相遇有惊喜也有风险。' },
}
