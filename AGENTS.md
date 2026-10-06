# Project brief: pixel-art challenge game with autonomous and manual play

This file captures the agreed product intent and provides project-specific guidance for implementation. It is a handover from a design conversation, not evidence that a repository, game or deployment already exists. The game will be a web app hosted on Webflow Cloud. Its confirmed name is lil-runnerz. The original brief left the application framework and game engine open.

## Purpose

Billy and Ruin want to build a game together for a weekly lunchtime bit of fun with colleagues who also use ChatGPT and Codex. The pleasure comes from inventing distinctive characters and devious rooms, then watching what happens when they meet.

The game is a 2D, side-on platformer with a choice of autonomous or manual play. The user selects a character and either watches it attempt a course assembled from contributed challenge rooms or controls its movement and jumps like a traditional platformer. The central contest is whether the room designer can defeat the character, or the character can survive the course and reach the finish under autonomous or player control.

Personalisation is the main attraction: a contributor's room idea becomes a playable challenge, and their invented character becomes a recognisable participant with its own power and capabilities.

## Agreed MVP

- A browser-based web app hosted on Webflow Cloud.
- A character-selection screen showing the available characters, their superpower and their stats.
- One selected character attempts a run at a time.
- A run consists of roughly five connected challenge rooms leading to a finish. Five is the initial working scale, not an immutable engine limit.
- A choice between autonomous play, where the character moves, jumps and uses its power itself, and manual play, where the user controls movement and jumps.
- Both modes use the same characters, courses, physics, hazards and power rules; the source of movement and active-power decisions changes.
- Abilities remain fixed during and between attempts; the MVP does not involve learning from previous failures.
- Character capabilities meaningfully affect whether and how it completes the course.
- A following camera reveals the course progressively as the character advances.
- Coherent pixel art across characters, rooms, backgrounds, effects, menus and character selection.
- Clear success and failure outcomes, with a practical way to attempt another run.

Multi-character runs are a later extension: colleagues should eventually be able to pit their characters against one another in the same run. Do not implement simultaneous races, networking or multiplayer infrastructure for the MVP.

## Play modes

Both autonomous and manual play are part of the MVP. Autonomous play preserves the spectator experience; manual play lets the user attempt the challenge directly with their chosen character.

Working defaults for implementation, reversible as the first playable slice is assessed:

- Choose the mode before starting a run and show the current mode clearly. Allow a different choice for the next attempt; switching control during a run is outside the initial scope.
- In manual mode, provide keyboard controls for left/right movement and jumping, plus an action for a power that requires deliberate activation. Show the controls before play. Exact bindings remain to be chosen; touch and gamepad support are not assumed.
- Passive or automatically triggered powers retain their defined triggers in both modes. Active powers use player input in manual mode and controller decisions in autonomous mode, with the same effects, limits and cooldowns.
- Physical capabilities such as movement speed and jump height apply in both modes. If a stat affects only autonomous decisions, label that explicitly and explain that it has no effect in manual mode rather than inventing a different effect.
- Pause manual play and clear held input when the game loses focus, requiring an explicit resume so returning to the game does not cause unintended movement.

## Room submissions: image plus creative brief

A contributor supplies a photograph, screenshot or PNG of a room, together with a short creative brief in ordinary language. Inputs can range from a quick paper sketch or wireframe to a detailed design prepared in Figma.

The image establishes the spatial idea. The brief explains the theme, intended challenge, special behaviours and any details that must be preserved. Numbered callouts are optional: matching numbers in the image and notes can clarify a particular platform or hazard, but simple submissions do not need annotations or a prescribed drawing convention.

Codex is used during authoring to interpret these submissions and implement rooms that fit the game. This is not a requirement for an image-upload or generation interface inside the running game.

### Interpretation rules

- Preserve the contributor's intended route, layout, obstacle relationships and challenge.
- More supplied detail means greater fidelity to that detail, while retaining the game's common visual language.
- Less supplied detail permits more invention of decoration, textures, lighting, background scenery and other unspecified presentation.
- Generate the backdrop from the room's theme. A rough dungeon layout can become a fully dressed dungeon without the contributor drawing every stone or torch.
- Do not silently move a platform, change a gap, remove a hazard or add a bypass merely to make the room easier to implement or complete.
- Resolve any necessary adaptation to game scale or room connections explicitly when it would change the intended challenge.
- If an ambiguity or conflict between the image and brief materially changes gameplay, ask a focused question. Use reasonable defaults for cosmetic gaps.
- Preserve the source image and creative brief alongside the implemented contribution so its interpretation can be reviewed.

Example of the submission style: a sketch of platforms over a pit, accompanied by a brief describing a crumbling dungeon, platforms that collapse after contact and an upper route that rewards a character with a high jump. Numbering is useful only if the note needs to identify a specific platform.

The long-term ambition is for anyone with a room idea to contribute a sketch and brief. The initial workflow is maintained by Billy and Ruin through the shared project; a public submission service is outside the MVP.

