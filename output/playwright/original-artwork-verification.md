# Original character artwork — 6 October 2026

Implemented the agreed mixed-style direction: source character artwork stays unchanged and is drawn directly at display resolution over the existing 640 × 360 scenery. Bill-e Bot and Codex use smooth downsampling; Marty explicitly preserves pixel edges. Character selection portraits follow the same distinction. World size, camera framing, collision bodies and movement rules are unchanged.

Changed `src/game/character-artwork.ts`, scene integration, character sampling metadata and validation, and the relevant CSS. Recorded the direction in `AGENTS.md` and the README contribution guidance.

Verified against the local production preview:

- Viewed screenshots of all three characters; Bill-e Bot and Codex retain visibly more source detail, Marty keeps his original pixel artwork. Shield and hoverboard visuals remain present.
- Bill-e Bot completed autonomous play in 17.065 seconds.
- Codex and Marty: keyboard selection, manual movement, jump, active power and pause exercised.
- Bill-e Bot: shield rendered and moving focus away from the original game canvas paused manual play. The artwork canvas is hidden from accessibility APIs, is not focusable and does not intercept pointer input.
- Both canvas layers had identical displayed bounds at desktop size and after resizing to 390 × 844. No horizontal overflow at 390px. The artwork layer followed the observed device-pixel-ratio change from 2 to 1.
- No browser console errors in the final manual check.
- All 25 existing tests, TypeScript and production build passed; existing large engine-bundle advisory remains. `git diff --check` passed. Source changes read back.

Evidence: `original-artwork-bill-e.png`, `original-artwork-codex.png`, `original-artwork-marty.png`, `original-artwork-detail.png`.

No deployment. Browser verification used Chromium; other browsers and a hosted Webflow Cloud deployment were not checked. The original artwork still has finite detail and small displays necessarily show smaller characters.
