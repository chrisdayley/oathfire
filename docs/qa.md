# Oathfire release QA

## Armor update — 1.3 (October 1, 2026)

- `npm test`: 22 passing tests. Armor coverage checks independent equipment slots, inactive carried gear, all six patterns, exact modifiers, rarity/forge/awakening, defensive sockets, randomized loot distribution, first-victory armor, inventory-full conversion, invalid patterns, and preservation of legacy item IDs, modifiers, upgrades and resources.
- `armor-qa.mjs`: 21 passing browser checks using the actual UI, combat system and fixed simulation ticks. With equal protection values, Cinderforged reduced a fire hit from 79 to 59 while the physical hit stayed 79; charged strikes rose from 48 to 53 while quick strikes stayed 25. Bastion reduced block stamina use from 35.53 to 29.84. Marchwarden increased a troop hit from 100 to 110 at its extended radius and left distant troop damage at 100. Dawnkeeper changed draught recovery from 100 to 120. Starwoven focus regenerated at 4.55/s versus 3.5/s; Wayfarer stamina recovered at 22.5/s versus 18/s, with guard still at 2/s.
- `campaign-test.mjs`: the input bot won all three waves of the first defense with normal starting stats, movement, attacks, purchases and potions. Zero enemies remained; the reward was a specialized armor pattern of at least Uncommon rarity. An earlier QA run was interrupted by a development-server reload during source edits; the final unchanged source completed successfully.
- All 66 pattern/forge models (six patterns, +0 through +10) have skinned geometry and moving leg joints; each forge step changes geometry. Equipped and preview models update immediately. A candidate preview does not equip the item. Worn armor, full inventory and currency survive reload.
- `playtest.mjs --pwa`: 33 passing production-build checks for movement, skeleton animation, quick/charged attacks, all menus, projectiles, spell/audio events, rock/stair collision, exploration rewards, recruitment, saved battle restoration, 844×390 controls and offline startup.

Actual rendered armor and comparison menus were visually inspected. Mobile checks use desktop Chromium/Metal with touch/viewport emulation; physical iPhone/Android performance remains unmeasured. Test saves are isolated from the player's browser profile. Machine reports and screenshots are in `work/qa-armor/` and `work/qa/`.

## First Oath update — 1.2 (October 1, 2026)

- `npm test`: 15 passing tests. New coverage preserves original save resources, ranks, equipment and hero progress; rejects corrupted migration data; enforces four-slot refitting, campaign locks and battle restrictions; prevents repeat victories from advancing unlock gates.
- `journey-qa.mjs`: 26 passing browser checks. Normal controls complete the movement, look, quick/charged attack, cast and jump lessons. The actual menus teach inspection, briefing, deployment and orders. Story pauses the simulation. First-defense buttons stay visible at 844×390. All 150 troop-rank models and all 80 defense-rank models build; the seven new troops and five new defenses change geometry every rank. Refitting changes the live castle and colliders. Cannon preview geometry moves when Preview action is pressed.
- Tactical fixtures confirm gate repair, non-stacking standard support, the Sun sworn's third-hit heal, armor penetration, cannon splash, ice slow, arcing stone impact, chain lightning, Sanctuary healing and friendly projectile safety. An ice shot initially clipped its own collider; its muzzle clearance was corrected before passing.
- The actual save-import UI and automatic load path accept an original-format suspended campaign and retain 713 fixture Supplies, rank-IV Shieldward and the active mission. Tests use isolated browser profiles, never the player's live save.
- `playtest.mjs --pwa` against the production build: 33 passing checks, including walking skeletons, physics, collisions, jumping, menu controls, attacks/projectiles, spells/audio, recruitment, saved battle restoration, phone-sized control bounds and offline reload.
- `extended-qa.mjs`: 45 passing checks covering touch input, geometry, all fifteen mission spawns, all 23 spells, distinct non-clipping spell waveforms and the complete five-wave final siege. The separate first-mission bot also won with starting stats, normal Command and ordinary purchases. No browser runtime errors were recorded.

Visual review checked the actual opening, mobile guide, mission briefing, cannon and storm previews, and rank-X standard bearer. It caught the initially hidden briefing actions; the action row now stays outside the scrollable story body. The first emplacement's numeric button ID was also corrected. These are desktop Chromium/Metal and emulated mobile checks, not a physical iPhone/Android certification.

The historical evidence below describes earlier releases.


This records executable checks, not a claim that every feature has been manually played on a physical phone.

## Permanent systems

`npm test`: 11 tests passing. Coverage includes all three hero starts, experience and point budgets, skill prerequisites, all ten regiment/defense ranks and chapter gates, item forging/rune/temper unlocks, equipped-item salvage protection, one-time treasure collection, repeat mission rewards, awakening, invalid-save rejection, transactional rollback and backup round trips.

## Browser interaction and physics

`playtest.mjs` exercises the normal controls and menus in Chromium at 1280×720 and 844×390. Verified running movement and changing leg-bone rotations; quick and held attack inputs; jumping; all menu pages; rank-X previews; actual upgrade costs and live tower changes; bow equipment and travelling arrow geometry; chest rewards; fire casting and sound events; troop recruitment and orders; battle/army restoration after reload; and mobile control bounds/scrolling.

