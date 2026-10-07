async (page) => {
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:4180');
  await page.getByRole('button',{name:'▶ START GAME',exact:true}).click();
  await page.getByRole('button',{name:'Auto-run →',exact:true}).click();
  await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(250);
  const isolation=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(()=>window.__jumpa.snapshot().room===2,{},{timeout:45000});
  await page.waitForFunction(()=>window.__jumpa.snapshot().feet>700 || window.__jumpa.snapshot().status!=='running',{},{timeout:20000});
  await page.screenshot({path:'output/playwright/jungle-production-waterfall.png'});
  await page.waitForFunction(()=>window.__jumpa.snapshot().status!=='running',{},{timeout:25000});
  const result=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.screenshot({path:'output/playwright/jungle-production-result.png'});
  await page.evaluate(e=>window.productionEvidence=e,{isolation,result,errors});
}
