# Jungle Run — room design proposal

Status: implemented locally, 6 October 2026. The reviewed concept is retained below; the implemented tuning and verification are recorded at the end.

## Contributor intent

Billy supplied `IMG_5140.HEIC`, annotated “Jungle Run”, and a spoken brief. The drawing is not to scale; Billy explicitly permits liberties and using it as inspiration. Preserve the sequence and relationships rather than tracing dimensions.

Enter at the upper left. Drop from a ledge while avoiding a spike pit, pass a hanging spider, descend a waterfall that overpowers upward movement, escape a whirlpool, and follow a fast river towards a snake that periodically lunges from a tree. An optional series of jumps climbs the right side to a marked bonus area, walled off from the spike pit and accessible only by a correctly timed jump as the river carries the character off its final ledge. Leave through the bottom of the room. Collectibles and scoring are deferred.

Source: [original sketch](sources/jungle-run.HEIC). Review diagram: [jungle-run-layout.svg](jungle-run-layout.svg). The diagram is a route study, not collision geometry or finished artwork.

## Proposed route

1. **Arrival shelf:** a quiet upper-left entrance gives space to see the first drop. Foliage frames the path without hiding the edge.
2. **Steered drop:** run off the right end and steer left onto the shelf below. Spikes occupy the overshoot zone to the right. Reveal the landing and spikes before the player commits; avoid a blind lethal fall.
3. **Spider crossing:** travel left under the arrival shelf. The spider swings through this route on a visible thread. Include a dry waiting position outside its sweep. Contact with the spider's body causes damage; the thread is decorative.
4. **Waterfall:** the left end feeds into a downward chute. Once inside, the flow wins over jumping and gliding. Keep lateral steering so the player can aim for the pool's exit. No new swimming controls.
5. **Whirlpool:** land in a shallow basin. Its inward pull slows escape but remains weaker than sustained movement towards the right lip. It must not become an inescapable holding state. The water itself is not lethal in this proposal; no oxygen meter or drowning mechanic.
6. **River and snake:** the outflow accelerates movement to the right towards the tree. Show the snake's wind-up before its lunge. Keep a stepping stone near the pool and allow counter-steering before the snake so the player can time their approach; a recovery gap after the lunge must permit passage. Shield protection does not cancel current forces.
7. **Optional climb — timed river-edge entry:** a continuous solid wall separates the spike pit and upper route from the bonus area and its climbing ledges. Extend it to the room ceiling so it cannot be jumped or glided over. Its only access is below the wall, from the final river ledge after the snake. Time a jump as the current carries the character off that ledge to reach the first bonus platform across the spillway; simply drifting off must carry the character down towards the normal exit instead. Use the existing brief coyote-time allowance at the edge, not a new mid-air jump. Tune the first landing height, gap and current together so the jump timing matters. Climb successive ledges inside the separated area and return down those ledges to the spillway. Label the destination “BONUS AREA — COMING LATER”. No points or collectibles yet.
8. **Bottom exit:** the river spills into a clearly framed downward opening. Crossing that opening completes this room; falling elsewhere remains a fall, not an exit. A future room can receive the character through a matching top entrance.

## Scale and presentation

Start the blockout around 1120 × 1120 logical pixels, retaining the 640 × 360 viewport and existing character physics. This is a tuning proposal, not an accepted engine limit. Current characters have a theoretical jump rise of about 93 pixels (410² / (2 × 900)); start bonus steps at 56–64 pixels rise, then verify their horizontal spacing in play. “Multi-jump” means successive platform jumps, not a new mid-air jump ability.

Keep the approved 16-bit scenery treatment: dark petrol-green recesses, layered foliage, faceted mossy rock, pale readable platform lips and stepped turquoise water. Background trees stay subdued; the snake tree is recognisable. Moving water marks actual force regions. Water, hazards and solid platforms remain separate from background art.

The camera should anticipate substantial drops and show the next landing, retain a dead zone for small jumps, and follow leftward travel naturally. The full-room overview is for authoring only; play still reveals the room progressively.

