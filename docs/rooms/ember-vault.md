# The Ember Vault — authored room brief

Original authoring reference for this slice; no contributor image was supplied.

A forgotten stone dungeon with barred arches, worn statues, suspended chains and warm torches. Teach a small jump with a low plinth, then commit to a gap. A floor vent cycles between embers and a flame column. An elevated pair of ledges towards the end provides a short upper route. Finish on a clear, level threshold which opens directly into the cave. Preserve this order and the obstacle relationships.

- Room size: 1440 × 432 logical pixels; floor top Y=312.
- Plinth: X=288–352, top Y=280.
- Pit: X=480–576, 96 pixels wide.
- Flame vent: X=812–840, Y=252–312; 1700ms active in a 2600ms cycle, phase 0. An amber warning is visible during the final 400ms before ignition.
- Upper route: X=1040–1104 at Y=280, then X=1120–1232 at Y=248.
- Last 96 pixels: clear level floor, exit Y=312. The threshold is decorative and must not obstruct the player.

See [layout.svg](layout.svg) for the original spatial diagram. Collision definitions are separately maintained in `src/content/rooms.ts`.
