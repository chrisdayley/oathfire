# Scouting, battle plans and wall troops — 2.12

## Before the battle

War table → mission briefing → **Scout & prepare**. A new enemy gets an animated, rotatable model, attack preview, health/damage/armor/range, its behavior, and advice for countering it. Cards advance individually, then open the battle plan. Previously encountered enemies remain available through **Review enemy army**. Completed missions establish existing knowledge for older saves.

Choose **two** preparation perks. They are free choices, gated by main-defense victories, and can be changed between battles. The battle freezes the selected perks and equipped Command bonuses, including across save/resume.

| Perk | Available after | Effect |
|---|---:|---|
| Supply wagons | Start | +25 starting Command |
| Signal fires | Start | +0.15 Command/s |
| Veteran drills | Start | +10% troop health |
| Spoils of war | 2 victories | +1 Command per hero kill |
| Eagle watch | 3 victories | Wall range bonus grows from 75% to 90% |
| Deep foundations | 5 victories | +20% gate health |

The preparation summary displays actual starting Command, passive generation, hero kill rewards and reserve capacity, with shortcuts to equipment, troops and castle upgrades.

## Enemy progression

The original introduction schedule remains save-compatible. The wave composer now gives a debut enemy a dedicated share of each wave on its introduction mission. Following missions rotate the full unlocked army, avoiding a permanent bias toward the newest heavy unit. Mixed slots advance their own roster cursor, preventing modulo alignment from accidentally reducing an entire later wave to two repeated types. From mission 4 onward, every main-mission wave contains at least four enemy types. Healers, buffers and artillery are limited to two of each type per wave; brutes to three. The opening six main missions wait for the previous wave to be cleared before releasing the next; later missions retain overlapping-wave pressure. Enemy health rises 18% and damage 10% of its opening-wave value per subsequent wave; existing increasing unit counts remain.

| Main mission | Newly introduced threat |
|---:|---|
| 1 | Hollow infantry |
| 2 | Archers |
| 3 | Fast runners |
| 4 | Armored infantry |
| 5 | First boss |
| 6 | Bomb throwers |
| 7 | Enemy banner buffer |
| 8 | Long-range wall hunters |
| 9 | Siege brutes |
| 10 | Second boss |
| 11 | Frontal shield tanks |
| 13 | Healers |
| 15 | Frost casters and third boss |
| 17 | Wounded berserkers |
| 19 | Mortar artillery |
| 20 | Fourth boss |
| 21 | Blink attackers |
| 23 | Protected battle priests |
| 24 | Hollow King final defense, after the final fortress siege |

Optional sieges derive scouting reports from their own army roster. Boss previews use that boss's equipment design and final-wave stats.

## Wall garrison

During defenses, use **Command → Wall troops**, the wall count at upper right, or the Field/Wall tabs in the regiment menu. Longbows, siege crews, cinder adepts, marksmen and rime scholars can occupy eight separate parapet posts. Field troops retain their separate 24-slot limit. Recruitment costs the normal Command price and one archer still means one archer.

Wall troops gain **75% range**, remain on the physical parapet, and fire real projectiles subject to scenery collisions. Field orders do not pull them off the wall. Long-range enemy archers prioritize exposed wall troops; enemy artillery can bombard their elevated positions. Dead soldiers free their post. Quick-recruit remembers whether a squad was field or wall, and saved battles restore the same posts.

The Longbows research range multiplier stacks with the wall bonus: rank-I Longbows have 25 m field range, 43.75 m wall range, or 54.69 m wall range with Longbows research. Eagle watch increases those wall figures to 47.5 m or 59.38 m. Castle garrisons are unavailable on offensive sieges.

## Cavalry

**Stormriders** unlock after eight main-defense victories. One armored mounted knight costs **100 Command**. At rank I: 230 health, 38 damage, 18 armor, 25% armor penetration, 7.2 m/s speed. A 6 m run primes the next strike for 1.6× damage and a stun. Training increases speed, penetration, charge damage and stun while reducing the distance required to prime a charge. Their knight rider and animated horse appear both in the dossier and on the battlefield.

## Command economy and gear

Base regeneration changes from **0.60 to 0.75/s**. A rank-I Longbow therefore takes about 37 seconds of base income instead of 47. Hero kills still grant 2 before bonuses. Starting defense Command remains 55 before bonuses; siege starting budgets remain mission-specific. The HUD shows the current passive rate. Tap it for the full breakdown.

