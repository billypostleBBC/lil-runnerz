import type Phaser from "phaser";

// Rooms keep their low-resolution canvas. Draw contributed character artwork
// directly at display resolution so it is not reduced to a tiny pixel sprite.
export class CharacterArtwork {
  private readonly canvas = document.createElement("canvas");
  private readonly context: CanvasRenderingContext2D;
  private readonly observer: ResizeObserver;
  private pixelRatio = 0;

  constructor(private readonly gameCanvas: HTMLCanvasElement) {
    this.canvas.className = "character-artwork";
    this.canvas.setAttribute("aria-hidden", "true");
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Character artwork could not be displayed.");
    this.context = context;
    gameCanvas.parentElement!.append(this.canvas);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(gameCanvas);
    this.observer.observe(gameCanvas.parentElement!);
    this.resize();
  }

  private resize() {
    const bounds = this.gameCanvas.getBoundingClientRect();
    this.pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(bounds.width * this.pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * this.pixelRatio));
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
    this.canvas.style.width = `${bounds.width}px`;
    this.canvas.style.height = `${bounds.height}px`;
    this.canvas.style.left = `${this.gameCanvas.offsetLeft}px`;
    this.canvas.style.top = `${this.gameCanvas.offsetTop}px`;
  }

  draw(
    sprite: Phaser.GameObjects.Sprite,
    camera: Phaser.Cameras.Scene2D.Camera,
    pixelArt: boolean,
  ) {
    if (this.pixelRatio !== window.devicePixelRatio) this.resize();
    const c = this.context;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!sprite.visible) return;

    const frame = sprite.frame;
    const scaleX = this.canvas.width / this.gameCanvas.width;
    const scaleY = this.canvas.height / this.gameCanvas.height;
    c.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    c.translate(sprite.x - camera.scrollX, sprite.y - camera.scrollY);
    c.scale(sprite.scaleX * (sprite.flipX ? -1 : 1), sprite.scaleY);
    c.imageSmoothingEnabled = !pixelArt;
    c.imageSmoothingQuality = "high";
    c.drawImage(
      frame.source.image as CanvasImageSource,
      frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
      -sprite.displayOriginX + frame.x, -sprite.displayOriginY + frame.y,
      frame.cutWidth, frame.cutHeight,
    );
  }

  destroy() {
    this.observer.disconnect();
    this.canvas.remove();
  }
}
