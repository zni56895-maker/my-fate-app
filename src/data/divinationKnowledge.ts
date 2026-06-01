/**
 * divinationKnowledge.ts — 六爻古籍核心断语数据库
 *
 * 三本经典：增删卜易 / 卜筮正宗 / 易冒
 * 按用神分类，每种用神按状态（旺相/休囚/入墓/被冲...）做断语映射
 * 供前端专项判定函数调用
 */

// ============================================================
// 类型定义
// ============================================================

export interface YongShenStateDuanYu {
  /** 旺相/休囚/入墓/被冲/被合/发动/安静 */
  state: string
  /** 状态描述 */
  desc: string
  /** 断语 */
  text: string
  /** 来源 */
  source: string
}

export interface BookYongShenKnowledge {
  book: string
  /** 用神名称 */
  yongShen: string
  /** 状态断语列表 */
  states: YongShenStateDuanYu[]
}

// ============================================================
// 一、《增删卜易》— 野鹤老人
// ============================================================

const ZENGSHAN_GUANGUI: YongShenStateDuanYu[] = [
  {
    state: '旺相',
    desc: '官鬼爻得月建日辰生扶，或自身临日月',
    text: '官星旺相，事业运极佳。求职者面试发挥出色，在职者得上司赏识，晋升有望。《增删卜易》云：官来生世，名利双收。',
    source: '《增删卜易》',
  },
  {
    state: '休囚',
    desc: '官鬼爻被月建日辰克制，或失令无气',
    text: '官星休囚无力，事业运低迷。求职者难遇好机会，在职者需防被边缘化。宜隐忍蓄力，待时而动。',
    source: '《增删卜易》',
  },
  {
    state: '入墓',
    desc: '官鬼爻入日墓或动墓（辰戌丑未）',
    text: '官星入墓，事业受阻如坠泥潭。求职屡屡碰壁，在职者被困于当前岗位动弹不得。"官入墓库，有志难伸"。宜静不宜动。',
    source: '《增删卜易》',
  },
  {
    state: '被冲',
    desc: '官鬼爻被日辰或动爻冲克（子午卯酉对冲）',
    text: '官星被冲，事业生变。在职者有被调岗、辞退的风险。求职者原本谈好的offer可能临时变故。"冲则散"，需有备选方案。',
    source: '《增删卜易》',
  },
  {
    state: '持世',
    desc: '官鬼爻临世爻',
    text: '官星持世，求名得名。求职在即，offer主动找上门；在职者有升职加薪之喜。自测官运最佳之象。',
    source: '《增删卜易》',
  },
  {
    state: '生世',
    desc: '官鬼爻生扶世爻',
    text: '官来生世，贵人提携。上司或长辈主动赏识你，机会从天而降。面试时对方对你印象极佳，顺利通过概率极高。',
    source: '《增删卜易》',
  },
  {
    state: '被克',
    desc: '子孙爻发动克制官鬼',
    text: '子孙剥官，职场大忌。在职者逢此需防火上口舌、小人排挤，或有强烈裸辞冲动。"子孙发动，丢官罢职"。求稳勿动。',
    source: '《增删卜易》',
  },
  {
    state: '空亡',
    desc: '官鬼爻旬空',
    text: '官星空亡，有名无实。看似有机会实则镜花水月。面试过后杳无音信，承诺的升职迟迟不兑现。"空则无成"。',
    source: '《增删卜易》',
  },
  {
    state: '动化回头克',
    desc: '官鬼发动但变爻回头克制',
    text: '官星先动后克，好事变坏事。起初顺利但中途生变。面试前两轮通过却在终面被刷。宜有最坏打算。',
    source: '《增删卜易》',
  },
  {
    state: '动化进神',
    desc: '官鬼发动化进神（寅化卯/巳化午/申化酉/亥化子）',
    text: '官化进神，步步高升。事业蒸蒸日上，跳槽越跳越好。求职者offer一个比一个好。野鹤曰：进神者，前进不休也。',
    source: '《增删卜易》',
  },
  {
    state: '临青龙',
    desc: '官鬼爻临青龙',
    text: '官星临青龙，喜庆之事。入职者遇好公司好岗位，在职者有嘉奖表彰之喜。贵人多为正直之人。',
    source: '《增删卜易》',
  },
  {
    state: '临白虎',
    desc: '官鬼爻临白虎',
    text: '官星带虎，威猛中带险。职场竞争激烈，需以实力硬抗。适合军警、执法、竞争性强的岗位，但也需防口舌刑罚。',
    source: '《增删卜易》',
  },
]

