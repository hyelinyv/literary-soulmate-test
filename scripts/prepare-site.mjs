import fs from 'node:fs';
import path from 'node:path';
const project = path.resolve(import.meta.dirname, '..');
const previewRoot = 'C:/Users/33328/.codex/visualizations/2026/10/23/01a1677a-9d28-7ab2-894f-663d6daf8206';
const preview = fs.readFileSync(path.join(previewRoot, 'soul-page-design-v3.html'), 'utf8');
const dist = path.join(project, 'dist');
fs.mkdirSync(path.join(project, 'archive', 'early-prototype'), { recursive: true });
for (const file of fs.readdirSync(dist)) {
  if (fs.statSync(path.join(dist, file)).isFile() && !fs.existsSync(path.join(project, 'archive', 'early-prototype', file))) fs.copyFileSync(path.join(dist, file), path.join(project, 'archive', 'early-prototype', file));
}
const css = preview.match(/<style>([\s\S]*?)<\/style>/)[1];
fs.writeFileSync(path.join(dist, 'style.css'), css, 'utf8');
fs.copyFileSync(path.join(previewRoot, 'writer-silhouettes-v2.webp'), path.join(dist, 'writers.webp'));
let home = preview.match(/<section class="sf-product sf-home"[\s\S]*?<\/section>/)[0];
home = home.replace(/src="data:image\/webp;base64,[^"]+"/, 'src="./writers.webp"').replace(/<i data-lucide="arrow-right" aria-hidden="true"><\/i>/g, '<span aria-hidden="true">→</span>');
home = home.replace('<span>24 道问题</span>', '<span>24 道问题</span>');
home = home.replace('按第一反应，选出你的答案。', '按第一反应，选出你的答案。');
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f3f6"><meta name="description" content="24道关于自我与世界的问题，寻找与你契合的作家或哲学家。"><title>你的灵魂，与谁同频？</title><link rel="icon" href="./favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="./style.css"><link rel="stylesheet" href="./site.css"><script defer src="./content.js"></script><script defer src="./engine.js"></script><script defer src="./app.js"></script></head>
<body><div id="soul-design" lang="zh-CN">${home}
<section class="sf-product sf-quiz" data-page="quiz" aria-label="答题" hidden>
<header class="sf-top"><button type="button" class="sf-icon-button" data-action="back" aria-label="上一题">←</button><div class="sf-progress-wrap"><div class="sf-progress-label"><span>凭第一反应选择</span><span class="sf-progress-number" data-progress-label></span></div><div class="sf-progress" role="progressbar" aria-label="答题进度" aria-valuemin="0" aria-valuemax="24"><div class="sf-progress-fill"></div></div></div></header>
<main id="question-content"></main><footer class="sf-quiz-footer"><button type="button" class="sf-primary" data-action="next" disabled><span data-next-label>下一题</span><span aria-hidden="true">→</span></button><button class="sf-exit" type="button" data-action="home">暂时回到首页</button></footer></section>
<section class="sf-product sf-result" data-page="result" aria-label="你的共鸣结果" hidden><header class="sf-top"><button type="button" class="sf-icon-button" data-action="edit" aria-label="返回修改答案">←</button><span class="sf-result-title">你的文学知音</span><span class="sf-symbol" aria-hidden="true"></span></header><main id="result-content"></main></section>
<div class="sf-live" id="status-message" aria-live="polite"></div>
<div id="modal" class="sf-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden><div class="sf-modal-panel"><button type="button" class="sf-modal-close" data-action="close-modal" aria-label="关闭">×</button><h2 id="modal-title"></h2><div id="modal-content"></div></div></div></div>
<noscript><p>请启用浏览器 JavaScript 后开始测试。你的答案仅保存在本机。</p></noscript></body></html>`;
fs.writeFileSync(path.join(dist, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(dist, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#f4f3f6"/><circle cx="25" cy="32" r="18" fill="#c6baf2"/><circle cx="42" cy="32" r="16" fill="#a4d5ed" opacity=".85"/></svg>');
console.log('Approved design prepared.');
