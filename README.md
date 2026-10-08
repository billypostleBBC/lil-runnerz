# lil-runnerz — Into the hollow

A local three-room platformer slice with Bill-e Bot, local Marty McFly work and an optional Codex pet, a dungeon leading continuously into a cave and a descending jungle, and manual or autonomous play. No accounts, backend, live AI or hosted services are used.

## Run locally

Repository: [billypostleBBC/lil-runnerz](https://github.com/billypostleBBC/lil-runnerz). The game is named lil-runnerz.

Bill-e Bot is bundled at `public/assets/bill-e-bot.png`, so a fresh clone is immediately playable. The temporary `public/assets/codex.webp` sprite remains excluded because redistribution rights are unresolved. When that authorised local file is absent, Codex stays visible in the picker as “Local artwork required” and Bill-e Bot remains playable. Screenshots containing the temporary Codex sprite also remain local.

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

Choose **Start game**, select a runner, then choose **Auto-run** or **Manual run**. Bill-e Bot is selected by default. Use left/right arrows or A/D to move, Space to jump, Left Shift for the selected power and Escape to pause. Marty uses an airborne hoverboard glide; see `docs/marty.md`. Manual play pauses when focus leaves the canvas. Both modes pause on a window blur or hidden-document event. Resume explicitly; held movement input is cleared. Menus support arrow keys or WASD, Enter selection, Escape back and visible yellow focus. The active power uses physical Left Shift; X is no longer bound. Reduced motion removes decorative flame flicker, background drift, title/preview animation and camera easing. Gameplay uses 1.25× closer framing (512×288 world units), shared by both modes.

One life; retry starts the whole course again. Shield protects against contact hazards for 0.8 seconds, with a 4-second cooldown from activation. It does not save you from a pit. Timers freeze while paused. Flames show an amber warning 0.4 seconds before reigniting. The run ends by crossing the marked bottom opening in Jungle Run. In the jungle, steer left after the first drop, wait for the spider, descend the waterfall, push right out of the whirlpool and time entry into the river past the snake. A jump at the final river lip reaches the optional bonus climb; collectibles are not implemented.

## Visual direction

Scenery follows the approved 16-bit Ember Vault treatment: detailed worn masonry, recessed arches, weathered chains, stepped amber lighting and readable pale platform edges. The Hollow Grotto uses the same pixel craftsmanship in cool teal rock and minerals. Background panoramas are bundled locally; platforms, vents, chains, torches and effects are drawn separately, so decorative art cannot change collisions. All room geometry and gameplay rules remain independent of graphics.

See [the art guide](docs/art/style-guide.md), [generation prompts](docs/art/generation-prompts.md) and [asset provenance](public/assets/PROVENANCE.md). Character artwork keeps its original style. Scenery loading completes before play is enabled; a missing backdrop shows a reload error. No runtime AI service is involved.

## Tune autonomous behaviour

Edit the relevant entry in `src/content/character.ts`. Changes are applied on reload. Each `controllerProfile` affects autonomous decisions only; no server or admin screen is needed.

| Setting                | Default | Observable effect                                                                                                                  |
| ---------------------- | ------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| `perceptionDistance`   |   140px | Maximum distance at which the controller can inspect nearby geometry/hazards. Values shorter than jump lead can cause missed gaps. |
| `reactionMs`           |   120ms | How often decisions refresh. Longer intervals can miss take-off windows.                                                           |
| `jumpLead`             |    22px | Distance ahead of the leading edge probed for safe footing or a step.                                                              |
| `powerTriggerDistance` |    52px | Distance at which an active or warning flame prompts shield use. Must fit inside perception.                                       |
| `stuckMs`              |  6000ms | Time without at least 6px of new route progress before a clear stuck outcome.                                                    |

The original rooms use nearby geometry and visible hazard timing. Jungle Run adds an authored three-part route (right, left, right) and timed waits; it aims for the exit rather than the optional bonus climb. It jumps spikes rather than wasting its shield on them. No randomness or learning is added. It can fail with a less capable profile or different challenge. A repeat attempt under identical conditions is expected to behave similarly.

The character's physical `speed` (160px/s), `jumpSpeed` (410px/s upwards) and `gravity` (900px/s²) affect both modes. Nominal jump height is about 93px; fixed-step integration yields a slightly lower actual apex. There is 75ms of coyote time and 100ms of jump buffering in both modes. A future character definition can provide its own controller profile without changing shared physics or power rules.

## Content and room contract

- `src/content/rooms.ts`: independent local room definitions and curated order.
- `src/content/character.ts`: the character roster, display copy, physical capabilities, power and controller profiles.
- `src/game/rules.ts`: validation, course assembly, power/run rules and autonomous decisions.
- `src/game/scene.ts`: shared Phaser movement/collision, simulation timing, input selection and camera.
- `src/game/art.ts`: detailed pixel foregrounds and animated effects, clearly separated from collision data.
- `public/assets/scenery/`: bundled 16-bit background panoramas; `docs/art/style-guide.md` is the art contract for future rooms.
- `docs/rooms/`: authored creative briefs and a separate reference layout. Jungle Run includes Billy’s original sketch and reviewed design.
- `public/assets/PROVENANCE.md`: character and scenery provenance; Fontsource packages contain font licences.

A room uses top-left origin, X right, Y down, in logical pixels. The original rooms are 1440×432 with floor Y=312; Jungle Run is 1120×1120 with a matching upper entrance. Left/right connections require matching floor height and clearance, but room heights may differ. Explicit `edge`, `x`, `y` and `clearance` fields support a bottom exit connecting to a top entrance. The assembler translates both axes and rejects overlapping placements, blocked openings, missing floor support, invalid water bounds and malformed hazards. Bottom/top assembly is covered by a receiving-room fixture in the tests; the shipped jungle is the last room.

All three rooms share one physics world. Crossing a seam preserves the character, velocity, power state and time. Solid platforms are rectangular, not one-way. Decorative scenery is not solid; pale top edges identify real platforms. `src/content/jungle.ts` owns the jungle layout and water regions; `src/game/jungle.ts` owns deterministic force, creature position and route rules. The divider reaches the ceiling and extends below the upper bonus ledges; its lower opening requires the river-edge jump. See [the room brief](docs/rooms/jungle-run.md) for exact implemented rules and verification.

To author another local room, copy a room definition, assign a unique ID, preserve the connection contract and add it to the room list. Follow [the 16-bit art guide](docs/art/style-guide.md) and update the themed art if a new theme is needed. Current scenery supports dungeon, cave and jungle; this is not yet a generic room editor.

### Contribute a character

Keep each contributor's original artwork and visual identity. Differences between character styles are intentional; characters do not need to match the rooms' pixel art. The game draws their source frames on a display-resolution layer over the low-resolution scenery, without changing their world size or collision bodies. Smooth resampling is the default for illustrated artwork; set `pixelArt: true` for intentionally pixel-authored sheets, as Marty does. Original asset files remain unchanged.

Add a unique entry to `characters` in `src/content/character.ts`. Supply its name, local `assets/...` path, display description and tagline, sprite cell dimensions, movement values, shield timing and autonomous controller profile. Set `bundled: true` only when the artwork may be redistributed in this public repository. Run `npm test` and `npm run build`; roster validation rejects duplicate IDs, unsafe paths, malformed profiles and invalid sprite dimensions.

Current pets use the animated v2 sheet contract: 8 columns × 11 rows with 192×208-pixel cells. Place a distributable sheet in `public/assets/` and document its origin and permission in `public/assets/PROVENANCE.md`. Do not add remote runtime image URLs. A different superpower is a focused code contribution: it needs explicit gameplay rules, visible feedback and tests rather than descriptive configuration alone.

## Verification and scope

See `docs/development-plan.md` for the current milestone, actual checks and remaining limitations. Browser evidence lives in `output/playwright/`. `window.__jumpa.snapshot()` and `.content()` return read-only copies for local inspection; they cannot move the character, skip hazards or change the run.

This slice runs locally. Its source is shared through GitHub; Webflow Cloud configuration, deployment and hosted checks are deferred. Bill-e Bot is distributed with the repository; the temporary Codex pet and captured Codex screenshots remain local.
