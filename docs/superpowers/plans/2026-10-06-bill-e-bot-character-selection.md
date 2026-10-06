# Bill-e Bot Character Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Bill-e Bot as the default playable character while retaining Codex as an optional second selection when its local artwork exists.

**Architecture:** Replace the singleton character content with a validated typed roster, keep asset availability separate from definition validation, and pass the selected character into the Phaser scene for on-demand texture loading. The DOM ready screen owns pending selection; scene snapshots own the character identity once a run begins.

**Tech Stack:** TypeScript 5.9, Phaser 3.90, Vite 8, Vitest 5, HTML/CSS.

**Spec:** `docs/superpowers/specs/2026-10-06-bill-e-bot-character-selection-design.md`

## Global Constraints

- Bill-e Bot is the default and its validated 1536×2288 PNG v2 sprite sheet is committed at `public/assets/bill-e-bot.png`.
- Codex remains at `public/assets/codex.webp`; the ignored local file is never added to Git.
- Both characters use speed 160, jump speed 410, gravity 900, shield duration 800 ms, shield cooldown 4000 ms, and the existing controller profile.
- A missing Codex asset disables only Codex; a missing Bill-e Bot asset is fatal.
- Do not add new powers, remote pet loading, uploads, multiplayer, accounts or deployment.
- Use UK English in interface copy and documentation.

## Review Focus

- An HTTP 404 or rejected availability request for Codex must produce an unavailable card without blocking Bill-e Bot; test in Task 2.
- An unknown character ID passed to the scene must throw rather than silently use Bill-e Bot; test in Task 1.
- Repeated starts with the same character must reuse the loaded texture and not register duplicate loader listeners; exercise in Task 3 runtime verification.
- Retry must preserve both mode and character while returning to ready state must permit changing either; exercise in Task 4 runtime verification.
- Keyboard users must be able to reach every enabled character and mode option while disabled Codex is skipped; exercise in Task 4 runtime verification.

---

### Task 1: Typed character roster and validation

**Files:**
- Modify: `src/game/types.ts:39-54,72-90`
- Modify: `src/game/rules.ts:45-70`
- Replace: `src/content/character.ts`
- Modify: `tests/rules.test.ts`

**Interfaces:**
- Produces: `CharacterDefinition` with `character: Character`, `controllerProfile: ControllerProfile`, `description: string`, `tagline: string`, `frameWidth: number`, `frameHeight: number`, and `bundled: boolean`.
- Produces: `characters: readonly CharacterDefinition[]`, `defaultCharacterId: string`, `getCharacter(id: string): CharacterDefinition`, and `validateCharacters(definitions: readonly CharacterDefinition[]): void`.
- Produces: `Snapshot.characterId: string` for Tasks 3 and 4.

- [ ] **Step 1: Write failing roster tests**

Add tests asserting that Bill-e Bot is the default, `getCharacter("bill-e-bot")` and `getCharacter("codex")` resolve, an unknown ID throws `/unknown character/i`, duplicate IDs throw `/duplicate/i`, unsafe asset paths still fail, and both real definitions validate.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- --run tests/rules.test.ts`

Expected: FAIL because the roster interfaces do not exist.

- [ ] **Step 3: Implement the roster interfaces and definitions**

Extend the types, validate each nested character/profile plus positive integer frame dimensions and non-empty display copy, reject duplicate IDs, and add the exact Bill-e Bot/Codex definitions. Keep a backwards-compatible `character` export only if needed within this task; all consumers are removed in later tasks.

- [ ] **Step 4: Run focused tests and type checking**

Run: `npm test -- --run tests/rules.test.ts && npm run check`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/types.ts src/game/rules.ts src/content/character.ts tests/rules.test.ts
git commit -m "feat: add validated character roster"
```

### Task 2: Bundled asset and availability boundary

**Files:**
- Create: `src/content/character-availability.ts`
- Create: `tests/character-availability.test.ts`
- Create: `public/assets/bill-e-bot.png`

