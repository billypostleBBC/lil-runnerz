async(page)=>{
 // Override runnerId only in this verification file to replay the other runner.
 const runnerId='marty';
 await page.goto('http://127.0.0.1:5177');
 await page.getByRole('button',{name:/START GAME/}).click();
 if(runnerId==='marty') await page.getByRole('radio',{name:/Marty McFly/}).check();
 await page.getByRole('button',{name:'Manual run →',exact:true}).click();
 await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
 await page.evaluate(async()=>{
   const rules=await import('/src/game/rules.ts');
   const jungle=await import('/src/game/jungle.ts');
   const {BonusController}=await import('/src/game/collectibles.ts');
   const data=window.__jumpa.content();
   const definition=data.characters.find(c=>c.character.id===window.__jumpa.snapshot().characterId);
   window.manualRoute={rules,jungle,BonusController,course:rules.assembleCourse(data.rooms),definition,
     controller:new rules.Controller(definition.controllerProfile),seekers:new Map(),stage:0,room:-1,bonusBase:0,flameCrossing:new rules.FlameCrossingController()};
   window.manualRouteTrace=[];
 });
 let direction=0,shot=false;
 for(let frame=0;frame<3300;frame++){
   const result=await page.evaluate(()=>{
     const s=window.__jumpa.snapshot(),d=window.manualRoute;
     if(s.status!=='running') return {s,a:null};
     const c=d.definition.character,p=d.definition.controllerProfile,room=d.course.rooms[s.room];
     const actor={x:s.x,feet:s.feet,halfWidth:9,grounded:s.grounded};
     const local={...actor,x:actor.x-room.offset,feet:actor.feet-room.offsetY};
     if(d.room!==s.room){d.room=s.room;d.bonusBase=s.bonuses;}
     const inJungle=room.theme==='jungle';
     if(inJungle)d.stage=d.jungle.jungleStage(d.stage,local.feet);
     let a=inJungle?d.jungle.jungleActions(local,d.stage,s.elapsed,room.hazards,p.perceptionDistance,room.solids,p.jumpLead):
       {...d.controller.decide(s.elapsed,actor,d.course.solids,d.course.hazards)};
     let seeker=d.seekers.get(room.id);if(!seeker){seeker=new d.BonusController();d.seekers.set(room.id,seeker);}
     const bonus=seeker.decide(room.id,local,c,s.elapsed,s.bonuses===d.bonusBase);
     if(bonus)a=bonus;
     const landing=d.course.solids.some(r=>actor.x>=r.x&&actor.x<=r.x+r.w&&r.y>=actor.feet);
     const flames=d.course.hazards.filter(h=>h.kind==='flame'&&d.rules.hazardActive(h,s.elapsed));
     if(c.power.kind==='glide'){
       a.power=!s.grounded&&s.vy>=-40&&!landing;
       if(s.grounded&&flames.some(h=>h.x>actor.x&&h.x-actor.x<85&&h.y<actor.feet))a.jump=true;
     }
     if(c.power.kind==='glide'){
       const crossing=d.flameCrossing.decide(actor,d.course.hazards,s.elapsed,c.speed);
       if(crossing&&!bonus)a=crossing;
     }
     if(c.power.kind==='rocket'){
       const danger=flames.some(h=>h.x+h.w>=actor.x-9&&h.x-actor.x<85&&h.y<actor.feet+c.jumpSpeed**2/(2*c.gravity)&&h.y+h.h>actor.feet-28);
       if(s.grounded&&danger)a.jump=true;
       const rise=c.power.boostSpeed**2/(2*c.gravity);
       const ceiling=d.course.solids.some(r=>d.jungle.overlaps({x:actor.x-9,y:actor.feet-28-rise,w:18,h:rise},r));
       a.power=!s.grounded&&s.vy>=-80&&s.vy<180&&!ceiling&&(!!bonus||danger||!landing);
     }
     return {s,a};
   });
   if(frame%20===0||!result.a)await page.evaluate(s=>window.manualRouteTrace.push(s),result.s);
   if(!result.a)break;
   const a=result.a;
   if(a.move!==direction){if(direction)await page.keyboard.up(direction===1?'ArrowRight':'ArrowLeft');if(a.move)await page.keyboard.down(a.move===1?'ArrowRight':'ArrowLeft');direction=a.move;}
   if(a.jump)await page.keyboard.press('Space');
   if(a.power)await page.keyboard.press('ShiftLeft');
   if(!shot&&result.s.room===2&&result.s.x>3260&&result.s.x<3400){shot=true;await page.screenshot({path:`output/playwright/jungle-boulders-${runnerId}.png`});}
   await page.waitForTimeout(20);
 }
 if(direction)await page.keyboard.up(direction===1?'ArrowRight':'ArrowLeft');
 await page.screenshot({path:`output/playwright/jungle-manual-${runnerId}-result.png`});
}
