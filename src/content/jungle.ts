import type { Room } from '../game/types';

// Authored from Billy's sketch; see docs/rooms/jungle-run.md.
export const jungleRoom: Room = {
  id: 'jungle-run', name: 'Jungle Run', subtitle: 'Go with the flow. Then jump.',
  theme: 'jungle', width: 1120, height: 1120,
  entrance: { edge: 'left', y: 312, clearance: 96 },
  exit: { edge: 'bottom', x: 932, y: 1120, clearance: 100 },
  solids: [
    { x: 0, y: 312, w: 690, h: 48 },
    // Jumpable entrance obstacles: same 32px rise as the dungeon blocks.
    { x: 288, y: 280, w: 64, h: 32, appearance: "boulder" },
    { x: 520, y: 280, w: 48, h: 32, appearance: "boulder" },
    { x: 240, y: 560, w: 520, h: 48 },
    { x: 100, y: 560, w: 56, h: 48 },
    { x: 760, y: 624, w: 140, h: 40 },
    { x: 900, y: 0, w: 24, h: 832 },
    { x: 1032, y: 980, w: 72, h: 140 },
    { x: 1104, y: 0, w: 16, h: 1120 },
    // Continuous basin floor and a solid cliff below the arrival shelf.
    { x: 0, y: 920, w: 900, h: 200 },
    { x: 0, y: 360, w: 100, h: 760 },
    { x: 350, y: 900, w: 72, h: 20 },
    { x: 1000, y: 852, w: 104, h: 16 },
    { x: 936, y: 792, w: 64, h: 16 },
    { x: 1016, y: 732, w: 88, h: 16 },
    { x: 936, y: 672, w: 64, h: 16 },
    { x: 1016, y: 612, w: 88, h: 16 },
    { x: 936, y: 552, w: 64, h: 16 },
    { x: 1000, y: 492, w: 104, h: 16 },
  ],
  hazards: [
    {kind: 'spikes', x: 772, y: 592, w: 120, h: 32},
    {kind: 'spider', x: 508, y: 524, w: 30, h: 32, period: 4000, on: 1200, phase: 0},
    {kind: 'snake', x: 648, y: 740, w: 32, h: 172, period: 4400, on: 1100, phase: 0},
  ],
  water: [
    {kind: 'waterfall', x: 156, y: 546, w: 84, h: 344},
    {kind: 'whirlpool', x: 120, y: 876, w: 230, h: 44},
    {kind: 'river', x: 350, y: 888, w: 550, h: 32},
    {kind: 'waterfall', x: 932, y: 948, w: 100, h: 172},
  ],
};
