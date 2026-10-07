import { describe, it, expect } from "vitest";
import {
  activateShield,
  shieldActive,
  cooldownLeft,
  transition,
  assembleCourse,
  validateProfile,
  validateCharacter,
  hazardActive,
  chooseActions,
  Controller,
  createRun,
  advanceRun,
} from "../src/game/rules";
import { rooms } from "../src/content/rooms";
import { character, controllerProfile } from "../src/content/character";
import {
  characters,
  defaultCharacterId,
  getCharacter,
} from "../src/content/character";
import { validateCharacters } from "../src/game/rules";

describe("shared run and shield rules", () => {
  it("limits shield duration and activation cooldown in simulation time", () => {
    const first = activateShield(-Infinity, 100, character.power);
    expect(first).toBe(100);
    expect(shieldActive(first, 899, character.power)).toBe(true);
    expect(shieldActive(first, 900, character.power)).toBe(false);
    expect(activateShield(first, 4099, character.power)).toBe(first);
    expect(cooldownLeft(first, 4100, character.power)).toBe(0);
    expect(activateShield(first, 4100, character.power)).toBe(4100);
  });
  it("pauses time and permits only valid state transitions", () => {
    expect(transition("ready", "resume")).toBe("ready");
    expect(transition("running", "pause")).toBe("paused");
    expect(transition("paused", "resume")).toBe("running");
    expect(transition("dead", "resume")).toBe("dead");
    expect(transition("won", "die")).toBe("won");
    let run = createRun("manual");
    run.status = "running";
    run = advanceRun(run, 100);
    expect(run.elapsed).toBe(100);
    run.status = "paused";
    expect(advanceRun(run, 100).elapsed).toBe(100);
    expect(createRun("auto")).toMatchObject({
      elapsed: 0,
      mode: "auto",
      status: "ready",
      shieldAt: -Infinity,
    });
  });
  it("makes flame timing deterministic and spikes persistent", () => {
    expect(
      hazardActive({ kind: "flame", period: 2400, on: 1600, phase: 0 }, 100),
    ).toBe(true);
    expect(
      hazardActive({ kind: "flame", period: 2400, on: 1600, phase: 0 }, 1800),
    ).toBe(false);
    expect(hazardActive({ kind: "spikes" }, 1800)).toBe(true);
  });
});

describe("contribution boundaries", () => {
  it("provides a validated roster with Bill-e Bot as the public default", () => {
    expect(defaultCharacterId).toBe("bill-e-bot");
    expect(getCharacter("bill-e-bot").character.name).toBe("Bill-e Bot");
    expect(getCharacter("codex").character.name).toBe("Codex");
    expect(() => getCharacter("missing")).toThrow(/unknown character/i);
    expect(() => validateCharacters(characters)).not.toThrow();
  });
  it("rejects duplicate character IDs and unsafe nested assets", () => {
    expect(() => validateCharacters([characters[0], characters[0]])).toThrow(
      /duplicate/i,
    );
    expect(() =>
      validateCharacters([
        {
          ...characters[0],
          character: {
            ...characters[0].character,
            asset: "https://untrusted.test/pet.png",
          },
        },
      ]),
    ).toThrow(/asset/i);
  });
  it("assembles room-local geometry without mutating definitions", () => {
    const before = JSON.stringify(rooms);
    const course = assembleCourse(rooms);
    expect(course.width).toBe(4000);
    expect(course.rooms[1].offset).toBe(1440);
    expect(course.solids.some((s) => s.x === 1440)).toBe(true);
    expect(JSON.stringify(rooms)).toBe(before);
  });
  it("rejects incompatible entrances, absent boundary support and non-finite geometry", () => {
    const copy = structuredClone(rooms);
    copy[1].entrance.y -= 16;
    expect(() => assembleCourse(copy)).toThrow(/connection/i);
    const gap = structuredClone(rooms);
    gap[1].solids[0].x = 20;
    expect(() => assembleCourse(gap)).toThrow(/entrance/i);
    const invalid = structuredClone(rooms);
    invalid[0].solids[0].w = NaN;
    expect(() => assembleCourse(invalid)).toThrow(/finite|geometry/i);
  });
  it("rejects duplicate room IDs and malformed hazard timing", () => {
    expect(() => assembleCourse([rooms[0], rooms[0]])).toThrow(/duplicate/i);
    const invalid = structuredClone(rooms);
    invalid[0].hazards[0].on = 3000;
    expect(() => assembleCourse(invalid)).toThrow(/timing/i);
  });
  it("validates character assets, powers and controller settings", () => {
    expect(() =>
      validateCharacter({
        ...character,
        asset: "https://untrusted.test/pet.png",
      }),
    ).toThrow(/asset/i);
    expect(() => validateCharacter({ ...character, speed: NaN })).toThrow();
    expect(() =>
      validateProfile({ ...controllerProfile, reactionMs: NaN }),
    ).toThrow();
    expect(() =>
      validateProfile({ ...controllerProfile, powerTriggerDistance: 200 }),
    ).toThrow(/perception/i);
    expect(() => validateProfile(controllerProfile)).not.toThrow();
  });
});

