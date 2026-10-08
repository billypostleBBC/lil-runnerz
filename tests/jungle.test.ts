import { describe, it, expect } from 'vitest';
import { waterVelocity, creatureRect, safeToCross, crossedExit, jungleActions } from '../src/game/jungle';
import { assembleCourse } from '../src/game/rules';
import { jungleRoom } from '../src/content/jungle';

describe('Jungle movement and hazard rules', () => {
  it('counter-steers while waiting in the connected river, then rides the safe crossing', () => {
    const actor = { x: 530, feet: 920, halfWidth: 9, grounded: true };
    const waiting = jungleActions(actor, 2, 100, jungleRoom.hazards);
    expect(waterVelocity('river', waiting.move * 160, 0, 0, 160).vx).toBeLessThanOrEqual(0);
    expect(jungleActions(actor, 2, 1500, jungleRoom.hazards).move).toBe(1);
  });
  it('forces downward water movement even after a jump or glide', () => {
    expect(waterVelocity('waterfall', 0, -410, 0, 160).vy).toBeGreaterThanOrEqual(300);
    expect(waterVelocity('waterfall', 80, 65, 0, 160).vx).toBe(80);
  });
  it('allows escape from the whirlpool and speeds river travel above walking speed', () => {
    expect(waterVelocity('whirlpool', 160, 0, 60, 160).vx).toBeGreaterThan(0);
    expect(waterVelocity('whirlpool', 0, 0, 60, 160).vx).toBeLessThan(0);
    expect(waterVelocity('river', 160, 0, 0, 160).vx).toBeGreaterThan(160);
    expect(waterVelocity('river', -160, 0, 0, 160).vx).toBeLessThan(0);
  });
  it('waits for a long enough safe interval, including cycle wrap', () => {
    const h = jungleRoom.hazards.find(h => h.kind === 'snake')!;
    expect(safeToCross(h, 100, 1200)).toBe(false);
    expect(safeToCross(h, 1500, 1200)).toBe(true);
    expect(safeToCross(h, 3900, 1200)).toBe(false);
  });
  it('moves the visible spider and its collision together', () => {
    const h = jungleRoom.hazards.find(h => h.kind === 'spider')!;
    expect(creatureRect(h, 0).y).toBe(h.y);
    expect(creatureRect(h, 2000).y).toBeLessThan(h.y - 40);
  });
  it('only accepts an outward crossing within the bottom opening', () => {
    const port = { edge: 'bottom' as const, x: 932, y: 1120, clearance: 100 };
    expect(crossedExit(port, { x: 960, feet: 1118 }, { x: 960, feet: 1122 })).toBe(true);
    expect(crossedExit(port, { x: 850, feet: 1118 }, { x: 850, feet: 1122 })).toBe(false);
    expect(crossedExit(port, { x: 960, feet: 1122 }, { x: 960, feet: 1118 })).toBe(false);
  });
  it('validates a bottom opening and rejects a floor blocking it', () => {
    expect(() => assembleCourse([jungleRoom])).not.toThrow();
    const blocked = structuredClone(jungleRoom);
    blocked.solids.push({x: 932, y: 1100, w: 100, h: 20});
    expect(() => assembleCourse([blocked])).toThrow(/exit.*obstructed/i);
  });
});

describe('directional room connections', () => {
  it('joins a bottom exit to a top entrance and translates both axes', () => {
    const receiver = { ...structuredClone(jungleRoom), id: 'receiver', width: 640, height: 360,
      entrance: {edge:'top' as const,x:100,y:0,clearance:100},
      exit: {edge:'right' as const,y:280,clearance:96},
      solids:[{x:0,y:280,w:640,h:80}], hazards:[], water:[] };
    const course=assembleCourse([jungleRoom,receiver]);
    expect(course.rooms[1]).toMatchObject({offset:832,offsetY:1120});
    expect(course.solids.at(-1)).toEqual({x:832,y:1400,w:640,h:80});
    expect(course.height).toBe(1480);
  });
  it('rejects mismatched directions and invalid water bounds', () => {
    const next={...structuredClone(jungleRoom),id:'next'};
    expect(()=>assembleCourse([jungleRoom,next])).toThrow(/directions/);
    const invalid=structuredClone(jungleRoom);
    invalid.water![0].w=NaN;
    expect(()=>assembleCourse([invalid])).toThrow(/geometry/);
  });
  it('puts the first bonus platform above the only opening under the dividing wall', () => {
    const wall=jungleRoom.solids.find(s=>s.x===900)!;
    const landing=jungleRoom.solids.find(s=>s.x===1000 && s.y===852)!;
    // A falling 28px-tall body cannot pass below this wall and land on the first ledge.
    expect(wall.y).toBe(0);
    expect(wall.y+wall.h+28).toBeGreaterThan(landing.y);
  });
});
