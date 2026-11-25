const {chromium}=require('playwright');
const FPS=30,DUR=15,TOTAL=FPS*DUR,WORKERS=4,OUT=process.env.FRAMES;
(async()=>{const b=await chromium.launch();
await Promise.all([...Array(WORKERS).keys()].map(async w=>{const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+process.cwd()+'/estilo/promo_169.html');await p.waitForTimeout(400);
for(let i=w;i<TOTAL;i+=WORKERS){await p.evaluate(t=>render(t),i/FPS);await p.screenshot({path:`${OUT}/f_${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});}}));
await b.close();console.log('frames ok');})();
