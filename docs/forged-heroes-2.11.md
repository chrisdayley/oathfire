# Forged heroes and shorter sieges — 2.11

## Equipment names

The landscape inventory inherited a vertical card style while retaining a short, shrinking row. Its icon pushed the name and rarity below the button, where the next button covered them. Equipment rows now reserve horizontal space for the icon and a wrapping text column. Every row displays the item's name, rarity, level and principal stat. The equipped preview and slot cards also display rarity. Names remain above Overview, Compare and Improve.

## Hero and weapon refinement

All three heroes use finer metal, leather and cloth surfaces, neutral lighting, tighter character shadows and a soft, normal-dependent sky fill for backlit scenes. Skin has warm/cool variation, pore relief, defined deltoids, biceps, triceps and forearm tendons. The existing skinned elbows and physical collider remain in use.

The Warden gains fitted, artist-authored shoulder plates, gauntlets, cuisses, knee cops, greaves, sabatons and an elite helmet derived from the existing CC0 crownjoshua knight source. The Ashwright and Veilranger gain convex overlapping shoulder armor; the smith's apron gains structured pockets, flaps, fasteners, seams and a split hem. Royal liveries, restrained engraving and rune glow distinguish higher equipment rarities. The bundled geometry is `public/models/forged-harness.json`; the source, license and Blender extraction recipe are identified in `public/licenses/crownjoshua-knight-CC0.txt`.

All five weapon styles have more deliberate construction: honed sword edges and fullers, wrapped grips, banded hammer faces, leaf spearheads, laminated bows and caged staff focuses. Mythic and Godly effects remain tied to equipment; decorative fins no longer obscure the underlying weapon.

Weapon-aware idle poses keep weapons ready. Walk/run poses retain bent elbows, shoulder rotation and the two-handed hammer grip. Restoring the animation's base pose before applying procedural motion fixes cumulative torso lean. Attacks, charging, guard, jumping and casting still take priority.

Character menus now provide a full-screen **Inspect** view with Rotate, Show attack and Back to stats controls. It uses the actual equipped, animated game model.

A separate reviewing agent compared multiple revisions, similar-sized hero captures, gameplay, inspection views and gait poses with the supplied Heroes & Castles 2 screenshot. After revisions to shoulders, material contrast, silhouette, shield size and presentation, the reviewer approved this pass as comparable in modeled armor and weapon detail. This is a qualitative art review, not a claim of objectively superior art direction or parity with the earlier painted concept art.

## Siege pacing

Castle gates are now 945 metres apart, half the previous 1,890 metres. The hero still starts at Hearthwatch. The four capture camps and road scenery follow the shorter route. Reinforcements arrive sooner, in larger groups, about 58–72 metres ahead of the advancing hero. Larger roadside garrisons activate near each camp. Strength and frequency increase with time and progress, with a gentler early strength ramp than later sieges. Mobile enemy caps remain 42 normally and 58 at the final fortress.

Checkpoint migration translates the former compact arena and compresses the old long road without resetting health, Command, army, captured camps, loot or damaged fortifications. Migration happens once; resuming and reloading retain the new coordinates.

## Validation

- 123 automated rules, progression, equipment, save and geometry tests pass; production build succeeds.
- `scripts/armory-labels-qa.mjs`: 59 checks across 844×390, 667×375, 390×844 and 1280×588. Checks every equipment slot, text bounds, actual occlusion, selected-item identity, Compare/Improve headers and inspection controls.
- `scripts/hero-motion-qa.mjs`: 80 checks, including all 15 hero/weapon combinations, idle drift, walk/run elbow bend, hammer grip, foot contacts, combat transitions, collision, jumping, saved progress and offline startup.
- `scripts/siege-approach-qa.mjs`: all nine siege maps, home starting position, new terrain bounds, clear spawns, nearby reinforcements, pressure escalation, enemy caps and one-time long-road save migration.
- Separate terrain and legacy-resume checks cover relocated castle collision, attackable fortifications and old saves.
- A reproducible active-play simulation completed the first siege in about 7 minutes 43 seconds with a level-4 Warden, modest equipment and troops, all four camps captured and all four fortress parts destroyed. One seed was tested; this is not a comprehensive balance proof.

Browser checks use disposable saves and phone-sized viewports. They do not modify the player's campaign and are not physical-phone performance benchmarks.
