# Bill-e Bot character selection design

## Intent

Add Bill-e Bot as the first redistributable character in Jumpa while retaining Codex as a second selectable character. A fresh clone must be playable with Bill-e Bot without requiring the locally held Codex artwork. The change should also establish a small, documented contribution path for future characters without creating a generic plug-in system.

Success means a player can choose Bill-e Bot or an available Codex before a run, choose autonomous or manual play, and see the chosen character consistently represented in gameplay and surrounding interface copy. Retrying preserves the character; returning to the ready screen allows a different selection.

## Scope and constraints

- Bill-e Bot is the default character and its validated v2 sprite sheet is committed to the repository.
- Codex remains in the roster. Its existing `public/assets/codex.webp` path and local-only rights status remain unchanged.
- If the Codex artwork is absent, Codex is visibly unavailable rather than causing the game to fail to load.
- Both characters initially use the existing movement values, shield power and autonomous-controller profile. Distinct powers and stats remain future focused contributions because they require their own implemented rules and balancing.
- The current two-room course, game modes, controls and run rules remain unchanged.
- Interface copy and documentation use UK English.

## Chosen approach

Introduce a typed, data-driven character roster and pass a selected character definition into the existing game scene. This is preferable to hard-coded branches because it proves the intended contribution boundary, and preferable to a full ability or plug-in registry because the second character does not yet require new gameplay rules.

Each roster entry owns its stable ID, display copy, sprite asset path, sprite-sheet dimensions, movement and power values, autonomous-controller profile, and whether its asset is expected to ship publicly. Roster validation rejects duplicate IDs and malformed definitions. Selection code resolves IDs through a focused lookup function rather than indexing the array throughout the application.

## Components

### Character content

Replace the single exported character definition with a `characters` roster containing Bill-e Bot and Codex. Bill-e Bot is first and is the default. Keep the controller profile associated with each entry even while both profiles share values, so a future character can be tuned without changing selection architecture.

The Bill-e Bot sprite sheet will live at `public/assets/bill-e-bot.png`. It uses the existing compatible 8-column v2 layout, so the current animation frame mappings can be retained. The character definition records enough sheet metadata for Phaser to load each texture without relying on one global asset assumption.

### Availability

Before enabling a character card, the ready screen checks whether that entry's asset can be fetched successfully. A missing optional asset disables only that character and displays a short explanation such as “Local artwork required”. A failure to load the selected, publicly bundled default remains a fatal loading error because the installation is incomplete.

Availability checking is separated from character validation: validation establishes that a definition is safe and well formed; availability establishes that its local file exists. No remote image URLs are accepted at runtime.

### Selection interface

Add a “Choose your character” fieldset above the existing mode picker. Each character is represented by a keyboard-accessible radio card with a sprite preview, name, short character line, and shield summary. Bill-e Bot begins selected. An unavailable Codex card remains visible for continuity but cannot be selected and explains why.

The primary action and automatic-play label use the selected name rather than hard-coding Codex. The character note below the game updates its portrait, name and description when selection changes. Selection controls are shown only on the ready screen; retry keeps the last selection, while “Change character or mode” returns to the ready screen.

### Game scene and state

The application passes the selected character ID when starting a run. The scene resolves that ID to a validated character definition and uses its texture, physics values, power timings and controller profile. It no longer imports a singleton character.

The scene loads the selected texture on demand before the run starts. This prevents an absent optional Codex file from breaking Bill-e Bot play. If the texture is already loaded, retry reuses it. A load error is reported through the existing error panel with the affected character named.

The run snapshot includes the selected character ID so interface rendering and diagnostics reflect the actual scene state. `window.__jumpa.content()` exposes the roster rather than a single character and reports the current selection for playtest inspection.

## Data flow

1. The page validates the roster and checks local asset availability.
2. Bill-e Bot is selected by default; enabled character cards can update the pending selection.
3. The player chooses autonomous or manual play and starts the run.
4. The application sends the mode and character ID to the scene.
5. The scene resolves the definition, loads its texture if necessary, resets the run and applies the selected configuration.
6. Scene snapshots include the character ID, allowing the surrounding interface to render consistent copy and status.
7. Retry starts the same mode and character. Returning to ready state re-enables both pickers.

## Error handling

- Invalid or duplicate roster definitions fail early with a useful content-validation message.
- A missing optional Codex asset disables Codex without blocking Bill-e Bot.
- A missing Bill-e Bot asset, or a load failure after an enabled character is selected, uses the existing fatal error panel and names the failed asset.
- An unknown character ID cannot silently fall back during a run; lookup raises a clear error. The initial UI default is established explicitly before play starts.

## Documentation and provenance

Update the README to explain character selection, Bill-e Bot's bundled status, Codex's optional local artwork, and the expected commands for development and tests. Update asset provenance with the source and redistribution statement supplied for Bill-e Bot without claiming rights beyond those granted by the contributor.

Add a concise character-contribution section covering the roster entry, local asset path, compatible 8-column v2 sprite-sheet layout, display copy, implemented gameplay values, validation and tests. New powers remain code contributions rather than descriptive configuration alone.

## Verification

Automated tests will cover:

- roster validation, including duplicate IDs and unsafe asset paths;
- character lookup and explicit handling of unknown IDs;
- the default Bill-e Bot selection;
- asset-availability behaviour that permits Bill-e Bot when Codex is absent;
- preservation of the current shield, controller, room and run-state tests for both roster entries where applicable.

Runtime verification will cover keyboard access and visible focus for both pickers, Bill-e Bot in autonomous and manual modes, retry preserving the selection, returning to ready state and changing selection, dynamic copy and portrait updates, and the non-fatal missing-Codex path. The production build must also succeed with `public/assets/codex.webp` absent.

## Out of scope

- A new Bill-e Bot power, different physics or character balancing.
- Remote pet installation, adoption links or a ChatGPT Pets API integration.
- User-uploaded characters or an in-game contribution interface.
- Simultaneous characters, races, networking or accounts.
- Deployment to Webflow Cloud.
