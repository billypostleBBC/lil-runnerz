import type { Room } from './types';

const block = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colour: string) => {
  c.fillStyle = colour; c.fillRect(Math.round(x), Math.round(y), w, h);
};
const random = (n: number) => Math.abs(Math.sin(n * 127.1) * 43758.5453) % 1;
function leaves(c: CanvasRenderingContext2D, x: number, y: number, scale: number, seed: number, bright = false) {
  for (let i = 0; i < 22; i++) {
    const dx = (random(seed + i) - .5) * scale * 2;
    const dy = (random(seed + i + 80) - .5) * scale;
    const w = 8 + Math.floor(random(i + seed + 20) * 18);
    block(c, x + dx, y + dy, w, 8, bright ? '#315a40' : '#173b35');
    block(c, x + dx + 3, y + dy - 3, w - 5, 3, bright ? '#4b7150' : '#21493d');
    block(c, x + dx + 4, y + dy + 8, w - 8, 3, '#102c2c');
  }
}
export function jungleBackground(c: CanvasRenderingContext2D, sx: number, sy: number, reduced: boolean, image: HTMLImageElement) {
  block(c, 0, 0, 640, 360, '#0a2026');
  c.imageSmoothingEnabled = false;
  c.drawImage(image, -Math.round(sx * (reduced ? 1 : .35)), -Math.round(sy * (reduced ? 1 : .65)), 1120, 1120);
  block(c, 0, 0, 640, 360, '#071a2420');
  // Sparse near vines supply another depth plane without obscuring the route.
  for (let i=0;i<8;i++) {
    const x=i*190-Math.round(sx*(reduced?1:.62));
    for(let y=0;y<80;y+=7) block(c,x+Math.floor(y/28),y,2,6,'#36594a');
  }
}
export function jungleDetails(c: CanvasRenderingContext2D, room: Room) {
  // Bark, roots and leaves are behind the hazard; no pale collision-like edges.
  for (let y = 712; y < 920; y += 8) {
    const x = 721 - Math.floor((920 - y) / 24);
    block(c, x, y, 36, 8, '#493d31');
    block(c, x + 6, y, 5, 7, '#756044');
    block(c, x + 27, y, 5, 8, '#292f2c');
  }
  for (let i = 0; i < 5; i++) block(c, 689 + i * 12, 906 - i * 5, 35, 6, '#514c36');
  leaves(c, 727, 708, 96, 17, true);
  for (let x = 50; x < 650; x += 84) {
    leaves(c, x, 302, 25, x, true);
    for (let y = 360; y < 425 + x % 41; y += 7) {
      block(c, x, y, 2, 7, '#426548');
      if (y % 3 === 0) block(c, x - 4, y, 5, 3, '#6b8050');
    }
  }
  c.font = '10px "Press Start 2P", monospace';
  c.fillStyle = '#e7dfaf'; c.fillText('JUNGLE RUN', 130, 257);
  c.font = '8px "Press Start 2P", monospace';
  c.fillText('← SPIDER / FALLS', 568, 500);
  c.fillText('CURRENT →', 475, 847);
  c.fillText('JUMP →', 807, 866);
  c.font = '7px "Press Start 2P", monospace';
  c.fillText('BONUS AREA', 947, 448); c.fillText('COMING LATER', 940, 467);
  c.fillText('EXIT ↓', 950, room.height - 45);
  for (let y = 1024; y < room.height; y += 12) {
    block(c, 928, y, 4, 8, '#e3c67e'); block(c, 1032, y, 4, 8, '#e3c67e');
  }
}
export function jungleWater(c: CanvasRenderingContext2D, room: Room, time: number, reduced: boolean) {
  for (const water of room.water ?? []) {
    const {x, y, w, h, kind} = water;
    block(c, x, y, w, h, kind === 'whirlpool' ? '#275b60' : '#246d76');
    const step = reduced ? 0 : Math.floor(time / 75);
    c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip();
    for (let row = 0; row < h; row += 12) for (let col = 0; col < w; col += 18) {
      const dx = kind === 'waterfall' ? col : (col + step * 3) % w;
      const dy = kind === 'waterfall' ? (row + step * 5) % h : row;
      block(c, x + dx, y + dy, kind === 'waterfall' ? 3 : 10, kind === 'waterfall' ? 8 : 2, '#70c4bc');
    }
    if (kind === 'waterfall') {
      for (let col=0;col<w;col+=9) {
        block(c,x+col,y,2,h,col%3===0?'#308b92':'#24616e');
        for(let row=0;row<h;row+=23) {
          const yy=(row+step*5+col*3)%h;
          block(c,x+col+2,y+yy,2,12,'#99d7cb');
          block(c,x+col+4,y+yy+7,2,5,'#4ba3a7');
        }
      }
      for(let col=0;col<w;col+=7) block(c,x+col,y+2,4,3,'#c2e6d5');
    }
    if (kind === 'river') {
      for(let col=0;col<w;col+=13)block(c,x+(col+step*3)%w,y,8,2,'#c2e6d5');
    }
    if (kind === 'whirlpool') {
      for (let i=0; i<18; i++) {
        const angle = i * .7 + (reduced ? 0 : time / 350);
        block(c, x+w/2+Math.cos(angle)*i*4, y+h/2+Math.sin(angle)*i*.8, 7, 2, '#b1ddd0');
      }
    }
    c.restore();
  }
}
