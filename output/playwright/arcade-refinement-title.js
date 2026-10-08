async page => {
  const choices=[];
  for(let i=0;i<4;i++) {
    await page.goto('http://127.0.0.1:5175/');
    await page.waitForFunction(()=>document.querySelector('.title-runner')?.dataset.character);
    choices.push(await page.locator('.title-runner').getAttribute('data-character'));
  }
  const before=choices.at(-1);
  await page.getByRole('button',{name:'START GAME'}).click();
  await page.getByRole('button',{name:'← Main menu'}).click();
  if(await page.locator('.title-runner').getAttribute('data-character')!==before) throw Error('Title pick changed within page');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(150);
  const first=await page.locator('.title-runner').evaluate(c=>c.toDataURL());
  await page.waitForTimeout(200);
  if(await page.locator('.title-runner').evaluate(c=>c.toDataURL())!==first) throw Error('Title animates with reduced motion');
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'output/playwright/refined-title-mobile.png'});
  return {choices,stable:before,reducedMotion:true};
}