**Interfaces:**
- Consumes: `CharacterDefinition` from Task 1.
- Produces: `checkCharacterAvailability(definition: CharacterDefinition, request?: typeof fetch): Promise<{ available: boolean; reason?: string }>`.

- [ ] **Step 1: Write failing availability tests**

Test a successful response, a 404, and a rejected request. Assert that unavailable optional Codex returns `{ available: false, reason: "Local artwork required" }`, while unavailable bundled Bill-e Bot rejects with an error naming Bill-e Bot.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- --run tests/character-availability.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement availability checking**

Build the request URL with `import.meta.env.BASE_URL` and the local asset path. Use a GET request so development servers that mishandle HEAD requests do not report false negatives. Convert non-OK responses and network rejection according to `definition.bundled`.

- [ ] **Step 4: Copy and validate Bill-e Bot artwork**

Copy the already validated source from `/Users/opathr01/Documents/Codex/2026-10-02/pets-plugin-work-pets-openai-curated/outputs/bill-e-bot/bill-e-bot-spritesheet.png` to `public/assets/bill-e-bot.png`. Verify it is a 1536×2288 transparent PNG and do not add `public/assets/codex.webp`.

- [ ] **Step 5: Run focused tests and type checking**

Run: `npm test -- --run tests/character-availability.test.ts && npm run check`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/character-availability.ts tests/character-availability.test.ts public/assets/bill-e-bot.png
git commit -m "feat: bundle Bill-e Bot character asset"
```

### Task 3: Character-aware Phaser scene

**Files:**
- Modify: `src/game/scene.ts`
- Modify: `src/game/types.ts:72-90`
- Modify: `src/main.ts` only where required to compile the new constructor/start signature

**Interfaces:**
- Consumes: `getCharacter(id)` and `CharacterDefinition` from Task 1.
- Produces: `CourseScene.start(mode: Mode, characterId: string): Promise<void>` and snapshots containing `characterId`.
- Produces: `CourseScene` constructor dependency `definitions: readonly CharacterDefinition[]` or a roster lookup with no singleton content import.

- [ ] **Step 1: Add failing scene-boundary assertions**

Add or extract pure tests where necessary to assert that scene configuration lookup rejects an unknown ID and returns the selected character's power/profile/frame metadata. Do not introduce a browser-test framework solely for this task.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL on the new character-aware interface.

- [ ] **Step 3: Remove singleton character use from the scene**

Store the active `CharacterDefinition`, initialise run state with the default ID, and replace every movement, gravity, shield, controller and stuck-message singleton reference with active-definition data. Apply per-body gravity so a future selected character is not constrained by Phaser's global initial gravity.

- [ ] **Step 4: Add on-demand texture loading**

Use texture keys derived from stable character IDs. `start(mode, characterId)` resolves the definition, loads its sprite sheet only if absent, reports a named error on failure, then creates or retargets the player and resets the run. Register one-shot loader callbacks and clean them up after success or failure.

- [ ] **Step 5: Publish selected identity**

Include `characterId` in every snapshot, make autonomous outcome text use the selected name, and ensure retry with the same arguments reuses its texture.

- [ ] **Step 6: Run the full automated suite**

Run: `npm test && npm run check`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/scene.ts src/game/types.ts src/main.ts tests
git commit -m "feat: run the selected character in Phaser"
```

### Task 4: Accessible character selection interface