## Implementation implications

The inspected runtime currently assembles rooms exclusively along X, requires matching entrance/exit floors and heights, decides autonomous movement with `move: 1`, measures progress along X, and checks a fixed right-edge finish. Those assumptions must be changed before this layout can work honestly.

- Add explicit entrance/exit edge, position and clearance; retain current left/right defaults for existing rooms. Match bottom exits to top entrances and translate both X and Y. Reject overlapping room placements and blocked connections.
- Detect completion by crossing the intended exit in its outward direction. Validate the connection before treating a bottom crossing as safe; do not simply disable fall death.
- Give this authored room a short ordered route with landing/wait targets. Autonomous actions follow the same forces and hazards as manual input. Track progress by reached route sections so heading left or down is not mistaken for being stuck.
- Implement waterfall, whirlpool and river as bounded movement regions. Apply their effects after voluntary movement and glide rules, with explicit speed limits; current character speed caps must not silently suppress the river boost.
- Give spider and snake visible warning, active and recovery phases. Their drawn bodies and collision areas must agree. Use simulation time so pause freezes hazard cycles and forces.
- Preserve character, power and run state across connections. A bottom-to-top connection should continue the fall into a clear receiving area without a hazardous blind spawn.

Build and verify the room in isolation before inserting it into the course. The next room's art and challenge are not specified; a safe receiving fixture can verify a downward join without inventing another authored room.

## Checks required before calling it playable

Verify ordinary-action traversal in both modes; steered drop success and spike death; spider and snake warning/contact/recovery; forced descent despite glide; escapable whirlpool; current-assisted movement and counter-steering; timed river-edge jump success and missed-jump descent to the normal exit; bonus climb and return; solid-wall exclusion from the spike pit and upper route, including with shield or glide; correct bottom exit versus ordinary fall death; restart and pause clearing input; camera visibility during drops and reversal; unchanged existing-room behaviour. Test deterministic force, timing, route-progress and connection rules, then inspect the rendered room and production build. Exact timings and geometry remain subject to those checks.


## Implemented tuning — 6 October 2026

The third room follows the cave at world X=2880. Local size is 1120×1120, entrance floor Y=312, and the marked bottom exit spans X=932–1032 at Y=1120. The original rooms retain their collision geometry. There is no fourth authored room yet; this bottom crossing ends the run. The assembler also supports matching a bottom opening to a following top entrance, covered by a test fixture.

- Arrival shelf ends at X=690. Land on the return shelf (X=240–760, Y=560); spikes occupy X=772–892 at Y=592.
- Spider: 4-second cycle, active for 1.2 seconds, retracts during recovery, and descends as a 400ms warning. Its active body swings 42 pixels either side of its anchor; drawing and collision share the same position function.
- Waterfall: X=156–240, Y=546–890. Minimum downward speed 300px/s, capped by the shared 700px/s terminal speed. It overrides jumping/gliding while preserving horizontal steering.
- Whirlpool: X=120–350, Y=876–920. Pull towards the centre, up to 90px/s; baseline 160px/s movement can overcome it. No water damage or drowning.
- River: X=350–900, Y=888–920, directly adjoining the whirlpool and adding 110px/s rightward drift. The existing pool-exit rock remains; counter-steer to hold back before the snake. Full right movement reaches 270px/s; full left movement still makes 50px/s against the current.
- Snake: 4.4-second cycle, active for 1.1 seconds with a 400ms warning. Lunges left from the tree; body collision shares its animated position. Shield prevents creature damage, while glide does not.
- Divider: X=900–924, from ceiling to Y=832. First bonus landing: X=1000–1104 at Y=852. A falling character cannot pass under the divider and land on that platform; a timed river-edge jump can. Six further rises of 60px lead to Y=492. All are solid platforms, so take off clear of the next platform's underside. Return down the alternating ledges to the final spillway.
- Existing jump/coyote/buffer rules remain unchanged. Autonomous play follows the main route, using character reaction/perception settings and visible hazard phases; the optional climb is for manual exploration in this slice.
- The camera previews the first landing before the drop, follows substantial vertical changes, and stays inside the jungle horizontally once deep in the room. Reduced motion removes decorative water scrolling and parallax; meaningful creature movement remains visible.

