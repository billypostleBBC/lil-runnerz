async (page) => {
 await page.reload();
 await page.getByRole('button',{name:/START GAME/}).click();
 await page.getByRole('button',{name:'Manual run →',exact:true}).click();
 await page.waitForFunction(()=>window.__jumpa.snapshot().grounded);
 await page.keyboard.press('Space'); await page.waitForTimeout(340);
 const before=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.keyboard.press('ShiftLeft'); await page.waitForTimeout(35);
 const boost=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.screenshot({path:'output/playwright/rocket-boots.png'});
 await page.keyboard.press('ShiftLeft');
 const repeat=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.keyboard.press('Escape');
 const paused=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.waitForTimeout(200);
 const frozen=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.getByRole('button',{name:/RESUME/}).click();
 await page.waitForTimeout(4200);
 await page.keyboard.press('ShiftLeft'); await page.waitForTimeout(25);
 const rearmed=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:/Change character/}).click();
 await page.getByRole('button',{name:'Manual run →',exact:true}).click();
 const reset=await page.evaluate(()=>window.__jumpa.snapshot());
 await page.keyboard.press('Escape');
 await page.evaluate(v=>window.rocketManualCheck=v,{before,boost,repeat,paused,frozen,rearmed,reset});
}
