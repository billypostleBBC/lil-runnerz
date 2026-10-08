# Arcade refinements — 7 October 2026

## Changes

- Original angular/slashed SVG Z with a short lower-right tail, readable accessible lil-runnerz title. A random available runner per page load uses existing running frames; per-frame alpha bounds align feet to the Z's lower stroke. Selection remains independent. Canvas renders at device resolution; pixel source art retains crisp sampling.
- Bevelled retro selection panels, fixed top heading and bottom actions, independently scrollable centre, reserved description height, no visible controls block in selection. Help/accessibility retain instructions. Desktop preview doubles to 192×208 for Bill-e Bot/Codex; Marty preserves its source proportions. Smaller viewports adapt to 144×156. Stepped light replaces the smooth glow.
- Five-cell absolute capability scales and exact values; Power duration label; inverse recharge scale. See docs/art/style-guide.md for thresholds. No upgrades or changed character capabilities.
- Shared 1.25× closer framing through a 512×288 logical viewport. Physics, sprites' world dimensions and room layouts unchanged. Camera uses a shared 90–240 vertical dead zone, 28px look-ahead, 140ms easing and world-bound/fast-fall visibility guards.
- Cave-to-jungle jump root cause: the previous lower threshold changed from 328 to 260 on room entry and directly clamped scrollY. The replacement uses one threshold and eased movement across rooms.
- Physical Left Shift replaces X. Arrows and WASD both navigate menus; Enter and Escape retained. Text-editing fields are excluded. The scrollable selection region remains keyboard reachable with Tab.

## Verification performed

- Red/green tests for capability ratings, physical power binding/clearing and closer camera continuity/bounds. Final `npm test`: 39 tests pass across eight files. `npm run build` and `git diff --check` pass. Existing Phaser bundle advisory remains (~337 KB gzip JS).
- Chromium 1280×720, 390×844 and 1024×500: header near top, bottom actions fully within frame and non-overlapping centre. Action rectangles identical across Bill-e Bot/Codex/Marty. Character preview, stats, keyboard focus and screenshots inspected. Narrow preview scales to 144×156; 3:2 frame remains 390×260.
- WASD navigation exercised in all four directions; left/right runner changes update artwork/stats; Enter enters run controls. No visible selection-controls block. Preview animation is `none` with reduced motion.
- Four page loads sampled title picks Codex/Bill-e Bot/Bill-e Bot/Codex; returning from selection kept the current choice. Earlier render also showed Marty. Title canvas was unchanged over time under reduced motion. Desktop and narrow title screenshots inspected.
- Full Bill-e Bot autonomous course completion in ~34.0 seconds, normal and narrow/reduced-motion. Both measured a maximum vertical delta of 0 through x=2750–3000 around the cave/jungle seam. Camera stayed within x=0–3488, y=0–832. Normal run y range 37–832; reduced run 35–832.
- Actual manual keyboard driver traversed dungeon/cave/jungle, crossed seam, descended waterfall, jumped from river into bonus route and climbed to the bonus area at y=492. Camera followed down and back up (y=673 at first bonus ledge to y=375 at top). No teleporting, physics changes or invulnerability. The driver reuses existing route observations to issue keyboard input. It stopped/paused at bonus, not a newly verified manual finish.
- Left Shift while D held activated shield with vx=160; reactivation during cooldown was rejected. Simulated window blur paused and cleared D; explicit resume kept x unchanged and vx=0. Shift in menus and Shift/A in autonomous mode did not activate power or override autonomous movement. Unit tests also reject X/right Shift and repeat-triggered activations.

## Files and evidence

Implementation: index.html; src/main.ts; src/style.css; src/title-runner.ts; src/character-presentation.ts; src/game/camera.ts; src/game/scene.ts; src/game/input.ts. Supporting changes: README.md, docs/art/style-guide.md, docs/development-plan.md, docs/marty.md; tests/camera.test.ts, tests/input.test.ts, tests/character-presentation.test.ts; existing keyboard drivers updated to Left Shift. New arcade-refinement-*.js scripts reproduce browser checks.

Screenshots under output/playwright/:
- refined-title.png and refined-title-mobile.png
- refined-selection.png, refined-selection-marty.png, refined-selection-mobile.png, refined-selection-short.png
- refined-camera-seam.png, refined-camera-jungle.png, refined-camera-bonus.png
- refined-camera-mobile-seam.png, refined-camera-mobile-jungle.png

Local preview: http://127.0.0.1:5175/

No deployment, publishing or commit performed in this pass. Cross-browser/native OS focus handling and full Marty traversal were not expanded. Existing optional Codex artwork remains local/ignored. UI and camera changes were isolated from room definitions, physics and power rules.
