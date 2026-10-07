async (page) => {
  await page.route('**/assets/scenery/jungle-run.png',route=>route.abort());
  await page.goto('http://127.0.0.1:4180');
  await page.locator('#load-error').waitFor({state:'visible'});
  const error=await page.locator('#error-message').textContent();
  await page.screenshot({path:'output/playwright/jungle-load-error.png'});
  await page.unroute('**/assets/scenery/jungle-run.png');
  await page.setViewportSize({width:375,height:812});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await page.getByRole('button',{name:'▶ START GAME',exact:true}).click();
  const narrow=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,reduced:window.__jumpa.snapshot().reducedMotion}));
  await page.screenshot({path:'output/playwright/jungle-narrow-selection.png'});
  await page.getByRole('radio',{name:/Marty McFly/}).check();
  await page.getByRole('button',{name:'Auto-run →',exact:true}).click();
  await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
  await page.waitForFunction(()=>window.__jumpa.snapshot().room===2 || window.__jumpa.snapshot().status!=='running',{},{timeout:45000});
  if((await page.evaluate(()=>window.__jumpa.snapshot())).status==='running'){
    await page.waitForFunction(()=>window.__jumpa.snapshot().x>3500 || window.__jumpa.snapshot().status!=='running',{},{timeout:10000});
    await page.screenshot({path:'output/playwright/jungle-narrow-drop.png'});
    await page.waitForFunction(()=>window.__jumpa.snapshot().status!=='running',{},{timeout:25000});
  }
  const result=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.evaluate(e=>window.uiEvidence=e,{error,narrow,result});
}
