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
function mossyBoulder(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Stepped silhouettes and small facets distinguish dressing from platform tops.
  for (let row = 0; row < h; row += 2) {
    const inset = Math.round((1 - Math.sin(Math.acos(1 - row / h))) * w * .32);
    block(c, x + inset, y + row, w - inset * 2, 2, '#21383c');
    block(c, x + inset + 2, y + row, (w - inset * 2) * .58, 2, row < h * .4 ? '#526b64' : '#39534f');
  }
  for (let i = 0; i < w; i++) {
    const px = x + w * .2 + random(i + x) * w * .6;
    const py = y + 2 + random(i + y) * h * .65;
    block(c, px, py, 2 + i % 3, 1, i % 3 ? '#607568' : '#233d3e');
  }
  for (let i = 0; i < 7; i++) {
    const px = x + w * .2 + i * w * .09;
    block(c, px, y + 2 + i % 3, 5, 3 + i % 4, '#466649');
    block(c, px, y + 2 + i % 3, 3, 1, '#819061');
  }
}

function waterBanks(c: CanvasRenderingContext2D, room: Room) {
  for (const water of room.water ?? []) {
    if (water.kind === 'river') continue;
    const { x, y, w, h } = water;
    const pool = water.kind === 'whirlpool';
    const base = pool ? y + h - 3 : y + 13;
    for (const side of [-1, 1]) {
      // Leave the outflow open; the lower bank continues beneath the river.
      if (pool && side > 0) continue;
      const edge = side < 0 ? x + 2 : x + w - 2;
      for (let leaf = 0; leaf < 26; leaf++) {
        const lx = edge + side * 11 + (random(leaf + edge) - .5) * 36;
        const ly = base - 21 - random(leaf + 74) * 19;
        block(c, lx, ly, 5, 7, '#183e34');
        block(c, lx - 2, ly + 2, 9, 3, '#315b40');
        block(c, lx, ly + 1, 4, 2, '#638252');
        block(c, lx + 2, ly + 3, 2, 5, '#294a36');
      }
      mossyBoulder(c, edge - 15, base - 18, 30, 20);
      mossyBoulder(c, edge + side * 19 - 8, base - 9, 17, 12);
      // Short fern fronds droop around the wet stone.
      for (let stem = 0; stem < 4; stem++) {
        for (let step = 0; step < 7; step++) {
          const fx = edge + side * (stem * 3 + step * 2);
          const fy = base - 20 - Math.sin(step / 7 * Math.PI) * (12 + stem * 2) + step;
          block(c, fx, fy, 2, 3, '#729064');
          block(c, fx - 2, fy + 2, 5, 2, '#365d43');
        }
      }
    }
    if (pool) {
      for (let bankX = x - 10; bankX < x + w; bankX += 19) {
        const height = 8 + Math.floor(random(bankX) * 7);
        mossyBoulder(c, bankX, y + h - height + 4, 24, height + 5);
      }
      mossyBoulder(c, x - 13, y + 8, 27, 28);
    } else {
      // Overlapping creepers break the long cut edges of the falling sheet.
      for (let bankY = y + 15; bankY < y + h - 24; bankY += 23) {
        for (const side of [-1, 1]) {
          const edge = side < 0 ? x : x + w;
          const reach = 4 + Math.floor(random(bankY + edge) * 7);
          const bx = side < 0 ? edge - 13 : edge - reach;
          mossyBoulder(c, bx, bankY, 13 + reach, 27);
          for (let leaf = 0; leaf < 9; leaf++) {
            const lx = edge + side * 5 + (random(leaf + bankY) - .5) * 15;
            const ly = bankY + random(leaf + edge) * 24;
            block(c, lx, ly, 5, 4, '#234d3b');
            block(c, lx + 1, ly, 3, 1, '#628359');
          }
        }
      }
    }
  }
}

