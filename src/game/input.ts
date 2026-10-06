import type { Actions } from "./types";
const gameKeys = new Set([
  "KeyA",
  "KeyD",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "KeyX",
]);
export class ManualInput {
  private held = new Set<string>();
  private jump = false;
  private power = false;
  constructor(
    private canPlay: () => boolean,
    private onPause: () => void,
  ) {
    window.addEventListener("keydown", this.down);
    window.addEventListener("keyup", this.up);
  }
  private down = (event: KeyboardEvent) => {
    if (event.code === "Escape" && !event.repeat) {
      event.preventDefault();
      this.onPause();
      return;
    }
    if (
      !this.canPlay() ||
      !gameKeys.has(event.code) ||
      event.target instanceof HTMLButtonElement
    )
      return;
    event.preventDefault();
    if (!event.repeat) {
      if (event.code === "Space") this.jump = true;
      if (event.code === "KeyX") this.power = true;
    }
    this.held.add(event.code);
  };
  private up = (event: KeyboardEvent) => {
    this.held.delete(event.code);
  };
  read(): Actions {
    const right = this.held.has("KeyD") || this.held.has("ArrowRight");
    const left = this.held.has("KeyA") || this.held.has("ArrowLeft");
    const result: Actions = {
      move: right === left ? 0 : right ? 1 : -1,
      jump: this.jump,
      power: this.power,
    };
    this.jump = false;
    this.power = false;
    return result;
  }
  clear() {
    this.held.clear();
    this.jump = false;
    this.power = false;
  }
  destroy() {
    window.removeEventListener("keydown", this.down);
    window.removeEventListener("keyup", this.up);
  }
}
