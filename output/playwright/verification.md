# Browser verification — 5 October 2026

Playwright CLI against the real Chromium-rendered local app. Physics, collision and hazards remained active throughout gameplay checks. Manual traversal used keyboard events; no teleporting, health overrides or hazard suppression.

## Gameplay evidence

- Autonomous default profile: complete course in about 17.1 seconds, X=2785 (finish X=2784). Holding left and pressing jump/power did not override the controller: X continued increasing, grounded, without an input-triggered shield.
- Manual: remained at X=80 without input; keyboard traversal completed in about 17.0 seconds. Left/right movement, jump, shield and mode reset exercised.
- Manual ordinary death: walked into the first pit after clearing the plinth. Died at feet Y=478.5 with shield still active. The shield correctly does not protect against falling.
- Room connection: walked backwards from cave into dungeon (X=1403.79, room 0, shield active, cooldown 3475ms), then forwards into cave (X=1457.68, room 1, cooldown 2917ms). Floor remained Y=312; camera remained in the course; no cooldown reset.
- Focus-loss handler: injected a browser blur event while holding D with an active shield. Paused at elapsed 158ms, X=94.37, cooldown 3861ms. After 500ms these values were unchanged. Explicit Resume left X unchanged and velocity zero without another keydown. Tab switches did not emit a reliable blur/visibility event in this automated session; an actual operating-system focus switch remains a human smoke check.
- Native keyboard focus loss on the final production build: Shift+Tab moved focus from the game canvas and paused at elapsed 125ms, X=87.504, active shield/cooldown 3899.89ms. State remained frozen after 500ms. Explicit resume cleared held D; X remained unchanged and velocity was zero. This complements the injected window-blur check above.
- Keyboard menus: Shift+Tab wrapped to the primary action; Tab returned to the selected radio; arrow key changed mode; Tab/Enter started the run. Controls appear before manual play. Pause and outcomes move focus to the action.
- 375×812 viewport: scroll width exactly 375px, no horizontal overflow; menu, controls and gameplay inspected. Reduced-motion preference propagated to the scene and autonomous play continued.
- Final production preview on port 4173: autonomous finish at 17.231 seconds, no page errors and no HTTP responses of 400 or above during reload and run. TypeScript and all 12 unit tests passed; Vite production build passed with its standard engine-bundle size advisory.

## Deliberate failure fixtures

Interceptions affected local module/asset responses in the browser only. Source room definitions and the delivered controller profile were restored unchanged.

- Perception reduced to 12px (power trigger 10px): autonomous character died in the first pit at about 3.3 seconds. Retry reset mode/time/position/power correctly.
- First plinth replaced by a valid 152px-high obstacle: controller stopped at X=279.04; six seconds without progress produced the explicit stuck outcome at about 7.3 seconds.
- Cave entrance changed to an incompatible height: useful named room-connection error and reload action.
- Pet image request aborted: useful image-load error and reload action. Removing the interception and reloading restored the ready screen.

## Evidence files

- `01-start.png`: initial desktop menu.
- `02-dungeon.png`, `03-join.png`, `04-cave.png`: rendered gameplay and continuous room boundary.
- `05-auto-outcome.png`, `06-manual-outcome.png`: completed runs.
- `07-asset-error.png`: deliberate asset failure.
- `08-mobile-menu.png`, `09-mobile-play.png`: smaller display / reduced-motion checks.
- `10-production-finish.png`: production-preview autonomous completion.
- `11-production-manual-finish.png`: final production-preview manual completion after the focus-scoping fix.

Earlier screenshots precede minor text-size and code-formatting refinements. Final preview captures are identified separately.
