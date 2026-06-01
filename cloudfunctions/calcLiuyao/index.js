// cloudfunctions/calcLiuyao/index.js
// ★ 六爻排盘云函数 — 完整64卦数据库 + 事业/感情/失物/求职应期

const { GUACI_FULL } = require('./guaci-full')

const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

function coin() { return Math.random() > 0.5 ? 3 : 2 }
function shake() { return [coin(), coin(), coin()] }

function sumToYao(sum) {
  if (sum === 6) return { value:6, isDong:true, symbol:'老阴 ▅▅ ▅▅ ×' }
  if (sum === 7) return { value:7, isDong:false, symbol:'少阳 ▅▅▅▅▅' }
  if (sum === 8) return { value:8, isDong:false, symbol:'少阴 ▅▅ ▅▅' }
  return { value:9, isDong:true, symbol:'老阳 ▅▅▅▅▅ ○' }
}

const UPPER = { 7:'乾',6:'兑',5:'离',4:'震',3:'巽',2:'坎',1:'艮',0:'坤' }
const LOWER = { 7:'乾',6:'兑',5:'离',4:'震',3:'巽',2:'坎',1:'艮',0:'坤' }

function getUpper(vals) { let n=0; for(let i=3;i<6;i++){if(vals[i]%2===1)n+=(1<<(i-3))} return n }
function getLower(vals) { let n=0; for(let i=0;i<3;i++){if(vals[i]%2===1)n+=(1<<i)} return n }

