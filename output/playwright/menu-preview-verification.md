# Random main-menu preview verification — 9 October 2026

Menu-only changes: src/main.ts selects an actual course room and an available character once per splash visit; src/game/scene.ts previews that room with paused physics and a hidden gameplay player; src/style.css reveals the existing renderer under the menu veil; src/title-runner.ts prevents a slower previous image load replacing a newer selection. Existing gameplay changes were preserved. No branch switch, commit, push or deployment.

- Production build passed; existing Vite large-chunk warning remains.
- All 56 tests passed (10 files).
- Browser check: all three rooms observed via normal menu navigation, captured and visually inspected.
- Room, character and run snapshot stayed stable between updates. Reduced-motion setting updates did not reselect either.
- Title canvas animated normally and stayed static under reduced motion.
- 390 × 844 viewport: no horizontal overflow; screenshot visually inspected.
- ArrowDown from Start Game focused How to Play.
- Manual and autonomous starts returned to room 0, x=80, feet=312, cameraX=0, cameraY≈73, score/snacks/bonuses=0.
- Manual start restored the visible gameplay character; screenshot visually inspected.
- Random character changes observed between Codex and Bill-e Bot. A supplementary check for Marty, selection/back navigation and manual movement could not run: its CLI process exited with code 137. Those supplementary checks remain unverified.
- Browser verification reported no page errors.

Reproducible browser script: menu-preview-check.js (Playwright CLI run-code --filename).
Screenshots in this directory: menu-ember-vault.png, menu-hollow-grotto.png, menu-jungle-run.png, menu-mobile.png, menu-marty.png, menu-start-manual.png, menu-start-auto.png.

Full-course completion was not repeated for this menu-only change; the preceding gameplay work reported its own completion checks. Hosted behaviour remains unverified.
