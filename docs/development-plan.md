# lil-runnerz — two-room development plan

Date: 5 October 2026
Status: Stage 1 and the second-character selection milestone are implemented and locally verified. Course expansion and deployment remain unstarted.
The confirmed game name is lil-runnerz (renamed on 6 October 2026).

## Intended result

A polished local browser game for Billy and Ruin to assess: one temporary Codex pet, one working superpower, and a dungeon connected continuously to a cave. Both manual and autonomous modes use the same physics, collision, hazards, power and run-state rules. The room connection is a central acceptance criterion. The user explicitly confirmed that even the subsequent MVP may remain local; Webflow hosting is a later stage, not an acceptance requirement for this slice or the local MVP.

Course construction screens remain deferred. Also excluded: multiplayer, accounts, databases, live AI, public submissions and deployment. Audio and touch/gamepad controls are deferred implementation defaults.

## Proposed implementation defaults

- TypeScript and Vite for the browser app; Phaser for rendering, animation, cameras and Arcade Physics. Native HTML buttons and text for mode choice, instructions, pause and outcomes.
- Local development and local production preview are the current targets. Resolve compatible stable package versions at implementation and lock dependencies. Keep gameplay browser-only. Webflow Cloud configuration and hosting checks are deferred.
- Use Vite asset imports or BASE_URL for constructed asset paths to keep the app portable. No production mount path or hosting adapter is needed for the local slice. Verify the local production preview and its assets; local verification does not prove hosting works.
- Use the bundled blue Codex pet temporarily. Its sprite sheet was located and visually inspected in the installed app. Preserve the source and record provenance; this is not a claim of a redistribution licence. Keep any public release of the temporary asset unresolved until release review.
- Temporary power: a visible protective shield, initially 0.8 seconds active with a 4-second cooldown measured from activation. It protects against contact hazards, not falling into a pit. Limits are tunable; displayed instructions must match final values. Manual activation uses X; autonomous activation uses the same action interface and rules.
- Keyboard: A/D or left/right arrows; Space to jump; X for shield; Escape to pause. Clear held input on focus loss and require explicit resume. Instructions precede play.
- One life, restart from the beginning, no checkpoint or scoring system. Preserve power state, position and velocity across the room boundary. Pause simulation and cooldowns together.
- Two independently defined rooms, fixed dungeon-then-cave order, preloaded into one world. No loading screen, teleport or player recreation at the join.
- Establish a consistent logical pixel scale, readable pixel typography and a restrained charcoal/cream/amber/turquoise palette. Pixel rendering, clear solid edges, visible hazard shapes and reduced decorative motion take precedence over CRT effects.

## Autonomous behaviour

Competent but fallible, with limited local perception rather than knowledge of the full course. No scripted route that bypasses the decision controller, and no live model calls.

Keep the tuning profile in one documented configuration file. Use parameters with observable units: perception distance, reaction delay, jump timing tolerance and power trigger distance. Validate ranges and cross-field constraints. Feed the profile to the controller independently of physics and rendering so later character definitions can supply different profiles. Physical speed and jump parameters remain separate and affect both modes.

Prefer reproducible decision rules. If variation is needed, seed it for repeatable checks. Do not add arbitrary random failure solely to make the character fallible. Reduced perception and delayed decisions should explain mistakes. Include a bounded stuck outcome with a useful restart action.

## Stage 1 — overnight review milestone

The following are internal work steps within one stage, not separate approval stops:

1. Establish the app, dependency lock and content structure. Add a shared action interface, character definition, validated controller profile, room contract and asset failure handling.
2. Build a complete playable journey through two separate room definitions. The dungeon demonstrates stepping, jumping and a timed contact hazard; the cave adds gaps, elevation and an alternate route. Preserve authored briefs and layout diagrams separately from collision data.
3. Dress both rooms with distinct pixel scenery and parallax layers. Make the connecting passage visible as masonry gives way to rock. Add pet animation, shield feedback, gentle camera follow, mode instructions, pause, finish, death and retry states.
4. Run focused tests and browser checks, fix relevant failures, verify the production build, and prepare a local preview plus evidence and known limitations.

Room contract: local coordinates originate at top-left; positive X is right, positive Y down. Record room size, entrance/exit position and clearances, collision geometry, hazard definitions, theme and asset references. A course assembler translates room-local data into world coordinates and rejects incompatible connections with useful errors. Exact dimensions are chosen during implementation and documented.

