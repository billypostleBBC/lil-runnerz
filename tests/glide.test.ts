import { expect, it } from 'vitest';
import { activateGlide, glideVelocity, shieldActive } from '../src/game/rules';
const power = { kind: 'glide' as const, durationMs: 1200, cooldownMs: 4000 };
it('requires airborne activation and respects recharge', () => {
  expect(activateGlide(-Infinity, 0, power, true)).toBe(-Infinity);
  expect(activateGlide(-Infinity, 100, power, false)).toBe(100);
  expect(activateGlide(100, 4099, power, false)).toBe(100);
  expect(activateGlide(100, 4100, power, false)).toBe(4100);
});
it('caps descent without adding lift and ends at expiry or landing', () => {
  expect(glideVelocity(-200, 100, 500, power, false)).toBe(-200);
  expect(glideVelocity(400, 100, 500, power, false)).toBe(65);
  expect(glideVelocity(400, 100, 1300, power, false)).toBe(400);
  expect(glideVelocity(400, 100, 500, power, true)).toBe(400);
});
it('never grants shield immunity to a hoverboard', () => {
  expect(shieldActive(100, 500, power)).toBe(false);
});
