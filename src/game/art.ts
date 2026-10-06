import type { Course } from "./types";
import { hazardWarning } from "./rules";

export type Scenery = Record<"dungeon" | "cave", HTMLImageElement>;

const stone = ["#283440", "#303d49", "#35424e", "#25323e"];
const rock = ["#203b40", "#29464b", "#304d51", "#243f45"];
const hash = (x: number, y: number) =>
  Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
function rect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colour: string,
) {
  c.fillStyle = colour;
  c.fillRect(Math.round(x), Math.round(y), w, h);
}
function poly(c: CanvasRenderingContext2D, points: number[][], colour: string) {
  c.fillStyle = colour;
  c.beginPath();
  points.forEach(([x, y], i) =>
    i
      ? c.lineTo(Math.round(x), Math.round(y))
      : c.moveTo(Math.round(x), Math.round(y)),
  );
  c.closePath();
  c.fill();
}

// Small integer clusters keep highlights and wear on the same pixel grid as the game.
function masonry(c: CanvasRenderingContext2D, x: number, y: number,
  w: number, h: number, seed: number, cave = false) {
  const palette = cave ? rock : stone;
  rect(c, x, y, w, h, palette[Math.floor(hash(seed, y) * palette.length)]);
  rect(c, x + 1, y, w - 2, 1, cave ? "#4c6868" : "#52606a");
  rect(c, x, y + 1, 1, h - 2, cave ? "#3d595d" : "#42515c");
  rect(c, x + 1, y + h - 2, w - 1, 2, cave ? "#152e34" : "#19242e");
  rect(c, x + w - 2, y + 2, 2, h - 3, "#182831");
  for (let i = 0; i < 12; i++) {
    const px = x + 2 + Math.floor(hash(seed + i, y) * Math.max(1, w - 5));
    const py = y + 2 + Math.floor(hash(seed, y + i) * Math.max(1, h - 5));
    rect(c, px, py, 1 + i % 3, 1 + i % 2,
      i % 3 === 0 ? (cave ? "#3d5a5b" : "#47555e") : (cave ? "#1d363c" : "#222e38"));
  }
  if (hash(seed, y + 4) > 0.75) {
    for (let i = 0; i < 5; i++)
      rect(c, x + 3 + i % 3 * 2, y + 2 + i * 2, 2, 2,
        i % 2 ? "#45543a" : "#354635");
  }
}

function torch(c: CanvasRenderingContext2D, x: number, y: number, t: number, reduced: boolean) {
  const frame = reduced ? 0 : Math.floor(t / 120) % 4;
  // Stepped warm illumination; no blur that would soften the pixel artwork.
  c.save();
  for (let band = 4; band >= 1; band--) {
    c.globalAlpha = 0.025;
    rect(c, x - band * 11, y - 12 - band * 12, band * 22, band * 24, "#ff9a43");
  }
  c.restore();
  rect(c, x - 3, y + 1, 6, 21, "#151d25");
  rect(c, x - 2, y + 2, 2, 17, "#8c6944");
  rect(c, x - 6, y - 2, 12, 9, "#19222b");
  rect(c, x - 7, y - 2, 14, 2, "#b48c51");
  rect(c, x - 6, y + 6, 12, 2, "#806646");
  for (let i = -4; i <= 4; i += 4) rect(c, x + i, y, 1, 6, "#a7814b");
  poly(c, [[x-5,y-3],[x-6,y-11],[x-3,y-16],[x-2,y-23-frame],
    [x+1,y-17],[x+3,y-20+frame],[x+5,y-10],[x+4,y-3]], "#d75b29");
  poly(c, [[x-3,y-3],[x-3,y-12],[x,y-18-frame],[x+3,y-9],[x+2,y-3]], "#ffab3f");
  rect(c, x - 1, y - 10, 3, 7, "#ffe4a0");
  if (!reduced) rect(c, x + frame - 2, y - 28 - frame * 2, 1, 2, "#df8241");
}

function crystals(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  poly(
    c,
    [
      [x, y],
      [x - 8, y - size + 9],
      [x - 4, y - size],
      [x + 3, y - 9],
    ],
    "#347878",
  );
  poly(
    c,
    [
      [x, y],
      [x + 1, y - size - 8],
      [x + 6, y - size - 12],
      [x + 11, y - 4],
    ],
    "#58b9a5",
  );
  poly(
    c,
    [
      [x + 6, y],
      [x + 16, y - size + 7],
      [x + 21, y - size + 12],
      [x + 15, y],
    ],
    "#297376",
  );
  rect(c, x + 5, y - size - 5, 2, Math.max(4, size - 12), "#91e1be");
}

