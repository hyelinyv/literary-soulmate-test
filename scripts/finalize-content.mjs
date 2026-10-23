import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(project,'content-source/unified-input.json'),'utf8'));
data.rules=data.rules.filter(r=>!(r.authorId==='hesse'&&r.questionId==='Q17')&&!(r.authorId==='nietzsche'&&r.questionId==='Q04'));
data.editorialExclusions=[{authorId:'hesse',questionId:'Q17',reason:'珍惜既定道路的相反回答不充分表达亲身理解；不从喜欢变化反推黑塞。'},{authorId:'nietzsche',questionId:'Q04',reason:'自定作品标准不足以表达长期自我塑造，不从单独自定标准推断尼采。'}];
data.instructions={general:'凭第一反应选择；几项都接近时，选最影响判断的那个理由。',storage:'答案保存在本机，不自动上传。'};
data.reviewStatus='source-reviewed-editorial-beta-awaiting-human-pilot';
data.methodSources=[
 {title:'Boateng等：量表开发与验证方法综述（2018）',url:'https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2018.00149/full',note:'用于安排题目审阅、认知试答与后续验证，不提供本测试的准确率。'},
 {title:'AERA/APA/NCME：教育与心理测验标准（2014）',url:'https://www.testingstandards.net/uploads/7/6/6/4/76643089/9780935302356.pdf',note:'验证应围绕具体解释与用途累积证据。'},
 {title:'Schwartz：基本价值理论综述（2012）',url:'https://scholarworks.gvsu.edu/orpc/vol2/iss1/11/',note:'用于理解价值优先顺序及其张力；本测试没有复制该理论的原版量表。'}
];
const output=path.join(project,'dist');
fs.writeFileSync(path.join(output,'content.js'),'window.SoulData = '+JSON.stringify(data)+';\n','utf8');
fs.writeFileSync(path.join(output,'content.json'),JSON.stringify(data,null,2),'utf8');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const authorHtml=data.authors.map(a=>'<section><h2>'+esc(a.name)+' · '+esc(a.typeName)+'</h2><p>'+esc(a.typeDescription)+'</p>'+a.facets.map(f=>'<p><strong>'+esc(f.label)+'</strong> '+esc(f.description)+'</p>').join('')+'<p>推荐：'+esc(a.book.title)+'。'+esc(a.book.reason)+'</p><ul>'+a.sources.map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+'</a><br><small>'+esc(s.locator)+'</small></li>').join('')+'</ul></section>').join('');
const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>关于测试与资料 · 你的灵魂，与谁同频？</title><style>body{max-width:720px;margin:auto;padding:30px 24px 70px;background:#f7f5f9;color:#352e40;font:15px/1.9 system-ui,"Microsoft YaHei",sans-serif}h1,h2{font-family:"Songti SC",SimSun,serif;line-height:1.6}h1{font-size:28px}h2{font-size:23px}section{border-top:1px solid #ded6e5;margin-top:30px;padding-top:16px}a{color:#6d5786;overflow-wrap:anywhere}li{margin-bottom:14px}small{color:#726a7c}code{overflow-wrap:anywhere}a{min-height:30px;display:inline-block}button{padding:12px}</style><body><a href="./">← 返回测试</a><h1>这次寻找，从何而来</h1><p>24道原创问题，12位作家与哲学家。共鸣类型由本项目编辑命名，围绕所列作品的有限主题展开，不是作者自称，也不是经过验证的人格分类。</p><p><code>'+data.contentVersion+' / '+data.matchingVersion+'</code> · 文本核对：2026-10-23。题目采用v1.1完整试答稿的原题干与选项，统一版本后重新关联证据。真人试答与匹配效果验证尚待进行。</p><section><h2>怎样比较人物</h2><p>先保存每道题所选的理由，再查找与作品主题相容的线索。直接主题联系的编辑权重为1，跨情境类比为0.35；五档题只有“比较符合”和“很符合”提供相应的0.6与1倍支持。其余回答不被解释成反对作者。</p><p>同一主题取最强线索，避免重复题累加。比较时按每位人物可达到的主题支持量归一，并校正不同题数带来的程序机会差异。校正使用等概率随机选项作为数学背景，不代表真实人群或心理分布。至少一条直接联系、两道不同题的支持，才进入主要共鸣候选；单题不足以确定结果。</p><p>目前20道题具有可评分的文本联系，Q01、Q06、Q17、Q21保留为探索背景；其他题也有部分选项只记录理由，不强行绑定人物。完整题目与对应表可查阅<a href="./content.json">本版内容数据</a>。缺少来源不会被当作用户与某人物相反。</p><p>结果接近时列出另一处共鸣；完全同分时明确展示并列，页面主次次序只是稳定展示顺序。线索不足时提供阅读起点，不给出确定归类。分数是内部编辑比较指标，不显示百分比或准确率。</p><p>这些是试测规则，不能仅凭文献或程序模拟认定匹配有效。自动检查验证计算与版本一致性，后续仍需检查真实用户怎样理解题目、选择理由和阅读结果。</p></section><section><h2>参考的方法</h2><ul>'+data.methodSources.map(s=>'<li><a href="'+s.url+'">'+esc(s.title)+'</a><br>'+esc(s.note)+'</li>').join('')+'</ul></section>'+authorHtml+'<section><h2>答题记录与反馈</h2><p>问卷答案仅保存在当前浏览器，不自动上传，不接入登录或广告统计。清除浏览器数据可能丢失进度。结果页可以主动复制完整答题记录与反馈，再自行发给邀请你试测的人。分享卡不包含逐题答案。</p><p>站点托管服务会处理提供网页所需的常规网络请求。本站没有配置额外的答题数据收集服务。</p><p>任何问题请联系开发者 <a href="mailto:3332873535@qq.com">3332873535@qq.com</a></p></section></body></html>';
fs.writeFileSync(path.join(output,'method.html'),html,'utf8');
let index=fs.readFileSync(path.join(output,'index.html'),'utf8');
index=index.replace('aria-expanded="false" aria-controls="sf-about"','aria-haspopup="dialog"');
index=index.replace(/<p id="sf-about"[\s\S]*?<\/p>/,'');
fs.writeFileSync(path.join(output,'index.html'),index,'utf8');
console.log(JSON.stringify({questions:data.questions.length,authors:data.authors.length,rules:data.rules.length,version:data.contentVersion}));
