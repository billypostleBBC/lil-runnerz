# lil-runnerz scenery — 16-bit art guide

Approved by Billy on 6 October 2026 after reviewing the Ember Vault concept. This replaces the original 8-bit scenery direction and applies to existing and future rooms. Contributor character artwork remains exempt: retain its original identity, detail and rendering treatment.

## Visual reference

The checked-in panoramas are the reusable material and atmosphere references:

- [Ember Vault](../../public/assets/scenery/ember-vault.png): worn slate masonry, recessed barred arches, weathered sword-bearing sentinels, sparse moss and rust.
- [Hollow Grotto](../../public/assets/scenery/hollow-grotto.png): faceted teal rock, layered dark recesses, stalactites and restrained mineral highlights.

Review these together with the rendered foreground in the running game. A panorama alone does not define the complete scene. The full approved concept remains local because it depicts the temporary Codex character; these scenery-only assets contain no character artwork. [Generation prompts](generation-prompts.md) record the exact built-in imagegen requests.

## Material, colour and light

Use crisp square pixel clusters, bevelled edges, small chips, restrained mottling and sparse moss. Build depth through stepped colour ramps and occlusion. Texture should describe material rather than cover every surface in random noise. No blurred glow, smooth lighting gradients, photorealism, painted surfaces, isometric floors or 3D diorama treatment.

| Element | Direction |
| --- | --- |
| Dungeon wall | Cool charcoal, slate and indigo; recesses darker than masonry |
| Dungeon foreground | Slate blocks with visible bevels, warm cream top edges |
| Metal | Dark iron, copper/rust midtones, sparse warm highlights |
| Torchlight | Stepped amber illumination, restrained decorative flame |
| Cave | Petrol teal rock, muted turquoise minerals, dark blue recesses |
| Cave foreground | Faceted textured teal stone, pale sage top edges |
| Active hazard | Saturated orange/red, pale yellow core; brighter than decoration |

The existing pixel typography, visible focus treatment and charcoal/cream interface remain the common arcade frame. Do not add scanlines or glow that harms legibility.

## Scale and layers

The logical gameplay viewport is now 512×288 (7 October 2026), giving 1.25× closer framing in the same display area. The course uses logical pixels; the current rooms are 1440×432 with floor Y=312. Increasing visual detail must never rescale physics, world-space character dimensions or gap widths.

Panoramas render without image smoothing, retain their aspect ratio and cover each room. They scroll at 0.35 of camera travel; chains and nearby cave formations use 0.62. Torches stay attached to the rear wall. Foreground platforms and hazards use world coordinates. Reduced motion removes parallax and decorative flicker while preserving meaningful hazard activation and warning states.

Assets live under `public/assets/scenery/`. Load them using Vite's base URL so a future configured mount path is respected. Both current PNG originals are 2172×724; their combined transfer size is approximately 3.3 MiB. They load before gameplay starts and require no external service. Keep future asset sizes proportionate; avoid increasing resolution without a visible benefit at gameplay size.

## Gameplay readability is part of the style

- Every solid platform has a continuous pale top edge matching its collision rectangle. Texture is clipped to the solid. No decorative extensions into pits.
- Background sculptures, rocks and architecture are lower contrast than the playable foreground. Do not give decoration the same pale edge treatment as a solid platform.
- Pits must remain unmistakable. No painted bridge, shelf or apparent landing in a gap.
- Keep hazards separate from the backdrop. A flame's colour, height and warning state must communicate its activity. Retain the implemented 400ms ember warning.
- Preserve the contributor's route, obstacle relationships and creative brief. A prettier image never authorises a geometry change.
- Characters retain their supplied artwork and render on the existing display-resolution overlay. `pixelArt: true` is for intentionally pixel-authored characters only.

## Adding or updating room art

