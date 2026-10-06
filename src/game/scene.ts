import Phaser from "phaser";
import { characters, defaultCharacterId, getCharacter } from "../content/character";
import { rooms } from "../content/rooms";
import {
  activateShield,
  activateGlide,
  glideVelocity,
  powerActive,
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
import { ManualInput } from "./input";
import { CharacterArtwork } from "./character-artwork";
import type { Actions, Character, CharacterDefinition, Mode, Snapshot, Status } from "./types";

export class CourseScene extends Phaser.Scene {
  private character: Character = getCharacter(defaultCharacterId).character;
  private starting = false;
  private gliding = false;
  private glideLanded = false;
  private hasGrounded = false;
  readonly course = assembleCourse(rooms);
  private player!: Phaser.Physics.Arcade.Sprite;
  private characterArtwork!: CharacterArtwork;
  private backdrop!: Phaser.Textures.CanvasTexture;
  private hazardsArt!: Phaser.Textures.CanvasTexture;
  private shield!: Phaser.GameObjects.Graphics;
  private manual!: ManualInput;
  private controller = new Controller(getCharacter(this.character.id).controllerProfile);
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
  }
  create() {
    validateCharacters(characters);
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
      .setVisible(false)
      // The display-resolution artwork layer draws this sprite; retain its body.
      .setAlpha(0)
      .setOrigin(0.5, 1)
      .setScale(40 / 192)
      .setDepth(5);
    this.player.setCollideWorldBounds(true);
    this.characterArtwork = new CharacterArtwork(this.game.canvas);
    this.game.events.on(Phaser.Core.Events.POST_RENDER, this.drawCharacter, this);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(86, 134).setOffset(53, 68);
    body.updateFromGameObject();
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
          !shieldActive(this.run.shieldAt, this.run.elapsed, this.character.power)
        )
          this.end(
            "dead",
            hazard.kind === "flame"
              ? this.character.power.kind === "shield" ? "Caught by the flames. Time your shield or wait for the embers." : "Caught by the flames. Jump over them or wait for the embers; the board cannot protect you."
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
      this.game.events.off(Phaser.Core.Events.POST_RENDER, this.drawCharacter, this);
      this.characterArtwork.destroy();
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
  private drawCharacter() {
    this.characterArtwork.draw(
      this.player,
      this.cameras.main,
      getCharacter(this.character.id).pixelArt ?? false,
    );
  }
  private lostFocus = () =>
    this.pause("The game lost focus. Resume when you are ready.");
  private canvasLostFocus = () => {
    if (this.run.mode === "manual") this.lostFocus();
  };
  private visibilityChanged = () => {
    if (document.hidden) this.lostFocus();
  };
  selectCharacter(id: string) {
    if (this.run.status !== "ready") return;
    this.character = getCharacter(id).character;
    this.publish();
  }
  private configureCharacter() {
    const marty = this.character.id === "marty";
    this.player.setTexture(`pet:${this.character.id}`, 0).setScale(marty ? 0.5 : 40 / 192).setFlipX(false);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(marty ? 36 : 86, marty ? 56 : 134).setOffset(marty ? 14 : 53, marty ? 20 : 68);
    body.updateFromGameObject();
    body.setMaxVelocity(this.character.speed, 700);
    this.physics.world.gravity.y = this.character.gravity;
  }
  async start(mode: Mode): Promise<void> {
    if (!this.ready || this.starting) return;
    this.starting = true;
    try {
      const definition = getCharacter(this.character.id);
      await this.loadCharacterTexture(definition, `pet:${this.character.id}`);
      this.configureCharacter();
    } catch {
      this.onError(`${this.character.name} artwork could not be loaded. Reload the page to try again.`);
      return;
    } finally {
      this.starting = false;
    }
    this.martyWasAirborne = false;
    this.martyLandedAt = -Infinity;
    this.run = createRun(mode);
    this.gliding = false;
    this.glideLanded = false;
    this.hasGrounded = false;
    this.run.status = "running";
    this.reason = "";
    this.decision =
      mode === "auto" ? "Finding a way through" : "You are in control";
    this.controller = new Controller(getCharacter(this.character.id).controllerProfile);
    this.manual.clear();
    this.player.setPosition(80, 313.25).setVelocity(0, 0);
    this.player.setVisible(true);
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
    this.gliding = false;
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
      if (grounded) {
        this.groundedAt = this.run.elapsed;
        this.hasGrounded = true;
      }
      const actor = {
        x: this.player.x,
        feet: body.bottom,
        halfWidth: body.halfWidth,
        grounded,
      };
      const actions: Actions =
        this.run.mode === "manual"
          ? this.manual.read()
          : { ...this.controller.decide(
              this.run.elapsed,
              actor,
              this.course.solids,
              this.course.hazards,
            ) };
      if (this.run.mode === "auto" && this.character.power.kind === "glide") {
        // Save the board for gaps, rather than spending it on every small step.
        const landingBelow = this.course.solids.some(s =>
          this.player.x >= s.x && this.player.x <= s.x + s.w && s.y >= body.bottom);
        actions.power = !grounded && body.velocity.y >= -40 && !landingBelow;
        // Marty jumps flames because his board offers no immunity.
        if (grounded && this.course.hazards.some(h =>
          h.kind === "flame" && hazardActive(h, this.run.elapsed) &&
          h.x > this.player.x && h.x - this.player.x < 85 && h.y < body.bottom))
          actions.jump = true;
      }
      const target = actions.move * this.character.speed;
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
        this.player.setVelocityY(-this.character.jumpSpeed);
        this.jumpBufferedUntil = 0;
        this.groundedAt = -1000;
      }
      if (grounded) this.glideLanded = true;
      if (actions.power) {
        const at = this.character.power.kind === "glide"
          ? activateGlide(this.run.shieldAt, this.run.elapsed, this.character.power, grounded || !this.hasGrounded)
          : activateShield(this.run.shieldAt, this.run.elapsed, this.character.power);
        if (at !== this.run.shieldAt) this.glideLanded = false;
        this.run.shieldAt = at;
      }
      this.gliding = this.character.power.kind === "glide" && !grounded &&
        !this.glideLanded && powerActive(this.run.shieldAt, this.run.elapsed, this.character.power);
      if (this.gliding)
        this.player.setVelocityY(glideVelocity(body.velocity.y, this.run.shieldAt,
          this.run.elapsed, this.character.power, grounded));
      this.decision =
        this.run.mode === "manual"
          ? (this.gliding ? "Hoverboard glide" : "You are in control")
          : this.gliding ? "Gliding on the hoverboard" : shieldActive(this.run.shieldAt, this.run.elapsed, this.character.power)
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
        this.run.elapsed - this.lastProgressTime >= getCharacter(this.character.id).controllerProfile.stuckMs
      )
        this.end(
          "stuck",
          `${this.character.name} could not find a way forward. Retry, or try the route yourself.`,
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
    if (shieldActive(this.run.shieldAt, this.run.elapsed, this.character.power)) {
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
  private martyWasAirborne = false;
  private martyLandedAt = -Infinity;
  private animatePet() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.character.id === "marty") {
      const airborne = !body.blocked.down && !body.touching.down;
      if (this.run.status === "running") {
        if (this.martyWasAirborne && !airborne) this.martyLandedAt = this.run.elapsed;
        this.martyWasAirborne = airborne;
      }
      let frame = 0;
      if (this.run.status === "dead") frame = 6;
      else if (this.run.status === "won") frame = 7;
      else if (this.gliding) frame = 5;
      else if (airborne && this.run.status !== "ready")
        frame = body.velocity.y < -200 ? 4 : body.velocity.y < 70 ? 10 : 11;
      else if (this.run.elapsed - this.martyLandedAt < 100) frame = 12;
      else if (Math.abs(body.velocity.x) > 8)
        frame = [1, 2, 3, 9][Math.floor(this.run.elapsed / 100) % 4];
      else if (!this.reduced)
        frame = [0, 8, 13, 8][Math.floor(this.run.elapsed / 220) % 4];
      this.player.setFrame(frame).setFlipX(this.facing < 0);
      return;
    }
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
      characterId: this.character.id,
      powerActive: this.gliding || shieldActive(this.run.shieldAt, this.run.elapsed, this.character.power),
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
        this.character.power,
      ),
      cooldown: cooldownLeft(
        this.run.shieldAt,
        this.run.elapsed,
        this.character.power,
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
