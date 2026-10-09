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
  return snakeShape(h, now).head;
}
// Shared pixel segments drive both rendering and contact, including the hanging body.
// h.y is the canopy anchor; h.h is the fully extended length, not a floor spawn.
export function snakeShape(h: Hazard, now: number): {head: Rect; body: Rect[]} {
  const time = (now + (h.phase ?? 0)) % h.period!;
  const active = time < h.on!;
  const warning = time >= h.period!-400;
  const progress = active ? Math.max(0, Math.min(1, time/180, (h.on!-time)/220)) : 0;
  const length = Math.round(active ? 20+(h.h-20)*progress : warning ? 20*(1-(h.period!-time)/400) : 0);
  const sway = active ? Math.round(Math.sin(time/150)*6) : 0;
  const head = {x:h.x+sway,y:h.y+length-20,w:h.w,h:20};
  const body: Rect[] = [];
  for (let y=h.y; y<head.y; y+=6) {
    const bend = Math.round(Math.sin((y-h.y)/23 + time/200)*4);
    body.push({x:h.x+h.w/2-6+bend,y,w:12,h:Math.min(6,head.y-y)});
  }
  return {head,body};
}
export function creatureRects(h: Hazard, now: number): Rect[] {
  if (h.kind !== 'snake') return [creatureRect(h,now)];
  const shape = snakeShape(h,now);
  return [...shape.body,shape.head];
}
export function crossedExit(port: Port, previous: {x: number; feet: number}, current: {x: number; feet: number}) {
  if (port.edge === 'bottom') return previous.feet < port.y && current.feet >= port.y &&
    current.x >= port.x! && current.x <= port.x! + port.clearance;
  return previous.x < port.x! && current.x >= port.x! && current.feet <= port.y + 8;
}

// Ordered local route; no physics overrides or advance knowledge of unseen terrain.
// Hazard waits use the same visible active/recovery/warning phases as manual play.
export function jungleActions(actor: Actor, stage: number, now: number, hazards: Hazard[], perception = 140, solids: Rect[] = [], jumpLead = 22): Actions {
  if (stage === 0) {
    const right = actor.x + actor.halfWidth;
    const obstacle = solids.some(s => s.x >= right-2 && s.x < right+Math.min(jumpLead,perception) &&
      s.y < actor.feet-4 && s.y >= actor.feet-88);
    // Jump raised obstacles, not the shelf edge: the next section requires a drop.
    return { move: actor.x < 716 ? 1 : -1, jump: actor.grounded && obstacle, power: false };
  }
  if (stage === 1) {
    const spider = hazards.find(h => h.kind === 'spider')!;
    const wait = actor.x > 598 && actor.x < 635 && actor.x - spider.x <= perception && !safeToCross(spider, now, 1300);
    return { move: wait ? 0 : -1, jump: false, power: false };
  }
  const snake = hazards.find(h => h.kind === 'snake')!;
  const wait = actor.x > snake.x-perception && actor.x < snake.x-48 && !safeToCross(snake, now, 1500);
  // The river now reaches the pool: neutral input drifts towards the snake.
  // Use ordinary left input to hold back until its recovery window opens.
  return { move: wait ? -1 : 1, jump: actor.grounded && actor.x > 320 && actor.x < 356, power: false };
}
export function jungleStage(stage: number, feet: number) {
  if (feet > 740) return Math.max(stage, 2);
  if (feet > 420) return Math.max(stage, 1);
  return stage;
}