Dawn standards unlock after the first defense and generate **0.25/s each at rank I**, growing by 0.025/s per rank to 0.475/s at rank X. Only the strongest three living standards contribute. Their nearby damage/speed aura remains. The existing five-rank castle Command lodge adds 0.08–0.52/s. Securing the ridge camp adds 0.15/s. Temporary Field logistics research multiplies all passive sources by 1.2.

New Command affixes roll only on weapons and armor:

| Affix | Minimum quality | Unforged effect |
|---|---|---|
| Muster | Epic | +18 starting Command; +9 per rarity tier |
| Logistics | Legendary | +0.12/s; +0.08/s per rarity tier |
| Bounty | Epic | +1 per hero kill; +0.5 per rarity tier |
| Conquest | Mythic | +8 extra per hero elite kill; +6 at Godly |
| Reserves | Legendary | +35 capacity; +20 per rarity tier |

Elite kills include armored knights, brutes, bulwarks, reavers, mortars, priests and bosses. Forging scales Command benefits by 2.5% per upgrade, with displayed rounding. These are equipped-item effects; carrying extra items does not stack them.

Certain named patterns also have inherent bonuses: Epic+ Dawnfang and Marchwarden cuirass add starting Command; Legendary+ Oathbell and Marchwarden add passive income. Affixes stack with these pattern bonuses. The armory, comparison, Improve preview and battle loot report show Command benefits. Existing items of these patterns gain the corresponding benefits without changing their identity or ownership.

## Victory and save compatibility

A victory now displays a separate animated gold crest, rays and rising embers. **Continue to battle summary** opens the existing statistics, chest reveals and unlock sequence. Rewards settle once before this presentation. Closing and resuming before Continue restores the victory screen; after Continue it returns directly to the report. Older pending reports open normally. Reduced-motion preferences disable the new animation.

Existing saves add empty perk/intelligence fields and preserve equipment, campaign progress, levels, current battles and rewards. Old field armies remain field armies.

## Reference research

- [Heroes & Castles 2: Runes](https://heroesandcastles2.fandom.com/wiki/Runes) documents starting-Command runes and high-rarity passive income effects. Oathfire uses two preparation selections plus equipped-item bonuses, balanced to its own unit prices.
- [Captain](https://heroesandcastles2.fandom.com/wiki/Captain) documents a recruitable Command generator; [Bannerman](https://heroesandcastles2.fandom.com/wiki/Bannerman) and [Phases of Battle](https://heroesandcastles2.fandom.com/wiki/Phases_of_Battle) describe the investment/protection strategy around income units.
- [Knight](https://heroesandcastles2.fandom.com/wiki/Knight_Unit) describes expensive, high-damage, fast cavalry with armor penetration.
- [Research](https://heroesandcastles2.fandom.com/wiki/Research) describes temporary research and ranged-unit improvements.

These community references establish mechanics, but did not establish a reliable exact baseline Command regeneration rate for the original game's current modes. Oathfire's 0.75/s is an explicit balance choice, not a claimed reproduction of that rate.

## Validation

Automated rules cover two-slot enforcement, unlock gates, old-save migration, equipped-only Command traits, loot rarity restrictions, independent capacities, range stacking, all mission scouting rosters, cavalry progression and idempotent victory settlement. The browser checks use disposable saves and actual Rapier/projectile simulation, including long-range wall hits, return fire, save/resume, quick-recruit and victory acknowledgement. Mobile checks include 844×390, 667×375 and 390×844. Build and deployed-byte verification are required before release.

Release checks: **134 automated rules tests passed**; **42 production-build preparation/garrison checks**, **59 armory layout checks**, and **16 siege regression checks** passed with no browser errors. The latter cover all nine siege maps and migration of a suspended older siege. These are browser and viewport checks, not a claim of physical-device performance testing.

The extended campaign run exposed and fixed a lethal-burn timing bug: a soldier could lose its physics body to burning, then enter movement in the same tick. Dead actors now leave the AI path before movement; the production-browser suite includes this exact regression.

The final automated opening-campaign playthrough completed missions 1–6 using earned equipment, normally priced troop training and potions, two preparation perks, timed research, guarding, balanced field recruitment and moving away from bomber telegraphs. The first boss required one defeat and a legitimate retry with retained progression. This verifies campaign continuity and provides a balance sample; it does not establish that every randomized loadout or player will win on the first attempt. Earlier aggressive bot runs failed at the first boss.
