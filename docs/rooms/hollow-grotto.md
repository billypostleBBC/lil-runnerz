# The Hollow Grotto — authored room brief

Original authoring reference for this slice; no contributor image was supplied.

Cool green-blue rock replaces the dungeon masonry. Crystals, long stalactites and distant rock layers give depth while the solid route retains bright, readable edges. Carry the dungeon's floor height through the entrance. Two gaps divide the main floor; ascending ledges offer an upper route above spikes and the second gap. A final flame vent asks the character to time its shield before the exit beacon. Preserve the two gaps and the alternate route.

All coordinates below are local; add 1440 for the current course's world coordinates.

- Room size: 1440 × 432 logical pixels; floor top Y=312.
- Clear entrance: first 96 pixels; entrance Y=312.
- Pits: X=360–464 (104 pixels), X=864–976 (112 pixels).
- Ledges: X=540–588 at Y=280, X=608–720 at Y=248, X=760–856 at Y=216, X=896–976 at Y=248.
- Spikes: X=736–768 at Y=298–312.
- Flame vent: X=1120–1148, Y=252–312; 1700ms active in a 2800ms cycle, phase 900. An amber warning is visible during the final 400ms before ignition.
- Course finish: local X=1344 (world X=2784), marked by a lit doorway and chequered flag.

See [layout.svg](layout.svg) for the original spatial diagram. The second pit has both a lower jump and an elevated route; no bypass may be silently added.

## Art treatment — 6 October 2026

Follow the approved [16-bit scenery guide](../art/style-guide.md). The bundled background is decorative; platform silhouettes, gap widths, ledges, hazard bounds and timings remain defined by this brief and `src/content/rooms.ts`. The graphic upgrade does not change the route or collision data.
