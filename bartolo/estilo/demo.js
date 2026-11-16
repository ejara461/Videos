const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/style.html');await p.waitForTimeout(600);
const out=process.env.FR;for(let i=0;i<180;i++){await p.evaluate(t=>renderDemo(t),i/30);await p.screenshot({path:`${out}/d_${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
console.log(errs.join('\n')||'ok');await b.close();})();
