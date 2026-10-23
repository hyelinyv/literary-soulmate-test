// 原创趣味题库。权重是编辑设计，不是经过心理学验证的量表。
// 顺序：加缪 / 伍尔夫 / 尼采 / 庄子。每个选项兼顾一种主倾向和一种次倾向。
export const questions = [
  {
    topic: '01 · 意义的形状',
    title: '如果人生没有一个预先写好的意义，你会怎样？',
    options: [
      {text:'认真地生活，让此刻的体验慢慢成为意义。',weights:[3,1,0,0]},
      {text:'向内寻找，看看什么真正触动了我的心。',weights:[0,3,0,1]},
      {text:'自己创造一套值得追随的价值。',weights:[1,0,3,0]},
      {text:'也许不必急着定义，先自在地存在。',weights:[0,0,1,3]}
    ]
  },
  {
    topic: '02 · 自我的边界',
    title: '你觉得，“真实的自己”更像什么？',
    options: [
      {text:'一片细腻而流动、很难被概括的内心风景。',weights:[0,3,0,1]},
      {text:'在一次次选择与承担中，逐渐形成的轮廓。',weights:[3,0,1,0]},
      {text:'松开外界的定义后，自然舒展的生命。',weights:[0,1,0,3]},
      {text:'一件由我亲手塑造，还能不断超越的作品。',weights:[1,0,3,0]}
    ]
  },
  {
    topic: '03 · 面对未知',
    title: '当一个想法动摇了你一直相信的事，你更愿意……',
    options: [
      {text:'继续追问，即使这意味着重新建立自己的信念。',weights:[1,0,3,0]},
      {text:'换个角度看看，也许不同答案可以同时存在。',weights:[0,1,0,3]},
      {text:'先觉察它带来的感受，理解内心为什么波动。',weights:[0,3,1,0]},
      {text:'承认不确定，再决定此刻还能诚实地做些什么。',weights:[3,0,0,1]}
    ]
  },
  {
    topic: '04 · 自由的温度',
    title: '对你而言，哪一种状态最接近自由？',
    options: [
      {text:'有勇气重估习以为常的规则，选择自己的方向。',weights:[1,0,3,0]},
      {text:'看清现实的限制后，依然保有选择与行动。',weights:[3,0,0,1]},
      {text:'有属于自己的空间，让思想和感受尽情生长。',weights:[0,3,1,0]},
      {text:'放松对结果与身份的执着，和变化相处。',weights:[0,1,0,3]}
    ]
  },
  {
    topic: '05 · 与他人相遇',
    title: '你觉得，人与人之间深刻的理解来自哪里？',
    options: [
      {text:'即使理解有限，仍愿意一起面对共同的处境。',weights:[3,1,0,0]},
      {text:'认真听见那些没有说出口、很细微的感受。',weights:[1,3,0,0]},
      {text:'容纳彼此不同的看法，给对方自在生长的余地。',weights:[0,1,0,3]},
      {text:'欣赏彼此的独特，也能激发对方成为更好的自己。',weights:[0,1,3,0]}
    ]
  },
  {
    topic: '06 · 与变化相处',
    title: '如果珍惜的一切都会变化，你会如何面对？',
    options: [
      {text:'细细感受它留下的痕迹，让回忆成为内心的一部分。',weights:[1,3,0,0]},
      {text:'允许相聚与离散发生，让生命保有流动的余地。',weights:[1,0,0,3]},
      {text:'正因无法永远拥有，更愿意认真投入现在。',weights:[3,1,0,0]},
      {text:'让变化成为转化自己的力量，创造新的可能。',weights:[1,0,3,0]}
    ]
  }
];

export const profiles = [
  {
    id:'camus',name:'阿尔贝·加缪',english:'Albert Camus',tags:['清醒的热爱','此刻的力量','温柔的勇气'],
    interpretation:'你的选择里，有一种清醒而认真生活的倾向。即使世界没有给出确定的答案，你仍愿意投入当下，与他人共同面对生活。这与加缪作品中对荒诞、反抗与生命体验的思考形成了共鸣。',
    clue:'你倾向于承认生活的不确定，同时保留行动的勇气。对你而言，意义可以在一次次真实的投入中发生。',
    book:'《西西弗神话》',bookNote:'沿着荒诞与反抗的思考，继续这场对话。',
    source:'https://plato.stanford.edu/entries/camus/'
  },
  {
    id:'woolf',name:'弗吉尼亚·伍尔夫',english:'Virginia Woolf',tags:['细腻的感受','独立的空间','丰盛的内心'],
    interpretation:'你愿意认真倾听内心，也珍惜那些很难被一句话概括的感受。你对独立空间与细微体验的重视，与伍尔夫作品中对内在意识、女性经验和创作空间的关注形成了共鸣。',
    clue:'你的选择反复指向内心体验：理解自己的感受，也听见他人细微的声音。对你而言，一个自由舒展的内在世界很珍贵。',
    book:'《一间自己的房间》',bookNote:'从独立空间与创作自由的思考，走近她的世界。',
    source:'https://www.penguin.co.uk/books/57112/a-room-of-ones-own-by-woolf-virginia/9780241436288'
  },
  {
    id:'nietzsche',name:'弗里德里希·尼采',english:'Friedrich Nietzsche',tags:['自由的精神','勇敢的追问','自我的创造'],
    interpretation:'你愿意审视已经被接受的答案，也渴望主动塑造自己的人生。你对价值创造与自我超越的兴趣，与尼采对既有价值的追问、对个体创造力的重视形成了共鸣。',
    clue:'你的选择里有主动追问与重新创造的力量。你愿意承担选择的重量，也期待在变化中拓展自己的可能。',
    book:'《查拉图斯特拉如是说》',bookNote:'在诗性与寓言中，继续探索价值与自我超越。',
    source:'https://plato.stanford.edu/entries/nietzsche/'
  },
  {
    id:'zhuangzi',name:'庄子',english:'Zhuangzi',tags:['自在的流动','开放的视角','从容的心'],
    interpretation:'你愿意为世界保留不止一种解释，也能为变化留出空间。你对固有分别的松动、对自由与流动的向往，与《庄子》中通过寓言展开的视角转换和逍遥思考形成了共鸣。',
    clue:'你倾向于容纳差异与变化，让自己从单一的标准中舒展开来。好奇、开放与从容，是你回应世界的方式。',
    book:'《庄子·逍遥游》',bookNote:'从鲲鹏的寓言出发，试着换一种尺度看世界。',
    source:'https://plato.stanford.edu/entries/zhuangzi/'
  }
];

export function rankAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length || answers.some((answer,index)=>!Number.isInteger(answer) || answer<0 || answer>=questions[index].options.length)) {
    throw new RangeError('请完成每道题，并选择有效选项。');
  }
  const scores = profiles.map((profile,index)=>({profile,score:0,primary:0,lastPrimary:-1,index}));
  answers.forEach((answer,questionIndex)=>{
    questions[questionIndex].options[answer].weights.forEach((weight,profileIndex)=>{
      scores[profileIndex].score+=weight;
      if(weight===3){scores[profileIndex].primary++;scores[profileIndex].lastPrimary=questionIndex;}
    });
  });
  // 总分相同时参考主倾向次数，再参考最近一次主倾向。不会展示虚假的精确百分比。
  return scores.sort((a,b)=>b.score-a.score || b.primary-a.primary || b.lastPrimary-a.lastPrimary || a.index-b.index);
}
