async (page) => {
 await page.reload();
 await page.getByRole('button',{name:/START GAME/}).click();
 await page.getByRole('button',{name:'Manual run →',exact:true}).click();
 const start=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.keyboard.down('ArrowRight'); await page.waitForTimeout(800); await page.keyboard.up('ArrowRight');
 const picked=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.keyboard.press('Escape');
 const paused=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.waitForTimeout(250);
 const still=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.getByRole('button',{name:/RESUME/}).click();
 await page.getByLabel('Game world.',{exact:false}).focus();
 await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(500); await page.keyboard.up('ArrowLeft');
 await page.keyboard.down('ArrowRight'); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight');
 const revisit=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:/Change character/}).click();
 await page.getByRole('button',{name:'Manual run →',exact:true}).click();
 const reset=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.screenshot({path:'output/playwright/collectibles-manual.png'});
 await page.keyboard.press('Escape');
 await page.evaluate(v=>window.manualCollectibleCheck=v,{start,picked,paused,still,revisit,reset});
}
