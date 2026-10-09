import type { Collection } from './collectibles';
import type { Variety } from '../content/collectibles';

// Original code-drawn sprites: integer rectangles, stepped shading, no external assets.
export function paintSnack(c: CanvasRenderingContext2D, variety: Variety, x: number, y: number) {
  c.save(); c.translate(Math.round(x)-8,Math.round(y)-10);
  const r = (colour:string,x:number,y:number,w:number,h:number) => {c.fillStyle=colour;c.fillRect(x,y,w,h);};
  const dark='#24202c', cream='#fff0c2', gold='#dda64c', red='#cc413b';
  if (variety==='chutney') {
    r(dark,2,1,13,19); r('#9cbbc0',3,4,11,14); r('#dce6ce',4,4,9,2);
    r('#872c32',4,8,9,9); r('#d95638',5,9,7,6); r('#ef874d',6,10,2,2);
    r('#b6d9cf',3,5,2,11); r('#eff4d6',4,6,1,6); r('#769594',12,5,2,12);
    r('#c1cbc0',2,1,13,3); r(cream,3,1,11,1); r('#64757c',1,4,15,2);
    r('#e2dcc5',8,3,3,8); r(dark,9,5,1,3); r(cream,6,12,6,4); r(red,8,13,3,1);
  } else if (variety==='apple') {
    r(dark,3,5,11,13); r(red,2,7,13,8);r('#e96048',4,5,5,10);r('#862e37',10,9,4,7);
    r(cream,4,7,2,3);r('#956746',8,1,2,5);r('#8ab86b',10,2,4,2);
  } else if (variety==='banana') {
    r(dark,2,3,3,9);r(dark,4,11,9,6);r('#d49b32',3,5,3,7);r('#f5d46c',5,10,8,5);
    r(cream,6,11,5,2);r('#f5d46c',12,6,3,7);r(dark,13,4,2,3);
  } else if (variety==='crisps' || variety==='chocolate' || variety==='flapjack') {
    const colour=variety==='crisps'?'#d7ac36':variety==='chocolate'?'#8957a0':'#b78647';
    r(dark,2,2,13,17);r(colour,3,3,11,15);r(cream,3,2,11,2);r(gold,3,17,11,2);
    if(variety==='crisps'){r('#be3a38',4,7,9,6);r(cream,6,8,5,2);r(gold,7,11,3,1);}
    else if(variety==='chocolate'){r('#53372e',4,3,9,6);r('#ad7350',5,4,3,2);r('#ad7350',9,4,3,2);r(cream,4,11,8,3);}
    else {for(let i=0;i<12;i++)r(i%2?cream:'#92602f',4+(i*3)%9,5+(i*7)%11,2,1);}
  } else if (variety==='cheese') {
    r(dark,1,14,15,4);r(dark,11,3,4,13);r('#f6cf64',3,12,11,4);r('#f6cf64',6,9,8,4);r('#f6cf64',9,6,5,4);
    r(cream,6,9,5,1);r('#c28a35',10,11,2,2);r('#c28a35',5,14,2,1);
  } else if (variety==='pretzel') {
    r(dark,2,4,13,11);r(gold,3,5,5,9);r(gold,10,5,4,9);r(gold,5,12,7,5);
    r(dark,5,7,2,4);r(dark,11,7,1,4);r(cream,4,5,2,1);r(cream,10,6,2,1);r('#9e5d35',7,9,3,4);
  } else {
    r(dark,3,5,11,12);r(dark,1,8,15,6);r(gold,3,6,11,10);r('#ebc276',2,8,13,6);
    if(variety==='doughnut'){r('#e294a0',3,7,11,6);r(dark,6,9,5,4);r('#765146',7,10,3,2);r(cream,4,8,2,1);r(cream,11,10,2,1);}
    else if(variety==='cookie'){for(const [a,b] of [[4,8],[9,7],[7,12],[12,12],[3,13]])r('#664231',a,b,2,2);}
    else {r(cream,4,7,2,5);r(cream,8,7,2,5);r('#bd7d3b',3,15,10,1);}
  }
  c.restore();
}
export function paintCollectibles(c: CanvasRenderingContext2D, state: Collection, now: number, reduced: boolean,
  feedback: {x:number;y:number;points:number;at:number}[]) {
  c.clearRect(0,0,c.canvas.width,c.canvas.height);
  for(const item of state.items) if(!item.collected) {
    if(item.kind==='bonus') {
      c.strokeStyle='#f1cd72';c.strokeRect(item.x-13,item.y-15,26,30);
      c.fillStyle='#fff0c2'; c.fillRect(item.x-1,item.y-20,3,3);
    }
    paintSnack(c,item.variety,item.x,item.y);
  }
  c.font='bold 10px monospace';c.textAlign='center';
  for(const f of feedback) if(now-f.at<850) {
    const y=Math.round(f.y-15-(reduced?0:(now-f.at)/40));
    c.fillStyle='#171b25';c.fillRect(f.x-17,y-10,34,13);
    c.fillStyle='#fff0c2';c.fillText(`+${f.points}`,f.x,y);
  }
}
