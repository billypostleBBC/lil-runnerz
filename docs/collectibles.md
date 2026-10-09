# Snacks and bonus routes

Implemented on `codex/collectibles`, 9 October 2026. No deployment or hosted verification.

Each run chooses the identity at each fixed, authored placement independently. Ordinary snacks are apple, cookie, bread roll, crisp packet, banana, cheese wedge, pretzel, doughnut, chocolate bar and flapjack. They award 10 points. Bonus placements currently choose from a one-item pool: a Kilner-style clasp-top jar of chilli chutney, worth 100 points. Random choice is with replacement; an individual run need not contain every variety.

Both control modes use the same body-overlap collection rule. A pickup disappears immediately and cannot score twice. The HUD shows the running score, a brief +10/+100 label marks pickups, and pause/results show the snack and bonus tally. Simulation pause freezes feedback and scoring. Starting or retrying resets every pickup and score. Reduced motion keeps feedback stationary.

`src/content/collectibles.ts` owns the names, variety pools, room-local centre coordinates and bonus-route waypoints. `src/game/collectibles.ts` validates placement bounds and solid intersections, chooses varieties, tracks collection and makes autonomous bonus decisions. `src/game/snack-art.ts` draws the original integer-grid artwork with stepped shading. There are no image downloads or added dependencies.

To add a bonus variety, extend `bonusVarieties`, its display name and its `paintSnack` artwork. All existing bonus placements will then choose randomly from the expanded pool at run start. To add a placement, supply its room-local centre and kind; keep its pickup rectangle clear of solids and test actual access. Bonus routes require authored take-off and landing points; adding an item does not invent a route.

Autonomous runners deliberately take the upper dungeon and cave routes and attempt the Jungle Run climb. They use normal movement and jumps with shared collision/power rules. These bonus routes are authored knowledge, not a search algorithm or learning. Routes beyond a character's nominal jump rise are skipped. Existing ledges already reached during a glide can join the route. A missed jungle entry falls back towards the normal exit, and the summit has a descending return route. Ordinary stuck handling remains active.

The existing first Jungle Run bonus landing stays at Y=852. The successful entry takes off at approximately local X=904, just after the river edge, using the existing coyote-time allowance. A too-early jump hits the divider; the original route remains deliberately demanding. The bonus platform geometry is unchanged. Later jungle refinements add two entrance boulders and move the snake into the canopy; see `docs/rooms/jungle-run.md`.
