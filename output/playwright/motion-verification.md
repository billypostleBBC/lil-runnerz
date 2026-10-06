# Character motion investigation — 6 October 2026

## Timing change

Changed only the Arcade Physics fixed rate in `src/main.ts`, from 60 to 120 steps per second. The browser delivered frames at approximately 120 Hz. Previously the camera could advance on frames where the character position repeated.

- Before: 82 repeated positions among 163 sampled moving frames (velocity above 150 px/s), mean frame interval 8.33 ms.
- After: 3 repeats among 179 sampled moving frames, mean frame interval 8.33 ms. Browser scheduling can still produce occasional repeats; this does not promise zero judder on every display.
- Bill-e Bot completed autonomous play in 17.233 seconds at the native render cadence.
- Production preview with requestAnimationFrame callbacks deliberately delivered every second refresh (approximately 60 Hz): Bill-e Bot completed in 17.218 seconds. This is a simulated cadence, not a separate physical 60 Hz display.
- Manual movement, jump, shield and pause checked for Bill-e Bot; manual movement, jump and active power checked for Codex and Marty in the production preview, using keyboard input.
- All 25 tests and TypeScript/Vite production build passed. Existing large engine-bundle advisory remains.
- Source change read back; `git diff --check` passed. No deployment.

## Separate artwork limitation

The user still observed crunchy artwork after the timing change. Bill-e Bot uses detailed, smoothly shaded 192 × 208 source frames scaled to 40 × 43.33 game pixels. Its opaque running silhouette occupies approximately 24 × 40 game pixels. The face and other fine features therefore lose detail before the game canvas is enlarged for display. Raising the physics rate does not address this.

Frozen identical gameplay frames using CSS `pixelated` and `crisp-edges` produced byte-identical screenshots in the tested Chromium browser. No CSS change was retained. No camera, artwork, collision geometry or character capability changes were made. Further art-direction work should distinguish a deliberately authored small pixel sprite from a detailed illustration reduced to a small raster; increasing camera zoom alone cannot recover detail already discarded at the current internal resolution.

Evidence: `motion-before.png`, `motion-pixelated.png`, `motion-crisp.png`, `motion-manual-pause.png`, `motion-codex-manual.png`, `motion-marty-manual.png`, `motion-60hz-production-finish.png`.