Background: `public/assets/scenery/jungle-run.png`, generated with the built-in tool using the existing scenery as style references. [Prompt and origin](../art/jungle-generation.md). Water, solids, creatures and bonus labels remain separate code-drawn elements. Runtime geometry in `src/content/jungle.ts` is authoritative; the SVG remains a conceptual route study.

Verification evidence and exact remaining limits: `output/playwright/jungle-verification.md`. Deployment is not part of this local implementation.

### Basin boundary — 8 October 2026

The basin floor now extends from X=0 to X=900 at Y=920, with solid ground down to the room bottom. A solid cliff occupies X=0–100 from Y=360 to the bottom, below the arrival shelf. Mossy rock and vines mark the blocking face. This closes the left side of the waterfall/whirlpool basin while preserving the upper entrance, main descent, river-edge jump and bottom exit. Water force regions are unchanged.

### Connected water and concealed edges — 8 October 2026

River rendering and force geometry now start at the whirlpool outflow (X=350); the former 210px gap is removed. Autonomous waiting uses left input to resist the current before the snake. Water banks render in front of the water: overlapping mossy stone and creepers cover waterfall sides and the basin rim, with an uneven pool surface leading into the river. These small decorative overlaps do not add collision walls inside the water.

### Left ledge continuity — 8 October 2026

Added a solid bank at X=100–156, Y=560–608, joining the left cliff to the waterfall lip at the same height as the spider shelf. The chute at X=156–240 remains open. The basin floor still spans X=0–900; cliff art now stops at Y=920 so its continuous top remains visible through the join. Jungle solids now use mud, moss and roots instead of dungeon-style masonry.

### Collectibles — 9 October 2026

The deferred bonus is now a chilli chutney jar worth 100 points. Ordinary snacks award 10. Autonomous runners pursue the climb and return down to the exit. Geometry remains unchanged: browser traversal confirmed the existing Y=852 first landing is reachable using the river-edge coyote jump. See [collectible rules](../collectibles.md) and [current verification](../../output/playwright/collectibles-verification.md). Historical deferral notes above describe the original room build.

### Entrance boulders and signage — 9 October 2026

Removed all in-world area lettering (room title, spider/falls, current, jump, bonus and exit labels) and the decorative exit marker strips. The global room/score/power HUD, controls and accessibility announcements remain. Two solid boulders now occupy the arrival shelf at local `(288,280,64,32)` and `(520,280,48,32)`. These use the dungeon obstacles' established 32px rise, with clipped faceted rock and moss artwork. Both sit outside the 96px entrance clearance. The controller jumps raised obstacles while retaining its deliberate drop from the shelf end. Other geometry and every hazard remain unchanged.

### Snake tree — 9 October 2026

The tree now has a continuous, densely layered pixel canopy, a curved widening trunk, outward roots and forked upper branches. It renders in front of the river so its roots remain visible. These forms remain scenery, not new collision platforms.

The snake's anchor is local `(648,740)` inside the canopy. Its definition is now 32px wide with a maximum hanging length of 172px; at full extension its head reaches Y=912. It peeks out during the existing 400ms warning, drops over 180ms, holds, and retracts over the final 220ms of the existing 1.1-second active phase. The 4.4-second cycle is unchanged. During recovery only eyes remain in the canopy. The head and each small curved body segment supply both their drawn bounds and collision rectangles; the tongue is decoration. Inactive/warning phases do not damage the runner. Reduced motion retains these gameplay-critical phases.

The autonomous snake waiting zone now spans from perception range to 48px before its anchor. This prevents the old narrow zone being skipped at river speed between reactions. Marty also waits for enough of a flame's off phase to clear his entire body, instead of relying on a jump with marginal descent clearance. Neither change gives immunity or changes character physics.
