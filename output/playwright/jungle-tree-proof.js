async(page)=>{
 await page.goto('http://127.0.0.1:5177');
 await page.evaluate(async()=>{
   const {paintTerrain,paintHazards}=await import('/src/game/art.ts');
   const {assembleCourse,hazardActive}=await import('/src/game/rules.ts');
   const {jungleRoom}=await import('/src/content/jungle.ts');
   const image=new Image();image.src='/assets/scenery/jungle-run.png';await image.decode();
   const course=assembleCourse([jungleRoom]);
   const proof=document.createElement('canvas');proof.id='tree-proof';proof.width=1050;proof.height=350;
   proof.style.cssText='position:fixed;left:0;top:0;z-index:10000;width:1050px;height:350px';document.body.append(proof);
   const target=proof.getContext('2d');target.imageSmoothingEnabled=false;target.fillStyle='#101d24';target.fillRect(0,0,1050,350);
   [[2000,'RETRACTED'],[4300,'WARNING'],[500,'DANGLING / ACTIVE']].forEach(([time,label],i)=>{
     const scene=document.createElement('canvas');scene.width=1120;scene.height=1120;const c=scene.getContext('2d');
     c.imageSmoothingEnabled=false;c.drawImage(image,0,0,1120,1120);paintTerrain(c,course);
     const layer=document.createElement('canvas');layer.width=1120;layer.height=1120;paintHazards(layer.getContext('2d'),course,time,true,h=>hazardActive(h,time));c.drawImage(layer,0,0);
     target.drawImage(scene,575,625,330,310,i*350+10,30,330,310);
     target.font='12px monospace';target.fillStyle='#ffedcb';target.fillText(label,i*350+15,18);
   });
 });
 await page.locator('#tree-proof').screenshot({path:'output/playwright/jungle-tree-phases.png'});
 await page.evaluate(()=>document.querySelector('#tree-proof').remove());
}