## Characters, powers and stats

The inspiration is the small personalised pixel pets the creators have been making and watching move around their Figma files. The game should preserve that sense of ownership and personality. This is visual and creative inspiration, not a requirement to integrate a pet API or reuse a particular pet file format.

Billy and Ruin create the initial characters. Colleagues can subsequently propose new characters through pull requests to the shared GitHub repository.

Each character has a distinctive visual identity, exactly one defined superpower, and a clearly presented capability profile. Speed, intelligence, strength and an extra life were discussed as possible attributes or abilities; they are examples, not a final mandatory stat schema. An extra life could itself be the character's power rather than an additional universal feature.

Superpower concepts are creatively open-ended. Each contributed power still needs explicit, implemented rules: what it does, when it activates, any limits, and how it interacts with hazards and the environment. A text description alone is not a working ability. A new power may require a focused code contribution.

Stats must affect observable behaviour rather than serve as decorative numbers, with any mode-specific effects clearly labelled. For example, intelligence could affect planning and speed could affect movement, but their exact meanings and ranges remain implementation decisions. Display descriptions that accurately match the implemented rules.

Keep behaviour understandable enough that players and spectators can connect a character's strengths, decisions and power to its successes and failures. Autonomous behaviour does not itself require a language-model request during play; prefer a straightforward game controller for the MVP unless evidence establishes a need for something else.

## Visual direction

Updated character direction, 6 October 2026: preserve contributors' original character artwork rather than converting every character into pixel art. The mismatch between character styles is intentional and supports the user-generated character identity. Render detailed character artwork at display resolution so small in-game sizing does not unnecessarily discard its detail; preserve hard edges for artwork originally authored as pixel art. This overrides the common pixel-style requirements below for characters only. Scenery and interface retain the retro pixel-art direction.

Updated scenery direction, 6 October 2026: the approved Ember Vault visual establishes a detailed **16-bit-inspired retro arcade** style for all existing and future rooms. This supersedes the original 8-bit scenery brief. Use richly textured, bevelled stonework, weathered metal, faceted rock, recessed architecture, stepped lighting and restrained atmospheric layers. Keep crisp square pixel clusters; avoid photorealism, painterly blur, smooth gradients and isometric/perspective floors. This is an art direction, not historical hardware emulation. Follow `docs/art/style-guide.md` and its checked-in scenery references for future contributions.

- Flat, side-on 2D platforming with horizontal travel and vertical jumps.
- Detailed pixel-art scenery and effects on the existing 640×360 logical viewport; preserve the retro pixel interface and original contributor character artwork.
- A consistent pixel scale and crisp rendering across the game.
- A late-1980s/1990s 16-bit arcade colour treatment with pixel typography and restrained CRT influence.
- Room scenes with character and atmosphere, including dungeons, caves, statues, flames, chains and rock formations where appropriate to the brief.
- Personalised characters that can be eccentric, funny and visually distinctive within the shared style.

References raised in the discussion include retro handheld games, Doom for aspects of the pixel texture and arcade atmosphere, and Street Fighter/Mortal Kombat for rich stage backgrounds. These are references for qualities, not instructions to copy their assets or reproduce their gameplay. The game remains a side-on platformer. High-resolution rendering and surreal diorama presentation are outside the chosen direction.

Established scenery palette: cool charcoal/slate/indigo stone, amber torchlight, warm cream platform edges, teal cave rock and muted turquoise minerals. Hazard flames use brighter orange and pale yellow cores. Other interface treatments initially discussed: dark charcoal, warm cream, amber, tomato red, turquoise and electric purple; chunky title lettering; a simpler readable bitmap font for stats; subtle glow and optional scanlines. Establish the final palette, font and sprite dimensions together when producing the first visual sample. Keep readability and hazard recognition ahead of CRT effects.

## Camera and layered backgrounds

The course scrolls continuously through connected rooms. The character stays approximately centred, with a little horizontal drift and a gentle follow. The restricted view reveals upcoming sections progressively; do not use the earlier single-screen-room interpretation.

Use restrained movement, a small amount of directional look-ahead and vertical tolerance for ordinary jumps. Follow substantial elevation changes without bobbing on every small hop. These are implementation recommendations for achieving the agreed camera feel, with exact values to be tuned in play.

Rooms have themed pixel-art backdrops behind the playable foreground. Distant layers move more slowly than nearer ones to create subtle parallax. A dungeon could have distant walls and a statue, nearer chains and torches, then the platforms. A cave could layer rock walls, stalactites and stalagmites.

Background animation can include flames, water or dust. Keep decorative scenery visually distinct from solid platforms and active hazards. Room connections should support continuous scrolling; the treatment of transitions between different themes is still to be worked out.

## Collaboration and implementation guidance

