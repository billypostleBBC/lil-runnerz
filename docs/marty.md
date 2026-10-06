# Marty McFly

Requested contribution: Marty McFly in the existing 8-bit / pet-like style, with a hoverboard that extends a jump as a glide. No reference image was supplied. Original pixel drawing in `scripts/marty-sprite.py`; regenerate with `python3 scripts/marty-sprite.py`. The sheet has fourteen 64 × 80 frames: three idle poses, four running poses, take-off, knee tuck, descent, landing, hoverboard, defeat and victory. Running includes opposing arm swings. The idle bob is disabled for reduced-motion preferences. Grey high-tops use white straps and cyan soles based on the supplied shoe reference. The finer grid adds facial and clothing detail with slimmer proportions; half-scale rendering preserves the original world size and collision bounds. It is independent of the bundled Codex pet artwork.

Marty is selectable alongside Codex before a run. Both have 160 logical pixels/second movement, 410 pixels/second initial jump velocity and 900 pixels/second² gravity (roughly 93 pixels of jump height). These values affect both play modes.

## Hoverboard rules

- Press X whilst airborne to deploy; a grounded press does not spend the power.
- Maximum 1.2 seconds, ending early on landing. Landing cancels the remainder, so a second jump cannot reuse it.
- Caps downward velocity at 65 pixels/second, preserving upward momentum. No added lift, double jump or immunity to flames/spikes.
- Four-second recharge measured from activation, using unpaused simulation time.
- Autonomous Marty deploys near the jump apex over a gap (vertical velocity at least −40 pixels/second, with no solid landing directly below). He jumps towards nearby active flames instead of relying on Codex's shield.
- Manual movement and activation use the same physics and power limits. Focus loss pauses play and clears held keys; resume is explicit.

These are reversible tuning defaults. The existing rooms and hazards were preserved; this character is not guaranteed to survive every autonomous attempt. Local implementation only; no deployment performed.
