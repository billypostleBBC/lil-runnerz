import { checkCharacterAvailability } from "./content/character-availability";
import Phaser from "phaser";
import "./style.css";
import { CourseScene } from "./game/scene";
import { rooms } from "./content/rooms";
import {
  character,
  characters as definitions,
  controllerProfile,
  defaultCharacterId,
  getCharacter,
} from "./content/character";
import {
  assembleCourse,
  validateCharacters,
  validateProfile,
} from "./game/rules";
import type { Snapshot, Status } from "./game/types";

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
const characters = definitions.map((definition) => definition.character);
let selected = getCharacter(defaultCharacterId).character;
let sceneReady = false;
let charactersReady = false;
let menuView: "splash" | "selection" | "help" | "settings" = "splash";
function showMenu(view: typeof menuView, focus = true) {
  menuView = view;
  const choosing = view === "selection";
  const splash = view === "splash";
  screen.className = `screen ${view}`;
  screen.removeAttribute("aria-describedby");
  screen.scrollTop = 0;
  el("selection").hidden = !choosing;
  el("help-panel").hidden = view !== "help";
  el("settings-panel").hidden = view !== "settings";
  el("screen-actions").hidden = !splash;
  el("splash-actions").hidden = !splash;
  el("back-splash").hidden = splash || choosing;
  el("screen-note").hidden = !splash;
  el("screen-note").textContent = "↑ ↓ SELECT · ENTER TO CHOOSE";
  el("screen-eyebrow").hidden = true;
  el("screen-description").hidden = true;
  el("screen-title").textContent = choosing
    ? "CHOOSE YOUR RUNNER"
    : view === "help"
      ? "HOW TO PLAY"
      : view === "settings"
        ? "SETTINGS"
        : "lil-runnerz";
  primary.textContent = loaded ? "START GAME" : "LOADING…";
  secondary.hidden = true;
  if (focus)
    (choosing
      ? document.querySelector<HTMLInputElement>(
          "input[name=character]:checked",
        )
      : splash
        ? primary
        : el("back-splash")
    )?.focus();
}
el("how-to-play").addEventListener("click", () => showMenu("help"));
el("settings").addEventListener("click", () => showMenu("settings"));
el("back-splash").addEventListener("click", () => showMenu("splash"));
el("fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el("play").requestFullscreen();
  } catch {
    el("fullscreen").textContent = "Fullscreen unavailable in this browser";
  }
});
document.addEventListener("fullscreenchange", () => {
  el("fullscreen").textContent = document.fullscreenElement
    ? "Leave fullscreen"
    : "Enter fullscreen";
});
const grid = el("character-grid");
for (const runner of characters) {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "radio";
  input.name = "character";
  input.value = runner.id;
  input.checked = runner.id === selected.id;
  const card = document.createElement("span");
  card.className = "character-tile";
  const sprite = document.createElement("span");
  sprite.className = `runner-sprite ${runner.id}`;
  sprite.setAttribute("aria-hidden", "true");
  sprite.style.backgroundImage = `url("${import.meta.env.BASE_URL}${runner.asset}")`;
  const name = document.createElement("strong");
  name.textContent = runner.name;
  const power = document.createElement("small");
  power.textContent = runner.power.kind === "glide" ? "Hoverboard" : "Shield";
  card.append(sprite, name, power);
  label.append(input, card);
  grid.append(label);
}
function previewCharacter() {
  el("character-preview").className = `runner-sprite ${selected.id}`;
  el("character-preview").style.backgroundImage =
    `url("${import.meta.env.BASE_URL}${selected.asset}")`;
  el("preview-name").textContent = selected.name;
  el("preview-power").textContent =
    selected.power.kind === "glide" ? "HOVERBOARD GLIDE" : "PROTECTIVE SHIELD";
  const stats = el("preview-stats");
  stats.replaceChildren();
  for (const [label, value] of [
    ["Speed", `${selected.speed} px/s`],
    [
      "Jump height",
      `${Math.round(selected.jumpSpeed ** 2 / (2 * selected.gravity))} px`,
    ],
    ["Power lasts", `${selected.power.durationMs / 1000}s`],
    ["Recharge", `${selected.power.cooldownMs / 1000}s`],
  ]) {
    const dt = document.createElement("dt"),
      dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    stats.append(dt, dd);
  }
  el("preview-description").textContent =
    selected.power.kind === "glide"
      ? "Glide while airborne. No protection from hazards. Recharge starts on activation."
      : "Brief protection from flames, spikes and creatures. Does not stop currents or protect against falls. Recharge starts on activation.";
}
previewCharacter();
function focusCanvas() {
  const canvas = document.querySelector("canvas");
  if (canvas) {
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Game world. Use arrow keys to move, Space to jump and X for your power. Escape pauses.",
    );
    canvas.focus({ preventScroll: true });
  }
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
  el("play").classList.toggle("playing", s.status === "running");
  el("power-label").textContent =
    selected.power.kind === "glide" ? "HOVERBOARD" : "SHIELD";
  const room = rooms[s.room];
  el("room-number").textContent = `0${s.room + 1}`;
  el("room-title").textContent = room.name.toUpperCase();
  el("mode-label").textContent =
    s.status === "ready"
      ? "READY TO PLAY"
      : s.mode === "auto"
        ? "AUTONOMOUS"
        : "MANUAL";
  const shieldLabel = s.powerActive
    ? "ACTIVE"
    : s.cooldown > 0
      ? `${(s.cooldown / 1000).toFixed(1)}s`
      : "READY";
  el("shield-status").textContent = shieldLabel;
  el("shield-fill").style.width =
    `${s.powerActive ? 100 : (1 - s.cooldown / selected.power.cooldownMs) * 100}%`;
  pause.disabled = s.status !== "running";
  if (s.room !== previousRoom && s.status === "running") {
    announce(`Room ${s.room + 1}: ${room.name}`);
    previousRoom = s.room;
  }
  if (s.status === previousStatus) return;
  previousStatus = s.status;
  screen.hidden = s.status === "running";
  el("game").inert = s.status !== "running";
  if (s.status === "running") {
    screen.className = "screen";
    return;
  }
  el("screen-description").textContent = s.reason;
  if (s.status === "ready") {
    showMenu(menuView, false);
  } else {
    screen.className = "screen";
    el("selection").hidden = true;
    for (const id of [
      "help-panel",
      "settings-panel",
      "splash-actions",
      "back-splash",
    ])
      el(id).hidden = true;
    el("screen-description").hidden = false;
    screen.setAttribute("aria-describedby", "screen-description");
    screen.scrollTop = 0;
    el("screen-actions").hidden = false;
    el("screen-note").hidden = true;
    secondary.hidden = false;
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
let startingRun = false;
async function startRun(mode: "auto" | "manual") {
  if (!loaded || startingRun) return;
  startingRun = true;
  const controls = [
    ...screen.querySelectorAll<HTMLInputElement | HTMLButtonElement>(
      "input, button",
    ),
  ];
  const disabledStates = controls.map((control) => control.disabled);
  controls.forEach((control) => {
    control.disabled = true;
  });
  screen.setAttribute("aria-busy", "true");
  try {
    if (current?.status === "ready") scene.selectCharacter(selected.id);
    await scene.start(mode);
    if (el("load-error").hidden) focusCanvas();
  } catch {
    showError("The run could not start. Reload the game to try again.");
  } finally {
    controls.forEach((control, index) => {
      control.disabled = disabledStates[index];
    });
    screen.removeAttribute("aria-busy");
    startingRun = false;
  }
}
primary.addEventListener("click", () => {
  if (!loaded) return;
  if (current?.status === "ready") {
    showMenu("selection");
    return;
  }
  if (current?.status === "paused") scene.resume();
  else {
    void startRun(current?.mode ?? "auto");
    return;
  }
  focusCanvas();
});
secondary.addEventListener("click", () => {
  menuView = "selection";
  scene.menu();
  showMenu("selection");
});
el("back-menu").addEventListener("click", () => showMenu("splash"));
for (const mode of ["auto", "manual"] as const) {
  el(`start-${mode}`).addEventListener("click", () => {
    if (!loaded || current?.status !== "ready") return;
    void startRun(mode);
  });
}
pause.addEventListener("click", () => scene.pause());
el("reload").addEventListener("click", () => location.reload());
document
  .querySelectorAll<HTMLInputElement>("input[name=character]")
  .forEach((input) =>
    input.addEventListener("change", () => {
      selected = characters.find((c) => c.id === input.value)!;

      previewCharacter();
      announce(`${selected.name} selected`);
    }),
  );
screen.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    current?.status === "ready" &&
    menuView !== "splash"
  ) {
    event.preventDefault();
    showMenu("splash");
    return;
  }
  const active = document.activeElement;
  const radio =
    active instanceof HTMLInputElement && active.name === "character";
  if (radio && (event.key === "ArrowLeft" || event.key === "ArrowRight"))
    return;
  if (radio && event.key === "Enter") {
    event.preventDefault();
    el("start-auto").focus();
    return;
  }
  const arrow = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
    event.key,
  );
  if (event.key !== "Tab" && !arrow) return;
  const focusable = [
    ...screen.querySelectorAll<HTMLElement>(
      "button:not([hidden]):not(:disabled),input:checked:not(:disabled)",
    ),
  ].filter((e) => !e.closest("[hidden]"));
  if (arrow) {
    event.preventDefault();
    const direction =
      event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1;
    const index = focusable.indexOf(active as HTMLElement);
    focusable[
      (index + direction + focusable.length) % focusable.length
    ]?.focus();
    return;
  }
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

