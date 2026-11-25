const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/promo_169.html');await p.waitForTimeout(600);
for(const t of process.argv.slice(2).map(Number)){await p.evaluate(t=>render(t),t);await p.screenshot({path:`${process.env.OUT}/w_${t}.jpg`,type:'jpeg',quality:80});}
console.log(errs.join('\n')||'ok');await b.close();})();
