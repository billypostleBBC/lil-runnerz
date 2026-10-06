import Phaser from "phaser";
import {
  characters,
  defaultCharacterId,
} from "../content/character";
import { rooms } from "../content/rooms";
import {
  activateShield,
  advanceRun,
  assembleCourse,
  Controller,
  cooldownLeft,
  createRun,
  hazardActive,
  shieldActive,
  transition,
  validateCharacters,
} from "./rules";
import { paintBackground, paintHazards, paintTerrain } from "./art";
import { resolveCharacterRuntime } from "./character-runtime";
import { ManualInput } from "./input";
import type {
  Actions,
  CharacterDefinition,
  Mode,
  Snapshot,
  Status,
} from "./types";

export class CourseScene extends Phaser.Scene {
  readonly course = assembleCourse(rooms);
  private player!: Phaser.Physics.Arcade.Sprite;
  private backdrop!: Phaser.Textures.CanvasTexture;
  private hazardsArt!: Phaser.Textures.CanvasTexture;
  private shield!: Phaser.GameObjects.Graphics;
  private manual!: ManualInput;
  private active: CharacterDefinition = resolveCharacterRuntime(
    defaultCharacterId,
  ).definition;
  private controller = new Controller(this.active.controllerProfile);
  private run = createRun("auto");
  private reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  private reason = "";
  private decision = "Ready when you are";
  private lastProgressX = 80;
  private lastProgressTime = 0;
  private lastPublish = 0;
  private jumpBufferedUntil = 0;
  private groundedAt = -1000;
  private finishX = this.course.width - 96;
  private facing = 1;
  private ready = false;
  constructor(
    private onSnapshot: (s: Snapshot) => void,
    private onReady: () => void,
    private onError: (message: string) => void,
  ) {
    super("course");
    validateCharacters(characters);
  }
  create() {
    this.backdrop = this.textures.createCanvas("backdrop", 640, 360)!;
    this.add
      .image(0, 0, "backdrop")
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-10);
    const terrain = this.textures.createCanvas(
      "terrain",
      this.course.width,
      this.course.height,
    )!;
    paintTerrain(terrain.context, this.course);
    terrain.refresh();
    this.add.image(0, 0, "terrain").setOrigin(0).setDepth(1);
    this.hazardsArt = this.textures.createCanvas(
      "hazards",
      this.course.width,
      this.course.height,
    )!;
    this.add.image(0, 0, "hazards").setOrigin(0).setDepth(2);
    this.physics.world.setBounds(
      0,
      -100,
      this.course.width,
      this.course.height + 300,
      true,
      true,
      false,
      false,
    );
    const ground = this.physics.add.staticGroup();
    for (const solid of this.course.solids) {
      const zone = this.add
        .zone(solid.x, solid.y, solid.w, solid.h)
        .setOrigin(0);
      this.physics.add.existing(zone, true);
      ground.add(zone);
    }
    this.player = this.physics.add
      .sprite(80, 313.25, "__WHITE", 0)
      .setOrigin(0.5, 1)
      .setVisible(false)
      .setDepth(5);
    this.player.setCollideWorldBounds(true);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(this.active.character.speed, 700);
    this.physics.add.collider(this.player, ground);
    for (const hazard of this.course.hazards) {
      const zone = this.add
        .zone(hazard.x, hazard.y, hazard.w, hazard.h)
        .setOrigin(0);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player, zone, () => {
        if (
          this.run.status === "running" &&
          hazardActive(hazard, this.run.elapsed) &&
          !shieldActive(
            this.run.shieldAt,
            this.run.elapsed,
            this.active.character.power,
          )
        )
          this.end(
            "dead",
            hazard.kind === "flame"
              ? "Caught by the flames. Time your shield or wait for the embers."
              : "Those spikes bite. Jump over them or take the upper route.",
          );
      });
    }
    this.shield = this.add.graphics().setDepth(6);
    this.cameras.main
      .setBounds(0, 0, this.course.width, this.course.height)
      .setRoundPixels(true);
    this.manual = new ManualInput(
      () =>
        this.run.status === "running" &&
        this.run.mode === "manual" &&
        document.activeElement === this.game.canvas,
      () => this.pause("Paused. Take your time."),
    );
    window.addEventListener("blur", this.lostFocus);
    this.game.canvas.addEventListener("blur", this.canvasLostFocus);
    document.addEventListener("visibilitychange", this.visibilityChanged);
    this.motionQuery.addEventListener("change", this.motionChanged);
    this.events.once("shutdown", () => {
      this.manual.destroy();
      window.removeEventListener("blur", this.lostFocus);
      this.game.canvas.removeEventListener("blur", this.canvasLostFocus);
      document.removeEventListener("visibilitychange", this.visibilityChanged);
      this.motionQuery.removeEventListener("change", this.motionChanged);
    });
    this.physics.pause();
    this.ready = true;
    this.publish();
    this.onReady();
  }
  private motionChanged = (e: MediaQueryListEvent) => {
    this.reduced = e.matches;
    this.publish();
  };
  private lostFocus = () =>
    this.pause("The game lost focus. Resume when you are ready.");
  private canvasLostFocus = () => {
    if (this.run.mode === "manual") this.lostFocus();
  };
  private visibilityChanged = () => {
    if (document.hidden) this.lostFocus();
  };
  async start(mode: Mode, characterId: string): Promise<void> {
    if (!this.ready) return;
    const runtime = resolveCharacterRuntime(characterId);
    try {
      await this.loadCharacterTexture(runtime.definition, runtime.textureKey);
    } catch {
      this.onError(
        `${runtime.definition.character.name} artwork could not be loaded. Reload the page to try again.`,
      );
      return;
    }
    this.active = runtime.definition;
    this.run = createRun(mode);
    this.run.status = "running";
    this.reason = "";
    this.decision =
      mode === "auto" ? "Finding a way through" : "You are in control";
    this.controller = new Controller(this.active.controllerProfile);
    this.manual.clear();
    this.player
      .setTexture(runtime.textureKey, 0)
      .setScale(40 / this.active.frameWidth)
      .setPosition(80, 313.25)
      .setVelocity(0, 0)
      .setVisible(true);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body
      .setSize(
        (86 / 192) * this.active.frameWidth,
        (134 / 208) * this.active.frameHeight,
      )
      .setOffset(
        (53 / 192) * this.active.frameWidth,
        (68 / 208) * this.active.frameHeight,
      );
    body.setMaxVelocity(this.active.character.speed, 700);
    body.setGravityY(this.active.character.gravity);
    body.updateFromGameObject();
    this.facing = 1;
    this.lastProgressX = 80;
    this.lastProgressTime = 0;
    this.jumpBufferedUntil = 0;
    this.groundedAt = -1000;
    this.cameras.main.setScroll(0, 0);
    this.physics.resume();
    this.publish();
  }
  private loadCharacterTexture(
    definition: CharacterDefinition,
    textureKey: string,
  ): Promise<void> {
    if (this.textures.exists(textureKey)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        this.load.off("complete", complete);
        this.load.off("loaderror", failed);
      };
      const complete = () => {
        cleanup();
        resolve();
      };
      const failed = (file: Phaser.Loader.File) => {
        if (file.key !== textureKey) return;
        cleanup();
        reject(new Error(`Failed to load ${definition.character.name}.`));
      };
      this.load.once("complete", complete);
      this.load.on("loaderror", failed);
      this.load.spritesheet(
        textureKey,
        `${import.meta.env.BASE_URL}${definition.character.asset}`,
        {
          frameWidth: definition.frameWidth,
          frameHeight: definition.frameHeight,
        },
      );
      this.load.start();
    });
  }
  pause(reason = "Paused. Take your time.") {
    this.manual?.clear();
    if (this.run.status !== "running") return;
    this.run.status = transition(this.run.status, "pause");
    this.reason = reason;
    this.physics.pause();
    this.publish();
  }
  resume() {
    if (this.run.status !== "paused") return;
    this.manual.clear();
    this.player.setVelocityX(0);
    this.jumpBufferedUntil = 0;
    this.run.status = transition(this.run.status, "resume");
    this.reason = "";
    this.physics.resume();
    this.publish();
  }
  menu() {
    if (!this.ready) return;
    this.manual.clear();
    this.physics.pause();
    this.run = createRun(this.run.mode);
    this.reason = "";
    this.decision = "Ready when you are";
    this.player.setPosition(80, 313.25).setVelocity(0, 0);
    this.cameras.main.setScroll(0, 0);
    this.publish();
  }
  private end(status: "dead" | "won" | "stuck", reason: string) {
    if (this.run.status !== "running") return;
    this.run.status = transition(
      this.run.status,
      status === "dead" ? "die" : status === "won" ? "win" : "stuck",
    );
    this.reason = reason;
    this.manual.clear();
    this.player.setVelocity(0, 0);
    this.physics.pause();
    this.publish();
  }
  update(_time: number, delta: number) {
    if (!this.ready) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.run.status === "running") {
      const dt = Math.min(delta, 50);
      this.run = advanceRun(this.run, dt);
      const grounded = body.blocked.down || body.touching.down;
      if (grounded) this.groundedAt = this.run.elapsed;
      const actor = {
        x: this.player.x,
        feet: body.bottom,
        halfWidth: body.halfWidth,
        grounded,
      };
      const actions: Actions =
        this.run.mode === "manual"
          ? this.manual.read()
          : this.controller.decide(
              this.run.elapsed,
              actor,
              this.course.solids,
              this.course.hazards,
            );
      const target = actions.move * this.active.character.speed;
      const rate = ((actions.move ? 1500 : 2100) * dt) / 1000;
      this.player.setVelocityX(
        Phaser.Math.Clamp(
          target,
          body.velocity.x - rate,
          body.velocity.x + rate,
        ),
      );
      if (actions.move) this.facing = actions.move;
      if (actions.jump) this.jumpBufferedUntil = this.run.elapsed + 100;
      if (
        this.jumpBufferedUntil > this.run.elapsed &&
        (grounded || this.run.elapsed - this.groundedAt < 75)
      ) {
        this.player.setVelocityY(-this.active.character.jumpSpeed);
        this.jumpBufferedUntil = 0;
        this.groundedAt = -1000;
      }
      if (actions.power)
        this.run.shieldAt = activateShield(
          this.run.shieldAt,
          this.run.elapsed,
          this.active.character.power,
        );
      this.decision =
        this.run.mode === "manual"
          ? "You are in control"
          : shieldActive(
                this.run.shieldAt,
                this.run.elapsed,
                this.active.character.power,
              )
            ? "Shielding against danger"
            : !grounded
              ? body.velocity.y < 0
                ? "Making the jump"
                : "Finding a landing"
              : body.blocked.right || Math.abs(body.velocity.x) < 8
                ? "Looking for a route"
                : "Watching the path ahead";
      if (body.bottom > this.course.height + 40)
        this.end(
          "dead",
          "A long way down. Jump closer to the edge on your next attempt.",
        );
      else if (this.player.x >= this.finishX && body.bottom <= 320)
        this.end("won", "Two rooms, one continuous run. You made it out.");
      if (this.player.x > this.lastProgressX + 6) {
        this.lastProgressX = this.player.x;
        this.lastProgressTime = this.run.elapsed;
      }
      if (
        this.run.mode === "auto" &&
        this.run.elapsed - this.lastProgressTime >=
          this.active.controllerProfile.stuckMs
      )
        this.end(
          "stuck",
          `${this.active.character.name} could not find a way forward. Retry, or try the route yourself.`,
        );
      this.followCamera(dt);
    }
    this.animatePet();
    const cam = this.cameras.main;
    paintBackground(
      this.backdrop.context,
      cam.scrollX,
      cam.scrollY,
      this.run.elapsed,
      this.reduced,
      this.course,
    );
    this.backdrop.refresh();
    paintHazards(
      this.hazardsArt.context,
      this.course,
      this.run.elapsed,
      this.reduced,
      (h) => hazardActive(h, this.run.elapsed),
    );
    this.hazardsArt.refresh();
    this.shield.clear();
    if (
      shieldActive(
        this.run.shieldAt,
        this.run.elapsed,
        this.active.character.power,
      )
    ) {
      this.shield.lineStyle(2, 0xabe7c2, 1);
      this.shield.strokeRoundedRect(
        Math.round(this.player.x - 21),
        Math.round(this.player.y - 43),
        42,
        44,
        8,
      );
      this.shield.lineStyle(1, 0x5da9a3, 0.5);
      this.shield.strokeRoundedRect(
        Math.round(this.player.x - 24),
        Math.round(this.player.y - 46),
        48,
        50,
        10,
      );
    }
    if (_time - this.lastPublish > 100) {
      this.publish();
      this.lastPublish = _time;
    }
  }
  private animatePet() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let frame = 0;
    if (this.run.status === "dead") frame = 42;
    else if (this.run.status === "won")
      frame = 64 + (Math.floor(this.run.elapsed / 150) % 4);
    else if (!body.blocked.down && this.run.status === "running")
      frame = 33 + (body.velocity.y > 0 ? 1 : 0);
    else if (Math.abs(body.velocity.x) > 8)
      frame =
        (this.facing > 0 ? 8 : 16) + (Math.floor(this.run.elapsed / 95) % 8);
    else frame = this.reduced ? 0 : Math.floor(this.run.elapsed / 400) % 6;
    this.player.setFrame(frame);
  }
  private followCamera(dt: number) {
    const cam = this.cameras.main;
    const targetX = Phaser.Math.Clamp(
      this.player.x - 300 + this.facing * 28,
      0,
      this.course.width - 640,
    );
    const amount = this.reduced ? 1 : 1 - Math.exp(-dt / 125);
    cam.scrollX += (targetX - cam.scrollX) * amount;
    // Vertical dead zone avoids camera bobbing on ordinary jumps.
    const screenY = this.player.y - cam.scrollY;
    if (screenY < 100)
      cam.scrollY = Phaser.Math.Clamp(
        this.player.y - 100,
        0,
        this.course.height - 360,
      );
    else if (screenY > 328)
      cam.scrollY = Phaser.Math.Clamp(
        this.player.y - 328,
        0,
        this.course.height - 360,
      );
  }
  snapshot(): Snapshot {
    const body = this.player?.body as Phaser.Physics.Arcade.Body | undefined;
    return {
      characterId: this.active.character.id,
      status: this.run.status,
      mode: this.run.mode,
      elapsed: Math.round(this.run.elapsed),
      x: this.player?.x ?? 80,
      feet: body?.bottom ?? 312,
      vx: body?.velocity.x ?? 0,
      vy: body?.velocity.y ?? 0,
      grounded: body?.blocked.down ?? false,
      room: Math.max(
        0,
        this.course.rooms.findIndex(
          (room) => (this.player?.x ?? 80) < room.offset + room.width,
        ),
      ),
      progress: Phaser.Math.Clamp(
        ((this.player?.x ?? 80) - 80) / (this.finishX - 80),
        0,
        1,
      ),
      shield: shieldActive(
        this.run.shieldAt,
        this.run.elapsed,
        this.active.character.power,
      ),
      cooldown: cooldownLeft(
        this.run.shieldAt,
        this.run.elapsed,
        this.active.character.power,
      ),
      decision: this.decision,
      reason: this.reason,
      cameraX: this.cameras?.main?.scrollX ?? 0,
      cameraY: this.cameras?.main?.scrollY ?? 0,
      reducedMotion: this.reduced,
    };
  }
  private publish() {
    this.onSnapshot(this.snapshot());
  }
}
