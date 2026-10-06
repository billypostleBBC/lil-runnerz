import { getCharacter } from "../content/character";
import type { CharacterDefinition } from "./types";

export interface CharacterRuntime {
  definition: CharacterDefinition;
  textureKey: string;
}

export function resolveCharacterRuntime(id: string): CharacterRuntime {
  return {
    definition: getCharacter(id),
    textureKey: `pet:${id}`,
  };
}