**Files:**
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/style.css`

**Interfaces:**
- Consumes: roster and availability APIs from Tasks 1 and 2; `CourseScene.start(mode, characterId)` from Task 3.
- Produces: character radio inputs named `character`, pending-selection rendering, and `window.__jumpa.content()` data containing `characters` and `selectedCharacterId`.

- [ ] **Step 1: Add the character fieldset and stable DOM hooks**

Add “Choose your character” above the mode picker. Render two radio cards from the roster in TypeScript so display data has one source of truth. Keep Bill-e Bot checked initially and expose unavailable reason text through visible copy and accessible description.

- [ ] **Step 2: Connect availability and selected-character presentation**

Check both assets before enabling play. Disable only unavailable Codex, keep Bill-e Bot failure fatal, and update CTA, “Watch …” copy, character note, portrait, shield timing display and screen notes from the selected definition.

- [ ] **Step 3: Connect run and retry behaviour**

Pass pending selection on a ready start; pass snapshot mode and character ID on retry. Show both pickers only in ready state, rename the secondary action to “Change character or mode”, and focus the selected character input when returning.

- [ ] **Step 4: Update layout and focus styling**

Add responsive two-card character styling that fits the existing overlay at desktop and narrow widths. Preserve visible focus, radio semantics, disabled styling and reduced-motion behaviour.

- [ ] **Step 5: Verify runtime behaviour**

Run: `npm run dev`

Verify with `public/assets/codex.webp` absent: Bill-e Bot is selected, Codex is visible and disabled, keyboard focus skips disabled Codex, both modes start, retry preserves Bill-e Bot, and returning permits mode/character choice. If an authorised local Codex file is present, verify selecting it loads its distinct texture. Confirm repeated retries do not duplicate loader errors or callbacks.

- [ ] **Step 6: Run automated checks and production build**

Run: `npm test && npm run check && npm run build`

Expected: all commands succeed; Vite may retain its documented large-chunk advisory.

- [ ] **Step 7: Commit**

```bash
git add index.html src/main.ts src/style.css
git commit -m "feat: add accessible character selection"
```

### Task 5: Contribution and provenance documentation

**Files:**
- Modify: `README.md`
- Modify: `public/assets/PROVENANCE.md`
- Modify: `docs/development-plan.md`

**Interfaces:**
- Consumes: final roster, asset contract and tested behaviour from Tasks 1–4.
- Produces: contributor instructions that match the shipped implementation.

- [ ] **Step 1: Update user and contributor documentation**

Document Bill-e Bot as the public default, Codex as optional local artwork, character and mode selection, the roster fields, the 8×11 v2 sheet with 192×208 cells, local-only asset paths, validation/tests, and that a new power requires implemented rules and tests.

- [ ] **Step 2: Record provenance accurately**

Record that Bill-e Bot was created from the contributor-provided reference image and generated as a validated custom pet sprite sheet for this repository. Do not publish the original face photograph or imply rights beyond the contributor's permission. Preserve the existing Codex rights warning.

- [ ] **Step 3: Update milestone status**

Mark second-character selection complete in `docs/development-plan.md` and record actual verification results only after they have run.

- [ ] **Step 4: Run documentation and repository checks**

Run: `git diff --check && npm test && npm run build && git status --short`

Expected: no whitespace errors; tests and build pass; only intended files are modified or added.

- [ ] **Step 5: Commit**

```bash
git add README.md public/assets/PROVENANCE.md docs/development-plan.md
git commit -m "docs: explain character contributions"
```

### Task 6: Final integrated verification

**Files:**
- Modify only files required to fix defects found by verification.

**Interfaces:**
- Consumes: the complete feature from Tasks 1–5.
- Produces: a review-ready branch with evidence for merge.

- [ ] **Step 1: Run the complete command suite from a clean state**

Run: `npm ci && npm test && npm run check && npm run build && git diff --check`

Expected: all commands exit 0, apart from Vite's accepted bundle-size advisory.

- [ ] **Step 2: Perform final browser checks**

Verify the Bill-e Bot default path with Codex absent, autonomous and manual runs, pause/resume, retry, return-to-ready, selection copy, portrait, focus order, reduced motion, missing-asset copy, and responsive layout at desktop and 390px width.

- [ ] **Step 3: Review repository contents**

Confirm `public/assets/bill-e-bot.png` is tracked, `public/assets/codex.webp` is not tracked, the original reference photograph is not present, and no generated build or screenshot directories are staged.

- [ ] **Step 4: Commit any verification fixes**

If fixes were needed, commit them with a message describing the defect. If none were needed, create no empty commit.

- [ ] **Step 5: Prepare merge delivery**

Summarise commits and checks, inspect the complete branch diff against `origin/main`, and only then push or open/merge a pull request using the user's authorised delivery method.