export function jungleDetails(c: CanvasRenderingContext2D, room: Room) {
  // Dress the solid left boundary as a sheer wet cliff. Its right edge matches
  // collision exactly; foliage grows inward so the chute stays readable.
  const cliff = room.solids.find(s => s.x === 0 && s.y === 360);
  if (cliff) {
    const basinFloor = room.solids.find(s => s.x === 0 && s.y === 920);
    c.save(); c.beginPath(); c.rect(cliff.x, cliff.y, cliff.w, (basinFloor?.y ?? cliff.y + cliff.h) - cliff.y); c.clip();
    block(c, cliff.x, cliff.y, cliff.w, cliff.h, '#193538');
    for (let y = cliff.y; y < cliff.y + cliff.h; y += 26) {
      for (let x = -14; x < cliff.w; x += 29) {
        const offset = Math.floor(random(y + x) * 7);
        mossyBoulder(c, x + offset, y, 28 + offset, 27);
      }
      block(c, cliff.w - 3, y, 3, 18, '#688174');
      block(c, cliff.w - 6, y + 18, 6, 8, '#29484a');
      if (y % 3 === 0) leaves(c, cliff.w - 32, y + 9, 20, y, true);
    }
    for (let vine = 0; vine < 5; vine++) {
      const x = 12 + vine * 17;
      for (let y = cliff.y + vine * 11; y < cliff.y + cliff.h; y += 6) {
        const sway = Math.round(Math.sin(y / 45 + vine) * 3);
        block(c, x + sway, y, 2, 6, '#53734d');
        if (y % 4 === 0) block(c, x + sway - 3, y, 5, 2, '#839260');
      }
    }
    c.restore();
  }
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
// A small stepped colour ramp matches the shaded rock and foliage. All marks stay
// on the logical pixel grid; no blur, gradients or additional image downloads.
const waterColours = ['#163c48', '#1b4b57', '#215c65', '#2a7076', '#39888a', '#55a6a1', '#84c5b8'];
const wrap = (value: number, length: number) => ((value % length) + length) % length;

function fallingWater(c: CanvasRenderingContext2D, w: number, h: number, time: number) {
  block(c, 0, 0, w, h, waterColours[1]);
  // Interlocking ribbons have different widths, shading and flow rates, rather
  // than a repeated grid of equally spaced streaks.
  for (let column = 0, index = 0; column < w; index++) {
    const width = 3 + Math.floor(random(index + 71) * 6);
    const shade = Math.floor(random(index + 23) * 3) + 1;
    for (let y = -12; y < h; y += 6) {
      const bend = Math.round(Math.sin(y / 37 + index * 1.7 + time / 1500) * 2);
      const fold = Math.sin(y / 29 - time / 230 + index) > .5 ? 1 : 0;
      block(c, column + bend, y, width, 6, waterColours[shade + fold]);
      block(c, column + bend, y, 1, 6, waterColours[Math.max(0, shade - 1)]);
    }
    column += width;
  }
  for (let i = 0; i < Math.ceil(w * h / 110); i++) {
    const lane = 2 + random(i * 3 + 10) * (w - 4);
    const length = 3 + Math.floor(random(i + 13) * 15);
    const y = wrap(random(i + 49) * (h + 24) + time * (.09 + random(i + 19) * .08), h + 24) - 24;
    const x = lane + Math.round(Math.sin(y / 39 + i) * 2);
    block(c, x, y, 1 + i % 2, length, waterColours[i % 3 === 0 ? 5 : 4]);
    if (i % 5 === 0) {
      block(c, x + 1, y + length - 3, 2, 3, '#a2d4c4');
      block(c, x - 1, y + length, 2, 2, '#559f9c');
    }
  }
  // Broken edge shadows soften the silhouette without disguising the force bounds.
  for (let y = 0; y < h; y += 3) {
    const inset = 1 + Math.floor(random(y + 31) * 3);
    block(c, 0, y, inset, 3, '#183e4b');
    block(c, w - inset, y, inset, 3, '#225564');
  }
  // Crested lip and turbulent aeration at the bottom stay inside the water region.
  for (let x = 0; x < w; x += 3) {
    const crest = 1 + Math.floor(random(x + 32) * 4);
    block(c, x, crest, 3, 2, '#93cbbd');
    block(c, x + 1, crest, 1, 1, '#d0e6cd');
  }
  for (let i = 0; i < w; i++) {
    const phase = wrap(time / 190 + random(i + 90) * 9, 9);
    const x = random(i + 76) * w;
    const y = h - 1 - Math.sin(phase / 9 * Math.PI) * (3 + random(i + 35) * 9);
    block(c, x, y, 2 + i % 3, 1, i % 3 ? '#72b4ad' : '#bedbca');
  }
}

function surfaceWater(c: CanvasRenderingContext2D, w: number, h: number, time: number, whirlpool: boolean) {
  // Shallow illuminated surface, shaded depths and irregular reflected fragments.
  for (let y = 0; y < h; y += 3) {
    const depth = Math.min(3, Math.floor(y / h * 4));
    block(c, 0, y, w, 3, waterColours[4 - depth]);
  }
  for (let i = 0; i < w * h / 42; i++) {
    const y = 3 + random(i + 58) * (h - 4);
    const speed = whirlpool ? .012 : .05 + random(i + 10) * .035;
    const x = wrap(random(i + 22) * (w + 20) + time * speed, w + 20) - 20;
    const length = 3 + Math.floor(random(i + 86) * 13);
    block(c, x, y, length, 1, waterColours[i % 4 + 2]);
    if (i % 3 === 0) block(c, x + 2, y + 1, length - 2, 1, waterColours[1]);
  }
  if (whirlpool) {
    const cx = w / 2, cy = h / 2;
    // Nested, broken elliptical currents curl towards a dark throat. Pixel
    // segments avoid antialiased circles and keep the vortex legible at game size.
    for (let ring = 7; ring >= 0; ring--) {
      const rx = 9 + ring * (w * .055);
      const ry = 2 + ring * (h * .042);
      for (let step = 0; step < 72; step++) {
        const angle = step / 72 * Math.PI * 2 + time / 1200 - ring * .38;
        const x = cx + Math.cos(angle) * rx;
        const y = cy + Math.sin(angle) * ry;
        block(c, x, y + 2, 3, 2, waterColours[0]);
        block(c, x, y, 3, 1, step % 13 < 8 ? waterColours[4 + ring % 2] : waterColours[2]);
        if (step % 17 < 3 && ring > 1) block(c, x, y, 2, 1, '#a8d4c3');
      }
    }
    block(c, cx - 6, cy - 1, 12, 3, '#122f3e');
  } else {
    for (let i = 0; i < w / 12; i++) {
      const x = wrap(i * 17 + time * .085, w + 16) - 16;
      const y = 1 + Math.floor(random(i + 18) * 3);
      block(c, x, y, 8, 1, '#badbca');
      block(c, x - 3, y + 1, 4, 1, '#76b7ab');
      block(c, x + 8, y + 1, 3, 1, '#76b7ab');
    }
  }
}

export function jungleWater(c: CanvasRenderingContext2D, room: Room, time: number, reduced: boolean) {
  // Simulation time freezes on pause. Reduced motion keeps the full texture,
  // including directional streaks, while stopping decorative scrolling.
  const waterTime = reduced ? 0 : Math.floor(time / 80) * 80;
  for (const { x, y, w, h, kind } of room.water ?? []) {
    c.save();
    c.beginPath();
    if (kind === 'whirlpool') {
      // A stepped basin outline slopes down into the river at the right lip.
      c.moveTo(x, y + 12);
      for (let dx = 0; dx <= w; dx += 2) {
        const inset = Math.round(11 * Math.pow(Math.abs(dx - w / 2) / (w / 2), 3));
        c.lineTo(x + dx, y + inset + (Math.floor(dx / 7) % 2));
      }
      c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath();
    } else c.rect(x, y, w, h);
    c.clip();
    c.translate(x, y);
    if (kind === 'waterfall') fallingWater(c, w, h, waterTime);
    else surfaceWater(c, w, h, waterTime, kind === 'whirlpool');
    c.restore();
  }
  // Foam is light peripheral dressing; only the clipped water above exerts force.
  for (const water of room.water ?? []) {
    const { x, y, w, h, kind } = water;
    if (kind === 'river') continue;
    const pool = kind === 'whirlpool';
    const span = pool ? w * .78 : w;
    const start = pool ? x + w * .11 : x;
    for (let i = 0; i < span / 3; i++) {
      const phase = wrap(waterTime / 650 + random(i + 201), 1);
      const px = start + random(i + 306) * (span - 5);
      const crest = Math.sin(phase * Math.PI) * (pool ? 4 : 3);
      const surfaceY = y + (pool ? Math.round(11 * Math.pow(Math.abs(px - x - w / 2) / (w / 2), 3)) : 0);
      block(c, px, surfaceY - crest, 4 + i % 4, 3, '#9bc6bd');
      block(c, px + 1, surfaceY - crest - 1, 2 + i % 3, 2, '#edf2df');
      if (i % 3 === 0) {
        const height = (pool ? 18 : 12) * Math.sin(phase * Math.PI);
        block(c, px + (phase - .5) * 12, y - height - 3, 1 + i % 2, 2, '#e4efdf');
      }
    }
    if (!pool) {
      const landing = room.water?.find(other => other.kind === 'whirlpool' &&
        x < other.x + other.w && x + w > other.x && y + h >= other.y && y + h <= other.y + other.h);
      if (!landing) continue;
      // Fans of impact spray sit above the pool, leaving its dark throat exposed.
      for (let i = 0; i < 38; i++) {
        const phase = wrap(waterTime / 780 + random(i + 55), 1);
        const side = i % 2 ? -1 : 1;
        const px = x + w / 2 + side * (8 + phase * (18 + random(i + 88) * 29));
        const py = landing.y + 3 - Math.sin(phase * Math.PI) * (8 + random(i + 12) * 22);
        block(c, px, py + 2, 3, 2, '#82b9b1');
        block(c, px, py, 2, 2, '#edf2df');
      }
    }
  }
  // Foreground dressing must be painted after water to conceal its cut edges.
  waterBanks(c, room);
}
