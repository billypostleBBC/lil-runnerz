// 640/512 = 1.25× closer at the same display size; world units/physics stay unchanged.
export const GAME_VIEW = { width: 512, height: 288 } as const;
export const CAMERA_FLOOR_LINE = 240;

export function followView(input: {
  x: number;
  y: number;
  scrollX: number;
  scrollY: number;
  facing: number;
  width: number;
  height: number;
  dt: number;
  reduced: boolean;
  minimumX?: number;
  revealY?: number;
}) {
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));
  const maxX = Math.max(0, input.width - GAME_VIEW.width);
  const maxY = Math.max(0, input.height - GAME_VIEW.height);
  const targetX = clamp(
    input.x - GAME_VIEW.width / 2 + input.facing * 28,
    input.minimumX ?? 0,
    maxX,
  );
  const screenY = input.y - input.scrollY;
  // One dead zone for every room avoids the old 328→260 threshold jump at the jungle seam.
  let targetY = input.scrollY;
  if (screenY < 90) targetY = input.y - 90;
  else if (screenY > CAMERA_FLOOR_LINE) targetY = input.y - CAMERA_FLOOR_LINE;
  if (!input.reduced && input.revealY !== undefined) targetY = input.revealY;
  const amount = input.reduced ? 1 : 1 - Math.exp(-input.dt / 140);
  const x = clamp(input.scrollX + (targetX - input.scrollX) * amount, 0, maxX);
  const easedY =
    input.scrollY + (clamp(targetY, 0, maxY) - input.scrollY) * amount;
  // A fast fall must not outrun the camera; retain space for the full sprite above its feet.
  const y = clamp(
    clamp(easedY, input.y - GAME_VIEW.height + 20, input.y - 48),
    0,
    maxY,
  );
  return { x, y };
}
