import { describe, expect, it } from 'vitest';
import { createCollectibles, collectSnacks } from '../src/game/collectibles';
import { assembleCourse } from '../src/game/rules';
import { rooms } from '../src/content/rooms';

describe('snack collection', () => {
  const course = assembleCourse(rooms);
  it('randomises identity but preserves authored positions and bonus values', () => {
    const a = createCollectibles(course, () => 0);
    const b = createCollectibles(course, () => 0.99);
    expect(a.items.map(({x,y}) => [x,y])).toEqual(b.items.map(({x,y}) => [x,y]));
    expect(a.items[0].variety).not.toBe(b.items[0].variety);
    expect(a.items.filter(i => i.kind === 'bonus').every(i => i.variety === 'chutney')).toBe(true);
  });
  it('collects once, tallies both kinds, and ignores paused/dead runs', () => {
    const state = createCollectibles(course, () => 0);
    for (const kind of ['snack','bonus']) {
      const item = state.items.find(i => i.kind === kind)!;
      const body = { x:item.x-8, y:item.y-8, w:16, h:16 };
      expect(collectSnacks(state, body, 'paused')).toEqual([]);
      expect(collectSnacks(state, body, 'running')).toHaveLength(1);
      expect(collectSnacks(state, body, 'running')).toEqual([]);
      expect(collectSnacks(state, body, 'dead')).toEqual([]);
    }
    expect(state).toMatchObject({score:110,snacks:1,bonuses:1});
    expect(createCollectibles(course)).toMatchObject({score:0,snacks:0,bonuses:0});
  });
});

import { BonusController } from '../src/game/collectibles';
import { character } from '../src/content/character';
describe('bonus route decisions', () => {
  const actor = {x:1010,feet:312,halfWidth:9,grounded:true};
  it('takes the upper route and advances after landing, using ordinary actions', () => {
    const controller = new BonusController();
    expect(controller.decide('ember-vault',actor,character,0,true)).toEqual({move:1,jump:true,power:false});
    expect(controller.decide('ember-vault',{...actor,x:1072,feet:280},character,800,true)?.jump).toBe(true);
    expect(controller.progress).toBe(1);
  });
  it('skips a route beyond the character jump and stops pursuing a collected bonus', () => {
    expect(new BonusController().decide('ember-vault',actor,{...character,jumpSpeed:100},0,true)).toBeUndefined();
    const controller = new BonusController();
    controller.decide('ember-vault',actor,character,0,true);
    expect(controller.decide('ember-vault',actor,character,100,false)).toBeUndefined();
  });
});

it('does not turn back across the cave gap to a bonus already passed', () => {
  const controller = new BonusController();
  expect(controller.decide('hollow-grotto',{x:1040,feet:312,halfWidth:9,grounded:true},character,10000,true)).toBeUndefined();
});
it('joins a bonus route from a ledge reached during a glide', () => {
  const controller = new BonusController();
  expect(controller.decide('hollow-grotto',{x:562,feet:280,halfWidth:9,grounded:true},character,10000,true)).toEqual({move:1,jump:true,power:false});
});
it('returns towards the bottom exit after a missed jungle entry', () => {
  const controller = new BonusController();
  controller.decide('jungle-run',{x:850,feet:920,halfWidth:9,grounded:true},character,0,true);
  expect(controller.decide('jungle-run',{x:1040,feet:980,halfWidth:9,grounded:true},character,2000,true)).toEqual({move:-1,jump:false,power:false});
});
