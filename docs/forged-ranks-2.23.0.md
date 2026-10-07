# 2.23.0 — forged ranks and stronger defenses

## Heroes

All three heroes now use continuous fitted helmets, cheek guards and curved nasal guards. A single shaped cuirass replaces intersecting breastplates. Rounded shoulder cups, raised fluting, articulated hip plates, shaped vambraces, closed greaves and fitted boots give armor a more coherent construction. The Ashwright has a sculpted grey beard, folded scarf, stitched leather lapels, a narrower apron and a caged ember lantern. The ranger retains a hood, layered cowl and scalloped leather skirt. Hero waists taper more naturally; the hammer's carried angle leaves more of the face visible. Legendary sleeves and Mythic/Godly full plate remain enforced across armor families.

The shoulder yoke and mantle fit the revised torso. Cloth still clears animated legs, the ground and a mounted horse's croup. Existing rarity colors, metal finishes, equipment effects and weapon appearances remain active.

## Horses

The shared horse model has a continuous barrel, shorter tapered skull, narrower muzzle, modeled nostrils, eyelids, jaw and ears, a more continuous neck, shaped leg joints and pasterns, and a solid mane and tail beneath finer hair strands. Coat shading adds subtle variation and dappled rare coats. A shaped saddle tree supports the seat; girth, stirrups, bridle, bit and reins are positioned against the body.

Seven tiers retain distinct coat and cloth colors. Higher ranks add fitted face armor, overlapping neck protection, curved shoulder/croup barding, fluting, rivets, heraldry and luminous fittings. Detached saddle surfaces and overlapping sun emblems were corrected during review. Stormrider cavalry now uses this same horse anatomy and riding rig at every rank instead of a separate primitive mount.

Physics, mount health, speed, riding controls and attack mechanics are unchanged. The model still has room for better integrated anatomy and tailored barding; this release does not claim the original concept's realism.

## Regiment identity and missing heads

Every rank keeps a complete skull beneath its helmet. The previous helmet-only construction omitted heads in 49 combinations: seven regiments at ranks 4–10. All 150 troop/rank combinations are now checked for actual head-bound skin geometry and finite animated meshes.

Fifteen regiments have distinct silhouettes and liveries:

| Regiment | Recognizable features |
| --- | --- |
| Shieldward | Teal livery, sallet and layered shield infantry armor |
| Longbows | Forest cloth, asymmetric shoulders, hood, feather and quiver |
| Pikeguard | Red sash and combed morion |
| Lanternkeepers | Ivory vestments, pointed cowl and paired reliquaries |
| Ashbreakers | Broad forge shoulders and vented face mask |
| Siege crew | Slate work harness, goggles and bolt cartridges |
| Stormriders | Royal-blue livery, lance helmet, plume and armored charger |
| Oathbound giants | Broad chain harness and massive forge pauldrons |
| Dawn standards | Gold command sash, officer crest and tall standard |
| Field engineers | Ochre work clothing, goggles, tools and survey pack |
| Veil blades | Narrow purple silhouette, wrapped face and crossed blade harness |
| Cinder adepts | Crimson split robes and furnace-crowned cowl |
| Ironwatch marksmen | Blue scouting coat, slouch hat and ammunition details |
| Rime scholars | Pale-blue robes, layered fur mantle and crystal diadem |
| Sun sworn | Ivory regalia, sun crown and fluted plate |

Ranks enrich each role rather than giving every specialist the same infantry helmet and quiver. Archer shoulder openings, caster headgear conflicts, mask clipping, floating caps and cape/belt intersections were corrected in successive reviews. These are original game meshes and fittings; no Heroes & Castles assets were copied. The reference's distinct mounted knights, giants, riflemen, archers and mages informed role readability ([official publisher description](https://apps.apple.com/us/app/heroes-and-castles-2/id993873900)).

## Defensive pressure

Reinforcements arrive in 9–12 formations per wave, at intervals no longer than 12 seconds. An opening advance party contains 5–12 enemies; later packets grow in size and shift toward armored threats. The first defense brings 28, 30 and 42 enemies across its three waves. Late campaign final waves can contain 184 enemies, with individual formations reaching 25. The simultaneous defense limit increases from 58 to 72, while spawning remains limited to four new models per frame. Waves still wait for both the scheduled reinforcements and surviving enemies to be cleared.

Existing suspended reinforcement schedules resume unchanged. The save validator accepts the larger new schedules; saved campaigns, gear, unlocks and mount contracts are preserved. No new game is required.

## Verification

- 225 unit tests pass, including new formation-density, delayed-queue and previous-schedule recovery cases.
- All 150 troop/rank combinations retain heads and render through idle, walk, run and charged attacks. All seven horses animate with finite geometry and hoof contacts; no shader errors.
- 84 hero/armor-family/rarity combinations check helmet, sleeve and plate coverage. All three heroes at Common, Legendary and Godly were inspected from front and rear. Walking, running, attacking, ground clearance and mounted cloth clearance pass.
- Production mounted playtests cover touch hiring, riding, acceleration, jump/landing, obstacle collision, damage to rider and horse, dismount/remount, visible spell and arrow projectiles, downward charged melee, first-person height, exhaustion and suspended battle recovery.
- An isolated first-defense simulation won with active combat and recruitment in 279.5 seconds; the idle strategy lost its castle in 391.1 seconds. This verifies a meaningful participation requirement, not the balance of every hero/build across the entire campaign.
- A 72-enemy/25-ally scene rendered without errors at a mobile viewport on desktop hardware. This is not a physical-phone frame-rate measurement.
- Independent review covered the full troop/rank set, focused front/rear hero and troop comparisons, mounted heroes, and all seven horse tiers. Multiple refinement passes resolved the reported head and attachment defects. The remaining concept-art gap is anatomy, tailoring and material fidelity, especially at close range.

QA artifacts are retained locally under `work/qa-design-overhaul/`. Tests use isolated browser profiles and synthetic campaigns; no player's save is reset.
