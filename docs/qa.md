# Oathfire release QA

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
