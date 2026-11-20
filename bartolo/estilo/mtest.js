const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/musical.html');await p.waitForTimeout(600);
const ts=process.argv.slice(2).map(Number);
for(const t of ts){await p.evaluate(t=>render(t),t);await p.screenshot({path:`${process.env.OUT}/p_${t}.jpg`,type:'jpeg',quality:80});}
console.log(errs.join('\n')||'ok');await b.close();})();
