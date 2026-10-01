# Battle reports and war chests — 1.6

Victory, defeat and a voluntary withdrawal open a full-screen report with four layers: Summary, Loot, Battle stats and Aftermath. The report records active battle time rather than time paused in menus. It includes kills and actual damage attributed to hero/army/defenses, casualties and survivors, recruits and free reinforcements, Command spent, repairs/refits, quick/charged attacks, spells, blocks, projectiles, gate/beacon condition, camp control, completed research, XP, level changes and all earned loot. Overkill does not inflate damage.

The Aftermath screen preserves the campaign narrative, new unlocks and the next destination. The player can return to Hearthwatch, inspect equipment, or explore the won battlefield.

## Physical drops and settlement

An ordinary defeated enemy has an 8% chest chance; a knight, grave caller or siege brute has 18%; a captain has a guaranteed chest, subject to the five-chest cap per battle. Training targets never drop them. Chest rarity is Common 55%, Uncommon 30%, Rare 12%, Epic 2.5%, Legendary 0.5%; captain chests are at least Rare. These are initial balance values and will benefit from longer player testing.

A dropped chest appears at the enemy's position with a rarity-colored light. Walking within 2.7 m secures it. Victory also recovers unclaimed chests; defeat/withdrawal retains only secured ones. Every chest contains Supplies, Salvage and rolled equipment. Epic and Legendary chests contain two equipment pieces. Equipment uses the existing armor patterns, affixes, item levels and forge progression. A full inventory converts unaccepted equipment into Salvage and explicitly explains that result.

Contents are rolled when the chest drops and serialized in the battle checkpoint. End-of-battle settlement grants all earned rewards in one save transaction before presenting the animation. The report has an ID, and settling it twice cannot grant duplicate mission rewards or chests. Opening a chest changes presentation state only. Reloading an unfinished report restores it; previously opened chests stay opened. Leaving the report reveals/acknowledges everything without discarding rewards. Legacy saves remain compatible.

## Reveal design and references

A custom 3D wooden chest uses weathered timber, metal bands, rivets, a rarity seal, coins and a crystal. A short lock movement opens the hinged lid, emits colored light and particles, and reveals equipment and materials. Unlock/creak and rarity-dependent chimes accompany the sequence. One tap starts the 1.7 s reveal; Reveal instantly and Reveal all instantly bypass it. Reduced-motion preferences skip the opening movement. There are no waiting timers, paid keys or simulated rarity rerolls.

[Clash Royale's Lucky Drops announcement](https://supercell.com/en/games/clashroyale/blog/release-notes/game-update-lucky-drops/) illustrates rarity-driven anticipation; its [October update](https://supercell.com/en/games/clashroyale/blog/release-notes/october-update/) emphasizes distinct reveal animation. The [April 2025 update](https://supercell.com/en/games/clashroyale/blog/release-notes/april-update/) removes chest queues/timers and streamlines opening. Those references support readable rarity and immediate access, while Oathfire uses fixed contents rather than repeated tap-based rerolls.

Player threads about [excessive opening length](https://www.reddit.com/r/ClashRoyale/comments/1i327ux/lucky_drop_animation_is_excessive/) and [repeat-opening convenience](https://www.reddit.com/r/Brawlstars/comments/1rtf7dj/quality_of_life_improvement_for_star_drops/) motivated the skip and reveal-all controls; this is qualitative feedback, not a representative survey. [Supercell's Starr Drop documentation](https://support.supercell.com/brawl-stars/en/articles/drop-chances.html) shows fallback rewards for ineligible results. Oathfire's explicit Salvage conversion addresses its own full-inventory case.

## Reproducible checks

`tests/battle-rewards.test.mjs` covers odds/boundaries, contents, cap, captain rarity, victory/defeat, inventory overflow, duplicate settlement/reveal, legacy saves, corruption rejection, damage accounting and research composition. `scripts/rewards-qa.mjs` uses actual enemy deaths, physical pickups, report navigation, a real 3D opening, instant reveal, save reload and defeat. It captures 667×375 and 844×390 touch browser viewports. `scripts/research-qa.mjs` checks actual combat research hooks; `scripts/campaign-test.mjs --research` completes the first mission through normal combat rules. These are browser checks, not physical-phone performance measurements.
