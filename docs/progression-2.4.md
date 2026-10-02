# Active Oaths — progression release 2.4

Character → Abilities is the active catalog; Passives retains the three specialization trees. Selecting an active opens one focused screen with its current effect, next rank, resource use, cooldown, training requirement and two equip buttons. The character preview can play its cast animation. Two abilities can be equipped, including at most one signature. Learning a new signature does not displace the old one until equipped.

## Hero unlocks

### The Warden

| Level | Active technique |
|---|---|
| 1 | Shieldstep |
| 1 | Rally |
| 2 | Signal Volley |
| 5 | Beacon Tether |
| 10 | Sunwall (signature, 3 points) |
| 14 | Living Standard (signature, 3 points) |
| 18 | Dawn Reversal (signature, 3 points) |

### The Ashwright

| Level | Active technique |
|---|---|
| 1 | Quench Burst |
| 1 | Furnace Fireball |
| 2 | Runic Bulwark |
| 5 | Cinder Mine |
| 8 | Overdrive |
| 10 | Forgefall (signature, 3 points) |
| 14 | Sanctuary (signature, 3 points) |
| 18 | Inferno (signature, 3 points) |

### The Veilranger

| Level | Active technique |
|---|---|
| 1 | Windstep |
| 1 | Thornsnare |
| 2 | Hunter’s Mark |
| 5 | Seed Ward |
| 8 | Guiding Volley |
| 10 | Briarstorm (signature, 3 points) |
| 14 | Living Grove (signature, 3 points) |
| 18 | Verdant Reversal (signature, 3 points) |

Starting techniques cost no points at rank I. Their next ranks require levels 2 and 6. Other non-signature techniques improve three and eight levels after their first unlock. Each rank costs one skill point. Signatures have one rank and cost three points. Passive prerequisites remain intact; active techniques do not require passive purchases. Existing ranks, equipment, mission progress and resources remain unchanged; already purchased starter rank I points become available again.

## Regiments

All units gain health and damage at every upgrade. Rank X has about 3.44× rank-I health and 2.75× rank-I damage before research. Tactical properties below are additional benefits.

| Regiment | Tactical progression, rank I → X |
|---|---|
| Shieldward | Soldiers / recruit: 1 → 3; Armor: 12 → 39 |
| Longbows | Arrow range: 25 m → 38.5 m |
| Pikeguard | Siege-target damage: 1.5× → 2.13×; Pike reach: 3.6 m → 4.23 m |
| Lanternkeepers | Healing / pulse: 14 HP → 50 HP; Healing radius: 10 m → 14.5 m; Healing cycle: 3 s → 2.28 s |
| Ashbreakers | Armor ignored: 55% → 77.5%; Hit stagger: 0.08 s → 0.4 s |
| Siege crew | Bolt push strength: 1.6 m/s → 5.38 m/s; Siege-target damage: 1.35× → 1.89× |
| Stormriders | Movement: 6.3 m/s → 7.92 m/s; Charge damage: 1.6× → 2.23×; Charge stun: 0.7 s → 1.24 s; Run to charge: 6 m → 4.2 m |
| Oathbound giant | Sweep reach: 4.4 m → 5.84 m; Hit stagger: 0.3 s → 0.84 s; Sweep push strength: 1.8 m/s → 4.5 m/s |
| Dawn standard | Ally damage & speed: 15% → 28.5%; Aura radius: 9 m → 13.5 m; Command / minute: 2.4 → 8.88 |
| Field engineers | Gate repair / pulse: 22 HP → 76 HP; Repair cycle: 3 s → 2.1 s |
| Veil blades | Movement: 5.4 m/s → 6.66 m/s; Armor ignored: 50% → 77% |
| Cinder adepts | Fireball burst radius: 1.6 m → 3.04 m; Ember damage / s (rank V): 3 → 9.3 |
| Ironwatch marksmen | Armor ignored: 70% → 92.5%; Bolt range: 34 m → 39.85 m |
| Rime scholars | Movement slowed: 35% → 57.5%; Slow duration: 2.2 s → 4.9 s |
| Sun sworn | Healing / proc: 14 HP → 50 HP; Healing radius: 7 m → 10.6 m; Hits per heal: 3 → 2 |

Shieldward squad size increases at IV (two) and VIII (three); each soldier consumes army capacity and squad Command cost rises. Archers and pikes remain single recruits. Standard auras and standard Command income use only the strongest eligible standard, never add together. Command income requires an enemy within 24m and respects the existing cap. Captains receive 35% of normal knockback and 30% of stagger/stun duration. Slows use the strongest active effect; cover and collision remain in force. Cinder adepts gain lingering embers at V and fragments at IX.

## Training economy

Base Supplies costs for ranks II–X: 320, 480, 700, 980, 1340, 1800, 2390, 3120, 4050. More expensive troop types apply a modest cost multiplier. First victory awards 180 Supplies; adding the initial 360 leaves 540, enough for one basic training purchase. With a generous extra 300 Supplies from treasure, at most two new basic purchases fit. Repeating a main mission still pays 55% of its first-victory reward; settlement income and exploration remain useful. No earned resources are removed. Defense, forge and shop prices are unchanged in this release.

## Verification

- `npm test`: 91 tests, including each hero’s learning gates, all active ranks, safe equipping, legacy budgets, save validation, every unit/rank and the early reward budget.
- `scripts/progression-qa.mjs`: mobile learn/equip/cast flow; all 23 active effects; rank-I/rank-X hit effects, healing, repair, knockback, physical frost projectiles and expanded fire splash; three phone viewports; pending unlock and learned-ability save reload.
- `scripts/balance-qa.mjs`: reproducible seeds 101 and 707, active play wins and idle archer recruiting loses. First-mission waves are 7, 12, 17 enemies, preserving an easy opening while demanding more in the final wave.
- Test campaigns run in isolated browser profiles. These are browser simulations, not a physical-phone performance certification or a full player balance study.
