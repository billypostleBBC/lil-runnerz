async(page)=>{
 await page.setViewportSize({width:1200,height:950});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.reload();
 await page.getByRole('button',{name:/START GAME/}).click();
 await page.getByRole('button',{name:'Manual run →',exact:true}).click();
 await page.waitForFunction(()=>window.__jumpa.snapshot().grounded);
 await page.keyboard.down('ArrowRight'); await page.waitForTimeout(1150);
 await page.keyboard.press('Space');
 await page.waitForFunction(()=>window.__jumpa.snapshot().status==='dead',{},{timeout:10000});
 await page.keyboard.up('ArrowRight');
 const dead=await page.evaluate(()=>({snapshot:window.__jumpa.snapshot(),copy:document.querySelector('#screen-description').textContent}));
 await page.screenshot({path:'output/playwright/collectibles-death.png'});
 await page.getByRole('button',{name:/TRY AGAIN/}).click();
 const reset=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.keyboard.press('Escape');
 await page.evaluate(v=>window.failureCheck=v,{dead,reset});
}
