async (page) => {
 await page.setViewportSize({width:375,height:812});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload();
 await page.getByRole('button',{name:/START GAME/}).click();
 await page.screenshot({path:'output/playwright/rocket-selection-narrow.png'});
 await page.getByRole('button',{name:'Manual run →',exact:true}).click();
 await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
 await page.getByLabel('Game world.',{exact:false}).focus();
 await page.keyboard.down('ArrowRight'); await page.waitForTimeout(800); await page.keyboard.up('ArrowRight');
 await page.waitForTimeout(120);
 await page.screenshot({path:'output/playwright/collectibles-narrow.png'});
 const layout=await page.evaluate(()=>{
   const score=document.querySelector('#score-label').getBoundingClientRect();
   const power=document.querySelector('.shield-meter').getBoundingClientRect();
   return {scoreRight:score.right,powerLeft:power.left,noOverlap:score.right<power.left,noOverflow:document.documentElement.scrollWidth<=innerWidth,snapshot:window.__jumpa.snapshot()};
 });
 await page.keyboard.press('Escape');
 await page.evaluate(v=>window.narrowCheck=v,layout);
}
