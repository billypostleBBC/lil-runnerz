import type {
  Actions,
  Actor,
  Character,
  CharacterDefinition,
  ControllerProfile,
  Course,
  Hazard,
  Power,
  Rect,
  Room,
  Run,
  RunEvent,
  Status,
  Mode,
} from "./types";

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
function finite(n: unknown, min: number, max: number): boolean {
  return typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
}
export function validateProfile(p: ControllerProfile): void {
  assert(
    p && finite(p.perceptionDistance, 8, 640),
    "Controller perception distance must be 8–640 pixels.",
  );
  assert(
    finite(p.reactionMs, 16, 1000),
    "Controller reaction time must be 16–1000 ms.",
  );
  assert(
    finite(p.jumpLead, 4, 60),
    "Controller jump lead must be 4–60 pixels.",
  );
  assert(
    finite(p.powerTriggerDistance, 4, p.perceptionDistance),
    "Power trigger must fit within perception distance.",
  );
  assert(
    finite(p.stuckMs, 1000, 30000),
    "Stuck timeout must be 1000–30000 ms.",
  );
}
export function validateCharacter(c: Character): void {
  assert(
    c &&
      typeof c.id === "string" &&
      c.id.length > 0 &&
      typeof c.name === "string",
    "Character needs an ID and name.",
  );
  assert(
    typeof c.asset === "string" &&
      /^assets\/[a-z0-9_-]+\.(webp|png)$/.test(c.asset),
    "Character asset must be a local assets/ image.",
  );
  assert(
    finite(c.speed, 40, 400) &&
      finite(c.jumpSpeed, 100, 800) &&
      finite(c.gravity, 200, 2000),
    "Character movement values must be finite and within supported limits.",
  );
  assert(
    c.power &&
      ["shield", "glide"].includes(c.power.kind) &&
      finite(c.power.durationMs, 100, 3000) &&
      finite(c.power.cooldownMs, c.power.durationMs, 30000),
    "Power kind, duration or cooldown is invalid.",
  );
}
export function validateCharacters(
  definitions: readonly CharacterDefinition[],
): void {
  assert(
    Array.isArray(definitions) && definitions.length > 0,
    "Character roster needs at least one character.",
  );
  const ids = new Set<string>();
  for (const definition of definitions) {
    validateCharacter(definition.character);
    validateProfile(definition.controllerProfile);
    assert(
      !ids.has(definition.character.id),
      `Duplicate character ID: ${definition.character.id}`,
    );
    ids.add(definition.character.id);
    assert(
      typeof definition.description === "string" &&
        definition.description.trim().length > 0 &&
        typeof definition.tagline === "string" &&
        definition.tagline.trim().length > 0,
      `Character ${definition.character.id}: display copy is required.`,
    );
    assert(
      Number.isInteger(definition.frameWidth) &&
        definition.frameWidth > 0 &&
        Number.isInteger(definition.frameHeight) &&
        definition.frameHeight > 0,
      `Character ${definition.character.id}: frame dimensions must be positive integers.`,
    );
    assert(
      typeof definition.bundled === "boolean",
      `Character ${definition.character.id}: bundled status is required.`,
    );
    assert(
      definition.pixelArt === undefined || typeof definition.pixelArt === "boolean",
      `Character ${definition.character.id}: pixelArt must be a boolean when supplied.`,
    );
  }
}
export function assembleCourse(rooms: Room[]): Course {
  assert(
    Array.isArray(rooms) && rooms.length > 0 && rooms.length <= 20,
    "Course needs 1–20 rooms.",
  );
  let offset = 0;
  const ids = new Set<string>();
  const result: Course = {
    width: 0,
    height: 0,
    rooms: [],
    solids: [],
    hazards: [],
  };
  for (const room of rooms) {
    assert(
      room && typeof room.id === "string" && room.id.length > 0,
      "Room needs an ID.",
    );
    assert(!ids.has(room.id), `Duplicate room ID: ${room.id}`);
    ids.add(room.id);
    assert(
      typeof room.name === "string" &&
        typeof room.subtitle === "string" &&
        ["dungeon", "cave"].includes(room.theme),
      `Room ${room.id}: invalid name or theme.`,
    );
    assert(
      finite(room.width, 640, 5000) && finite(room.height, 360, 1200),
      `Room ${room.id}: invalid dimensions.`,
    );
    assert(
      Array.isArray(room.solids) &&
        room.solids.length > 0 &&
        Array.isArray(room.hazards),
      `Room ${room.id}: missing solids or hazards.`,
    );
    for (const rect of [...room.solids, ...room.hazards]) {
      assert(
        rect &&
          finite(rect.x, 0, room.width) &&
          finite(rect.y, 0, room.height) &&
          finite(rect.w, 1, room.width) &&
          finite(rect.h, 1, room.height) &&
          rect.x + rect.w <= room.width &&
          rect.y + rect.h <= room.height,
        `Room ${room.id}: geometry must be finite and inside the room.`,
      );
    }
    for (const h of room.hazards) {
      assert(
        ["flame", "spikes"].includes(h.kind),
        `Room ${room.id}: unknown hazard.`,
      );
      if (h.kind === "flame")
        assert(
          finite(h.period, 500, 10000) &&
            finite(h.on, 100, h.period!) &&
            finite(h.phase, 0, h.period!),
          `Room ${room.id}: invalid flame timing.`,
        );
    }
    assert(
      room.entrance && room.exit,
      `Room ${room.id}: missing entrance or exit connection.`,
    );
    const previous = result.rooms.at(-1);
    assert(
      !previous ||
        (previous.exit.y === room.entrance.y &&
          previous.height === room.height),
      `Room connection to ${room.id} has incompatible floor or height.`,
    );
    for (const [edge, port] of [
      ["entrance", room.entrance],
      ["exit", room.exit],
    ] as const) {
      assert(
        port &&
          finite(port.y, 96, room.height - 16) &&
          finite(port.clearance, 64, room.width / 2),
        `Room ${room.id}: invalid ${edge}.`,
      );
      const x = edge === "entrance" ? 0 : room.width - port.clearance;
      assert(
        room.solids.some(
          (s) => s.y === port.y && s.x <= x && s.x + s.w >= x + port.clearance,
        ),
        `Room ${room.id}: ${edge} needs continuous floor support.`,
      );
      assert(
        ![...room.solids, ...room.hazards].some(
          (s) =>
            s.y < port.y &&
            s.y + s.h > port.y - 64 &&
            s.x < x + port.clearance &&
            s.x + s.w > x,
        ),
        `Room ${room.id}: ${edge} clearance is obstructed.`,
      );
    }
    result.rooms.push({ ...room, offset });
    result.solids.push(...room.solids.map((s) => ({ ...s, x: s.x + offset })));
    result.hazards.push(
      ...room.hazards.map((s) => ({ ...s, x: s.x + offset })),
    );
    offset += room.width;
    result.height = Math.max(result.height, room.height);
  }
  result.width = offset;
  return result;
}
export const createRun = (mode: Mode): Run => ({
  mode,
  status: "ready",
  elapsed: 0,
  shieldAt: -Infinity,
});
export const advanceRun = (run: Run, ms: number): Run => ({
  ...run,
  elapsed: run.elapsed + (run.status === "running" ? Math.max(0, ms) : 0),
});
export function transition(status: Status, event: RunEvent): Status {
  if (event === "start" && status === "ready") return "running";
  if (event === "resume" && status === "paused") return "running";
  if (status !== "running") return status;
  return (
    (
      { pause: "paused", die: "dead", win: "won", stuck: "stuck" } as Partial<
        Record<RunEvent, Status>
      >
    )[event] ?? status
  );
}
export const cooldownLeft = (at: number, now: number, p: Power) =>
  Math.max(0, p.cooldownMs - (now - at));