function enableWhenReady() {
  loaded = sceneReady && charactersReady;
  primary.disabled = !loaded;
  el<HTMLButtonElement>("start-auto").disabled = !loaded;
  el<HTMLButtonElement>("start-manual").disabled = !loaded;
  showMenu(menuView, false);
  if (loaded && document.activeElement === document.body)
    primary.focus({ preventScroll: true });
}
async function checkOptions() {
  const checks = await Promise.all(
    definitions.map(async (definition) => ({
      id: definition.character.id,
      availability: await checkCharacterAvailability(definition),
    })),
  );
  for (const { id, availability } of checks) {
    const input = [
      ...document.querySelectorAll<HTMLInputElement>("input[name=character]"),
    ].find((input) => input.value === id)!;
    input.disabled = !availability.available;
    if (availability.reason)
      input.parentElement!.querySelector("small")!.textContent =
        availability.reason;
  }
  charactersReady = true;
  enableWhenReady();
}
try {
  validateCharacters(definitions);
  validateProfile(controllerProfile);
  assembleCourse(rooms);
  scene = new CourseScene(
    update,
    () => {
      sceneReady = true;
      enableWhenReady();
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
        gravity: { x: 0, y: character.gravity },
        fixedStep: true,
        // Keep movement in step with 120 Hz displays; 60 Hz frames run two steps.
        // At 60 steps/s the camera moved between repeated character positions.
        fps: 120,
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
  void checkOptions().catch((error) =>
    showError(
      `${error instanceof Error ? error.message : "Character artwork could not be checked."} Reload to try again.`,
    ),
  );
  Object.defineProperty(window, "__jumpa", {
    value: Object.freeze({
      snapshot: () => scene.snapshot(),
      content: () =>
        structuredClone({
          rooms,
          characters: definitions,
          selectedCharacterId: selected.id,
        }),
    }),
    writable: false,
  });
} catch (error) {
  showError(
    `${error instanceof Error ? error.message : "The game could not start."} Check the content definitions and reload.`,
  );
}
