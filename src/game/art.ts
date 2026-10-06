import type { Course } from "./types";
import { hazardWarning } from "./rules";

const stone = ["#252933", "#292d37", "#2d303a", "#242730"];
const rock = ["#172d32", "#1b3338", "#203a3e", "#203338"];
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

function arch(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  rect(c, x, y + 12, w, h - 12, "#11131c");
  rect(c, x + 8, y + 4, w - 16, h - 4, "#11131c");
  rect(c, x + 16, y, w - 32, h, "#11131c");
  rect(c, x - 8, y + 16, 6, h - 16, "#303039");
  rect(c, x + w + 2, y + 16, 6, h - 16, "#303039");
  rect(c, x + 8, y - 5, w - 16, 5, "#323039");
  rect(c, x, y + 1, 8, 6, "#323039");
  rect(c, x + w - 8, y + 1, 8, 6, "#323039");
  for (let k = 0; k < 4; k++)
    rect(c, x + 10 + k * 12, y + 14, 3, h - 14, "#252631");
}
function torch(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  reduced: boolean,
) {
  const flicker = reduced ? 0 : Math.floor(t / 140) % 3;
  rect(c, x - 2, y, 4, 18, "#6b4b38");
  rect(c, x - 5, y + 2, 10, 3, "#997047");
  rect(c, x - 5, y - 12, 10, 13, "#9f4638");
  rect(c, x - 3, y - 17 - flicker, 7, 15 + flicker, "#f39a55");
  rect(c, x - 1, y - 10, 3, 10, "#ffdb94");
}
function statue(c: CanvasRenderingContext2D, x: number) {
  rect(c, x - 33, 269, 66, 13, "#3b3840");
  rect(c, x - 24, 255, 48, 14, "#302f39");
  poly(
    c,
    [
      [x - 17, 255],
      [x - 20, 198],
      [x - 33, 191],
      [x - 34, 181],
      [x - 12, 181],
      [x - 12, 163],
      [x + 12, 163],
      [x + 12, 181],
      [x + 33, 181],
      [x + 34, 191],
      [x + 21, 198],
      [x + 17, 255],
    ],
    "#3b3944",
  );
  rect(c, x - 12, 150, 24, 24, "#43404b");
  rect(c, x - 8, 157, 5, 3, "#1f202c");
  rect(c, x + 3, 157, 5, 3, "#1f202c");
  rect(c, x - 2, 173, 4, 72, "#252733");
  rect(c, x - 16, 208, 5, 37, "#4a4650");
  rect(c, x + 23, 169, 3, 74, "#4c4651");
  rect(c, x + 17, 176, 15, 3, "#4c4651");
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
  c: CanvasRenderingContext2D,
  scrollX: number,
  scrollY: number,
  elapsed: number,
  reduced: boolean,
  course: Course,
  width = 640,
  height = 360,
) {
  c.clearRect(0, 0, width, height);
  c.fillStyle = "#11151d";
  c.fillRect(0, 0, width, height);
  for (const room of course.rooms) {
    const left = Math.max(0, room.offset - scrollX),
      right = Math.min(width, room.offset + room.width - scrollX);
    if (right <= left) continue;
    c.save();
    c.beginPath();
    c.rect(left, 0, right - left, height);
    c.clip();
    c.translate(0, -Math.round(scrollY * 0.3));
    const cave = room.theme === "cave";
    c.fillStyle = cave ? "#11272c" : "#1d1e29";
    c.fillRect(0, 0, width, height + 80);
    const drift = Math.round(scrollX * (reduced ? 1 : 0.22));
    if (!cave) {
      for (let y = 0; y < 380; y += 22)
        for (
          let gx = Math.floor(drift / 48) - 1;
          gx < (drift + width) / 48 + 1;
          gx++
        ) {
          const x = gx * 48 - drift + ((y / 22) % 2) * 24;
          rect(
            c,
            x + 1,
            y + 1,
            46,
            20,
            ["#21222c", "#23242f", "#24252f"][Math.floor(hash(gx, y) * 3)],
          );
          if (hash(gx, y) > 0.7) rect(c, x + 4, y + 17, 16, 1, "#2d2c35");
        }
      for (
        let gx = Math.floor(drift / 224) - 1;
        gx < (drift + width) / 224 + 1;
        gx++
      )
        arch(c, gx * 224 - drift + 54, 95, 72, 190);
      statue(c, 390 - (drift % 780));
      statue(c, 1170 - (drift % 780));
    } else {
      for (
        let gx = Math.floor(drift / 84) - 1;
        gx < (drift + width) / 84 + 1;
        gx++
      ) {
        const x = gx * 84 - drift,
          low = 55 + hash(gx, 2) * 80;
        poly(
          c,
          [
            [x - 20, 0],
            [x + 92, 0],
            [x + 70, low],
            [x + 35, low + 45],
            [x + 12, low - 5],
          ],
          "#173239",
        );
        poly(
          c,
          [
            [x + 15, 0],
            [x + 47, 0],
            [x + 35, low + 30],
          ],
          "#1c3c42",
        );
        const up = 225 + hash(gx, 4) * 50;
        poly(
          c,
          [
            [x - 20, 370],
            [x + 20, up],
            [x + 50, up - 17],
            [x + 100, 370],
          ],
          "#16353b",
        );
        if (gx % 3 === 0) crystals(c, x + 30, 290, 28);
      }
      for (let i = 0; i < 18; i++) {
        const x = (i * 97 - drift * 0.6) % 760,
          y = 100 + hash(i, 8) * 185;
        rect(
          c,
          x,
          y,
          2,
          2,
          hash(i, Math.floor(elapsed / (reduced ? 1e9 : 1600))) > 0.5
            ? "#4b817d"
            : "#2e565b",
        );
      }
    }
    const near = Math.round(scrollX * (reduced ? 1 : 0.62));
    if (!cave)
      for (
        let gx = Math.floor(near / 190) - 1;
        gx < (near + width) / 190 + 1;
        gx++
      ) {
        const x = gx * 190 - near + 70;
        rect(c, x, 0, 4, 85 + hash(gx, 2) * 45, "#373440");
        for (let y = 0; y < 90; y += 7) {
          rect(c, x - 1, y, 6, 3, "#50434a");
          rect(c, x + 1, y + 1, 2, 1, "#22232e");
        }
        torch(c, x + 80, 220, elapsed + gx * 300, reduced);
      }
    if (cave)
      for (
        let gx = Math.floor(near / 135) - 1;
        gx < (near + width) / 135 + 1;
        gx++
      ) {
        const x = gx * 135 - near + 34;
        poly(
          c,
          [
            [x - 14, 0],
            [x + 18, 0],
            [x + 12, 43],
            [x + 2, 74],
            [x - 6, 43],
          ],
          "#284248",
        );
        rect(c, x + 2, 2, 3, 32, "#365359");
      }
    const shade = c.createLinearGradient(0, 200, 0, 360);
    shade.addColorStop(0, "#10131b00");
    shade.addColorStop(1, cave ? "#0a2027aa" : "#12121cbb");
    c.fillStyle = shade;
    c.fillRect(0, 180, width, 200);
    c.restore();
  }
}