export function paintBackground(
  c: CanvasRenderingContext2D, scrollX: number, scrollY: number,
  elapsed: number, reduced: boolean, course: Course, scenery: Scenery,
  width = 640, height = 360,
) {
  c.clearRect(0, 0, width, height);
  c.imageSmoothingEnabled = false;
  for (const room of course.rooms) {
    const left = Math.max(0, room.offset - scrollX);
    const right = Math.min(width, room.offset + room.width - scrollX);
    if (right <= left) continue;
    c.save();
    c.beginPath();
    c.rect(left, 0, right - left, height);
    c.clip();
    const cave = room.theme === "cave";
    const localScroll = scrollX - room.offset;
    const drift = Math.round(localScroll * (reduced ? 1 : 0.35));
    const image = scenery[room.theme];
    const imageWidth = Math.max(room.width, room.height * image.width / image.height);
    const imageHeight = imageWidth * image.height / image.width;
    const vertical = Math.round(scrollY * (reduced ? 1 : 0.3));
    rect(c, 0, 0, width, height, cave ? "#08171f" : "#101722");
    c.drawImage(image, -drift, -vertical, imageWidth, imageHeight);
    // Darken the rear wall slightly; only real platforms get continuous pale edges.
    rect(c, 0, 0, width, height, "#08111b18");
    c.translate(0, -vertical);
    if (!cave) {
      // Sconces stay attached to the rear masonry as it scrolls.
      for (let i = -1; i < imageWidth / 240 + 1; i++)
        torch(c, i * 240 + 225 - drift, 235, elapsed + i * 170, reduced);
      const near = Math.round(localScroll * (reduced ? 1 : 0.62));
      for (let i = Math.floor(near / 210) - 1; i < (near + width) / 210 + 1; i++) {
        const x = i * 210 + 75 - near;
        const length = 70 + Math.floor(hash(i, 9) * 48);
        for (let y = -6; y < length; y += 7) {
          rect(c, x, y, 4, 6, "#191c24");
          rect(c, x, y, 1, 5, "#8b6246");
          rect(c, x + 1, y, 3, 1, "#bd8a58");
          rect(c, x + 3, y + 1, 1, 5, "#563d33");
          rect(c, x + 1, y + 5, 3, 1, "#936343");
        }
      }
    } else {
      const near = Math.round(localScroll * (reduced ? 1 : 0.62));
      for (let i = Math.floor(near / 180) - 1; i < (near + width) / 180 + 1; i++) {
        const x = i * 180 + 28 - near;
        poly(c, [[x-9,0],[x+14,0],[x+10,22],[x+4,22],[x+4,44],[x,54],[x-3,35]], "#1e3942");
        rect(c, x + 1, 0, 2, 33, "#426169");
        rect(c, x + 4, 4, 3, 15, "#304e57");
      }
      for (let i = 0; i < 12; i++) {
        const x = ((i * 97 - drift * 0.6) % 760 + 760) % 760;
        const y = 105 + Math.floor(hash(i, 8) * 150);
        rect(c, x, y, 1, 1, hash(i, Math.floor(elapsed / (reduced ? 1e9 : 1600))) > 0.5 ? "#619a94" : "#35575c");
      }
    }
    // Stepped darkness keeps the rear-wall base distinct from the playable floor.
    for (let y = 280; y < 440; y += 16)
      rect(c, 0, y, width, 16, `rgba(5,12,20,${Math.min(0.7, (y - 264) / 240)})`);
    c.restore();
  }
}

