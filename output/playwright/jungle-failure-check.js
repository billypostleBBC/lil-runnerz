async (page) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('http://127.0.0.1:5176');
  await page.getByRole('button',{name:'▶ START GAME',exact:true}).click();
  await page.getByRole('button',{name:'Manual run →',exact:true}).click();
  await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
  await page.keyboard.down('ArrowRight');
  for(let i=0;i<1100;i++) {
    const s=await page.evaluate(()=>window.__jumpa.snapshot());
    if(s.status!=='running')break;
    if(s.room<2){
      const a=await page.evaluate(async()=> {
        const rules=await import('/src/game/rules.ts');
        const c=window.__jumpa.content();const s=window.__jumpa.snapshot();const course=rules.assembleCourse(c.rooms);
        return rules.chooseActions({x:s.x,feet:s.feet,halfWidth:9,grounded:s.grounded},course.solids,course.hazards,c.characters[0].controllerProfile,s.elapsed);
      });
      if(a.jump)await page.keyboard.press('Space');if(a.power)await page.keyboard.press('KeyX');
    }
    await page.waitForTimeout(30);
  }
  await page.keyboard.up('ArrowRight');
  const death=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.screenshot({path:'output/playwright/jungle-spike-death.png'});
  await page.getByRole('button',{name:'▶ TRY AGAIN →',exact:true}).click();
  await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
  const restart=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Change character / mode',exact:true}).click();
  await page.getByRole('button',{name:'Auto-run →',exact:true}).click();
  await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
  const modeReset=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.keyboard.press('Escape');
  await page.evaluate(e=>window.failureEvidence=e,{death,restart,modeReset});
}