const ZENGSHAN_QICAI: YongShenStateDuanYu[] = [
  { state: '旺相', desc: '妻财爻得日月生扶', text: '财星旺相，求财得财。正财运稳定，投资回报可观。求职者薪资待遇理想。《增删卜易》：财旺则利厚。', source: '《增删卜易》' },
  { state: '休囚', desc: '妻财爻失令无气', text: '财星休囚，财运低迷。收入不如预期，投资回报低于期望。暂时不宜做大的财务决策。', source: '《增删卜易》' },
  { state: '入墓', desc: '妻财爻入墓', text: '财入墓库，资金被套牢或周转不灵。收入被拖欠，投资金被锁定。"财入库，难得用"。', source: '《增删卜易》' },
  { state: '持世', desc: '妻财爻临世爻', text: '财来就我，求财最易。财运主动找上门，收入增长明显。是求财的最佳卦象。', source: '《增删卜易》' },
  { state: '被兄弟克', desc: '兄弟爻发动克妻财', text: '兄弟劫财，破财之象。严防朋友借钱不还、合伙投资失利、冲动消费。野鹤曰：兄弟发动，破财连连。', source: '《增删卜易》' },
  { state: '空亡', desc: '妻财爻旬空', text: '财星空亡，到手的钱飞了。看似有收入却总是差一步。不宜轻信高回报承诺。', source: '《增删卜易》' },
  { state: '动化进神', desc: '妻财爻化进神', text: '财化进神，财富增长。收入节节攀升，投资越投越顺。是扩大经营的好时机。', source: '《增删卜易》' },
  { state: '临青龙', desc: '妻财爻临青龙', text: '财临青龙，喜财双收。收入来自正道，且有喜庆之事与之相伴。', source: '《增删卜易》' },
]

const ZENGSHAN_ZISUN: YongShenStateDuanYu[] = [
  { state: '旺相', desc: '子孙爻旺相', text: '子孙福神旺盛，宠物走失易找回，健康无忧。用神有气，所问之事大有希望。', source: '《增删卜易》' },
  { state: '休囚', desc: '子孙爻休囚', text: '子孙福神无力，宠物找回希望渺茫，需扩大搜索范围。', source: '《增删卜易》' },
  { state: '带驿马', desc: '子孙爻带驿马', text: '宠物处于奔跑移动状态，往驿马指向的方位去找。宜速去寻找，迟则更难。', source: '《增删卜易》' },
  { state: '安静', desc: '子孙爻安静不动', text: '宠物可能被关在某处或躲藏起来了。多在附近仔细寻找，尤其隐蔽角落。', source: '《增删卜易》' },
  { state: '空亡', desc: '子孙爻空亡', text: '遗失之物恐已不在原处，被转移或彻底丢失的可能性较大。', source: '《增删卜易》' },
]

const ZENGSHAN_FUMU: YongShenStateDuanYu[] = [
  { state: '旺相', desc: '父母爻旺相', text: '文书证件易找回，考试学业顺利。用神有力，所失之物在显眼处等待被发现。', source: '《增删卜易》' },
  { state: '休囚', desc: '父母爻休囚', text: '证件文件找回难度较大，可能需要补办。学业上需加倍努力。', source: '《增删卜易》' },
  { state: '伏藏', desc: '父母爻伏藏不现', text: '证件被遮盖压住，多在书本纸张堆中、抽屉底层或夹缝里。耐心翻找。', source: '《增删卜易》' },
  { state: '入墓', desc: '父母爻入墓', text: '文件物品在箱子、柜子深处或被封装起来了。仔细翻找储物空间。', source: '《增删卜易》' },
]

// ============================================================
// 二、《卜筮正宗》— 王洪绪
// ============================================================

