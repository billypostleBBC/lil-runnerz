import { bonusRoutes, bonusVarieties, placements, snackVarieties, type Variety } from '../content/collectibles';
import { overlaps } from './jungle';
import type { Actions, Actor, Character, Course, Rect, Status } from './types';
export interface Collectible { id: string; x: number; y: number; kind: 'snack' | 'bonus'; variety: Variety; collected: boolean }
export interface Collection { items: Collectible[]; score: number; snacks: number; bonuses: number }
export function createCollectibles(course: Course, random = Math.random): Collection {
  const items = course.rooms.flatMap(room => (placements[room.id] ?? []).map((p, index) => {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 10 || p.y < 12 || p.x > room.width-10 || p.y > room.height-12)
      throw new Error(`Room ${room.id}: snack ${index} must be inside the room.`);
    const rect = {x:p.x-8,y:p.y-10,w:16,h:20};
    if (room.solids.some(s => overlaps(rect,s))) throw new Error(`Room ${room.id}: snack ${index} is inside solid terrain.`);
    const varieties = p.kind === 'bonus' ? bonusVarieties : snackVarieties;
    const roll = random();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) throw new Error('Snack random value must be between 0 and 1.');
    return {...p,x:p.x+room.offset,y:p.y+room.offsetY,id:`${room.id}:${index}`,variety:varieties[Math.floor(roll*varieties.length)],collected:false};
  }));
  return {items,score:0,snacks:0,bonuses:0};
}
export function collectSnacks(state: Collection, body: Rect, status: Status): Collectible[] {
  if (status !== 'running') return [];
  const picked = state.items.filter(item => !item.collected && overlaps(body,{x:item.x-9,y:item.y-11,w:18,h:22}));
  for (const item of picked) {
    item.collected = true;
    state.score += item.kind === 'bonus' ? 100 : 10;
    if (item.kind === 'bonus') state.bonuses++; else state.snacks++;
  }
  return picked;
}

export class BonusController {
  private index = 0;
  private jumping = false;
  private started = false;
  private done = false;
  private startedAt = 0;
  private descending = false;
  private returnIndex = 5;
  progress = 0;
  decide(roomId: string, actor: Actor, character: Character, now: number, available: boolean): Actions | undefined {
    const route = bonusRoutes[roomId];
    if (!route) return;
    if (!available && roomId === 'jungle-run' && this.started) this.descending = true;
    if (this.descending) {
      const landing = route.steps[this.returnIndex];
      if (landing && actor.grounded && Math.abs(actor.feet-landing.feet)<3) {
        this.returnIndex--; this.progress++;
      }
      const aim = route.steps[this.returnIndex]?.x ?? 980;
      return {move:Math.abs(actor.x-aim)<3 ? 0 : actor.x<aim ? 1 : -1,jump:false,power:false};
    }
    if (this.done) return;
    if (!available) { this.done = true; return; }
    if (!this.started) {
      if (!actor.grounded || actor.x < route.start) return;
      const landedStep = route.steps.findIndex(step => Math.abs(actor.feet-step.feet)<3 && Math.abs(actor.x-step.x)<65);
      if (landedStep < 0 && (actor.x > route.steps[0].x || Math.abs(actor.feet-route.floor)>5)) return;
      if (landedStep >= 0) this.index = landedStep;
      // Skip a route beyond this runner's nominal jump capability.
      let floor = route.floor;
      for (const step of route.steps) {
        if (floor-step.feet > character.jumpSpeed**2/(2*character.gravity)-3) { this.done = true; return; }
        floor = step.feet;
      }
      this.started = true;
      this.startedAt = now;
    }
    if (now-this.startedAt > 16000 || actor.feet > route.floor+45) {
      this.done = true;
      if (roomId === 'jungle-run') {
        this.descending = true; this.returnIndex = -1;
        return {move:actor.x>980 ? -1 : 0,jump:false,power:false};
      }
      return;
    }
    let step = route.steps[this.index];
    if (actor.grounded && Math.abs(actor.feet-step.feet)<3) {
      this.index++;
      this.progress++;
      this.jumping = false;
      this.startedAt = now;
      if (this.index === route.steps.length) { this.done = true; return; }
      step = route.steps[this.index];
    }
    const riverEntry = roomId === 'jungle-run' && this.index === 0;
    const ready = !this.jumping && (riverEntry ? actor.x >= 901 && actor.x < 920 : Math.abs(actor.x-step.takeoff)<5);
    if (ready) this.jumping = true;
    const aim = this.jumping || riverEntry ? step.x : step.takeoff;
    return {move:Math.abs(actor.x-aim)<3 ? 0 : actor.x<aim ? 1 : -1,jump:ready,power:false};
  }
}
