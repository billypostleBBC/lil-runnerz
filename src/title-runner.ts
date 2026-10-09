import type { CharacterDefinition } from "./game/types";

// Decorative only. Crop each existing run frame to its alpha bounds so every
// runner keeps the reference scale beside the Z despite different sheet padding.
export class TitleRunner {
  readonly canvas = document.createElement("canvas");
  private image?: HTMLImageElement;
  private frames: { x: number; y: number; w: number; h: number }[] = [];
  private animation = 0;
  private pixelArt = false;
  private reduced = matchMedia("(prefers-reduced-motion: reduce)");
  constructor() {
    this.canvas.className = "title-runner";
    this.canvas.setAttribute("aria-hidden", "true");
  }
  async load(definition: CharacterDefinition) {
    const image = new Image();
    image.src = `${import.meta.env.BASE_URL}${definition.character.asset}`;
    try {
      await image.decode();
    } catch {
      return;
    }
    const { frameWidth: w, frameHeight: h } = definition;
    const probe = document.createElement("canvas");
    probe.width = w;
    probe.height = h;
    const context = probe.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const columns = Math.floor(image.width / w);
    const indices =
      definition.character.id === "marty"
        ? [1, 2, 3, 9]
        : [8, 9, 10, 11, 12, 13, 14, 15];
    this.frames = indices.map((index) => {
      const x = (index % columns) * w,
        y = Math.floor(index / columns) * h;
      context.clearRect(0, 0, w, h);
      context.drawImage(image, x, y, w, h, 0, 0, w, h);
      const data = context.getImageData(0, 0, w, h).data;
      let left = w,
        top = h,
        right = 0,
        bottom = 0;
      for (let py = 0; py < h; py++)
        for (let px = 0; px < w; px++) {
          if (data[(py * w + px) * 4 + 3] < 20) continue;
          left = Math.min(left, px);
          top = Math.min(top, py);
          right = Math.max(right, px + 1);
          bottom = Math.max(bottom, py + 1);
        }
      return right > left
        ? { x: x + left, y: y + top, w: right - left, h: bottom - top }
        : { x, y, w, h };
    });
    this.canvas.dataset.character = definition.character.id;
    this.image = image;
    this.pixelArt = definition.pixelArt ?? false;
    this.play();
  }
  play() {
    cancelAnimationFrame(this.animation);
    const draw = (time: number) => {
      if (!this.canvas.isConnected || !this.image) return;
      const bounds = this.canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width * devicePixelRatio));
      const height = Math.max(1, Math.round(bounds.height * devicePixelRatio));
      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
      }
      const c = this.canvas.getContext("2d");
      if (!c) return;
      c.clearRect(0, 0, width, height);
      c.imageSmoothingEnabled = !this.pixelArt;
      c.imageSmoothingQuality = "high";
      const frame =
        this.frames[
          this.reduced.matches ? 0 : Math.floor(time / 95) % this.frames.length
        ];
      const scale = Math.min(
        width / Math.max(...this.frames.map((f) => f.w)),
        height / Math.max(...this.frames.map((f) => f.h)),
      );
      c.drawImage(
        this.image,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        (width - frame.w * scale) / 2,
        height - frame.h * scale,
        frame.w * scale,
        frame.h * scale,
      );
      this.animation = requestAnimationFrame(draw);
    };
    this.animation = requestAnimationFrame(draw);
  }
}
