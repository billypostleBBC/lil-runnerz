# 16-bit scenery verification — 6 October 2026

## Implementation checks

- `npm test`: 25 tests pass in five files.
- `npm run build`: TypeScript and Vite production build pass. Existing Phaser large-chunk advisory remains (~332KB gzipped JavaScript).
- `git diff --check`: pass.
- `src/content/rooms.ts`, shared rules, input code, character definitions and original character image files have no changes.
- Scene assets are bundled PNGs and use the configured Vite base URL. Both load before the scene reports ready. Requests time out after 15 seconds; missing assets trigger the existing accessible reload-error UI.

## Browser evidence

Chromium, local Vite development and production preview:

| Check | Evidence / result |
| --- | --- |
| Dungeon, cave and room transition | `output/playwright/16bit-dungeon.png`, `16bit-cave.png`, `16bit-join.png`; visually inspected |
| Autonomous completion | Bill-e Bot reached X=2785, status `won`, room 1 |
| Production manual completion | Real keyboard movement/jump/shield inputs reached X=2785, status `won`; `16bit-production-manual-finish.png` |
| Manual input and power | `16bit-manual.png`; movement, upward jump and active shield observed |
| Focus loss / resume | Moving focus off the canvas paused the run; explicit resume cleared held movement input |
| Ordinary death | Walking into the dungeon pit produced the normal death outcome and retry action |
| Failed scenery request | Aborted dungeon PNG produced visible reload error; `16bit-asset-error.png`; browser route removed afterwards |
| Narrow display / reduced motion | 375×812, no horizontal overflow, reduced-motion state enabled; `16bit-mobile.png` |

All scenery shots use the bundled Bill-e Bot rather than the temporary Codex artwork. Screenshots remain local under the repository's existing ignore policy. Generated source images are preserved unchanged under `public/assets/scenery/`.

## Limits

This pass covers local Chromium, not deployed Webflow Cloud, all browsers, physical low-power devices or native OS focus switching. Art changes were checked against existing room definitions; no new gameplay, route or power was introduced. The two original panorama files total 3,432,657 bytes (~3.3 MiB). This is an explicit local asset cost; no external runtime image service is used.


## Jungle water detail — 8 October 2026

Replaced flat fills and regular dash patterns with stepped teal shading, irregular falling ribbons, fine highlights, foam crests, shaded currents and a defined whirlpool throat. Rendering remains clipped to the existing water regions. No collision, water-force, room-layout or character rules changed. `AGENTS.md` already requires 16-bit-inspired scenery; the style guide now explicitly applies that quality bar to water.

- `npm run build` passes (existing Phaser chunk advisory remains); all 39 tests pass.
- Chromium local-game traversal with Bill-e Bot in autonomous mode reaches the bottom finish at 34.004 seconds. Inspected waterfall and pool screenshots against the backdrop.
- Isolated canvas readback: zero painted pixels outside water bounds; zero changed channels between reduced-motion renders at 0 and 9999ms; 117,191 changed channels in the animated comparison.
- Comparison: `output/playwright/water-before-after.png`. In-game captures: `water-detail-waterfall.png`, `water-detail-pool.png` in the same directory.
- A temporary comparison fixture initially replaced the game DOM and caused a missing-HUD error in that fixture. It was corrected to an overlay and rerun; the game was reloaded and temporary fixture source files removed. No application fix was needed.
- No deployment performed. Manual physics and powers are unchanged and were not exhaustively rerun for this rendering-only change.


### Water bank dressing — 8 October 2026

Added stepped mossy boulders, small shrubs and fern fronds on both sides of the waterfall lips and whirlpool. Added cream-white foam caps, short airborne droplets and impact spray above the plunge pool. Gameplay geometry and forces are unchanged.

Verified the actual Canvas rendering functions in a browser composition with the checked-in jungle backdrop and terrain at 2× nearest-neighbour scale; inspected `output/playwright/water-bank-detail.png`. This is a detail composition, not a gameplay-camera screenshot. Reduced-motion water frames at 0 and 9999ms were pixel-identical. Production build passed (existing large Phaser bundle advisory). Full gameplay traversal was not repeated for this decorative follow-up.

### Basin floor and cliff — 8 October 2026

Extended the basin floor to X=0 and the room bottom, and added a solid X=0–100 cliff below the arrival shelf. The cliff uses the existing shared static collision system, dressed with mossy stone and vines. Inspected the updated browser-rendered detail composition (`output/playwright/water-bank-detail.png`). All 39 tests and the production build passed; the existing Phaser bundle-size advisory remains. Bill-e Bot completed the full autonomous course and bottom exit in 34.012 seconds. Manual attempts to push against the new wall have not been separately exercised. No deployment performed.

### Concealed water edges and connected river — 8 October 2026

Moved bank dressing into the foreground water pass so it actually overlaps the water. Added irregular stone/creeper borders along the waterfall, rim stones beneath the whirlpool and a stepped pool surface tapering into the outflow; removed the right pool shrub cluster that blocked the visual connection. Inspected `output/playwright/water-bank-detail.png` using the real drawing functions and backdrop in the browser. Reduced-motion frames remain pixel-identical at 0 and 9999ms.

Extended the river force region from X=560 back to X=350, directly adjoining the pool. The initial autonomous run exposed drift into the snake while waiting; added a failing regression for that behaviour, then changed waiting to ordinary left input against the current and updated the death hint. All 40 tests and the production build passed (existing bundle-size advisory). The updated Bill-e Bot autonomous run completed the bottom exit in 34.153 seconds. Full manual/bonus traversal was not repeated. No deployment performed.

### Continuous left banks and themed terrain — 8 October 2026

Added the missing left bank between cliff and waterfall at Y=560. Kept the waterfall chute clear. Stopped cliff artwork at the basin surface so the existing continuous lower floor remains visible. Jungle solids now show moss, mottled mud and roots; cave solids show fractured teal rock and minerals; dungeon masonry is retained. Inspected browser-rendered detail and material comparisons (`output/playwright/water-bank-detail.png`, `output/playwright/room-terrain-materials.png`). All 40 tests and the production build passed, with the existing bundle-size advisory. A fresh Bill-e Bot autonomous run completed all three rooms in 34.079 seconds. Manual/bonus traversal was not repeated. No deployment performed.