## Acceptance and evidence

- Both modes can complete the same two-room course using normal actions. Record successful runs; tests may drive the action interface but must not teleport or suppress hazards to manufacture success.
- Verify ordinary death and restart in both modes. Mode changes happen between attempts and fully reset state. Manual input cannot override autonomous play; autonomous decisions never run movement in manual mode.
- Verify shield activation, expiration, cooldown, hazard protection and pit death. Verify state continuity and collision at the room join, including traversal back across it.
- Automated checks cover deterministic power/run transitions, profile/content validation and room connections. Use red-green-refactor where these tests are useful. Browser checks exercise actual collisions, jump/control behaviour and outcomes.
- Verify manual focus-loss pause, explicit resume and cleared keys. Test pause while shield is active and while keys are held.
- Verify the autonomous stuck outcome and the effect of changing at least two tuning parameters. Explain which profile settings affect autonomous play only.
- Reject invalid definitions and missing assets with a useful error instead of starting a broken run. Test a relevant failure path.
- Inspect the rendered game at desktop and smaller display sizes: camera continuity, pixel clarity, foreground/background distinction, hazards, readable instructions, keyboard menus, visible focus and reduced-motion treatment. Narrow displays may offer autonomous viewing with a clear keyboard requirement for manual play.
- Compare rooms against their authored briefs/layout diagrams. Record screenshots from each room and the join; document how to run the app and change the controller profile.
- Run type checking, relevant tests and a production build. Check asset loading in the local production preview. Report actual results and exact gaps, without claiming hosted verification.

Human review is reserved for whether the character is entertaining, manual control feels responsive, the art feels coherent and the two rooms feel like one continuous course. Automated tests cannot decide these qualities.

## Authority and stopping rules

Once execution is authorised, make routine reversible implementation decisions and continue through Stage 1. Preserve AGENTS.md. Keep a compact progress record in this document, including evidence and unresolved issues. No remote publishing, collaborator invitations or deployment is authorised.

Local browser checks are part of the proposed implementation and verification work. The supplied Webflow-specific browser restriction applies to Webflow platform work, which remains plugin-only and is outside this local stage. No overnight scheduler has been created and no unattended runtime guarantee has been made.

Stop at the complete playable Stage 1 review checkpoint. If three materially different approaches to the same blocker make no meaningful progress, complete independent in-scope work and report the blocker. Do not weaken acceptance checks or expand scope to claim completion.

## Later stages — not authorised by this plan

2. Apply feedback and expand towards approximately five rooms. Character choice now has two entries, and Bill-e Bot demonstrates an independently authored, redistributable contribution using the documented character contract.
3. Prepare a release candidate for the chosen Webflow Cloud site, mount path and repository. Resolve temporary asset use and run release checks. Deploy only with explicit authorisation, then verify the hosted app and both modes at the actual path.

Course construction UI is deferred; its scope is not defined by this plan.

## Research and current evidence

