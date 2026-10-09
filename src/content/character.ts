import type {
  Character,
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
  power: { kind: "shield", durationMs: 800, cooldownMs: 4000 },
} as const;

export const marty: Character = {
  id: "marty",
  name: "Marty McFly",
  asset: "assets/marty.png",
  speed: 160,
  jumpSpeed: 410,
  gravity: 900,
  power: { kind: "glide", durationMs: 1200, cooldownMs: 4000 },
};

export const characters: readonly CharacterDefinition[] = [
  {
    character: {
      id: "bill-e-bot",
      name: "Bill-e Bot",
      asset: "assets/bill-e-bot.png",
      ...physicalProfile,
      power: { kind: "rocket", boostSpeed: 360, durationMs: 220, cooldownMs: 4000 },
    },
    controllerProfile: { ...controllerProfile },
    description: "Rocket boots. A magnificent moustache.",
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
  {
    character: marty,
    controllerProfile: { ...controllerProfile },
    description: "Red gilet. Pink board. A little more airtime.",
    tagline: "the hoverboard rider",
    frameWidth: 64,
    frameHeight: 80,
    pixelArt: true,
    bundled: true,
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