function getDuanYu( BA_GUA_WX = { '乾':'金','兑':'金','离':'火','震':'木','巽':'木','坎':'水','艮':'土','坤':'土' }

const YAO_DIZHI_TABLE = {
  '乾':['子','寅','辰','午','申','戌'],'坎':['寅','辰','午','申','戌','子'],
  '艮':['辰','午','申','戌','子','寅'],'震':['子','寅','辰','午','申','戌'],
  '巽':['丑','亥','酉','未','巳','卯'],'离':['卯','丑','亥','酉','未','巳'],
  '兑':['巳','卯','丑','亥','酉','未'],'坤':['未','巳','卯','丑','亥','酉'],
}

function getLiuQin(benGongWx, yaoZhi) {
  const dizhiWx = {'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'}
  const yaoWx = dizhiWx[yaoZhi] || '土'
  if (yaoWx === benGongWx) return '兄弟'
  if ({'木':'水','火':'木','土':'火','金':'土','水':'金'}[yaoWx] === benGongWx) return '父母'
  if ({'木':'水','火':'木','土':'火','金':'土','水':'金'}[benGongWx] === yaoWx) return '子孙'
  if ({'木':'金','火':'水','土':'木','金':'火','水':'土'}[yaoWx] === benGongWx) return '官鬼'
  return '妻财'
}

function getDuanYu(guaName, yongShen, yongYaoIdx, shiYao, dongCount) {
  if (yongYaoIdx === shiYao) return { level:'大吉', text:`用神"${yongShen}"临世爻，所求之事心想事成。`, advice:'宜积极行动，把握时机。' }
  if (dongCount >= 3) return { level:'平', text:'卦中动爻较多，事情发展可能有变数。', advice:'随机应变，保持灵活。' }
  return { level:'吉', text:'卦象显示趋势向好，保持信心。', advice:'坚持当前方向，不要被短期波动干扰。' }
}

function getCareerAdvice(yaoList, benGua, status) {
  var guanGui = yaoList.find(function(y){return y.liuqin==='官鬼'&&y.isDong})
  var ziSunDong = yaoList.filter(function(y){return y.liuqin==='子孙'&&y.isDong})
  var guanChishi = yaoList.find(function(y){return y.liuqin==='官鬼'&&y.index===benGua.shi})
  if (status === '待业求职') {
    if (guanChishi) return '官星持世，Offer就在近期，请积极面试。'
    if (guanGui) return '官鬼发动，求职机会正在酝酿中。'
    if (ziSunDong.length > 0) return '子孙发动剥官削职。近期求职市场不景气，建议先充电。'
    return '官星平静，求职需主动出击，多投简历多联络人脉。'
  }
  if (status === '在职求晋升') {
    if (guanChishi) return '官星持世，晋升有望。主动表达晋升意愿会有回应。'
    if (ziSunDong.length > 0) return '子孙发动剥官削职。近期谨防口舌小人，晋升宜暂缓。'
    return '官星平稳，稳扎稳打是当前最好的策略。'
  }
  if (status === '想裸辞跳槽') {
    if (guanChishi) return '官星持世，跳槽窗口期到来。可以面试试试水。'
    if (ziSunDong.length > 0) return '子孙克官，裸辞风险极大！建议先找到下家再提离职。'
    return '目前不是跳槽最佳时机，先做好职业规划再行动。'
  }
  return '官鬼为事业用神。'
}

function getMarriageAdvice(yaoList, benGua, gender, goal) {
  var yongShen = gender === '男' ? '妻财' : '官鬼'
  var yongYao = yaoList.find(function(y){return y.liuqin===yongShen})
  var shiYao = yaoList.find(function(y){return y.index===benGua.shi})
  var yingYao = yaoList.find(function(y){return y.index===benGua.ying})
  var chongPairs = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']]
  var hePairs = [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']]
  var isLiuChong = false, isLiuHe = false
  if (shiYao && yingYao) {
    var sd = shiYao.dizhi, yd = yingYao.dizhi
    for (var i=0;i<6;i++){if((chongPairs[i][0]===sd&&chongPairs[i][1]===yd)||(chongPairs[i][1]===sd&&chongPairs[i][0]===yd)) isLiuChong=true}
    for (var j=0;j<6;j++){if((hePairs[j][0]===sd&&hePairs[j][1]===yd)||(hePairs[j][1]===sd&&hePairs[j][0]===yd)) isLiuHe=true}
  }
  if (goal === '单身求正缘') {
    if (yongYao && yongYao.index === benGua.shi) return `用神"${yongShen}"持世，正缘即将出现。`
    if (isLiuHe) return '世应六合，情投意合之象。近期遇到的对象很可能是正缘。'
    return '缘分正在酝酿中，不必焦虑。保持开放心态。'
  }
  if (goal === '测现任是否正缘') {
    if (isLiuHe && yongYao) return '世应相生六合，对方多为正缘，发展顺利。'
    if (isLiuChong) return '卦逢六冲，性格冲突较大，需要大量磨合。'
    return '世应关系平平，需要更多时间验证。'
  }
  if (goal === '前任能否复合') {
    if (isLiuChong) return '卦逢六冲，缘分已尽。请放下过去，迎接新的开始。'
    if (yongYao && yongYao.index === benGua.shi) return '用神持世，对方对你仍有感情。复合有一定希望。'
    return '缘分已淡，复合窗口正在关闭。建议释怀。'
  }
  return `${gender==='男'?'妻财':'官鬼'}为感情用神。`
}

function getCareerTiming(yaoList, benGua, dayGan) {
  var fmYao = yaoList.find(function(y){return y.liuqin==='父母'})
  var guanGuiYao = yaoList.find(function(y){return y.liuqin==='官鬼'&&y.isDong})
  if (!fmYao) {
    if (guanGuiYao) return '官鬼发动，求职机会近在眼前，预计近期（1个月内）有面试邀约。'
    return '父母爻与官鬼爻均未现，求职时机尚需等待。建议持续投递简历，约1-2个月后运势转旺。'
  }
  var fmZhi = fmYao.dizhi
  var branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  var fmIdx = branches.indexOf(fmZhi)
  var xunStart = Math.floor(fmIdx/10)*10
  var kong1 = branches[((xunStart-1)%12+12)%12]
  var kong2 = branches[((xunStart-2)%12+12)%12]
  if (fmZhi===kong1||fmZhi===kong2) {
    return `父母爻逢空亡（${fmZhi}），待"出空"之日，预计1-3周内有望收到录用通知。`
  }
  if (fmYao.isDong) return `父母爻动而有力（${fmZhi}），求职运势正旺。预计1-2周内有好消息。`
  return `父母爻安静在${fmZhi}位，待"值日"时机会显现，预计2-4周内有望得到录用机会。`
}

exports.main = async (event) => {
  const { questionType } = event

  // 摇卦
  const coins = [shake(),shake(),shake(),shake(),shake(),shake()]
  const sums = coins.map(c => c[0]+c[1]+c[2])
  const yaoData = sums.map(sumToYao)
  const benVals = yaoData.map(y => y.value)

  const benUpper = UPPER[getUpper(benVals)] || '乾'
  const benLower = LOWER[getLower(benVals)] || '乾'

  let benGuaName = ''
  for (const k in GUACI_FULL) {
    const v = GUACI_FULL[k]
    if (v.upper === benUpper && v.lower === benLower) { benGuaName = k; break }
  }
  if (!benGuaName) benGuaName = benUpper + benLower + '卦'

  const raw = GUACI_FULL[benGuaName] || {}
  const benGua = Object.assign({}, raw, { name:benGuaName,upper:benUpper,lower:benLower,shi:raw.shi||3,ying:raw.ying||6,gong:raw.gong||benUpper,guaCi:raw.guaCi||'',baiHua:raw.baiHua||''})

  const dongCount = yaoData.filter(y => y.isDong).length
  const benGong = benGua.gong || benUpper
  const gongWx = BA_GUA_WX[benGong] || '金'
  const yaoDizhi = YAO_DIZHI_TABLE[benGong] || YAO_DIZHI_TABLE['乾']
  const LIU_SHOU_ORDER = ['青龙','朱雀','勾陈','螣蛇','白虎','玄武']

  const yaoList = yaoData.map((y, i) => ({
    index: i+1, value: y.value, isDong: y.isDong,
    original: y.symbol,
    dizhi: yaoDizhi[i], liuqin: getLiuQin(gongWx, yaoDizhi[i]),
    liushou: LIU_SHOU_ORDER[i],
  }))

  const yongShen = (questionType==='感情缘分'?'妻财':questionType==='事业求职'?'官鬼':'妻财')
  const yongYao = yaoList.find(y => y.liuqin===yongShen) || yaoList[benGua.shi-1]
  const duanYu = getDuanYu(benGuaName, yongShen, yongYao?yongYao.index:benGua.shi, benGua.shi, dongCount)

  // ★ 专项断语 + 求职应期
  let specialAdvice, careerTiming
  if (questionType === '事业求职') {
    specialAdvice = getCareerAdvice(yaoList, benGua, '待业求职')
    careerTiming = getCareerTiming(yaoList, benGua, '甲')
  } else if (questionType === '感情缘分') {
    specialAdvice = getMarriageAdvice(yaoList, benGua, '男', '单身求正缘')
  }

  return {
    coins, yaoList, benGua, dongYaoCount: dongCount,
    shiYao: benGua.shi, yingYao: benGua.ying,
    yongShen, duanYu,
    specialAdvice: specialAdvice || '',
    careerTiming: careerTiming || '',
  }
}