export const activateShield = (at: number, now: number, p: Power) =>
  cooldownLeft(at, now, p) === 0 ? now : at;
export const powerActive = (at: number, now: number, p: Power) =>
  now >= at && now - at < p.durationMs;
export const shieldActive = (at: number, now: number, p: Power) =>
  p.kind === "shield" && powerActive(at, now, p);
export const activateGlide = (at: number, now: number, p: Power, grounded: boolean) =>
  grounded ? at : activateShield(at, now, p);
export const glideVelocity = (vy: number, at: number, now: number, p: Power, grounded: boolean) =>
  p.kind === "glide" && !grounded && powerActive(at, now, p) ? Math.min(vy, 65) : vy;
export function hazardActive(
  h: Pick<Hazard, "kind" | "period" | "on" | "phase">,
  now: number,
): boolean {
  return h.kind === "spikes" || (now + (h.phase ?? 0)) % h.period! < h.on!;
}
export function hazardWarning(
  h: Pick<Hazard, "kind" | "period" | "on" | "phase">,
  now: number,
): boolean {
  return (
    h.kind === "flame" &&
    !hazardActive(h, now) &&
    h.period! - ((now + (h.phase ?? 0)) % h.period!) <= 400
  );
}
export function chooseActions(
  actor: Actor,
  solids: Rect[],
  hazards: Hazard[],
  p: ControllerProfile,
  now: number,
): Actions {
  const right = actor.x + actor.halfWidth;
  const visible = solids.filter(
    (s) =>
      s.x <= right + p.perceptionDistance &&
      s.x + s.w >= actor.x - actor.halfWidth,
  );
  const probe = right + p.jumpLead;
  const groundAhead = visible.some(
    (s) =>
      probe >= s.x &&
      probe <= s.x + s.w &&
      s.y >= actor.feet - 4 &&
      s.y <= actor.feet + 64,
  );
  const obstacle = visible.some(
    (s) =>
      s.x >= right - 2 &&
      s.x < right + p.jumpLead &&
      s.y < actor.feet - 4 &&
      s.y >= actor.feet - 88,
  );
  const hazardsAhead = hazards.filter(
    (h) =>
      h.x + h.w >= actor.x - actor.halfWidth &&
      h.x - right <= p.perceptionDistance &&
      h.y + h.h > actor.feet - 24 &&
      (hazardActive(h, now) || hazardWarning(h, now)),
  );
  const spikes = hazardsAhead.some(
    (h) => h.kind === "spikes" && h.x - right < 38,
  );
  return {
    move: 1,
    jump:
      actor.grounded &&
      ((p.perceptionDistance >= p.jumpLead && !groundAhead) ||
        obstacle ||
        spikes),
    power: hazardsAhead.some(
      (h) => h.kind === "flame" && h.x - right <= p.powerTriggerDistance,
    ),
  };
}

// Reaction interval is simulation time, so pausing never consumes decision time.
export class Controller {
  private nextDecision = 0;
  private action: Actions = { move: 0, jump: false, power: false };
  constructor(readonly profile: ControllerProfile) {
    validateProfile(profile);
  }
  decide(
    now: number,
    actor: Actor,
    solids: Rect[],
    hazards: Hazard[],
  ): Actions {
    if (now >= this.nextDecision) {
      this.action = chooseActions(actor, solids, hazards, this.profile, now);
      this.nextDecision = now + this.profile.reactionMs;
    }
    return this.action;
  }
}
