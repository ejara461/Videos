// Renderiza los cuadros del video con Chromium (Playwright) en paralelo.
const {chromium} = require('playwright');
const FPS = 30, DUR = 48, TOTAL = FPS * DUR, WORKERS = 4;
const OUT = process.env.FRAMES || 'frames';
(async () => {
  const b = await chromium.launch();
  const jobs = [...Array(WORKERS).keys()].map(async w => {
    const p = await b.newPage({viewport: {width: 1080, height: 1920}});
    await p.goto('file://' + process.cwd() + '/estilo/pilot.html');
    await p.waitForTimeout(400);
    for (let i = w; i < TOTAL; i += WORKERS) {
      await p.evaluate(t => render(t), i / FPS);
      await p.screenshot({path: `${OUT}/f_${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92});
    }
  });
  await Promise.all(jobs);
  await b.close();
  console.log('frames ok');
})();
