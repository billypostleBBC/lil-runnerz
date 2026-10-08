async page => {
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:5175/');
  await page.getByRole('button', {name:'START GAME'}).click();
  await page.getByRole('button', {name:'Auto-run →'}).click();
  await page.waitForFunction(() => window.__jumpa?.snapshot().status === 'running');
  await page.evaluate(() => {
    window.cameraTrace = [];
    const sample = () => {
      const s = window.__jumpa.snapshot();
      window.cameraTrace.push(s);
      if (s.status === 'running') requestAnimationFrame(sample);
    };
    sample();
  });
  await page.waitForFunction(() => window.__jumpa.snapshot().x > 2900);
  await page.screenshot({path:'output/playwright/refined-camera-mobile-seam.png'});
  await page.waitForFunction(() => window.__jumpa.snapshot().feet > 800);
  await page.screenshot({path:'output/playwright/refined-camera-mobile-jungle.png'});
  await page.waitForFunction(() => window.__jumpa.snapshot().status !== 'running');
  return await page.evaluate(() => {
    const trace = window.cameraTrace;
    const seam = trace.filter(s => s.x > 2750 && s.x < 3000);
    const maxSeamDelta = Math.max(...seam.slice(1).map((s,i)=>Math.abs(s.cameraY-seam[i].cameraY)));
    return {outcome:trace.at(-1),maxSeamDelta,rangeY:[Math.min(...trace.map(s=>s.cameraY)),Math.max(...trace.map(s=>s.cameraY))],outOfBounds:trace.some(s=>s.cameraX<0||s.cameraX>3488||s.cameraY<0||s.cameraY>832)};
  });
}
