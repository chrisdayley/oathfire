# First Oath — playable design update, 1.2

## What the original game teaches us

Research checked October 1, 2026. The detailed mechanics below come from the community-maintained Heroes & Castles 2 wiki, not an official balance specification. Its unit index lists 24 ground, six wall and eleven support units. That breadth includes repair, healing, ranged support, artillery, cavalry and large creatures—not simply successive stronger swordsmen. [Unit index](https://heroesandcastles2.fandom.com/wiki/Units).

Unlocks vary: the Paladin follows wave 9; the Captain requires Fell Crystal IV; Gray Beard requires Crystal VI; Forge Master requires a level-20 Dwarf. Their identities include healing, leadership, ranged support and artillery support. [Paladin](https://heroesandcastles2.fandom.com/wiki/Paladin_Unit), [Captain](https://heroesandcastles2.fandom.com/wiki/Captain), [Gray Beard](https://heroesandcastles2.fandom.com/wiki/Gray_Beard), [Forge Master](https://heroesandcastles2.fandom.com/wiki/Forge_Master).

H&C2 has four tower slots with cannon, ballista and crystal choices. Research also uses territory/crystal unlocks and limited simultaneous selections. These systems encourage complementary choices. Oathfire keeps readable campaign unlocks and constrained emplacement composition; it does not reproduce that game's research timers or race restrictions. [Castle](https://heroesandcastles2.fandom.com/wiki/Castle), [Research](https://heroesandcastles2.fandom.com/wiki/Research).

## Teach by doing, with a clear way to start

A new journey opens with three short scenes: Sera explains Veyr and the beacons, Iona explains the refugees and her missing brother, and Rowan gives practical first orders. Players can skip these scenes. Returning campaigns are preserved. A new or previously unstarted campaign receives the opening; an active battle resumes without interruption.

The gold field-training card advances on actual input or menu actions: walk 8m, turn the camera, quick strike, charged strike, cast, jump, inspect a regiment, inspect a defense, begin the first defense, deploy reinforcements, give an order, and win. It saves between sessions, can be hidden, and can be restarted through Journal or Settings. It never prevents mission travel. Waypoints identify the practice yard, Rowan, Nell and Sera, with distance and an off-screen direction cue.

A persistent home button says **Start first defense**, then names the next mission after progress. Sera's physical war table and the Campaign menu reach the same briefing. Each briefing includes a narrative reason, advice, wave count, win/loss conditions, rewards and upcoming unlocks. **Prepare more** and **Begin defense** remain visible while the text scrolls. Dialogues and menus pause the simulation.

## A campaign with consequences

The beacons were meant to shelter the voices of the fallen. Veyr's broken oath made them a prison. Hearthwatch is the last uncorrupted light. Iona's brother brings refugees toward it; the first defense buys them time. The ford reveals prisoners at the quarry. The quarry leads to the Lanternkeepers and the abbey's book of names. Defeating the Bell Knight lets one dead captain speak freely.

Act II follows the foundry's crown plans through the crossings, Frostmere and the riders' road. The Ash Castellan's defeat reveals Veyr's fear that freeing souls will extinguish them. Act III recovers the original oath: shelter is voluntary. The giant remembers it; Glasswater opens the road; the Frozen Beacon proves it can work. At the Crown of Ash, the fallen choose whether to stay or depart.

All fifteen missions have authored briefings, advice and aftermaths in `src/journey.js`. Reclaimed chapters also appear in the Journal. The playable encounters remain hold-the-beacon battles with bosses at the end of each act. Refugee rescue and research discoveries are narrative consequences; this release does not add a separate escort AI, branching dialogue system or cinematic quest simulation.

## Fifteen regiments

All have ten purchasable ranks, actual model changes and rank-scaled combat statistics. Command pays for battlefield squads; Supplies pay for permanent training. Unlocks count distinct reclaimed territories. Repeat victories cannot accelerate the unlock count.

| Regiment | Tactical job | Unlock after victories |
|---|---|---:|
| Shieldward | Durable front line; linked projectile protection at rank V | Start |
| Longbows | Three ranged soldiers per squad | Start |
| Pikeguard | Long melee reach; +50% damage against brutes and bosses | 1 |
| Dawn standard | Non-stacking 9m aura, +15% allied damage and movement | 1 |
| Field engineers | Repair a standing gate every 3s for 18 + 4 per rank | 2 |
| Lanternkeepers | Heal injured soldiers and hero within 10m | 3 |
| Veil blades | Prioritize archers/callers; ignore 50% armor | 3 |
| Cinder adepts | Fireball impact bursts; higher ranks gain fire zones and splits | 4 |
| Ashbreakers | Heavy melee; ignore 55% armor | 5 |
| Siege crew | Heavy bolts; ignore 50% armor, +35% against large targets | 6 |
| Ironwatch marksmen | 34m crossbows, 70% armor penetration, 2.8s reload | 6 |
| Rime scholars | Physical ice shards slow 35% for 2.2–4s | 7 |
| Stormriders | Fast cavalry; movement prepares a +60% charging hit and stagger | 8 |
| Sun sworn | Armored melee; every third landed strike heals a wounded ally within 7m | 10 |
| Oathbound giant | Large body, heavy hammer, extended melee reach | 11 |

The new silhouettes use a tall oath standard, tool pack and goggles, concealed forearm blades, elemental robes and crowns, a marksman's equipment harness, or a sun halo and winged shoulders. Models stay bound to the full-body animation rig. Ranks I–V are available in Act I, VI–VII after five victories, VIII–X after ten.

## Eight defense designs, four emplacements

The Wall & gate is always built. West gate, East gate, West wing and East wing each hold one of the seven emplacement designs. Refit for free at Hearthwatch. Purchased ranks belong to the design and apply wherever it is installed. Refitting and upgrades are unavailable during battle.

| Defense | Function | Unlock |
|---|---|---:|
| Wall & gate | Preserve time before the beacon is exposed | Start |
| Archer tower | Frequent physical arrows; two rank-V doctrines | Start |
| Ballista | Heavy bolts prioritize large targets; two rank-V doctrines | Start |
| Ember cannon | Iron shot, 50% direct armor penetration, 3m splash | 2 |
| Rime obelisk | Low damage, 35% slow for 3s | 4 |
| Stone lobber | Arcing boulders, 4m splash, 9m minimum range | 5 |
| Sanctuary brazier | Heal up to four allies and grant brief protection | 7 |
| Storm spire | Lightning chains to three nearby enemies with diminishing damage | 9 |

The cannon has a bored barrel, carriage, wheels and ammunition. The lobber has braces, a counterweight and an animated throwing arm. The obelisk has a faceted ice crystal and bronze supports. The sanctuary has an ember bowl and pilgrim arch. The spire has copper induction rings and a grounded mast. Every rank adds construction, culminating in gilded fittings, parapets, standards and twin dawn spires.

Spell/projectile behavior is part of the implementation: ice leaves a blue shard trail, cannonballs are iron spheres with smoke and impact blasts, stones follow gravity-driven arcs, lightning has visible jagged links, and healing generates a ward. These have separate procedural sound signatures.

## Compatibility and limits

The save key remains unchanged. Migration adds only the seven new regiment ranks, five new defense ranks, four-slot layout and training state. Existing ranks, hero skills, items, resources, treasures and suspended battle data remain intact. Invalid original data is still rejected; a missing field in an already-migrated save is not silently repaired.

The four-slot layout deliberately avoids adding five automatic damage sources to every existing castle. Starting missions retain the previous two archer towers/two ballistae. New roles alter composition as the campaign unfolds. Territory meshes remain the existing six families. Phone viewport and touch emulation are tested separately from a claim of physical-device performance.
