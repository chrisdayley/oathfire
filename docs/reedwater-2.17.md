# Reedwater — 2.17

## River and stalled waves

Reedwater previously subtracted a narrow trough from uneven terrain and placed a constant-width water plane at a fixed elevation. The two surfaces did not share a bank profile. The river now carves its bed and banks from a shared profile, with shallow fords at the two crossings. It bends out of the east edge near Hearthwatch, without ending in an exposed rectangle. A denser terrain grid smooths the actual shoreline and collision surface. Wet soil replaces meadow along the bank; reeds, cattails and pebbles line the edges. Meadow plants, random rocks and trees avoid the channel. The old segmented submerged plank strips are replaced by continuous traversable shallows.

The water uses animated, distorted ripple normals, small surface displacement, depth-dependent color, broken foam and subdued reflected lighting. It adds no reflection render target or downloaded assets. Water contacts use the same river profile as the mesh. Rivers in other biomes retain their existing location and receive the flowing material.

The reported “3” was a count of surviving enemies. A deterministic reproduction stranded two infantry at approximately x=27, z=-82 for hundreds of seconds. They were colliding with rocks below sea level. Navigation treated an omitted obstacle bottom as world y=0, excluding those rocks from its grid; the physical colliders remained solid. Ground props without an explicit bottom now extend downward in the height overlap check, while explicit overhead arches remain passable. Spawn overlap checks use the same height rule. Enemies follow real paths and die through normal combat; there is no timed removal, forced victory or clipping through obstacles.

The HUD now says “enemies left” after reinforcements finish and “Next wave in Ns” during the cleared-wave pause. Existing battle resumes preserve the wave, clock, health, Command, research and army; actors below the revised riverbed are raised to its surface. Wall garrisons retain their saved height.

## Command purchasing research

The community-maintained Heroes & Castles 2 tables list [Footmen](https://heroesandcastles2.fandom.com/wiki/Footman) at 40 Command for a starting squad of three, [Archers](https://heroesandcastles2.fandom.com/wiki/Archer) at 20 for one, [Blunderbusses](https://heroesandcastles2.fandom.com/wiki/Blunderbuss) at 40, [Dwarf Miners](https://heroesandcastles2.fandom.com/wiki/Dwarf_Miner) at 60, [mounted Knights](https://heroesandcastles2.fandom.com/wiki/Knight_Unit) at 100, and [Giants](https://heroesandcastles2.fandom.com/wiki/Giant) at 130. Thus the Footman headline price is not a one-soldier price; the basic soldier works out to about 13.3 Command. These are community reference values, not independently measured live telemetry.

[Bannermen](https://heroesandcastles2.fandom.com/wiki/Bannerman) add one Command per second, with successive summon prices of 35, 75, 115 and 155. Their guide gives those same numbers as seconds to repay each investment. A [contemporaneous gameplay guide](https://www.gamerevolution.com/guides/67996-heroes-and-castles-2-iphone-cheats) also identifies Bannermen as the way to increase income. The [developer's App Store history](https://apps.apple.com/sg/app/heroes-and-castles-2/id993873900?platform=ipad) says Easy mode increases Command earnings. An exact unmodified base rate was not established from the available sources, so this release does not claim an identical seconds-per-unit economy.

Oathfire adapts that inexpensive-infantry / costly-specialist / elite structure to its smaller armies, existing income investments and user-requested sharper price separation. Base income remains 0.75/s; the Signal Fires perk makes it 0.90/s. Kills, standards, the lodge, equipment, captured camps and logistics research shorten the waits. At 0.90/s, three rank-one standards produce a total of 1.65/s, making a 150-Command rider a roughly 91-second purchase from zero before kills or further bonuses.

| Regiment | Base Command | Seconds from zero at 0.90/s |
|---|---:|---:|
| Shieldward foot soldier | 14 | 16 |
| Longbow | 30 | 34 |
| Dawn standard | 40 | 45 |
| Pikeguard | 45 | 50 |
| Field engineer | 60 | 67 |
| Lanternkeeper | 75 | 84 |
| Veil blade | 80 | 89 |
| Ashbreaker | 90 | 100 |
| Cinder adept | 95 | 106 |
| Rime scholar | 100 | 112 |
| Ironwatch marksman | 110 | 123 |
| Siege crew | 120 | 134 |
| Sun sworn | 145 | 162 |
| Stormrider | 150 | 167 |
| Oathbound giant | 195 | 217 |

Training retains its existing Command surcharges and squad-count improvements. Longbows still summon exactly one soldier at every rank. Shieldward training unlocks squads of two and three, with the squad price clearly shown. All rank-ten units remain affordable within the normal 220 Command cap. Permanent Supplies training costs retain their previous basis; these recruitment changes do not silently change them. Research surcharges and discounts apply to the same stats used by the purchase action and quick-recruit HUD.

## Verification

Rules tests cover below-zero obstacle overlap, bank continuity, troop price separation, research pricing and elite affordability. Browser regression physically crosses both fords, buys troops at the displayed price, restores an old below-bank save without losing progress, and runs the reported eight-wall-archer arrangement through all three mission-two waves. This garrison fixture receives setup Command to isolate pathing; it is not evidence of natural early-game affordability.

Separate first-mission simulations test active play with starter equipment and the new prices against an unattended castle. Ground-level, near-castle and elevated screenshots are inspected; animation frames and WebGL errors are checked. Phone-safe UI and NPC service flows retain their existing regression coverage. Desktop mobile emulation is not a measurement of physical iPhone frame rate.

Measured on the 2.17 production build: 157 rules tests, 11 river/purchase/resume browser checks, 39 phone/town checks, and 17 targeting/assault checks passed. The eight-archer mission-two fixture won in 366.75 simulated seconds with zero survivors. The separate active starter Warden won mission one in 293.95 seconds; the unattended castle lost at 384.02 seconds. No runtime or shader errors were reported.
