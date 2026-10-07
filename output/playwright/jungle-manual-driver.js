async (page) => {
  await page.goto('http://127.0.0.1:5176');
  await page.getByRole('button', {name:'▶ START GAME',exact:true}).click();
  await page.getByRole('button', {name:'Manual run →',exact:true}).click();
  await page.waitForFunction(() => window.__jumpa.snapshot().status === 'running');
  let direction=0, stage=0, bonus=0, takeoff=false;
  const seen=new Set();
  const trace=[{event:'start',...await page.evaluate(()=>window.__jumpa.snapshot())}];
  for(let i=0;i<1450;i++) {
    const s=await page.evaluate(()=>window.__jumpa.snapshot());
    if(s.status!=='running') { trace.push(s); break; }
    let a;
    const x=s.x-2880;
    if(s.room<2) {
      a=await page.evaluate(async()=> {
        const rules=await import('/src/game/rules.ts');
        const c=window.__jumpa.content(); const s=window.__jumpa.snapshot();
        const course=rules.assembleCourse(c.rooms);
        return rules.chooseActions({x:s.x,feet:s.feet,halfWidth:9,grounded:s.grounded},course.solids,course.hazards,c.characters[0].controllerProfile,s.elapsed);
      });
    } else {
      if(s.feet>740) stage=2; else if(s.feet>420 && stage<1) stage=1;
      a=await page.evaluate(async({stage})=>{
        const {jungleActions}=await import('/src/game/jungle.ts');
        const s=window.__jumpa.snapshot();const c=window.__jumpa.content();
        return jungleActions({x:s.x-2880,feet:s.feet,halfWidth:9,grounded:s.grounded},stage,s.elapsed,c.rooms[2].hazards);
      },{stage});
      if(stage===2 && x>899 && !takeoff) {a.jump=true;takeoff=true;trace.push({event:'river jump',...s});}
      if(takeoff) {
        if(s.grounded && s.feet<=853 && bonus===0){bonus=1;trace.push({event:'first ledge',...s});}
        if(bonus>0) {
          const levels=[852,792,732,672,612,552,492];
          const idx=levels.findIndex(y=>Math.abs(y-s.feet)<2);
          if(s.grounded && idx>=0) bonus=Math.max(bonus,idx+1);
          const target=bonus%2===1?965:1045;
          const takeoffX=bonus%2===1?1030:965;
          const ready=s.grounded && Math.abs(x-takeoffX)<7;
          const aim=s.grounded&&!ready?takeoffX:target;
          a={move:Math.abs(x-aim)<4?0:x<aim?1:-1,jump:ready,power:false};
          if(bonus===7){trace.push({event:'bonus reached',...s});await page.screenshot({path:'output/playwright/jungle-bonus.png'});break;}
        }
      }
      const key=stage+'-'+bonus;
      if(!seen.has(key)){seen.add(key);trace.push({event:key,...s});}
    }
    if(a.move!==direction){if(direction) await page.keyboard.up(direction===1?'ArrowRight':'ArrowLeft'); if(a.move)await page.keyboard.down(a.move===1?'ArrowRight':'ArrowLeft');direction=a.move;}
    if(a.jump)await page.keyboard.press('Space');
    if(a.power)await page.keyboard.press('KeyX');
    await page.waitForTimeout(30);
  }
  if(direction)await page.keyboard.up(direction===1?'ArrowRight':'ArrowLeft');
  await page.keyboard.press('Escape');
  await page.evaluate(trace=>window.jungleVerification=trace,trace);
}
