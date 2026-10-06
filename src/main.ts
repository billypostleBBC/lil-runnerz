import Phaser from "phaser";
import "./style.css";
import { CourseScene } from "./game/scene";
import { rooms } from "./content/rooms";
import {
  character,
  controllerProfile,
  defaultCharacterId,
} from "./content/character";
import {
  assembleCourse,
  validateCharacter,
  validateProfile,
} from "./game/rules";
import type { Mode, Snapshot, Status } from "./game/types";

const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const screen = el("screen"),
  primary = el<HTMLButtonElement>("primary"),
  secondary = el<HTMLButtonElement>("secondary"),
  pause = el<HTMLButtonElement>("pause");
let current: Snapshot | undefined;
let previousStatus: Status | undefined;
let previousRoom = -1;
let scene: CourseScene;
let loaded = false;
const mode = () =>
  document.querySelector<HTMLInputElement>("input[name=mode]:checked")!
    .value as Mode;
function focusCanvas() {
  const canvas = document.querySelector("canvas");
  if (canvas) {
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Game world. Use arrow keys to move, Space to jump and X for shield. Escape pauses.",
    );
    canvas.focus({ preventScroll: true });
  }
}
function modeNote() {
  el("screen-note").textContent =
    mode() === "manual"
      ? "← → or A/D: move · Space: jump · X: shield · Esc: pause"
      : "One life · Two rooms · A shield up your sleeve";
}
function announce(message: string) {
  el("announcement").textContent = message;
}
function showError(message: string) {
  el("load-error").hidden = false;
  el("error-message").textContent = message;
  screen.hidden = true;
  pause.disabled = true;
  announce(message);
  el("reload").focus();
}
function update(s: Snapshot) {
  current = s;
  const room = rooms[s.room];
  el("room-number").textContent = `0${s.room + 1}`;
  el("room-title").textContent = room.name.toUpperCase();
  el("mode-label").textContent =
    s.status === "ready"
      ? "READY TO PLAY"
      : s.mode === "auto"
        ? "AUTONOMOUS"
        : "MANUAL";
  const seconds = Math.floor(s.elapsed / 1000);
  el("timer").textContent =
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  el("decision").textContent = s.decision;
  const shieldLabel = s.shield
    ? "ACTIVE"
    : s.cooldown > 0
      ? `${(s.cooldown / 1000).toFixed(1)}s`
      : "READY";
  el("shield-status").textContent = shieldLabel;
  el("shield-fill").style.width =
    `${s.shield ? 100 : (1 - s.cooldown / character.power.cooldownMs) * 100}%`;
  el("route-fill").style.width = `${s.progress * 100}%`;
  document
    .querySelector(".route-track")!
    .setAttribute("aria-valuenow", String(Math.round(s.progress * 100)));
  el("route-dungeon").classList.toggle("active", s.room === 0);
  el("route-cave").classList.toggle("active", s.room === 1);
  pause.disabled = s.status !== "running";
  if (s.room !== previousRoom && s.status === "running") {
    announce(`Room ${s.room + 1}: ${room.name}`);
    previousRoom = s.room;
  }
  if (s.status === previousStatus) return;
  previousStatus = s.status;
  screen.hidden = s.status === "running";
  el("game").inert = s.status !== "running";
  if (s.status === "running") return;
  el("mode-picker").hidden = s.status !== "ready";
  secondary.hidden = s.status === "ready";
  el("screen-note").hidden = s.status !== "ready";
  el("screen-description").textContent = s.reason;
  if (s.status === "ready") {
    modeNote();
    el("screen-eyebrow").textContent = "DUNGEON → CAVE";
    el("screen-title").innerHTML = "A little courage.<br>A long way down.";
    el("screen-description").innerHTML =
      "Jump the gaps. Watch the flames.<br>Keep your shield for the tricky bits.";
    primary.textContent = loaded
      ? mode() === "auto"
        ? "LET CODEX LOOSE →"
        : "ENTER THE HOLLOW →"
      : "LOADING THE WORLD…";
  } else {
    const labels = {
      paused: ["A MOMENT TO BREATHE", "Adventure on hold.", "RESUME →"],
      dead: ["THE HOLLOW WINS THIS ONE", "Down, but not done.", "TRY AGAIN →"],
      won: ["EXPEDITION COMPLETE", "Small hero. Big win.", "ANOTHER RUN →"],
      stuck: ["A MOMENT OF DOUBT", "A little help?", "TRY AGAIN →"],
    }[s.status];
    if (labels) {
      el("screen-eyebrow").textContent = labels[0];
      el("screen-title").textContent = labels[1];
      primary.textContent = labels[2];
    }
  }
  announce(`${el("screen-title").textContent} ${s.reason}`);
  if (loaded) primary.focus({ preventScroll: true });
}
primary.addEventListener("click", () => {
  if (!loaded) return;
  if (current?.status === "paused") scene.resume();
  else
    scene.start(
      current?.status === "ready" ? mode() : (current?.mode ?? mode()),
      current?.characterId ?? defaultCharacterId,
    );
  focusCanvas();
});
secondary.addEventListener("click", () => {
  scene.menu();
  document.querySelector<HTMLInputElement>("input[name=mode]:checked")?.focus();
});
pause.addEventListener("click", () => scene.pause());
el("reload").addEventListener("click", () => location.reload());
document.querySelectorAll("input[name=mode]").forEach((input) =>
  input.addEventListener("change", () => {
    if (loaded)
      primary.textContent =
        mode() === "auto" ? "LET CODEX LOOSE →" : "ENTER THE HOLLOW →";
    modeNote();
  }),
);
screen.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [
    ...screen.querySelectorAll<HTMLElement>(
      "button:not([hidden]):not(:disabled),input:checked",
    ),
  ].filter((e) => !e.closest("[hidden]"));
  const first = focusable[0],
    last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});

try {
  validateCharacter(character);
  validateProfile(controllerProfile);
  assembleCourse(rooms);
  scene = new CourseScene(
    update,
    () => {
      loaded = true;
      primary.disabled = false;
      primary.textContent =
        mode() === "auto" ? "LET CODEX LOOSE →" : "ENTER THE HOLLOW →";
    },
    showError,
  );
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: "game",
    width: 640,
    height: 360,
    backgroundColor: "#171b25",
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        fixedStep: true,
        fps: 60,
        debug: false,
      },
    },
    input: { keyboard: false },
    scene: [scene],
    audio: { noAudio: true },
    banner: false,
  });
  const observer = new ResizeObserver(() => game.scale.refresh());
  observer.observe(el("game"));
  // Read-only diagnostics for reproducible local verification; no gameplay overrides.
  Object.defineProperty(window, "__jumpa", {
    value: Object.freeze({
      snapshot: () => scene.snapshot(),
      content: () => structuredClone({ rooms, character, controllerProfile }),
    }),
    writable: false,
  });
} catch (error) {
  showError(
    `${error instanceof Error ? error.message : "The game could not start."} Check the content definitions and reload.`,
  );
}
