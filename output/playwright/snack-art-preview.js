async(page)=>{
 await page.evaluate(async()=>{
   const {paintSnack}=await import('/src/game/snack-art.ts');
   const {snackVarieties,bonusVarieties,snackNames}=await import('/src/content/collectibles.ts');
   const canvas=document.createElement('canvas');canvas.id='snack-proof';canvas.width=720;canvas.height=260;
   canvas.style.cssText='position:fixed;inset:0;z-index:10000;width:720px;height:260px;';document.body.append(canvas);
   const c=canvas.getContext('2d');c.fillStyle='#151e2a';c.fillRect(0,0,720,260);
   [...snackVarieties,...bonusVarieties].forEach((v,i)=>{
     const x=(i%6)*120+60,y=Math.floor(i/6)*130+52;
     c.save();c.translate(x,y);c.scale(3,3);paintSnack(c,v,0,0);c.restore();
     c.fillStyle='#ffedcb';c.font='12px monospace';c.textAlign='center';c.fillText(v==='chutney'?'Chilli chutney':snackNames[v],x,y+52);
   });
 });
 await page.locator('#snack-proof').screenshot({path:'output/playwright/snack-art-preview.png'});
 await page.evaluate(()=>document.querySelector('#snack-proof').remove());
}
