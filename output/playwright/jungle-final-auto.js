async(page)=>{
 const results=[],errors=[];const error=e=>errors.push(e.message);page.on('pageerror',error);
 for(const id of ['bill-e-bot','marty']){
   await page.goto('http://127.0.0.1:4178');
   await page.getByRole('button',{name:/START GAME/}).click();
   if(id==='marty')await page.getByRole('radio',{name:/Marty McFly/}).check();
   await page.getByRole('button',{name:'Auto-run →',exact:true}).click();
   await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
   let tree=false;
   for(let i=0;i<750;i++){
     const s=await page.evaluate(()=>window.__jumpa.snapshot());
     if(!tree&&s.room===2&&s.feet>800&&s.x>3370&&s.x<3570){tree=true;await page.screenshot({path:`output/playwright/jungle-tree-${id}.png`});}
     if(s.status!=='running')break;
     await page.waitForTimeout(100);
   }
   results.push(await page.evaluate(()=>window.__jumpa.snapshot()));
   await page.screenshot({path:`output/playwright/jungle-final-auto-${id}.png`});
 }
 await page.evaluate(v=>window.finalAutoResults=v,{results,errors});page.off('pageerror',error);
}