The intended home is a shared GitHub repository with Billy and Ruin as collaborators. Colleagues can contribute through pull requests, initially with particular emphasis on adding characters. Repository name, ownership, visibility and collaborator accounts have not been supplied.

When implementation is requested:

- Inspect any existing project before choosing a stack or changing structure. Preserve established conventions.
- Build the game as a browser-based web app for hosting on Webflow Cloud. This is the confirmed target platform, not a provisional default.
- Choose the simplest maintainable application framework and game engine that meet the gameplay requirements and are compatible with Webflow Cloud. Verify current platform requirements before choosing the stack; document the build, asset handling, local development and deployment configuration.
- Keep manual input and autonomous decisions separate from shared movement, collision, power and run-state logic. Use the same character actions for both modes so fixes and contributions work consistently across them.
- Keep room definitions, character definitions, visual assets and core game behaviour clearly organised. Avoid building a generic content platform or elaborate plugin system before a repeated need exists.
- Establish a small, documented room connection contract: scale, entrance, exit, collision boundaries and coordinate conventions. Exact dimensions and formats are not yet agreed.
- Keep the source image and brief distinct from collision geometry and playable behaviour. Image generation alone does not establish that a level works.
- Validate contributed definitions and asset references. Invalid content should produce useful errors instead of a broken run.
- Keep contributions focused and reviewable. Document how to add a character or room once the first working examples exist.
- Do not add accounts, databases, live AI services, public upload systems or online multiplayer without a current requirement.
- Provide keyboard-accessible menus, visible focus, readable text, adaptable display sizing and reduced decorative motion where relevant. Game outcomes must not rely on colour alone.
- Use UK English in project documentation and interface copy.
- Keep publication or deployment separate from local implementation and verification; publish only when explicitly authorised.

## Open decisions

The concept above is settled. These details remain open and must not be presented as previous agreements:

- Repository details, application framework and game engine. The web app target and Webflow Cloud hosting are confirmed.
- Webflow Cloud project/site, deployment path and domain configuration.
- Future room dimensions and per-character sprite dimensions. The current slice and `docs/art/style-guide.md` establish the scenery rendering scale and palette; preserve them when extending it.
- Initial character roster, superpowers, stat meanings and activation rules in each mode.
- Exact manual control bindings and any input support beyond the keyboard working default.
- How much of the course an autonomous character can perceive or plan ahead of; camera visibility does not automatically define its knowledge.
- Whether every room must be solvable, and whether solvability is assessed for a baseline character or particular capabilities, under manual control, autonomous control or both. Character death is part of the game and is not by itself a defect.
- How rooms are chosen and ordered for a run: curated, random or another simple approach.
- Retry, checkpoint, extra-life and time-limit rules; any timing or scoring system beyond reaching the finish.
- Audio direction, which has not yet been discussed.

Choose and label safe, reversible implementation defaults where possible. Ask only when an unresolved choice materially changes the experience or risk. Do not restart discovery of the decisions already captured here.

## Suggested first build milestone

This is a proposed execution sequence, not a claim that development has begun.

Start with a small playable slice: one character, one working superpower and one room that demonstrates movement, a hazard, an alternate challenge or route, a finish, the following camera and a themed parallax backdrop. Make this slice available in both autonomous and manual modes. Use it to assess whether watching the autonomous character is entertaining and legible, and whether controlling the same character feels responsive and understandable.

Then expand to the agreed MVP: a meaningful character choice, a clear play-mode choice, approximately five connected rooms, clear run outcomes and documented contribution examples covering both modes. Prove that a second independently authored character or room can be added without reworking the core game. Keep simultaneous races for a later milestone.

## Verification and completion

Use automated tests for deterministic logic where useful, especially collision, power interactions, room connections and run-state transitions. Verify the rendered game for movement, camera behaviour, pixel clarity, menu access and presentation. Test successful completion, ordinary character death and restart in both modes, plus invalid content and any autonomous stuck-character handling that is implemented. Verify manual movement, jumping, active and passive power behaviour, keyboard instructions, focus-loss pause, explicit resume and clearing held input. Confirm that autonomous decisions do not control the character in manual mode, manual gameplay input does not override autonomous mode, and choosing a different mode for a new attempt resets the run correctly.

Compare authored rooms against their source images and briefs. Check that intended layouts and challenges survive interpretation, that each displayed stat or power matches actual behaviour, and that camera and background effects do not hide crucial gameplay.

An MVP is complete when a user can select a character, understand its capabilities, choose autonomous or manual play, watch or control its attempt through the connected course, reach a clear outcome and start another attempt; the visual direction is coherent; and a colleague has a documented route to contribute a new character.

Verify the production build and Webflow Cloud configuration before deployment. After an explicitly authorised deployment, verify the hosted app, asset loading and both play modes at its actual deployment path. Local build verification alone does not establish that Webflow Cloud hosting works.

Report what was built, which checks actually ran and what remains unverified. Do not equate generated assets with playable levels, saved files with a tested build, or a local build with a published game.
