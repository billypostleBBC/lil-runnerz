import Phaser from "phaser";
import "./style.css";
import { characterPresentation } from "./character-presentation";
import { checkCharacterAvailability } from "./content/character-availability";
import { characters, defaultCharacterId, getCharacter } from "./content/character";
import { rooms } from "./content/rooms";
import { CourseScene } from "./game/scene";
import { assembleCourse, validateCharacters } from "./game/rules";
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
let sceneReady = false;
let charactersReady = false;
let loaded = false;
let selectedCharacterId = defaultCharacterId;

const mode = () =>
  document.querySelector<HTMLInputElement>("input[name=mode]:checked")!
    .value as Mode;
const selectedCharacter = () => getCharacter(selectedCharacterId);

function focusCanvas() {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;
  canvas.tabIndex = 0;
  canvas.setAttribute(
    "aria-label",
    "Game world. Use arrow keys to move, Space to jump and X for shield. Escape pauses.",
  );
  canvas.focus({ preventScroll: true });
}

function modeNote() {
  el("screen-note").textContent =
    mode() === "manual"
      ? "← → or A/D: move · Space: jump · X: shield · Esc: pause"
      : "One life · Two rooms · A shield up your sleeve";
}

function updateSelectedPresentation() {
  const definition = selectedCharacter();
  const presentation = characterPresentation(definition, mode());
  el("watch-label").textContent = presentation.watchLabel;
  el("character-heading").childNodes[0].textContent =
    `${definition.character.name} `;
  el("character-tagline").textContent = definition.tagline;
  el("character-description").textContent = definition.description;
  el("power-summary").textContent =
    `${presentation.shieldSummary} · Pits are still pits.`;
  const portrait = document.querySelector<HTMLElement>(".pet-portrait")!;
  portrait.style.backgroundImage = `url("${presentation.portraitAsset}")`;
  portrait.style.backgroundSize = `${62 * 8}px ${68 * 11}px`;
  if (loaded && current?.status === "ready") {
    primary.textContent = presentation.callToAction;
  }
  modeNote();
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

function enableWhenReady() {
  loaded = sceneReady && charactersReady;
  primary.disabled = !loaded;
  if (loaded) updateSelectedPresentation();
}

async function initialiseCharacterOptions() {
  const options = el("character-options");
  const checks = await Promise.all(
    characters.map(async (definition) => ({
      definition,
      availability: await checkCharacterAvailability(definition),
    })),
  );
  options.replaceChildren();
  for (const { definition, availability } of checks) {
    const id = definition.character.id;
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "character";
    input.value = id;
    input.checked = id === selectedCharacterId;
    input.disabled = !availability.available;
    if (availability.reason) input.setAttribute("aria-describedby", `${id}-reason`);

    const card = document.createElement("span");
    card.className = "character-card";
    const portrait = document.createElement("i");
    portrait.className = "character-card-portrait";
    portrait.setAttribute("aria-hidden", "true");
    portrait.style.backgroundImage = `url("/${definition.character.asset}")`;
    const copy = document.createElement("span");
    const name = document.createElement("b");
    name.textContent = definition.character.name.toUpperCase();
    const detail = document.createElement("small");
    detail.id = `${id}-reason`;
    detail.textContent = availability.reason ?? definition.tagline;
    copy.append(name, detail);
    card.append(portrait, copy);
    label.append(input, card);
    options.append(label);
    input.addEventListener("change", () => {
      selectedCharacterId = id;
      updateSelectedPresentation();
    });
  }
  charactersReady = true;
  enableWhenReady();
}

function update(s: Snapshot) {
  current = s;
  const room = rooms[s.room];
  const active = getCharacter(s.characterId);
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
    `${s.shield ? 100 : (1 - s.cooldown / active.character.power.cooldownMs) * 100}%`;
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
  el("character-picker").hidden = s.status !== "ready";
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
      ? characterPresentation(selectedCharacter(), mode()).callToAction
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
  if (current?.status === "paused") {
    scene.resume();
    focusCanvas();
    return;
  }
  const runMode = current?.status === "ready" ? mode() : (current?.mode ?? mode());
  const runCharacterId =
    current?.status === "ready"
      ? selectedCharacterId
      : (current?.characterId ?? selectedCharacterId);
  void scene.start(runMode, runCharacterId).then(() => {
    if (el("load-error").hidden) focusCanvas();
  });
});
secondary.addEventListener("click", () => {
  scene.menu();
  document
    .querySelector<HTMLInputElement>("input[name=character]:checked")
    ?.focus();
});
pause.addEventListener("click", () => scene.pause());
el("reload").addEventListener("click", () => location.reload());
document.querySelectorAll("input[name=mode]").forEach((input) =>
  input.addEventListener("change", updateSelectedPresentation),
);
screen.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [
    ...screen.querySelectorAll<HTMLElement>(
      "button:not([hidden]):not(:disabled),input:checked:not(:disabled)",
    ),
  ].filter((entry) => !entry.closest("[hidden]"));
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
  validateCharacters(characters);
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
  void initialiseCharacterOptions().catch((error) => {
    showError(
      error instanceof Error
        ? error.message
        : "Character artwork could not be checked.",
    );
  });
  Object.defineProperty(window, "__jumpa", {
    value: Object.freeze({
      snapshot: () => scene.snapshot(),
      content: () =>
        structuredClone({ rooms, characters, selectedCharacterId }),
    }),
    writable: false,
  });
} catch (error) {
  showError(
    `${error instanceof Error ? error.message : "The game could not start."} Check the content definitions and reload.`,
  );
}
