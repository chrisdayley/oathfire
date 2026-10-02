# Crownfall: sieges and the last defense

The 24 core missions remain defenses. The eight optional settlement IDs (24–31) now attack an enemy castle, and ID 32 is the required Obsidian Crown siege. The last campaign sequence is:

**The Door of Names → The Obsidian Crown → The Last Dawn at Hearthwatch.**

The Hollow King appears in the sixth wave of the final defense. Destroying his fortress alone does not award the ending. Existing completed campaigns and settlement tribute remain earned; those players can replay the new sieges without losing their old ending.

## Siege objectives and tactics

Each castle has an ironbound gate, two gun bastions, and a dread keep. Destroy the gate to expose the keep. Destroying the keep wins immediately, including when enemy soldiers remain. Losing the hero loses the expedition. The player's distant home gate is not a siege objective and cannot take siege damage.

Bastions fire real bolts or grave projectiles. Destroying one removes its fire and collider. Gates and bastions collapse with dust and stone impacts, leaving low debris. The closed gate and intact walls block capsules and projectiles. The breach removes its navigation obstruction, so troops advance through it. Melee attacks and auto-aim target the nearest face of a structure rather than requiring a hit at its center.

Charged attacks gain 25% siege damage. Pikeguard and Siege Crew retain their trained siege-target multiplier against fortifications; armor penetration applies. Field engineers advance on sieges and deal 2.5 times their base damage to masonry. Magical Imbuement, Siege Hero research, army auras and applicable equipment powers also work against structures. Root, stun and knockback do not displace buildings.

New recruits and research reserves arrive at the forward rally standard. Assault orders seek soldiers and structures; Follow can bring an army through a breach. The captured ridge supply camp grants Command and lengthens enemy reinforcement intervals by 20%. Home emplacements and wall-only research are omitted from the siege command menu.

## Pressure and economy

Sieges have continuous reinforcements rather than finite enemy waves. Pressure increases every 55 seconds, and once more when the gate is breached, up to tier six. Each tier adds a soldier to the next packet and shortens the interval. A field population limit bounds CPU/animation cost; it does not award victory or stop later reinforcements when soldiers die.

| Siege | Starting Command | Gate HP | Each bastion HP | Keep HP | Reinforcement interval, I → VI |
| --- | ---: | ---: | ---: | ---: | --- |
| Willowmill | 55 | 420 | 280 | 760 | 26 → 11 seconds |
| Reedhaven | 55 | 564 | 376 | 1,020 | 25.2 → 10.2 seconds |
| Coppergate | 65 | 780 | 520 | 1,410 | 24 → 9 seconds |
| Whitepine | 75 | 996 | 664 | 1,800 | 22.8 → 9 seconds |
| Sunspire | 85 | 1,212 | 808 | 2,190 | 21.6 → 9 seconds |
| Briarhaven | 95 | 1,428 | 952 | 2,580 | 20.4 → 9 seconds |
| Greywake | 105 | 1,644 | 1,096 | 2,970 | 19.2 → 9 seconds |
| Dawnmere | 115 | 1,860 | 1,240 | 3,360 | 18 → 9 seconds |
| Obsidian Crown | 180 | 2,076 | 1,384 | 3,750 | 15 → 5 seconds |

Ordinary siege packets grow from two to seven soldiers. The final fortress grows from three to eight, advances pressure every 38 seconds, begins with a larger garrison, and allows up to 58 active enemies instead of 42. Enemy health and damage also grow with pressure. Command regeneration remains 0.6/s before the existing limited camp, standard and research bonuses; a larger opening army is not a faster recurring income stream.

Rescue rewards and tribute work as before. The required final fortress pays its completion reward but does not count as a rescued settlement or pay itself tribute. The battle report includes destroyed fortifications, fortress damage, peak pressure, reinforcements, loot and elapsed time. Hero/army damage totals include their damage to structures.

## Architecture

`fortress-art.js` constructs original textured geometry: a vaulted gatehouse, iron lattice gate, circular gun bastions, layered masonry, buttresses, slitted lit windows, spires with metal ribs, hanging chains, broken-crown heraldry and regional cloth colors. The Obsidian Crown has a taller central keep and violet-lit windows. Scenery generation reserves its footprint and the terrain forms a continuous traversable plateau. The courtyard behind the gate is playable.

Hearthwatch receives a colored-glass rose window, a carved entry arch and gable, stone capitals and buttresses, copper roof ribs, paired gallery windows and colored market drapes. The original painted concepts remain art-direction targets; this release does not claim equivalent photorealism. Static details are merged by material and use the existing credited scanned surfaces.

## Persistence

Save schema 1 and the existing storage key remain. `fortresses: [32]` is separate from completed defenses and rescued settlements. Siege checkpoints preserve each structure's health, pressure, reinforcement timing and counts, destruction statistics, hero, army and research. Reloading a breached gate keeps its model/collider removed. A pre-2.5 suspended settlement is converted to a siege at its forward camp, retaining its hero condition, army, Command, research and earned battle ledger; the old defensive timer and positions restart for the new objective.

## Verification

- 98 automated tests cover campaign sequencing, legacy progress, tribute idempotency, siege pressure, structure health validation, abilities, regiments, equipment and the earlier game systems.
- `siege-qa.mjs`: mobile briefing/command/HUD, real sword and arrow damage, protected keep, closed-gate collision, walk-through breach, automatic army attacks, firing/destructible bastions, save resume, victory with living enemies, statistics, final-fortress lock and final boss spawn.
- `siege-terrain-qa.mjs`: all nine siege maps have a valid plateau, clear reinforcement spawns, melee damage at the edge of a gate, and valid pressure-six checkpoints. Includes legacy-battle conversion and actual 667×375 menus.
- `siege-balance-qa.mjs`: seeded 101 and 707 first-siege simulations. Active play wins both; idle hero plus repeated archer recruitment loses both. This is accelerated real combat/physics with a level-two Warden and rank-two Longbow, not forced victory.
- `final-siege-qa.mjs`: an endgame Warden (level 24, Epic +8 gear), rank-X giant, support recruitment, normal research, potions and Follow orders completes the final fortress. Earlier shield/archer and prolonged skirmishing attempts lost. The passing run uses ordinary damage and resources and does not force victory.
- `progression-qa.mjs`: all 47 regression checks pass, including 23 active casts, tactical troop effects, menus, unlock reveals and save reloads.
- `siege-smoke.mjs` verifies the production bundle, actual recruitment, charged damage, breached-gate reload, pressure-six save validation and reward settlement without importing development modules.

Evidence is written to ignored `output/siege/` and `output/progression/`. Browser viewport checks are not physical-phone performance or a human playthrough of every campaign mission. Difficulty is tunable through the shared siege rules and mission tables.
