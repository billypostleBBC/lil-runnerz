import { expect, it } from 'vitest';
import { activateRocket, rocketVelocity, shieldActive, cooldownLeft, validateCharacter } from '../src/game/rules';
import { getCharacter } from '../src/content/character';
const rocket = {kind:'rocket' as const, boostSpeed:360, durationMs:220, cooldownMs:4000};
it('fires a single upward impulse, never stacks velocity or grants immunity', () => {
  expect(activateRocket(-Infinity,100,rocket,false)).toBe(100);
  expect(rocketVelocity(200,rocket)).toBe(-360);
  expect(rocketVelocity(-410,rocket)).toBe(-410);
  expect(shieldActive(100,110,rocket)).toBe(false);
});
it('requires both recharge and landing before another boost', () => {
  expect(activateRocket(100,4099,rocket,false)).toBe(100);
  expect(activateRocket(100,4100,rocket,true)).toBe(100);
  expect(activateRocket(100,4100,rocket,false)).toBe(4100);
  expect(cooldownLeft(100,4099,rocket)).toBe(1);
});
it('gives Bill-e Bot rocket boots and validates their impulse', () => {
  const bot=getCharacter('bill-e-bot').character;
  expect(bot.power).toEqual(rocket);
  expect(()=>validateCharacter({...bot,power:{...rocket,boostSpeed:NaN}})).toThrow(/boost/i);
});

import { waterVelocity } from '../src/game/jungle';
import { characterStats } from '../src/character-presentation';
it('keeps waterfall descent stronger than a rocket impulse', () => {
  expect(waterVelocity('waterfall',160,rocketVelocity(100,rocket),0,160).vy).toBe(300);
});
it('shows nominal boost rise instead of presenting thrust as sustained flight', () => {
  expect(characterStats(getCharacter('bill-e-bot').character)[2]).toEqual({label:'Boost rise',value:'72 px',rating:3});
});
