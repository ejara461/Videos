const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
for(const f of ['sheet','scene']){await p.goto('file://'+process.cwd()+'/style.html?f='+f);await p.waitForTimeout(600);await p.screenshot({path:`cuadro_${f}.png`});}
console.log(errs.join('\n')||'ok');await b.close();})();
