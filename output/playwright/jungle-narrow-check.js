async (page) => {
  await page.goto('http://127.0.0.1:4180');
  await page.getByRole('button',{name:'▶ START GAME',exact:true}).click();
  await page.getByRole('button',{name:'Auto-run →',exact:true}).click();
  await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
  await page.waitForFunction(()=>window.__jumpa.snapshot().x>3500 || window.__jumpa.snapshot().status!=='running',{},{timeout:40000});
  await page.screenshot({path:'output/playwright/jungle-narrow-drop.png'});
  await page.waitForFunction(()=>window.__jumpa.snapshot().status!=='running',{},{timeout:25000});
  await page.evaluate(()=>window.narrowResult=window.__jumpa.snapshot());
}
