# Snacks, rocket boots and jungle refinements — 9 October 2026

Branch: `codex/collectibles`. These checks were recorded locally before the authorised commit and push. No publication or Webflow Cloud deployment was performed. Raw browser traces and screenshots remain local; the reproducible check scripts and this report accompany the source.

## Delivered

- 28 authored ordinary snack placements across three rooms. Ten varieties, randomly chosen at run start; fixed positions. Each awards 10 points once.
- Three upper-route bonus placements. Currently all choose a clasp-top chilli chutney jar from an extensible one-item pool; each awards 100 points.
- Shared manual/autonomous collection, pickup feedback and announcements, running score, pause/outcome tally and complete new-run/retry reset.
- Autonomous bonus-route pursuit, joining ledges reached during glide, recovery towards the jungle exit after a missed entry, and descent from the summit.
- Bill-e Bot's only power is now rocket boots: one upward impulse at up to 360px/s, four-second cooldown, at most one activation per airtime, landing required before reuse. A stronger existing upward velocity is preserved, not added to. No hazard immunity; waterfall forces retain priority. The 220ms plume is feedback only. UI shows boots, 72px nominal boost rise and rearming state.
- Removed all in-world jungle area lettering and exit marker strips; global HUD/accessibility labels remain.
- Two real entry boulders at local `(288,280,64,32)` and `(520,280,48,32)`, using the dungeon obstacles' 32px rise with faceted mossy rock artwork. Other platforms are unchanged, including the first bonus landing at Y=852.
- Dense filled tree canopy, curved/flared trunk, spreading roots and upper branches. Roots render in front of the river. The snake now descends from a canopy anchor at `(648,740)` and retracts upwards. Shared head/body segments drive rendering and contact. Its 4.4-second cycle, 1.1-second active phase and 400ms warning are retained.
- The snake waiting zone is wide enough to be noticed between reaction ticks at river speed. Marty waits for a complete flame off-phase crossing rather than attempting a jump with marginal descent clearance.

## Automated checks

`npm test`: **56 tests passed** across 10 files. `npm run build`: TypeScript and Vite passed. `git diff --check`: passed. Existing Phaser bundle-size advisory remains; final JavaScript is about **344KB gzip**. No runtime dependency was added.

New tests cover fixed placement with random identities, ordinary/bonus tally, one-time collection, inactive-run exclusion, reset, bonus route landings, avoiding late backtracking over the cave gap, joining a route from glide, missed jungle-entry recovery, rocket impulse/cooldown/airtime limits, invalid rocket speed, no rocket immunity, waterfall priority, boost copy, boulder jumping versus deliberate shelf dropping, canopy snake extension/retraction and shared collision segments, and safe flame crossing including the shorter dungeon off phase. Existing movement, input, camera, character and room tests also passed.

## Browser traversal

Chromium through Playwright CLI. No teleports, invulnerability, time scaling, hazard suppression or physics overrides. Manual runs sent real left/right/Space/Left Shift events, driven by read-only route observations; the game stayed in manual mode.

| Runner | Mode | Outcome | Score | Bonuses | Time |
| --- | --- | --- | --- | --- | --- |
| Bill-e Bot, rocket boots | Autonomous, production build | Won | 540 | 3/3 | 44.212s |
| Marty, hoverboard | Autonomous, production build | Won | 540 | 3/3 | 44.112s |
| Bill-e Bot, rocket boots | Keyboard-driven manual | Won | 530 | 3/3 | 44.439s |
| Marty, hoverboard | Keyboard-driven manual | Won | 530 | 3/3 | 44.052s |

These routes include the entry boulders, river/snake crossing, bonus climb and return to the bottom exit. Production checks used `http://127.0.0.1:4178`; captured page-error lists were empty. Evidence: `jungle-final-auto-bill-e-bot.txt`, `jungle-final-auto-marty.txt`, and `jungle-manual-*-trace.txt`. Earlier `collectibles-*` and `rocket-*` traces document the incremental checks before the final jungle refinements.

The existing first bonus ledge needed no lowering. Before the power change, Bill-e Bot reached it with the ordinary jump, and Marty also reaches it. The successful entry takes off at approximately local X=904 using the existing coyote allowance; it remains deliberately demanding.

## Other browser checks

- Manual snack pickup changed score 0→10; revisiting did not award it again. Pause froze time and position. Starting another run reset score to zero.
- Manual rocket activation increased upward velocity from about -95 to -330px/s after one frame of gravity. Repeated activation did not reset cooldown or apply another impulse. Pause froze cooldown exactly. Landing and recharge allowed another activation. New run reset score, cooldown and airtime lock. `shield` remained false.
- Manual fall death retained **20 points / 2 snacks** in the result copy. Try Again reset score, elapsed time and power state.
- At 375×812 with reduced motion, score and rocket HUD did not overlap or overflow horizontally; native menus and stationary pickup feedback rendered. Narrow results were also inspected. These HUD checks preceded the final jungle artwork changes; the logical game viewport is unchanged.
- Inspected the eleven-sprite contact sheet, live snacks, rocket plume, jungle boulders, summit and results. Inspected a three-phase tree proof using the actual rendering functions: retracted, warning and active snake, with foreground roots and dense canopy. The proof uses reduced-motion water while retaining gameplay snake motion.

Local images include `snack-art-preview.png`, `rocket-boots.png`, `jungle-boulders-*.png`, `jungle-tree-phases.png` and `jungle-final-auto-*.png`. Screenshot files follow the repository's existing ignore rules.

## Implementation files

Collectible definitions: `src/content/collectibles.ts`; collection and bonus decisions: `src/game/collectibles.ts`; original snack artwork: `src/game/snack-art.ts`. Rocket definition/rules and HUD: `src/content/character.ts`, `src/game/rules.ts`, `src/game/scene.ts`, `src/character-presentation.ts`, `src/main.ts`, `src/game/types.ts`, `src/style.css`, `index.html`. Jungle geometry, snake and scenery: `src/content/jungle.ts`, `src/game/jungle.ts`, `src/game/jungle-art.ts`, `src/game/art.ts`. Tests, README, art provenance/style notes and contribution documentation accompany the changes.

## Limits

Autonomous movement remains fallible and uses authored routes; it is not a universal path planner or a guarantee for every character and course. Optional Codex was not separately replayed through all new routes. Manual traversal was driven through real keyboard events by a verification script, not a human usability test. Checks used local Chromium, not a cross-browser/device matrix or hosted Webflow Cloud deployment. Manual play still requires a keyboard on narrow screens.
