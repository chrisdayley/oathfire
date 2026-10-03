# The marching host — 2.15

## Castle-directed assaults

Ordinary defending-mission enemies now march on the gate, then the beacon. Merely standing near one no longer pulls it away from that objective. A damaging hit from the hero or an allied soldier creates a nine-second retaliation order; further hits refresh it. The enemy returns to the castle when the attacker dies, moves out of pursuit range, becomes unreachable, or the order expires. Reavers, wraiths and siege longbowmen retain explicit troop-hunting roles; longbowmen favor the wall garrison. Enemy scouting descriptions explain these roles. Garrisons on offensive siege maps continue defending their own fortress against the invading army.

Castle archers/mages release visible projectiles and apply damage on impact. Melee enemies walk to the visible gate face before striking it. The navigation/spawn obstacle bounds now distinguish overhead architecture from obstructions at soldier height; the gatehouse arch no longer blocks a valid ground route. Large melee enemies use their scaled reach. Existing collision shapes remain in place.

## Sustained waves

Each defensive wave has a saved, deterministic schedule of seven to eleven reinforcement packets over 72–120 seconds. Later packets are larger and closer together, include more of the unlocked heavy units, and rise to +18% health / +10.8% damage relative to the start of that wave, on top of existing mission/wave scaling. Total troops increase over the old simultaneous roster. Enemy introductions remain tied to campaign progression.

Clearing an opening packet does not end the wave. The next wave starts only after every scheduled reinforcement has arrived and every surviving enemy is defeated, followed by an eight-second respite. Bosses enter with the last packet of their final wave and trigger their music then. The HUD shows reinforcement time, then remaining enemies. A 58-enemy field limit queues overdue troops instead of dropping them, with at most four model creations per simulation step.

Save/resume retains the exact schedule, cursor, health, assault strength and retaliation identities. Pre-2.15 suspended battles finish their already-spawned wave before using the new schedule. No player inventory or progression reset is required.

## Hero armor and silhouette

All three heroes now wear a helmet as part of equipped armor. Neck height, shoulder width and exaggerated limb inflation were adjusted for a more natural adult silhouette. Legendary and higher armor covers the arms with fitted metal sleeves and gauntlets. Mythic and Godly armor has a closed visor, shaped cuirass, abdominal lames, thigh plates, knee/elbow cops and closed calf greaves, including armor families formerly styled as cloth or leather. Class equipment and color identity remain visible.

Ankle-length embroidered mantles replace the short capes. They have a gathered shoulder yoke, shoulder fastenings, irregular folds, stitched edging, a worn uneven hem and restrained high-tier glowing embroidery. The animated cape checks the actual calf/foot positions to reduce leg clipping. Ranger quivers sit against the side harness with shoulder and lower straps. These changes follow the existing skeleton and preserve weapon grips, attacks and Rapier movement.

The new cape textures are generated locally from original patterns. Armor uses the existing bundled geometry and surface assets with their retained credits. No new remote runtime dependency or unlicensed reference-game asset is included.

## Independent visual review

A separate agent viewed the supplied concept and compared actual rendered heroes through baseline and successive implementation passes. Review led to fixes for cape/backplate intersection, uncovered high-tier arms/calves, moving boots piercing the cape, a detached-looking cape neckline, missing Legendary Ranger/Ashwright boots and unsupported quiver placement. Coverage included all three heroes, Common/Legendary/Mythic/Godly samples, front/rear/side poses, running phases and high-tier trail/spellweave families. Local captures and candid reviews are under `work/hero-215-review`.

The result is a substantial silhouette and armor-coverage improvement, not literal parity with the painted reference. Cloth folds and material/weathering naturalism remain simpler than that painting. Rendered checks cover sampled poses, not a guarantee of zero clipping for every possible combination.

## Validation

- 151 automated rules/geometry tests pass, including schedules across every defensive mission, targeting/retaliation, save validation, legacy saves and rarity coverage.
- Real-browser assault checks exercise castle approach and damage, delayed physical arrows, continuous reinforcement gaps, survivor cleanup, checkpoint reconstruction, boss entry, success transition and HUD containment at 844×390 and 667×375.
- 84 hero/armor-family/rarity combinations are constructed and checked for valid skinned geometry and coverage; representative poses are independently inspected visually.
- Existing movement checks pass for all 15 hero/weapon combinations, including gait, grips, guard/attack/jump/cast, scenery collision and save/reload.
- A seeded full first-mission simulation with starter Warden gear and active combat/recruitment wins in 294 seconds. The same unattended castle loses in 386 seconds. This is a useful early-mission balance sample, not proof of balance for every campaign build.
- Production browser regression covers preparation, Command plans, physical wall arrows and enemy return fire, separate field/wall caps, cavalry charges, rewards, all nine siege routes and old siege-save migration.

Publication is followed by an exact-file comparison of the live GitHub Pages build and a disposable-save assault check on the public URL. Existing personal campaigns are not used for testing.
