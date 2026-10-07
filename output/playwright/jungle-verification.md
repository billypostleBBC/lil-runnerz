# Jungle Run — local verification, 6 October 2026

## Implemented

Jungle Run is the third room, after the unchanged dungeon/cave collision layouts. It has a right/left/right descent, overshoot spike pit, retracting/swinging spider, forced waterfall, escapable whirlpool, rightward river current, timed snake lunge, protected bonus climb and bottom finish. The bonus climb is entered by a timed jump at the river lip; its ceiling-height divider prevents access from the spike pit. Collectibles remain deferred.

The original HEIC and reviewed brief are in `docs/rooms/`. Final geometry is in `src/content/jungle.ts`; forces, animated creature bounds and route decisions are in `src/game/jungle.ts`; runtime integration is in `src/game/scene.ts`. Room assembly now supports right/left and bottom/top pairs, matching clearance and translated X/Y geometry. A test receiving room proves bottom/top assembly; no fourth room is shipped.

## Automated checks

- `npm test`: **34 tests pass** across six files. New tests cover forced descent, counter-steering/river boost, whirlpool escape, creature movement, safe crossing windows, directional exit crossing, bottom opening obstruction, bottom/top coordinate translation, invalid water geometry/directions and the bonus divider's exclusion geometry.
- `npm run build`: TypeScript and Vite build pass. Existing Phaser chunk advisory remains: approximately 336KB gzip JavaScript. Jungle backdrop adds about 2.4MB of local PNG artwork; no runtime AI request or new dependency.
- `git diff --check`: clean.

## Browser checks performed

Chromium via Playwright CLI, using actual keyboard events and read-only diagnostics. No teleporting, invulnerability, physics override or hazard suppression was used to manufacture traversal. The manual driver uses route observations to send normal left/right/Space/X input; it does not put the game into autonomous mode.

- Bill-e Bot autonomous traversal reaches the bottom finish in about 34 seconds. Production preview was checked at `http://127.0.0.1:4180/`; no page errors occurred in the successful run. Holding left in autonomous mode does not override its rightward movement.
- Manual traversal reaches the river, executes the timed edge jump, lands on the first bonus ledge, climbs all six further rises and reaches the marked bonus area. Returning down the alternating ledges then reaches the bottom finish. See `jungle-manual-trace.txt`, `jungle-return-trace.txt` and `jungle-bonus.png`.
- Deliberately holding right on the jungle drop causes spike death. Retry resets elapsed time, power and position; changing to autonomous mode resets again. See `jungle-failure-trace.txt` and `jungle-spike-death.png`. That check found a one-frame stale body position in immediate reset diagnostics; `updateFromGameObject()` now synchronises the body before publishing start/menu snapshots. The jungle spike error now explains steering left, rather than suggesting a nonexistent upper bypass.
- While paused, position and simulation time remain unchanged. Moving keyboard focus away from the canvas while right is held pauses the run. Explicit resume clears held input: X stays unchanged and velocity is zero. Evidence is in `jungle-return-trace.txt`.
- Blocking the jungle PNG produces the scenery loading error and reload action. Removing the block and reloading recovers. The expected request-abort console error belongs only to this deliberate failure test. See `jungle-load-error.png` and `jungle-ui-trace.txt`.
- At 375×812 with reduced motion, the menu has no horizontal overflow and Bill-e Bot completes the course. The anticipatory camera exposes the first landing and spike tips before the drop. See `jungle-narrow-drop.png` and `jungle-narrow-trace.txt`.
- Desktop rendering inspected for waterfall, bonus wall/ledges, character clarity and hazard separation. The generated jungle backdrop matches the standing scenery references; pale platform edges, moving creatures and water regions are separate runtime graphics.

Reproduction helpers are the `jungle-*-check.js` and `jungle-manual-driver.js` files here. They are Playwright CLI `run-code --filename` functions, not shipped game code. Development checks expect port 5176; production checks expect 4180.

## Practical limits

- This is a local implementation. No publishing, deployment, Git push or hosted Webflow Cloud check was performed.
- Autonomous behaviour is intentionally fallible. Marty’s checked autonomous attempt died at the existing cave flame before reaching Jungle Run. Do not infer that all characters complete every course. The complete jungle/bonus browser traversal above was with Bill-e Bot; waterfall-over-glide precedence is covered by the shared force rule test, not a complete Marty jungle browser run.
- Creature warning/contact bounds share deterministic simulation rules, but an exhaustive matrix of every power against every creature phase was not browser-tested. User review should assess difficulty, timing and scenery quality.
- Bottom/top joins are tested in assembly; an actual fourth room and live traversal into it remain future work. Upward or leftward inter-room connections are not implemented.
- Cross-browser/device performance and native OS app-switch handling were not expanded in this change. Narrow screens support viewing; manual play still needs a keyboard.
