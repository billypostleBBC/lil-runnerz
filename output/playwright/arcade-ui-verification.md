# Arcade UI verification — 6 October 2026

Changed index.html, src/main.ts and src/style.css. The outer screen is 3:2; the existing 640×360 simulation and camera remain inside it with slim internal HUD bands. No physics, controller or content definitions changed.

- Production build and TypeScript check passed; all 25 existing tests passed; git diff --check passed. Vite retains its large Phaser bundle warning.
- Chromium desktop 1280×720: inspected splash, all three runner choices and complete selection controls, gameplay and pause. Screenshots: arcade-splash.png, arcade-selection.png, arcade-run.png.
- Chromium 390×844: screen measured 390×260 (3:2); cabinet hidden; help and selection actions reachable by scrolling inside the screen. Screenshots: arcade-mobile-splash.png and arcade-mobile-selection.png.
- Enter on the initial focused start button opens selection. Manual movement, jump, Escape pause, resume and simulated window-blur pause checked.
- Autonomous Bill-e Bot completed both rooms, reporting won at 17.24 seconds. Mode/character selection remained available afterwards.
- Manual Bill-e Bot ran, jumped the first obstacle and fell into a pit; death explanation and retry controls appeared inside the frame.
- Help/back navigation and fullscreen enter/exit passed in Chromium.

Limitations: no deployment, no cross-browser suite or touch/gamepad controls. A full manually controlled winning run was not repeated for this UI change. Small-screen selection intentionally scrolls rather than expanding the game frame.

Additional checks: manual retry returned to running; intentionally blocking the dungeon image produced the useful scenery error and Reload game control. Removing the block and reloading restored the splash screen.

## Detailed surround and menu follow-up

- Reused the approved generated surround itself, replacing the CSS-drawn speakers, bezel and controls. Inspected desktop screenshots `arcade-detailed-splash.png` and `arcade-detailed-selection.png`.
- Splash Down navigation reaches Help, Settings and wraps to Start; Enter opens selection. Native left/right selects Codex and Marty and updates the visible right-column avatar. Enter moves from runner to Auto-run; Right moves to Manual run; Enter starts the manual run.
- Escape pauses; Down moves to Change character / mode and Enter returns to selection.
- Restored preview reports `runner-bob` animation normally and `none` under emulated reduced motion. At 390×844 the game remains 390×260; the avatar is reachable within the scrolling menu (`arcade-avatar-mobile.png`).
- Production build and all 25 tests passed after the changes.

## Shared yellow menu styling

All screen/error actions now share transparent backgrounds, cream pixel text and a yellow focused/hovered arrow and label. Character selection uses yellow borders/text with a focus arrow and a separate checked marker. Removed turquoise menu outlines and filled action buttons. Chromium confirmed focused menu colour rgb(255, 189, 89) and outline none; inspected arcade-yellow-menu.png and arcade-yellow-selection.png. Vite bundling and whitespace checks passed.

Full build was blocked by concurrent jungle tests referencing not-yet-present modules. During result-screen verification, concurrent jungle content then caused the running app to report `Room jungle-run: invalid name or theme`; the common styling is applied to result actions, but the final result-screen browser check could not complete. Jungle implementation files were not changed for this styling task.

## Gameplay HUD consistency

Replaced the legacy run-bar/game-footer styling with shared pixel HUD styling. Removed the timer and live decision commentary from HTML and snapshot updates. Retained room, mode, pause and power status in cream/yellow inside the fixed frame. Production build passed. Chromium manual gameplay screenshot inspected (`arcade-clean-hud.png`); confirmed zero legacy bar/timer/decision elements, working pause, and autonomous mode with the 390×260 narrow-screen frame.
