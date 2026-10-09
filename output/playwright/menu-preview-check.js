async (page) => {
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const read=()=>page.evaluate(()=>({room:document.querySelector('#screen').dataset.previewRoom,character:document.querySelector('.title-runner')?.dataset.character,state:window.__jumpa.snapshot(),focus:document.activeElement.id}));
 await page.setViewportSize({width:1280,height:800});
 await page.waitForFunction(()=>document.querySelector('.title-runner')?.dataset.character);
 const seen=new Set(), characters=new Set();
 for(let i=0;i<35;i++) {
  await page.waitForTimeout(180);
  const s=await read(); characters.add(s.character);
  if(!seen.has(s.room)){await page.screenshot({path:`output/playwright/menu-${s.room}.png`});seen.add(s.room);}
  const before=JSON.stringify(s);
  await page.waitForTimeout(180);
  if(JSON.stringify(await read())!==before) throw Error('Menu changed without entry');
  if(seen.size===3&&characters.size>=2)break;
  await page.locator('#how-to-play').click(); await page.locator('#back-splash').click();
 }
 if(seen.size!==3)throw Error('Not all previews observed');
 const stabilityBefore=await read();
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);
 const reduced=await page.evaluate(async()=>{const c=document.querySelector('.title-runner');const a=c.toDataURL();await new Promise(r=>setTimeout(r,180));return a===c.toDataURL();});
 const stabilityAfter=await read();
 if(stabilityBefore.room!==stabilityAfter.room||stabilityBefore.character!==stabilityAfter.character)throw Error('Settings update reselected preview');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'output/playwright/menu-mobile.png'});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(100);
 const animated=await page.evaluate(async()=>{const c=document.querySelector('.title-runner');const a=c.toDataURL();await new Promise(r=>setTimeout(r,130));return a!==c.toDataURL();});
 await page.setViewportSize({width:1280,height:800});
 await page.locator('#primary').focus();await page.keyboard.press('ArrowDown');
 const keyboardFocus=await page.evaluate(()=>document.activeElement.id);
 const starts=[];
 for(const mode of ['manual','auto']) {
  if(mode==='auto') {await page.goto('http://127.0.0.1:5181/');await page.locator('#primary').waitFor();}
  await page.locator('#primary').click();
  await page.locator(`#start-${mode}`).click();
  await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
  const s=await read();starts.push({mode,state:s.state,focus:s.focus});
  await page.screenshot({path:`output/playwright/menu-start-${mode}.png`});
 }
 return {rooms:[...seen],characters:[...characters],reduced,animated,overflow,keyboardFocus,starts,errors};
}
