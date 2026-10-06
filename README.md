# Jumpa — Into the hollow

A local two-room platformer slice: one temporary Codex pet, a dungeon leading continuously into a cave, and manual or autonomous play. No accounts, backend, live AI or hosted services are used.

## Run locally

Repository: [billypostleBBC/lil-runnerz](https://github.com/billypostleBBC/lil-runnerz). Jumpa remains the working in-game name.

**Fresh-clone requirement:** the temporary `public/assets/codex.webp` sprite is excluded from this public repository because redistribution rights are unresolved. The existing local workspace retains it. A clone can run tests and build, but gameplay requires an authorised sprite at that path matching the sheet contract in `public/assets/PROVENANCE.md`; otherwise the game shows its asset-loading error. A redistributable replacement is needed for a self-contained public playable version. Screenshots containing the temporary sprite also remain local.

Node.js 22.12+ (verified here with 24.19.0) and npm:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. For a production build and local preview:

```sh
npm test
npm run build
npm run preview
```

`npm run check` runs TypeScript without a build. The dependency lock is included. Phaser 3.90 is deliberately pinned; a game-engine major upgrade is not required for this slice. The production bundle includes the engine (about 328KB gzipped at first build); Vite reports its standard large-chunk advisory. All fonts and artwork load locally. Keyboard required for manual play; autonomous viewing works on smaller displays. Audio is deferred.

## Play

Choose **Watch Codex** or **Take control** before a run. Use left/right arrows or A/D to move, Space to jump, X to shield and Escape to pause. Manual play pauses when focus leaves the canvas. Both modes pause on a window blur or hidden-document event. Resume explicitly; held movement input is cleared. Menus support keyboard navigation and visible focus. Reduced motion removes decorative flame flicker, background drift and camera easing.

One life; retry starts the whole course again. Shield protects against contact hazards for 0.8 seconds, with a 4-second cooldown from activation. It does not save you from a pit. Timers freeze while paused. Flames show an amber warning 0.4 seconds before reigniting. The run ends at the cave's lit doorway and chequered flag.

## Tune autonomous behaviour

Edit `src/content/character.ts`. Changes are applied on reload. `controllerProfile` affects autonomous decisions only; no server or admin screen is needed.

| Setting                | Default | Observable effect                                                                                                                  |
| ---------------------- | ------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| `perceptionDistance`   |   140px | Maximum distance at which the controller can inspect nearby geometry/hazards. Values shorter than jump lead can cause missed gaps. |
| `reactionMs`           |   120ms | How often decisions refresh. Longer intervals can miss take-off windows.                                                           |
| `jumpLead`             |    22px | Distance ahead of the leading edge probed for safe footing or a step.                                                              |
| `powerTriggerDistance` |    52px | Distance at which an active or warning flame prompts shield use. Must fit inside perception.                                       |
| `stuckMs`              |  6000ms | Time without at least 6px of new forward progress before a clear stuck outcome.                                                    |

The controller reads nearby geometry and visible hazard timing, not the entire route or the camera view. It jumps spikes rather than wasting its shield on them. No randomness or learning is added. It can fail with a less capable profile or different challenge. A repeat attempt under identical conditions is expected to behave similarly.

The character's physical `speed` (160px/s), `jumpSpeed` (410px/s upwards) and `gravity` (900px/s²) affect both modes. Nominal jump height is about 93px; fixed-step integration yields a slightly lower actual apex. There is 75ms of coyote time and 100ms of jump buffering in both modes. A future character definition can provide its own controller profile without changing shared physics or power rules.

## Content and room contract

- `src/content/rooms.ts`: independent local room definitions and curated order.
- `src/content/character.ts`: the temporary character, physical capabilities, power and controller profile.
- `src/game/rules.ts`: validation, course assembly, power/run rules and autonomous decisions.
- `src/game/scene.ts`: shared Phaser movement/collision, simulation timing, input selection and camera.
- `src/game/art.ts`: original deterministic pixel scenery, clearly separated from collision data.
- `docs/rooms/`: authored creative briefs and a separate reference layout. No contributor source images were supplied for this slice.
- `public/assets/PROVENANCE.md`: temporary pet source; Fontsource packages contain font licences.

A room uses top-left origin, X right, Y down, in logical pixels. Current rooms are 1440×432 with floor Y=312. Width may differ. Neighbouring rooms must share world height and exit/entrance floor height; no implicit vertical teleport or scaling is performed. Entrance and exit specify clear floor widths (96px in these examples, minimum 64px). Validation rejects missing support, obstructed portals, out-of-bounds geometry, duplicate IDs and malformed hazards.

The course assembler adds horizontal offsets once. Both rooms are loaded into the same physics world. Crossing the seam does not recreate the character or reset velocity, shield state, timers or camera. Solid platforms use rectangular collision and are not one-way. Decorative pillars, crystals and rocks are not solid; continuous pale top edges identify platforms. The authored briefs are the reference for checking layout intent.

To author another local example, copy a room definition, assign a unique ID, preserve the connection contract and add it to the room list. Update the themed art if a new theme is needed. Current scenery supports dungeon and cave only; this is not yet a generic room editor. New powers require explicit rules, feedback and tests. Character selection and public contribution workflows are deferred to the next milestone.

## Verification and scope

See `docs/development-plan.md` for the current milestone, actual checks and remaining limitations. Browser evidence lives in `output/playwright/`. `window.__jumpa.snapshot()` and `.content()` return read-only copies for local inspection; they cannot move the character, skip hazards or change the run.

This slice runs locally. Its source is shared through GitHub; Webflow Cloud configuration, deployment and hosted checks are deferred. The temporary Codex pet and captured screenshots remain local and are not distributed in the repository.