export function paintTerrain(c: CanvasRenderingContext2D, course: Course) {
  for (const room of course.rooms) {
    for (const s of room.solids) {
      const x = s.x + room.offset,
        cave = room.theme === "cave",
        palette = cave ? rock : stone;
      c.save();
      c.beginPath();
      c.rect(x, s.y, s.w, s.h);
      c.clip(); // Texture never bleeds into a pit or changes a platform's silhouette.
      rect(c, x, s.y, s.w, s.h, palette[0]);
      for (let y = s.y + 8, row = 0; y < s.y + s.h; y += 18, row++) {
        for (let bx = x - (row % 2) * 18; bx < x + s.w; bx += 36)
          masonry(c, bx + 1, y, 34, 16, bx, cave);
      }
      for (let tx = x; tx < x + s.w; tx += 18) {
        const top = cave ? "#bdd0a9" : "#e4d3a3";
        rect(c, tx, s.y, 17, 2, top);
        rect(c, tx, s.y + 2, 17, 4, cave ? "#819983" : "#af9e7d");
        rect(c, tx + 1, s.y + 6, 16, 2, cave ? "#4a655d" : "#796c54");
        rect(c, tx + 17, s.y + 1, 1, 7, "#263239");
        if (hash(tx, s.y) > 0.5) {
          rect(c, tx + 4, s.y + 2, 2, 1, top);
          rect(c, tx + 6, s.y + 3, 1, 2, "#6a6b59");
        }
      }
      c.restore();
    }
    if (room.theme === "dungeon") {
      // A broken stone threshold makes the change of theme part of the world.
      const x = room.offset + room.width - 32;
      rect(c, x, 128, 16, 184, "#35333b");
      rect(c, x - 7, 120, 30, 10, "#6a6262");
      for (let y = 140; y < 304; y += 18) masonry(c, x, y, 16, 16, y);
      rect(c, x + 32, 136, 12, 176, "#294044");
      rect(c, x + 27, 128, 24, 8, "#65786d");
      rect(c, x - 6, 304, 58, 8, "#a8a18a");
    } else {
      for (let x = room.offset + 50; x < room.offset + room.width; x += 247)
        crystals(c, x, 312, 18);
    }
  }
  // Finish beacon: colour, flag and open doorway all identify the finish.
  const x = course.width - 96;
  rect(c, x - 17, 242, 34, 70, "#b8bb91");
  rect(c, x - 13, 246, 26, 66, "#183c3d");
  rect(c, x - 9, 250, 18, 62, "#60bca0");
  rect(c, x - 2, 260, 4, 42, "#caebaa");
  rect(c, x - 21, 237, 42, 6, "#e5d9af");
  rect(c, x + 28, 249, 3, 63, "#d1c4a0");
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 4; col++)
      rect(
        c,
        x + 31 + col * 5,
        249 + row * 5,
        5,
        5,
        (row + col) % 2 ? "#233838" : "#e2d5ad",
      );
}

export function paintHazards(
  c: CanvasRenderingContext2D,
  course: Course,
  elapsed: number,
  reduced: boolean,
  active: (h: Course["hazards"][number]) => boolean,
) {
  c.clearRect(0, 0, course.width, course.height);
  for (const h of course.hazards) {
    if (h.kind === "spikes") {
      rect(c, h.x - 2, h.y + h.h - 4, h.w + 4, 4, "#794f48");
      for (let x = h.x; x < h.x + h.w; x += 8) {
        poly(
          c,
          [
            [x, h.y + h.h - 4],
            [x + 4, h.y],
            [x + 8, h.y + h.h - 4],
          ],
          "#f6af88",
        );
        rect(c, x + 4, h.y + 5, 1, 6, "#fff0b4");
      }
    } else {
      const base = h.y + h.h;
      rect(c, h.x - 4, base - 5, h.w + 8, 6, "#202731");
      rect(c, h.x - 3, base - 5, h.w + 6, 1, "#c88b5b");
      rect(c, h.x - 3, base - 1, h.w + 6, 1, "#805340");
      for (let x = h.x - 1; x < h.x + h.w + 2; x += 5) {
        rect(c, x, base - 4, 2, 3, "#85513b");
        rect(c, x, base - 4, 1, 1, "#edb777");
      }
      if (active(h)) {
        for (let x = h.x; x < h.x + h.w; x += 7) {
          const height =
            h.h -
            4 -
            (reduced ? 6 : Math.floor(hash(x, Math.floor(elapsed / 100)) * 12));
          const tip = base - height;
          poly(c, [[x,base-5],[x,tip+12],[x+2,tip+7],[x+3,tip],
            [x+5,tip+9],[x+6,tip+15],[x+6,base-5]], "#c2482d");
          rect(
            c,
            x + 1,
            h.y + h.h - height + 9,
            4,
            Math.max(2, height - 14),
            "#ff932f",
          );
          rect(c, x + 2, h.y + h.h - 25, 2, 20, "#ffdfa0");
        }
      } else
        for (let x = h.x + 2; x < h.x + h.w; x += 8) {
          const warning = hazardWarning(h, elapsed);
          rect(
            c,
            x,
            h.y + h.h - (warning ? 14 : 7),
            3,
            warning ? 10 : 3,
            warning ? "#ffcb7d" : "#a65642",
          );
        }
    }
  }
}
