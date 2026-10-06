export type Mode = "manual" | "auto";
export type Status = "ready" | "running" | "paused" | "dead" | "won" | "stuck";
export type RunEvent = "start" | "pause" | "resume" | "die" | "win" | "stuck";
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Hazard extends Rect {
  kind: "flame" | "spikes";
  period?: number;
  on?: number;
  phase?: number;
}
export interface Room {
  id: string;
  name: string;
  subtitle: string;
  theme: "dungeon" | "cave";
  width: number;
  height: number;
  entrance: { y: number; clearance: number };
  exit: { y: number; clearance: number };
  solids: Rect[];
  hazards: Hazard[];
}
export interface Course {
  width: number;
  height: number;
  rooms: (Room & { offset: number })[];
  solids: Rect[];
  hazards: Hazard[];
}
export interface Power {
  durationMs: number;
  cooldownMs: number;
}
export interface Character {
  id: string;
  name: string;
  asset: string;
  speed: number;
  jumpSpeed: number;
  gravity: number;
  power: Power;
}
export interface ControllerProfile {
  perceptionDistance: number;
  reactionMs: number;
  jumpLead: number;
  powerTriggerDistance: number;
  stuckMs: number;
}
export interface Actions {
  move: -1 | 0 | 1;
  jump: boolean;
  power: boolean;
}
export interface Actor {
  x: number;
  feet: number;
  halfWidth: number;
  grounded: boolean;
}
export interface Run {
  mode: Mode;
  status: Status;
  elapsed: number;
  shieldAt: number;
}
export interface Snapshot {
  status: Status;
  mode: Mode;
  elapsed: number;
  x: number;
  feet: number;
  vx: number;
  vy: number;
  grounded: boolean;
  room: number;
  progress: number;
  shield: boolean;
  cooldown: number;
  decision: string;
  reason: string;
  cameraX: number;
  cameraY: number;
  reducedMotion: boolean;
}
