import type {
  CharacterDefinition,
  ControllerProfile,
} from "../game/types";

// Autonomous decisions only. Physical speed and jump height above affect both modes.
// All distances are logical pixels; all times are milliseconds of unpaused play.
export const controllerProfile: ControllerProfile = {
  perceptionDistance: 140,
  reactionMs: 120,
  jumpLead: 22,
  powerTriggerDistance: 52,
  stuckMs: 6000,
};

const physicalProfile = {
  speed: 160,
  jumpSpeed: 410,
  gravity: 900,
  power: { durationMs: 800, cooldownMs: 4000 },
} as const;

export const characters: readonly CharacterDefinition[] = [
  {
    character: {
      id: "bill-e-bot",
      name: "Bill-e Bot",
      asset: "assets/bill-e-bot.png",
      ...physicalProfile,
    },
    controllerProfile: { ...controllerProfile },
    description: "A quick shield. A magnificent moustache.",
    tagline: "the cheerfully calculated",
    frameWidth: 192,
    frameHeight: 208,
    bundled: true,
  },
  {
    character: {
      id: "codex",
      name: "Codex",
      asset: "assets/codex.webp",
      ...physicalProfile,
    },
    controllerProfile: { ...controllerProfile },
    description: "A quick shield. A questionable sense of danger.",
    tagline: "the cautiously curious",
    frameWidth: 192,
    frameHeight: 208,
    bundled: false,
  },
];

export const defaultCharacterId = "bill-e-bot";

export function getCharacter(id: string): CharacterDefinition {
  const definition = characters.find((entry) => entry.character.id === id);
  if (!definition) throw new Error(`Unknown character ID: ${id}`);
  return definition;
}

// Temporary compatibility exports while scene and UI migrate to the roster.
export const character = getCharacter("codex").character;
