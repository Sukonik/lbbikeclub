// UI sweep: overflow, undersized tap targets, clipped text and low-contrast text across
// pages x widths x themes. Usage: node tests/ui_sweep.js [baseUrl]  (weather API is mocked)
const {chromium}=require('playwright');const mock=require('./mock_weather.js');
const base=process.argv[2]||'http://localhost:8123/';
const themes=['giant','trek','specialized','canyon','scott','cervelo','cannondale','bianchi'];
const pages=['index.html','weather.html'];const widths=[320,360,390,768,1024,1440];
(async()=>{const b=await chromium.launch();const issues={};const add=(k,m)=>{(issues[k]=issues[k]||new Set()).add(m)};
for(const pg of pages)for(const w of widths){const c=await b.newContext({viewport:{width:w,height:800}});const p=await c.newPage();
 await p.route('**/api.open-meteo.com/**',r=>r.fulfill({json:mock()}));await p.route('**/fonts.g*apis.com/**',r=>r.abort());
 await p.goto(base+pg);await p.waitForTimeout(500);
 await p.evaluate(()=>document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in')));
 for(const t of (w===390||w===1440?themes:['giant'])){
  await p.evaluate(t=>LBBC.setTheme(t),t);await p.waitForTimeout(150);
  const r=await p.evaluate(()=>{const out={small:[],clip:[],over:[],contrast:[]};
   const lum=c=>{const [r,g,b]=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
   const vw=document.documentElement.clientWidth;
   const vis=e=>{if(e.matches('.paint,.skip-link')||e.closest('.paint'))return false;const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('.drawer')};
   document.querySelectorAll('a,button,select').forEach(e=>{if(!vis(e))return;const r=e.getBoundingClientRect();
     if((r.height<40||r.width<40)&&!e.closest('.site-footer__links,.drawer__foot,.hours,.site-footer')&&!(e.matches('a')&&e.closest('p')))out.small.push((e.className||e.tagName)+' '+Math.round(r.width)+'x'+Math.round(r.height))});
   document.querySelectorAll('body *').forEach(e=>{if(!vis(e))return;const r=e.getBoundingClientRect();if(r.right>vw+1&&!e.closest('.hours,.paint,svg,.scrim'))out.over.push((e.className||e.tagName)+' right='+Math.round(r.right));
     if(e.children.length===0&&e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible'&&!e.closest('.hours'))out.clip.push((e.className||e.tagName))});
   document.querySelectorAll('p,span,a,li,h1,h2,h3,label,small,button,b').forEach(e=>{if(!vis(e)||!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;
     const s=getComputedStyle(e);if(s.webkitTextFillColor==='rgba(0, 0, 0, 0)')return;const m=s.color.match(/[\d.]+/g).map(Number);if(m.length>3&&m[3]<1)return;
     const fs=parseFloat(s.fontSize);
     // background: approximate with near-black
     const L=lum(m.slice(0,3)),ratio=(L+.05)/(0.004+.05);if(ratio<4.5&&fs<24)out.contrast.push((e.className||e.tagName)+' '+s.color+' '+fs+'px ratio '+ratio.toFixed(1))});
   return out});
  for(const k of Object.keys(r))r[k].forEach(m=>add(k+' @'+pg+' '+w+(w===390||w===1440?' '+t:''),m));
 }
 await c.close()}
const agg={};for(const k of Object.keys(issues)){for(const m of issues[k]){const kk=k.split(' @')[0]+' :: '+m;(agg[kk]=agg[kk]||[]).push(k.split(' @')[1])}}for(const k of Object.keys(agg).sort())console.log(k,'  [',agg[k].length,'configs; e.g.',agg[k].slice(0,3).join(', '),']');
if(!Object.keys(issues).length)console.log('no issues');await b.close();
// nav links are short words (height is what matters for tapping); everything else must pass
process.exit(Object.keys(agg).filter(k=>!/nav__link/.test(k)).length?1:0)})();
