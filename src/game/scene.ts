import { CAMERA_FLOOR_LINE, GAME_VIEW, followView } from "./camera";
import { creatureRect, crossedExit, jungleActions, jungleStage, overlaps, waterVelocity } from "./jungle";
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
import { paintBackground, paintHazards, paintTerrain, type Scenery } from "./art";
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
  private scenery!: Scenery;
  private hazardsArt!: Phaser.Textures.CanvasTexture;
  private shield!: Phaser.GameObjects.Graphics;
  private manual!: ManualInput;
  private controller = new Controller(getCharacter(this.character.id).controllerProfile);
  private run = createRun("auto");
  private reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  private reason = "";
  private decision = "Ready when you are";
  private lastProgressTime = 0;
  private lastPublish = 0;
  private jumpBufferedUntil = 0;
  private groundedAt = -1000;
  private facing = 1;
  private routeStage = 0;
  private nextJungleDecision = 0;
  private jungleDecision: Actions = { move: 0, jump: false, power: false };
  private walkVelocity = 0;
  private previousPosition = { x: 80, feet: 312 };
  private bestRouteProgress = 0;
  private ready = false;
  constructor(
    private onSnapshot: (s: Snapshot) => void,
    private onReady: () => void,
    private onError: (message: string) => void,
  ) {
    super("course");
  }
  preload() {
    this.load.image("scenery:dungeon", `${import.meta.env.BASE_URL}assets/scenery/ember-vault.png`, { responseType: "blob", timeout: 15000 });
    this.load.image("scenery:jungle", `${import.meta.env.BASE_URL}assets/scenery/jungle-run.png`, { responseType: "blob", timeout: 15000 });
    this.load.image("scenery:cave", `${import.meta.env.BASE_URL}assets/scenery/hollow-grotto.png`, { responseType: "blob", timeout: 15000 });
  }
  create() {
    if (!this.textures.exists("scenery:dungeon") || !this.textures.exists("scenery:cave") || !this.textures.exists("scenery:jungle")) {
      this.onError("Room scenery could not be loaded. Check your connection and reload the page.");
      return;
    }
    this.scenery = {
      jungle: this.textures.get("scenery:jungle").getSourceImage() as HTMLImageElement,
      dungeon: this.textures.get("scenery:dungeon").getSourceImage() as HTMLImageElement,
      cave: this.textures.get("scenery:cave").getSourceImage() as HTMLImageElement,
    };
    validateCharacters(characters);
    this.backdrop = this.textures.createCanvas("backdrop", GAME_VIEW.width, GAME_VIEW.height)!;
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
      if (hazard.kind === "spider" || hazard.kind === "snake") continue;
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
              : this.course.rooms.some(room => room.theme === "jungle" && hazard.x >= room.offset && hazard.x < room.offset + room.width)
                ? "You overshot the landing. Steer left as you drop from the first ledge."
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
    body.setMaxVelocity(this.character.speed + 110, 700);
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
    (this.player.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
    this.player.setVisible(true);
    this.facing = 1;
    this.routeStage = 0;
    this.nextJungleDecision = 0;
    this.walkVelocity = 0;
    this.previousPosition = { x: 80, feet: 312 };
    this.bestRouteProgress = 0;
    this.lastProgressTime = 0;
    this.jumpBufferedUntil = 0;
    this.groundedAt = -1000;
    this.cameras.main.setScroll(0, Math.max(0, this.player.y - CAMERA_FLOOR_LINE));
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
    this.walkVelocity = 0;
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
    this.bestRouteProgress = 0;
    this.walkVelocity = 0;
    this.gliding = false;
    this.reason = "";
    this.decision = "Ready when you are";
    this.player.setPosition(80, 313.25).setVelocity(0, 0);
    (this.player.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
    this.cameras.main.setScroll(0, Math.max(0, this.player.y - CAMERA_FLOOR_LINE));
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
      const room = this.course.rooms.find(r => this.player.x >= r.offset && this.player.x < r.offset + r.width &&
        body.bottom >= r.offsetY && body.bottom <= r.offsetY + r.height + 100) ?? this.course.rooms[0];
      const inJungle = room.theme === "jungle";
      const localActor = { ...actor, x: actor.x - room.offset, feet: actor.feet - room.offsetY };
      if (inJungle) this.routeStage = jungleStage(this.routeStage, localActor.feet);
      if (inJungle && this.run.mode === "auto" && this.run.elapsed >= this.nextJungleDecision) {
        const profile = getCharacter(this.character.id).controllerProfile;
        this.jungleDecision = jungleActions(localActor, this.routeStage, this.run.elapsed, room.hazards, profile.perceptionDistance);
        this.nextJungleDecision = this.run.elapsed + profile.reactionMs;
      }
      const actions: Actions =
        this.run.mode === "manual"
          ? this.manual.read()
          : inJungle ? { ...this.jungleDecision }
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
      this.walkVelocity = Phaser.Math.Clamp(target, this.walkVelocity - rate, this.walkVelocity + rate);
      this.player.setVelocityX(this.walkVelocity);
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
      const bodyRect = { x: body.x, y: body.y, w: body.width, h: body.height };
      for (const h of this.course.hazards) {
        if ((h.kind === "spider" || h.kind === "snake") && hazardActive(h, this.run.elapsed) &&
          overlaps(bodyRect, creatureRect(h, this.run.elapsed)) &&
          !shieldActive(this.run.shieldAt, this.run.elapsed, this.character.power))
          this.end("dead", h.kind === "spider" ? "The spider caught you. Wait for it to climb, then pass underneath." :
            "The snake struck. Steer against the current, then pass during its recovery.");
      }
      if (inJungle && this.run.status === "running") {
        for (const water of room.water ?? []) {
          if (!overlaps(bodyRect, { ...water, x: water.x + room.offset, y: water.y + room.offsetY })) continue;
          const velocity = waterVelocity(water.kind, body.velocity.x, body.velocity.y,
            localActor.x - (water.x + water.w / 2), this.character.speed);
          this.player.setVelocity(velocity.vx, velocity.vy);
          if (water.kind === "waterfall") this.gliding = false;
          this.decision = water.kind === "waterfall" ? "The waterfall pulls you down" :
            water.kind === "whirlpool" ? "Push right to escape the whirlpool" : "Riding the current — jump at the lip for the bonus climb";
        }
        if (this.run.mode === "auto" && actions.move === 0) this.decision = "Waiting for a safe crossing";
        if (localActor.x > 924 && localActor.feet < 530) this.decision = "Bonus area reached — collectibles coming later";
      }
      const final = this.course.rooms.at(-1)!;
      const exit = { ...final.exit, x: final.offset + (final.exit.x ?? final.width - 96), y: final.offsetY + final.exit.y };
      if (crossedExit(exit, this.previousPosition, { x: this.player.x, feet: body.bottom }))
        this.end("won", "Three rooms, one expedition. You dropped out of Jungle Run!");
      else if (body.bottom > room.offsetY + room.height + 40)
        this.end("dead", "A long way down. Aim for a landing or the marked exit on your next attempt.");
      this.previousPosition = { x: this.player.x, feet: body.bottom };
      const routeProgress = inJungle ? room.offset + this.routeStage * 1200 +
        (this.routeStage === 1 ? room.width - localActor.x : localActor.x) : this.player.x;
      if (routeProgress > this.bestRouteProgress + 6) {
        this.bestRouteProgress = routeProgress;
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
      this.scenery,
      GAME_VIEW.width, GAME_VIEW.height,
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
    const room = this.course.rooms.find(r => this.player.x >= r.offset && this.player.x < r.offset + r.width);
    const deepJungle = room?.theme === "jungle" && this.player.y > room.offsetY + 420;
    const approachingDrop = room?.theme === "jungle" && this.player.x - room.offset > 600 &&
      this.player.x - room.offset < 760 && this.player.y - room.offsetY < 420;
    const next = followView({
      x: this.player.x, y: this.player.y, scrollX: cam.scrollX, scrollY: cam.scrollY,
      facing: this.facing, width: this.course.width, height: this.course.height,
      dt, reduced: this.reduced, minimumX: deepJungle ? room.offset : 0,
      // Keep the first landing visible before the commitment; clamped to retain the runner.
      revealY: approachingDrop ? room.offsetY + 264 : undefined,
    });
    cam.setScroll(next.x, next.y);
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
          (room) => (this.player?.x ?? 80) >= room.offset && (this.player?.x ?? 80) < room.offset + room.width &&
            (body?.bottom ?? 312) >= room.offsetY && (body?.bottom ?? 312) <= room.offsetY + room.height + 100,
        ),
      ),
      progress: Phaser.Math.Clamp(
        this.run.status === "won" ? 1 : this.bestRouteProgress / (this.course.width + 2400),
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
