import type { Room } from "../game/types";

// Geometry is local to each room. The assembler supplies horizontal offsets.
// See docs/rooms for the corresponding creative briefs and layout diagrams.
export const rooms: Room[] = [
  {
    id: "ember-vault",
    name: "The Ember Vault",
    subtitle: "Old stone. New trouble.",
    theme: "dungeon",
    width: 1440,
    height: 432,
    entrance: { y: 312, clearance: 96 },
    exit: { y: 312, clearance: 96 },
    solids: [
      { x: 0, y: 312, w: 480, h: 120 },
      { x: 576, y: 312, w: 864, h: 120 },
      { x: 288, y: 280, w: 64, h: 32 },
      { x: 1040, y: 280, w: 64, h: 32 },
      { x: 1120, y: 248, w: 112, h: 16 },
    ],
    hazards: [
      {
        kind: "flame",
        x: 812,
        y: 252,
        w: 28,
        h: 60,
        period: 2600,
        on: 1700,
        phase: 0,
      },
    ],
  },
  {
    id: "hollow-grotto",
    name: "The Hollow Grotto",
    subtitle: "Mind the gaps.",
    theme: "cave",
    width: 1440,
    height: 432,
    entrance: { y: 312, clearance: 96 },
    exit: { y: 312, clearance: 96 },
    solids: [
      { x: 0, y: 312, w: 360, h: 120 },
      { x: 464, y: 312, w: 400, h: 120 },
      { x: 976, y: 312, w: 464, h: 120 },
      { x: 540, y: 280, w: 48, h: 32 },
      { x: 608, y: 248, w: 112, h: 16 },
      { x: 760, y: 216, w: 96, h: 16 },
      { x: 896, y: 248, w: 80, h: 16 },
    ],
    hazards: [
      { kind: "spikes", x: 736, y: 298, w: 32, h: 14 },
      {
        kind: "flame",
        x: 1120,
        y: 252,
        w: 28,
        h: 60,
        period: 2800,
        on: 1700,
        phase: 900,
      },
    ],
  },
];
