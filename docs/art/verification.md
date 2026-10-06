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
