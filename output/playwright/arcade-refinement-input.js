async page => {
  await page.setViewportSize({width:1280,height:720});
  await page.getByRole('button',{name:'Manual run →'}).click();
  await page.waitForFunction(()=>window.__jumpa.snapshot().status==='running');
  await page.keyboard.down('d'); await page.keyboard.press('ShiftLeft');
  await page.waitForTimeout(150);
  const active=await page.evaluate(()=>window.__jumpa.snapshot());
  if(!active.powerActive||active.vx<=0) throw Error('Left Shift while D failed');
  await page.keyboard.up('d'); await page.waitForTimeout(850);
  await page.keyboard.press('ShiftLeft'); await page.waitForTimeout(100);
  const cooldown=await page.evaluate(()=>window.__jumpa.snapshot());
  if(cooldown.powerActive||cooldown.cooldown<=0) throw Error('Cooldown bypass');
  await page.keyboard.down('d'); await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await page.getByRole('button',{name:'RESUME →'}).waitFor();
  await page.keyboard.press('ShiftLeft');
  const paused=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.getByRole('button',{name:'RESUME →'}).click();
  await page.waitForTimeout(250);
  const resumed=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.keyboard.up('d');
  if(resumed.x!==paused.x||resumed.vx!==0) throw Error('Held input not cleared');
  return {active,cooldown,paused,resumed};
}