- Initial workspace inspection found only AGENTS.md; no implementation existed.
- Bundled asset inspected: app.asar/webview/assets/codex-spritesheet-v6-51045ae208c0.webp in the installed ChatGPT/Codex app. Preview extracted to a temporary directory only.
- Webflow Cloud support and asset-path guidance queried through the installed Webflow plugin on 5 October 2026: [framework adaptations](https://developers.webflow.com/webflow-cloud/environment/framework-customization), [configuration](https://developers.webflow.com/webflow-cloud/environment/configuration). These are documentation findings, not a deployment test.
- [Phaser Arcade Physics](https://docs.phaser.io/phaser/concepts/physics/arcade) documents its lightweight rectangle/circle collision system and suitability for platformers.
- At planning time no game existed. Implementation and verification are recorded below; deployment remains deferred.


## Stage 1 handover — 5 October 2026

Implemented the local slice with TypeScript, Vite and Phaser 3.90. The temporary Codex pet, active shield, two independently defined rooms, continuous join, original pixel scenery, parallax, following camera and complete mode/pause/outcome/retry flow are working. Autonomous tuning is centralised in `src/content/character.ts`; character stats can supply that profile later without changing shared movement or collision.

The source briefs and spatial reference are in `docs/rooms/`. The runtime definitions preserve their plinths, gap widths, ledges and hazards. Controller fixes did not alter the course geometry. One refinement adds a visible 400ms ember warning before ignition so a competent controller can react to the same cue a player sees. Another prevents wasting the shield on spikes already being jumped.

Verified:

- `npm test`: 12 passing tests for shared rules, validation, room assembly and controller decisions, including reaction/perception effects.
- `npm run build`: TypeScript and production build pass. Vite reports a non-blocking large-chunk advisory for the bundled game engine (about 329KB gzipped JavaScript).
- Full autonomous and manual traversal, ordinary death and restart; mode reset and input isolation; shield activation, cooldown, protection and pit limits.
- Forward and backward room crossing with uninterrupted floor, movement, camera and power state.
- Real keyboard focus leaving the canvas pauses manual play; active shield/time freeze and held input clears. An injected window blur also passes. A native operating-system app/tab switch remains a short human smoke check because tab switching in the automated browser did not reliably emit those events.
- Explicit stuck outcome and useful invalid-content / missing-image errors, using browser-only failure fixtures that were removed afterwards.
- Keyboard menu traversal, visible focus, 375px display without horizontal overflow, reduced motion and rendered scene checks.
- Production preview completed the course without page errors or failed HTTP responses during the checked run.
- Temporary pet bytes match the inspected source SHA-256; local font licence files are included.

Evidence and exact limitations: `output/playwright/verification.md`. Playable production preview: http://127.0.0.1:4173/ while the preview server is running. Restart with `npm run preview`; rebuild with `npm run build` after source edits. Full local instructions and contribution/tuning contracts: `README.md`.

Review next: try both modes and judge manual responsiveness, each pet's decisions, the visual treatment and whether the dungeon-to-cave connection feels convincing. Repair this slice from feedback before expanding the course. Course construction, audio, touch/gamepad, broader browser verification and Webflow work are deferred. No deployment or scheduled continuation was created.

## Character selection milestone — 6 October 2026

Bill-e Bot is now the bundled default character and Codex remains an optional second selection when its authorised local artwork exists. The picker is keyboard accessible, character identity travels through scene snapshots and diagnostics, retry preserves the selected character, and returning to ready state permits a new character or mode choice. Both roster entries currently share the proven shield, movement and controller values.

Verified with Codex absent:

- `npm test`: 22 passing tests covering the existing game rules plus roster validation, lookup, availability fallbacks, runtime selection metadata and dynamic presentation copy.
- `npm run check` and `npm run build`: pass. Vite retains the documented non-blocking Phaser bundle-size advisory and notes the intentionally absent local Codex path.
- Browser checks: Bill-e Bot is selected by default; Codex is visibly disabled with “Local artwork required”; Bill-e Bot starts and completes autonomous play; manual mode starts; retry retains Bill-e Bot; selected copy, portrait, shield timing and outcome screens update without page errors.

## 16-bit scenery rollout — 6 October 2026

Billy approved the Ember Vault concept and authorised applying the style across the game and documentation. Both rooms now use original generated backdrop panoramas plus code-drawn textured platforms, chains, torches and hazards. The original room definitions, collision rules, character assets and input paths are unchanged. `AGENTS.md`, README, room briefs, character wording and provenance now point to the standing contract in `docs/art/style-guide.md`; exact built-in imagegen prompts are preserved in `docs/art/generation-prompts.md`.

Scenery loads locally before play is enabled, with a 15-second request timeout and the existing visible reload-error UI on failure. The two PNGs add approximately 3.3 MiB before HTTP compression. No runtime AI dependency, new package or service was added.

Verification for this change:

- All 25 existing automated tests pass. TypeScript and the production build pass; Vite retains its existing Phaser bundle-size advisory.
- Chromium desktop screenshots inspected for dungeon, cave and transition; silhouettes remain tied to unchanged collision definitions. Detailed background art, separate parallax layers, platform edges and active flames are visible.
- Autonomous traversal reached the finish. Production-preview manual keyboard traversal also reached the finish; movement, jumps and shield were exercised through both rooms.
- Manual pit death, focus-loss pause with an active shield, explicit resume and clearing held input were checked.
- Blocking the dungeon PNG in the browser produced the visible scenery-loading error and reload action. The browser-only block was removed and loading recovered.
- Production preview at 375px and reduced motion checked separately; see the evidence record for the final outcome.

Evidence: `output/playwright/16bit-*.png` (local screenshots) and `docs/art/verification.md`. This is a local implementation, not a Webflow Cloud deployment. Cross-browser/device performance, native OS focus switching and hosted mount-path checks remain outside this verification pass. Review the local production preview with `npm run preview` after building.