The low-rock fixture uses Rapier's real capsule movement. Walking stopped at approximately z=-30.16 before the rock centered on z=-32. Jumping peaked around 1.65m and cleared it to z=-34.82. No wall bypass is used in this check.

## Extended checks

`extended-qa.mjs`: 34 checks passing. Touch input moves and releases the virtual stick; touch Attack works; optional first-person mode shows arms and hides the hero's own body. Every one of the eight regiments and three defenses has ten distinct geometry stages. All fifteen mission definitions build their terrain and spawn valid enemies with active collision.

All 23 named techniques cast and produce their own sound event. Offline audio rendering confirms non-silent, distinct waveforms; the largest measured single-spell peak was below 0.17 on a normalized ±1 scale. This verifies signal output and clipping headroom, not a human listening review.

The first mission was played to victory by a fixed-step input bot using normal initial combat stats, troop purchases, movement, attacks and potions. It defeated the complete third wave before receiving rewards. A final-battle fixture used a developed level-30 hero and rank-X equipment/army/defenses, selected Follow orders, survived all five waves and defeated the boss with zero enemies remaining. The first and last complete encounters were exercised; the middle territories received spawn/navigation checks rather than full human playthroughs.

## Bugs found and corrected

- Final-wave spawning could briefly satisfy an empty-enemy victory check. Victory now checks the current living enemy collection after spawning.
- Frame clamping slowed movement under a slow renderer. The fixed-step catch-up budget was increased, and Auto graphics can reduce rendering cost.
- Large stretched stone UVs and excessively coarse grass were replaced with world-scale surfaces and smaller crossed grass blades.
- Scenery occupancy now includes quarry blocks, ruins and the practice rock; enemy spawns are moved out of static obstacles.
- Pausing or losing attack input could leave a charging pose active. Cancelled input now clears charge state; a later key release cannot trigger a ghost strike.
- The upper stair landing and an oversized parapet obstructed the rampart route. Their geometry was corrected and the real capsule controller walked up all steps to the treasure walkway.
- Static cache entries could miss anonymous script/stylesheet requests because of `Vary: Origin`. Public static asset lookup now ignores that header difference, and cache versions include the worker generator itself.
- Returning after a background pause now resumes the audio context through the next menu gesture.
- Scene switches dispose world geometry/material resources; rigid weapon pieces are merged to reduce draw calls.

## Visual comparison and limits

The live build was compared with the courtyard and battlefield concept paintings. The game preserves the wide field, teal/gold heraldry, warm stone, vendors, parapet exploration and model-focused menus. The executable scene has a distinctly stylized, lower-detail character/environment treatment. It is not a photorealistic reproduction of the painted mockups.

No physical iPhone or Android device was available for this run. Landscape viewport and touch emulation do not establish physical-device frame rate, thermal behavior, Safari audio behavior or App Store readiness. Save export is provided so browser storage can be backed up.

The final production build passed 33 browser checks, including cold offline startup and restoration of the saved battle. The character walked to z=27.83 on the 5.23m-high rampart through the actual stair collision. No runtime or WebGL shader errors were reported.

Exact GitHub deployment and public asset hashes are verified at release time. Local raw screenshots and detailed machine reports are kept in `work/qa/`.


## Version 1.1 — refined art pass

The new build passed all 11 permanent progression/save tests, all 33 production browser/PWA checks, and all 34 extended checks. The first-person hands, full-body movement, touch controls, travelling arrows, quick/held attacks, rock collision, jump clearance and complete rampart route still work with the replacement body geometry. The test used a fresh isolated browser campaign, not a user's save.

All eight regiments and all three defenses still have ten distinct geometry stages. Every territory builds valid physics and enemy spawns. The developed final-battle fixture completed all five waves with zero enemies remaining and 209 hero health. Spell audio checks produced 23 distinct non-silent waveforms without clipping. Save/army restoration and cold offline start both passed.

The art catalogue was inspected in the live renderer: Warden, mounted Stormrider, all eight Hollow Host designs, courtyard, open field and rank-X tower. Comparison with the concept paintings drove adult body proportions, steel/leather/cloth materials, fitted equipment, masonry, organic foliage and atmospheric ridges. Recessed skull sockets replaced protruding eyes; idle weapons received carrying poses; the highest tower received a wider preview camera so its roof is visible. The game still has a simpler, constructed geometry style than the painted references; this pass is not a photorealism claim.

Browser QA on macOS uses the Metal backend. Software WebGL is also capable of displaying the scene but is not used as evidence of real device performance. Mobile checks use an actual 844×390 browser viewport with touch emulation. No physical phone performance or Safari compatibility certification is claimed. All new scanned assets are bundled locally, and their uploaded Git blob hashes are checked against the downloaded bytes.

Additional skinning checks sampled transformed arm and leg vertices across animation frames for all three heroes and all eight enemy designs. All eleven bodies deformed, retained finite coordinates and used the new original meshes. The rank-X tower roof projected inside the preview viewport (normalized y=0.539). The mobile bestiary was also inspected at 844×390. No JavaScript or shader errors were recorded.