1. Read the room's source image, creative brief and collision definition. Preserve the originals.
2. Use the two scenery panoramas as style references. Create background-only artwork with no characters, UI, hazards, solid platforms or foreground route baked in.
3. Implement foreground textures and animated effects separately. Keep collision data independent and record asset origins in `public/assets/PROVENANCE.md`.
4. Inspect the actual game at desktop and narrow widths, both play modes, reduced motion, the room entrance/exit and the darkest/busiest scenes. Compare all silhouettes against the authored geometry.
5. Check loading and failure states, test and build locally. Deployment remains a separate authorised action.

The current implementation supports dungeon, cave and jungle themes directly. Jungle Run uses a square background with dark petrol-green foliage and mossy rock; its water and creatures are drawn separately. See [its generation record](jungle-generation.md). Add another theme only when a real room requires it; this guide is not a requirement for a generic art pipeline or room editor.

## Arcade shell — 6 October 2026

The user-approved interface uses a fixed 3:2 screen, scaling to fit the window. Splash, runner selection, help, fullscreen settings, pause and results all live inside this screen. The 16:9 gameplay area uses a 512×288 logical view, with the remaining vertical space reserved for the top and bottom HUD. World geometry and physics remain unchanged. On narrow screens, longer menus scroll inside the frame; manual play still requires a keyboard.

The title screen reuses the Ember Vault scenery and warm cream/amber pixel lettering. The approved generated cabinet artwork (`public/assets/ui/arcade-cabinet.png`) appears when the window has sufficient width and height; it is hidden on smaller windows and in fullscreen. Cabinet controls are decorative and excluded from accessibility navigation. Actual menus use native HTML buttons and radio controls, with visible keyboard focus. The unchanged approved mock-up supplies only the decorative surround: the opaque live viewport covers its illustrated screen. All menus remain native interactive HTML. The surround is fitted vertically to preserve the exact 3:2 opening. Arrow keys navigate menu actions, left/right changes runners, and Enter on a runner moves to the run controls. The selected avatar bobs unless reduced motion is requested.


## Runner menus and camera — 7 October 2026

Selection uses bevelled stone/metal panels, cream pixel labels, yellow focus and stepped lighting. The heading and actions occupy fixed rows; the centre scrolls independently on small/short screens. Description space is reserved equally for every runner. The preview is 192×208 for the detailed characters on desktop, with original-source smoothing, and adapts on small screens. Marty remains pixel-rendered. Visible controls are in How to play, not the selection screen. Arrows or WASD navigate menus; Enter chooses; Escape goes back. Manual power uses physical Left Shift.

The original angular Z is an inline SVG (not a copied logo). On each page load, one available runner is chosen randomly for the title, independently of the selected playable runner. Existing run frames are cropped to measured alpha bounds and drawn at display resolution; their feet share a fixed point on the Z’s lower stroke. Reduced motion holds a single frame and disables preview bobbing.

Five-cell capability bars use fixed absolute bands, not roster ranking or upgrades. Exact values remain visible alongside the bars. For speed, jump and duration, bands 1–4 have inclusive upper limits; higher values fill more cells. Recharge reverses the direction: shorter cooldowns fill more cells. These are separate capability scales, not a claim that different powers are equally strong.

| Stat | 1 cell | 2 cells | 3 cells | 4 cells | 5 cells |
| --- | --- | --- | --- | --- | --- |
| Speed (px/s) | ≤80 | ≤120 | ≤180 | ≤240 | >240 |
| Nominal jump (px) | ≤40 | ≤70 | ≤100 | ≤130 | >130 |
| Power duration (s) | ≤0.4 | ≤0.8 | ≤1.2 | ≤1.6 | >1.6 |
| Recharge cooldown (s) | >6 | >4.5–6 | >3–4.5 | >1.5–3 | ≤1.5 |

Camera defaults live in `src/game/camera.ts`. Both modes use the same 512×288 view, 28px directional look-ahead, 90–240px vertical dead zone and 140ms easing. Ordinary jumps fit the dead zone; substantial elevation changes track vertically. The cave/jungle boundary no longer switches vertical thresholds or snaps the scroll. The jungle’s first-drop preview is retained, with a full-character visibility constraint. Reduced motion removes easing and anticipatory decorative panning; world bounds and gameplay tracking remain active.
