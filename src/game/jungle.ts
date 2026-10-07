import type { Actions, Actor, Hazard, Port, Rect, Water } from './types';

export function waterVelocity(kind: Water['kind'], vx: number, vy: number, centreDistance: number, speed: number) {
  if (kind === 'waterfall') return { vx, vy: Math.max(300, vy) };
  if (kind === 'whirlpool') return { vx: vx - Math.max(-90, Math.min(90, centreDistance * 2)), vy };
  return { vx: Math.max(-speed, Math.min(speed + 110, vx + 110)), vy };
}
export function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
export function safeToCross(h: Hazard, now: number, travelMs: number) {
  const time = (now + (h.phase ?? 0)) % h.period!;
  return time >= h.on! && time + travelMs < h.period! - 400;
}
export function creatureRect(h: Hazard, now: number): Rect {
  const time = (now + (h.phase ?? 0)) % h.period!;
  const active = time < h.on!;
  const warning = time > h.period! - 400;
  if (h.kind === 'spider') return {
    x: h.x + (active ? Math.sin(time / h.on! * Math.PI * 2) * 42 : 0),
    y: h.y - (active ? 0 : warning ? (h.period! - time) / 400 * 80 : 80), w: h.w, h: h.h,
  };
  return { x: h.x + (active ? -Math.sin(time / h.on! * Math.PI) * 32 : 38),
    y: h.y + (active ? 0 : 22), w: active ? h.w : 18, h: active ? h.h : 28 };
}
export function crossedExit(port: Port, previous: {x: number; feet: number}, current: {x: number; feet: number}) {
  if (port.edge === 'bottom') return previous.feet < port.y && current.feet >= port.y &&
    current.x >= port.x! && current.x <= port.x! + port.clearance;
  return previous.x < port.x! && current.x >= port.x! && current.feet <= port.y + 8;
}

// Ordered local route; no physics overrides or advance knowledge of unseen terrain.
// Hazard waits use the same visible active/recovery/warning phases as manual play.
export function jungleActions(actor: Actor, stage: number, now: number, hazards: Hazard[], perception = 140): Actions {
  if (stage === 0) return { move: actor.x < 716 ? 1 : -1, jump: false, power: false };
  if (stage === 1) {
    const spider = hazards.find(h => h.kind === 'spider')!;
    const wait = actor.x > 598 && actor.x < 635 && actor.x - spider.x <= perception && !safeToCross(spider, now, 1300);
    return { move: wait ? 0 : -1, jump: false, power: false };
  }
  const snake = hazards.find(h => h.kind === 'snake')!;
  const wait = actor.x > 520 && actor.x < 552 && snake.x - actor.x <= perception && !safeToCross(snake, now, 1500);
  return { move: wait ? 0 : 1, jump: actor.grounded && actor.x > 320 && actor.x < 356, power: false };
}
export function jungleStage(stage: number, feet: number) {
  if (feet > 740) return Math.max(stage, 2);
  if (feet > 420) return Math.max(stage, 1);
  return stage;
}
