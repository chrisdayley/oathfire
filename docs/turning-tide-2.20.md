# The turning tide — 2.20

This release adds battlefield turning points, skill-based combat interactions, optional siege routes and a visibly growing Hearthwatch. All existing gear, progression, territory income and earned research rules remain intact.

## Defense turning points

The first defense retains its introductory pacing. From defense two, wave two adds a twelve-second warning before an Ironjaw ram and two infantry escorts arrive. The ram is an attackable wheeled siege engine that follows collision-aware paths to the castle, winds up for 1.3 seconds and strikes every four seconds. Charged melee deals double damage; a rear strike bypasses 65% of armor. It has 220 × (1 + mission index × 0.11) health, 22 armor and 38 + mission index × 2 gate damage.

From defense four, wave one adds a Grave marshal. Its four-second banner ritual calls up to three additional infantry, at most twice per encounter. A charged hit or a close melee perfect guard interrupts it and delays the next ritual ten seconds. From defense six, wave three introduces a three-bomber flank. Bombs have a 0.9-second interruptible windup followed by flight; interrupting or killing the thrower before release cancels the attack. Already released bombs remain dangerous.

Threats have scouting cards with their actual models, stats and counters, compact battlefield warnings, direction/distance indicators and a tactics screen. The ram and mortar mechanism animate in inspection. A defeated threat awards twelve Command once. Pending threat arrivals keep the wave open; spawned targets are included in the ordinary victory condition. Field population remains capped at 58. Existing suspended waves do not retroactively receive a new threat; subsequent waves do.

## Combat skill and combinations

- A perfect guard gives every hero a two-second +40% melee counterattack and staggers nearby melee attackers for 0.85 seconds. Warden Riposte ranks improve the counter to +50/60/70%; ranks two and three restore eight stamina when it lands. Rank three retains its cleave.
- Rear melee strikes deal 20% extra damage and bypass 65% of enemy armor. Ordinary projectiles and secondary damage do not receive these positioning bonuses.
- Charged blows interrupt special windups and have a brief impact camera response, controlled by the existing shake setting.
- A charged hammer strike against a slowed or frost-affected enemy deals 65% extra damage, consumes the slow and staggers it for 1.2 seconds, with a blue shatter effect.
- The Warden's perfect guard protects allies within seven metres for three seconds, with a five-second pulse cooldown.
- Marked enemies become preferred targets for allied bows and crossbows, including the wall garrison, subject to range, line of sight and existing orders.
- An Ashwright wearing Cinderforged mail creates healing embers when burning enemies die. Embers last six seconds; approaching within 2.5 metres restores twelve health. At most eight exist, and training targets do not create them.

This update extends the current combat inputs; it does not add another row of attack buttons. Negative render-frame deltas after lengthy loading are clamped to zero.

## Siege routes

The main road and its four original camps remain. Three marked optional flanks now have distinct benefits:

| Objective | Position | Action | Result |
| --- | --- | --- | --- |
| Ash battery | West, 283 m along the route | Destroy the stationary mortar | Stops this battery's road bombardment |
| Pilgrim camp | East, 498 m along the route | Clear enemies within 26 m; occupy within 10 m for six seconds | Heal nearby survivors 50% once; move recruitment here until a later road camp is held |
| Hornwatch | West, 715 m along the route | Clear and occupy for six seconds | Multiply future enemy reinforcement intervals by 1.3 |

The central road is the direct approach. Stone markers, lanterns, flags and physical cover identify the detours. The battery appears as the army reaches its stretch of road, rather than firing across the whole map. Benefits, capture progress, threats and objective enemies survive save/reload; no duplicate mortars or reward payments appear.

## Hearthwatch homecomings

Every region's first rescue permanently adds a themed courtyard project: Willowmill's bread market, Reedhaven's bowyer range, Coppergate's carved gate buttresses, Whitepine's herb arbor, Sunspire's forge display, Briarhaven's flowering orchard, Greywake's merchant stall and Dawnmere's sun monument. Up to four additional residents join the existing patrols.

NPCs give brief requests tied to the region and explain the completed project when visited. The player can continue to the NPC's service or follow a waypoint to see the improvement. Acknowledgments are recorded once in the existing guide and journal. Town loss removes its normal tribute/research access, but does not erase the home its rescued people built. Existing campaigns receive visuals for their historical first captures without duplicate currency.

## Validation

- Automated rules coverage includes staged threat introductions, pending-wave rules, malformed checkpoints, rear/charged damage eligibility, route recruitment priority and one-time homecoming acknowledgments.
- `scripts/frontline-qa.mjs` exercises actual combat interruption, guards, shatter, ember recovery, ram navigation/gate damage, siege route effects, save/reload and mobile HUD bounds in isolated browser saves.
- `scripts/frontline-visual-qa.mjs` checks actual threat preview models/animation and tactics layouts at 844×390, 667×375 and 390×844.
- `scripts/frontline-balance-qa.mjs` simulates the entire second defense with a level-three Warden, starter equipment, normal Command income and paid troop recruitment. Active fighting wins; leaving the castle unattended loses. This is a reproducible bot scenario, not a claim that every hero, build or late-campaign encounter is balanced.
- The existing earned-research and campaign suites cover castle unlocks, all research access, full regional relief waves, map/report layouts, invasions, final-fortress requirements and persistence.

Phone checks use browser viewport emulation. They do not certify physical iPhone performance. The update uses existing sampled orchestral music unchanged.