const BUSHI_GUANGUI: YongShenStateDuanYu[] = [
  { state: '旺相', desc: '官星得令得地', text: '官爻旺相，出仕大吉。面试必过，晋升在即。《卜筮正宗》：官星有气，利见大人。', source: '《卜筮正宗》' },
  { state: '休囚', desc: '官星失令', text: '官爻无气，仕途偃蹇。求职不宜冒进，在职者宜安守本分。王洪绪曰：官衰则职卑。', source: '《卜筮正宗》' },
  { state: '被冲', desc: '官星被日冲月破', text: '官逢冲破，职位不保。在职者恐有去职之忧，求职者空有面试无缘入职。', source: '《卜筮正宗》' },
  { state: '被克', desc: '子孙爻旺动克官', text: '子孙夺官，仕途危矣。防小人进谗、上司不满。动则不利，宜以静制动。', source: '《卜筮正宗》' },
  { state: '得财生', desc: '妻财爻动生官鬼', text: '财动生官，以财求名。投资自己的包装和履历可获职位。在职者以业绩说话必然晋升。', source: '《卜筮正宗》' },
  { state: '世应相合', desc: '世爻与应爻六合', text: '世应六合，面试官与你的气场相投。应聘单位对你印象极佳，录用概率极高。', source: '《卜筮正宗》' },
  { state: '世应相冲', desc: '世爻与应爻六冲', text: '世应相冲，与目标单位气场不和。面试时容易话不投机，或入职后发现自己不适合。', source: '《卜筮正宗》' },
]

const BUSHI_QICAI: YongShenStateDuanYu[] = [
  { state: '旺相在世', desc: '妻财爻旺+临世', text: '财爻持世旺相，富贵逼人。求财必得，投资回报丰厚。自身财运达到顶点。', source: '《卜筮正宗》' },
  { state: '暗动', desc: '妻财爻暗动', text: '财爻暗动，意外之财。不经意间的投资或副业会带来惊喜收入。', source: '《卜筮正宗》' },
  { state: '被日克', desc: '妻财被日辰克', text: '财爻被日克，当日有破财。今天不宜做财务决策，消费要克制。', source: '《卜筮正宗》' },
  { state: '月破', desc: '妻财爻月破', text: '财逢月破，本月财运低迷。整个月的收入低于预期，需节流渡难关。', source: '《卜筮正宗》' },
]

const BUSHI_HUNYIN: YongShenStateDuanYu[] = [
  { state: '世应相合', desc: '世爻应爻六合', text: '世应六合，婚缘天成。两人气场相合，正缘无疑。《卜筮正宗》：合则情投，百年好合。', source: '《卜筮正宗》' },
  { state: '世应相冲', desc: '世爻应爻六冲', text: '六冲卦，两情相违。婚前恋爱易分手，婚后夫妻多争吵。若测复合则缘分已尽。', source: '《卜筮正宗》' },
  { state: '男占财持世', desc: '男占，妻财爻持世', text: '财来就我，良缘自投。主动追求你的异性多为正缘。是男测感情的上上卦。', source: '《卜筮正宗》' },
  { state: '女占官持世', desc: '女占，官鬼爻持世', text: '官来就我，夫星临身。命中良缘就在眼前，宜主动把握。是女测感情的最佳卦象。', source: '《卜筮正宗》' },
  { state: '用神伏藏', desc: '妻财/官鬼伏藏不现', text: '用神不现，缘分未到。单身者近期难遇正缘；若测现任，对方可能心不在此。', source: '《卜筮正宗》' },
  { state: '游魂卦', desc: '卦得游魂', text: '游魂卦，心意不定。双方有一方犹豫不决，关系飘忽不定。不宜仓促做重大感情决定。', source: '《卜筮正宗》' },
  { state: '归魂卦', desc: '卦得归魂', text: '归魂卦，回心转意。若问复合则大有希望；若问现任则关系将进入稳定期。', source: '《卜筮正宗》' },
]

// ============================================================
// 三、《易冒》— 程良玉
// ============================================================

const YIMAO_GUANGUI: YongShenStateDuanYu[] = [
  { state: '旺相临日月', desc: '官鬼临月建或日辰', text: '官星当令，势不可挡。此乃一年中事业运最强之时。程良玉曰：官临日月，不招而至。', source: '《易冒》' },
  { state: '伏吟', desc: '卦得伏吟', text: '伏吟卦，事业停滞。进退两难，原地踏步。宜自我反省调整策略，不宜强动。', source: '《易冒》' },
  { state: '反吟', desc: '卦得反吟', text: '反吟卦，反复无常。事业忽好忽坏，刚有起色又被打回原地。宜做长期规划。', source: '《易冒》' },
  { state: '临螣蛇', desc: '官鬼爻临螣蛇', text: '官星临螣蛇，有诈。注意offer中的陷阱条款，防备职场中的虚假承诺。螣蛇主虚惊。', source: '《易冒》' },
  { state: '临勾陈', desc: '官鬼爻临勾陈', text: '官星临勾陈，事业稳定但发展慢。适合体制内、传统行业。稳步积累必有收获。', source: '《易冒》' },
  { state: '临玄武', desc: '官鬼爻临玄武', text: '官星临玄武，暗中有变。注意职场中的暗箱操作、背后议论。谨慎行事，低调为上。', source: '《易冒》' },
  { state: '得动爻生', desc: '官鬼得动爻相生', text: '官星得同伴相生，团队力量助推事业。同事、合作伙伴是你的贵人，多与他们协作。', source: '《易冒》' },
]