export function paintTerrain(c: CanvasRenderingContext2D, course: Course) {
  for (const room of course.rooms) {
    for (const s of room.solids) {
      const x = s.x + room.offset,
        cave = room.theme === "cave",
        palette = cave ? rock : stone;
      rect(c, x, s.y, s.w, s.h, palette[0]);
      for (let y = s.y + 8; y < s.y + s.h; y += 16)
        for (let bx = x; bx < x + s.w; bx += 32) {
          const w = Math.min(30, x + s.w - bx - 1);
          if (w < 1) continue;
          rect(
            c,
            bx + 1,
            y,
            w,
            14,
            palette[Math.floor(hash(bx, y) * palette.length)],
          );
          if (hash(bx, y) > 0.45)
            rect(
              c,
              bx + 3,
              y + 2,
              Math.min(w - 2, 9),
              1,
              cave ? "#2d4647" : "#3a3b43",
            );
        }
      rect(c, x, s.y, s.w, 3, cave ? "#93af8b" : "#a9a08a");
      rect(c, x, s.y + 3, s.w, 4, cave ? "#465f54" : "#656052");
      for (let tx = x + 4; tx < x + s.w; tx += 16) {
        rect(c, tx, s.y, 1, 3, cave ? "#374c48" : "#5b564c");
        if (cave && hash(tx, 0) > 0.5) rect(c, tx, s.y + 6, 3, 6, "#3d6860");
      }
    }
    if (room.theme === "dungeon") {
      // A broken stone threshold makes the change of theme part of the world.
      const x = room.offset + room.width - 32;
      rect(c, x, 128, 16, 184, "#35333b");
      rect(c, x - 7, 120, 30, 10, "#6a6262");
      for (let y = 142; y < 306; y += 22) rect(c, x, y, 16, 2, "#50484a");
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
      rect(c, h.x - 4, h.y + h.h - 4, h.w + 8, 5, "#5e4142");
      rect(c, h.x - 2, h.y + h.h - 4, h.w + 4, 2, "#d47858");
      if (active(h)) {
        for (let x = h.x; x < h.x + h.w; x += 7) {
          const height =
            h.h -
            4 -
            (reduced ? 6 : Math.floor(hash(x, Math.floor(elapsed / 100)) * 12));
          rect(c, x, h.y + h.h - height, 6, height - 4, "#bf4d3d");
          rect(
            c,
            x + 1,
            h.y + h.h - height + 9,
            4,
            Math.max(2, height - 14),
            "#fa9454",
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
