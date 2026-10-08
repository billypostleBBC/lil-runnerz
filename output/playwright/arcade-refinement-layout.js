async page => {
  const assert = (ok,message) => { if(!ok) throw Error(message); };
  await page.setViewportSize({width:1280,height:720});
  await page.getByRole('button',{name:'START GAME'}).focus();
  for(const [key,id] of [['s','how-to-play'],['d','settings'],['a','how-to-play'],['w','primary']]) {
    await page.keyboard.press(key); assert(await page.locator(':focus').getAttribute('id')===id, 'menu '+key);
  }
  await page.screenshot({path:'output/playwright/refined-title.png'});
  await page.keyboard.press('Enter');
  const rects=[];
  for(let i=0;i<3;i++) {
    rects.push(await page.locator('.selection-actions').boundingBox());
    const preview = await page.locator('#character-preview').boundingBox();
    assert(preview.height===208,'large preview');
    await page.keyboard.press('d');
  }
  assert(rects.every(r=>r.y===rects[0].y && r.height===rects[0].height),'actions shifted');
  await page.keyboard.press('a'); assert(await page.locator('input:checked').inputValue()==='marty','A selects previous');
  await page.screenshot({path:'output/playwright/refined-selection-marty.png'});
  await page.keyboard.press('d');
  await page.screenshot({path:'output/playwright/refined-selection.png'});
  const results=[];
  for(const size of [{width:390,height:844},{width:1024,height:500},{width:1280,height:720}]) {
    await page.setViewportSize(size);
    const frame=await page.locator('.viewport').boundingBox();
    const heading=await page.locator('#screen-title').boundingBox();
    const actions=await page.locator('.selection-actions').boundingBox();
    const content=await page.locator('.selection-layout').boundingBox();
    assert(actions.y+actions.height<=frame.y+frame.height+1,'footer outside');
    assert(content.y+content.height<=actions.y+1,'overlapping footer');
    assert(heading.y>=frame.y && heading.y<frame.y+25,'heading not at top');
    results.push({size,frame,heading,actions,content});
    if(size.width===390) { await page.locator('#character-preview').scrollIntoViewIfNeeded(); await page.screenshot({path:'output/playwright/refined-selection-mobile.png'}); }
    if(size.height===500) await page.screenshot({path:'output/playwright/refined-selection-short.png'});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert(await page.locator('#character-preview').evaluate(e=>getComputedStyle(e).animationName)==='none','reduced motion');
  return {rects,results,visibleHelp:await page.locator('.selection-help').count()};
}