const YIMAO_QICAI: YongShenStateDuanYu[] = [
  { state: '临朱雀', desc: '妻财爻临朱雀', text: '财临朱雀，口舌生财。销售、讲师、律师靠嘴赚钱的行业今天特别旺。以言辞取胜。', source: '《易冒》' },
  { state: '临玄武', desc: '妻财爻临玄武', text: '财临玄武，暗财。收入来自不公开的渠道。但也需防被骗——来路不明的钱要谨慎。', source: '《易冒》' },
  { state: '月破', desc: '妻财爻月破', text: '财逢月破，本月财运低迷。整月收入不如意，守成为上。', source: '《易冒》' },
]

const YIMAO_HUNYIN: YongShenStateDuanYu[] = [
  { state: '桃花临世', desc: '桃花星临世爻', text: '桃花照命，异性缘极佳。单身者近期易遇心动之人。程良玉：桃花入世，佳偶天成。', source: '《易冒》' },
  { state: '用神带刑', desc: '用神带刑害', text: '用神带刑，感情有隐患。关系中存在欺骗或暴力倾向，需冷静审视对方人品。', source: '《易冒》' },
  { state: '用神生应爻', desc: '用神生应爻', text: '用神生应，对方更在意你。这段感情中你是被偏爱的一方，对方付出更多。', source: '《易冒》' },
  { state: '应爻克用神', desc: '应爻克用神', text: '应爻克用神，对方并非真心。这段关系中对方有控制欲或不够珍惜你，需警惕。', source: '《易冒》' },
]

// ============================================================
// 四、统一导出 — 供专项判定函数调用
// ============================================================

/** 按用神+书籍分组的断语数据库 */
export const DIVINATION_KNOWLEDGE: BookYongShenKnowledge[] = [
  { book: '增删卜易', yongShen: '官鬼', states: ZENGSHAN_GUANGUI },
  { book: '增删卜易', yongShen: '妻财', states: ZENGSHAN_QICAI },
  { book: '增删卜易', yongShen: '子孙', states: ZENGSHAN_ZISUN },
  { book: '增删卜易', yongShen: '父母', states: ZENGSHAN_FUMU },
  { book: '卜筮正宗', yongShen: '官鬼', states: BUSHI_GUANGUI },
  { book: '卜筮正宗', yongShen: '妻财', states: BUSHI_QICAI },
  { book: '卜筮正宗', yongShen: '感情', states: BUSHI_HUNYIN },
  { book: '易冒', yongShen: '官鬼', states: YIMAO_GUANGUI },
  { book: '易冒', yongShen: '妻财', states: YIMAO_QICAI },
  { book: '易冒', yongShen: '感情', states: YIMAO_HUNYIN },
]

/**
 * 根据用神+状态查断语
 * @param yongShen 用神名称：官鬼/妻财/子孙/父母
 * @param state 状态：旺相/休囚/入墓/被冲/持世...
 * @param preferBook 优先使用的书籍（默认增删卜易）
 */
export function findDuanYu(yongShen: string, state: string, preferBook = '增删卜易'): YongShenStateDuanYu | undefined {
  const books = [preferBook, '增删卜易', '卜筮正宗', '易冒']
  for (const book of books) {
    const knowledge = DIVINATION_KNOWLEDGE.find(k => k.book === book && k.yongShen === yongShen)
    if (knowledge) {
      const found = knowledge.states.find(s => s.state === state)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 根据用神+状态获取所有匹配书籍的断语
 */
export function findAllDuanYu(yongShen: string, state: string): YongShenStateDuanYu[] {
  return DIVINATION_KNOWLEDGE
    .filter(k => k.yongShen === yongShen)
    .flatMap(k => k.states.filter(s => s.state === state))
}
