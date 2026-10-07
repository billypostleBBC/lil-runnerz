async (page) => {
  const evidence={paused:await page.evaluate(()=>window.__jumpa.snapshot())};
  await page.waitForTimeout(300);
  evidence.stillPaused=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.getByRole('button',{name:'▶ RESUME →',exact:true}).click();
  await page.keyboard.down('ArrowRight');
  await page.locator('#pause').focus();
  evidence.focusLoss=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.getByRole('button',{name:'▶ RESUME →',exact:true}).click();
  await page.waitForTimeout(150);
  evidence.resumed=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.keyboard.up('ArrowRight');
  let direction=0;
  for(let i=0;i<250;i++){
    const s=await page.evaluate(()=>window.__jumpa.snapshot());
    if(s.status!=='running')break;
    const levels=[492,552,612,672,732,792,852];
    let idx=levels.findIndex(y=>Math.abs(y-s.feet)<2);
    if(idx<0)idx=levels.findLastIndex(y=>y<s.feet);
    const target=idx>=6?980:idx%2===0?965:1045;
    const move=Math.abs(s.x-2880-target)<5?0:s.x-2880<target?1:-1;
    if(move!==direction){if(direction)await page.keyboard.up(direction===1?'ArrowRight':'ArrowLeft');if(move)await page.keyboard.down(move===1?'ArrowRight':'ArrowLeft');direction=move;}
    await page.waitForTimeout(30);
  }
  if(direction)await page.keyboard.up(direction===1?'ArrowRight':'ArrowLeft');
  evidence.result=await page.evaluate(()=>window.__jumpa.snapshot());
  await page.evaluate(e=>window.jungleReturn=e,evidence);
}
