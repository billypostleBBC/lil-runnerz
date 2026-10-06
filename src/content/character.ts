import type { Character, ControllerProfile } from "../game/types";

export const character: Character = {
  id: "codex",
  name: "Codex",
  asset: "assets/codex.webp",
  speed: 160,
  jumpSpeed: 410,
  gravity: 900,
  power: { durationMs: 800, cooldownMs: 4000 },
};

// Autonomous decisions only. Physical speed and jump height above affect both modes.
// All distances are logical pixels; all times are milliseconds of unpaused play.
export const controllerProfile: ControllerProfile = {
  perceptionDistance: 140,
  reactionMs: 120,
  jumpLead: 22,
  powerTriggerDistance: 52,
  stuckMs: 6000,
};