describe("local controller decisions", () => {
  const actor = { x: 440, feet: 312, halfWidth: 9, grounded: true };
  const terrain = [
    { x: 0, y: 312, w: 480, h: 120 },
    { x: 576, y: 312, w: 864, h: 120 },
  ];
  it("jumps for a perceived edge but cannot see beyond its profile", () => {
    expect(
      chooseActions({ ...actor, x: 455 }, terrain, [], controllerProfile, 0)
        .jump,
    ).toBe(true);
    expect(
      chooseActions(
        { ...actor, x: 455 },
        terrain,
        [],
        {
          ...controllerProfile,
          perceptionDistance: 12,
          powerTriggerDistance: 10,
        },
        0,
      ).jump,
    ).toBe(false);
  });
  it("saves the shield when jumping spikes", () => {
    const spike = { x: 480, y: 298, w: 24, h: 14, kind: "spikes" as const };
    const a = chooseActions(
      { ...actor, x: 453 },
      terrain,
      [spike],
      controllerProfile,
      0,
    );
    expect(a.jump).toBe(true);
    expect(a.power).toBe(false);
  });
  it("reaction delay affects when a changed situation is acted on", () => {
    const fast = new Controller({ ...controllerProfile, reactionMs: 40 });
    const slow = new Controller({ ...controllerProfile, reactionMs: 200 });
    fast.decide(0, { ...actor, x: 400 }, terrain, []);
    slow.decide(0, { ...actor, x: 400 }, terrain, []);
    expect(fast.decide(60, { ...actor, x: 455 }, terrain, []).jump).toBe(true);
    expect(slow.decide(60, { ...actor, x: 455 }, terrain, []).jump).toBe(false);
  });
  it("reacts to the warning just before a flame reignites", () => {
    const h = {
      x: 480,
      y: 252,
      w: 28,
      h: 60,
      kind: "flame" as const,
      period: 2400,
      on: 1600,
      phase: 0,
    };
    expect(
      chooseActions(actor, terrain, [h], controllerProfile, 2250).power,
    ).toBe(true);
  });
  it("uses the same action interface for nearby active hazards", () => {
    const hazard = {
      x: 480,
      y: 250,
      w: 24,
      h: 62,
      kind: "flame" as const,
      period: 2400,
      on: 1600,
      phase: 0,
    };
    expect(
      chooseActions(actor, terrain, [hazard], controllerProfile, 0).power,
    ).toBe(true);
    expect(
      chooseActions(
        actor,
        terrain,
        [hazard],
        { ...controllerProfile, powerTriggerDistance: 12 },
        0,
      ).power,
    ).toBe(false);
    expect(
      chooseActions(actor, terrain, [hazard], controllerProfile, 1800).power,
    ).toBe(false);
  });
});
