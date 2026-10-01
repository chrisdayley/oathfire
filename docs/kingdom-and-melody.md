# Oathfire 2.0 — Campaign, equipment and music revision

This release adds 24 main missions, eight optional rescues, an illustrated war table, regional equipment hunting, ten signature weapon powers, a redesigned armory and a recomposed sampled soundtrack. The existing wide fields, three heroes, fifteen regiments, ten-rank training, castle defenses, battle research, armor patterns, exploration and chest reveals remain part of the game.

## What was learned from Heroes & Castles 2

The official description connects hero classes, forging, castle defense and a larger conquest map. The 2015 hands-on review shows a character beside compact equipment information, random forged gear, optional territory battles, equipment rewards and recurring territory benefits. The original's important loop is personal combat feeding army preparation and territorial expansion. Oathfire makes that loop explicit with separate main and optional destinations, displayed tribute amounts and visible enemy counters. [Official store description](https://play.google.com/store/apps/details?id=com.foursakenmedia.heroesandcastles2) · [Hands-on review and menu screenshots](https://iphoneac-blog.com/archives/8821956.html).

Community documentation describes weapon classes with different attack behavior, equipment from battles/chests/crafting, and armor changing both appearance and attributes. These are useful system references, not a verified source for exact original drop probabilities or a promise of identical balance. Oathfire uses its own values, models, story and powers. [Weapons](https://heroesandcastles2.fandom.com/wiki/Weapons) · [Items](https://heroesandcastles2.fandom.com/wiki/Items) · [Armor](https://heroesandcastles2.fandom.com/wiki/Armor).

The source game's documented Goblin Bomber reinforces the value of enemies with different tactical jobs. New Oathfire opponents include marked-area bombers, long-range hunters, banner support, frontal shields, healers, enraging melee fighters, siege mortars, phasing attackers and protective priests. [Goblin Bomber](https://heroesandcastles2.fandom.com/wiki/Goblin_Bomber).

## Campaign and story

The first fifteen mission IDs remain stable for existing saves. The story expands after Veyr: his crown was built on an older prison. The Glass Regent turns the beacon network against the rescued cities; beyond him, the Hollow King guards the first ember. Sera seeks the original promise: souls may find shelter without being owned. Each main mission and rescue has a briefing, tactical guidance and aftermath.

| Missions | Progression |
|---|---|
| 1–5 | Three waves. Infantry, archers, fast runners and armored revenants introduced separately. The Bell Knight closes Act I. |
| 6–10 | Bombers, heralds, long-range hunters and siege brutes. Four waves. The Ash Castellan closes Act II. |
| 11–15 | Larger formations, frontal shield tanks, healers, then slowing casters. Five waves; defeat Marshal Veyr. |
| 16–20 | Veteran combinations, enraging reavers and artillery. Six waves from mission 19. Defeat the Glass Regent. |
| 21–24 | Phasing enemies and protective/healing warpriests. Six waves, the largest formations, and the Hollow King. |

Every main mission requires the preceding main victory. Optional rescues unlock after specified main missions and do not advance that sequence. All currently use the playable hold-the-beacon combat rules; the story does not imply separate escort or city-management mechanics.

The illustrated atlas supports panning, separate settlement symbols, selected-location details, mission requirements, enemy counters, regional loot and the next-story destination. Original generated landscape art is overlaid with interactive routes and settlements.

| Optional settlement | Opens after main mission | Supplies per later main victory |
|---|---:|---:|
| Willowmill | 1 | 28 |
| Reedhaven | 3 | 42 |
| Coppergate | 6 | 62 |
| Whitepine | 9 | 80 |
| Sunspire | 12 | 102 |
| Briarhaven | 15 | 126 |
| Greywake | 18 | 152 |
| Dawnmere | 21 | 180 |

Tribute is awarded on main victories, including replays, and included in the saved battle report. It is not a real-time/offline timer. Settlements cannot be multiplied by replaying their rescue. Reopening the same report does not pay rewards again.

## Equipment hunting and builds

Fifteen weapon identities cover swords, spears, hammers, bows and staves. The menu and held weapon use the same model definition. Each class has a starting design and two signature designs. Existing items without a design ID remain compatible. Armor keeps its existing seven distinct patterns and their visible hero models, bonuses, rune and temper effects.

The armory has slot selection, weapon-class filters, a large rotatable item preview, an optional view on the hero, and separate Overview, Compare and Improve panels. Upgrade values are calculated using the same stat functions that apply the upgrade. No invented preview percentages.

Signature abilities activate on Rare-or-better level-5 gear or at Forge +6. Each has a ten-second cooldown. Higher forging/quality increases applicable damage or healing; control/protection durations remain explicit. Charged attacks trigger weapon abilities; the two staff powers trigger from techniques.

| Design | Signature |
|---|---|
| Emberbrand | Fire burst and ignition |
| Dawnfang | Heal hero and nearby allies |
| Rimespire | Frost burst and roots |
| Stormlance | Lightning arcs to three other foes |
| Faultbreaker | Wide shockwave and stagger |
| Oathbell | Temporary protection for the nearby formation |
| Briarthorn | Root enemies around a charged-arrow hit |
| Starsong | Armor-piercing charged arrow with follow-through projectiles |
| Pyrecrown | Fire nova at the technique's aim point |
| Tidecaller | Nearby healing and focus return on technique use |

Regional reward pairs are shown on the map: plains favor Dawnfang/Oathbell, rivers Tidecaller/Stormlance, forests Briarthorn/Pyrecrown, quarries Faultbreaker/Emberbrand, snow Rimespire/Starsong, and deserts Emberbrand/Stormlance. A first boss or settlement victory guarantees Rare-or-better regional equipment. Subsequent victories have a 35% chance to choose from the region's pair. Other random equipment and chests remain available. This allows targeted farming without guaranteeing a perfect affix roll.

Example combinations: Dawnfang with healing armor for a frontline captain; Rimespire with ranged troops to pin a formation; Oathbell with guard-focused armor to hold a contested gate; Tidecaller with focus recovery and support techniques. Power cooldowns prevent rapid-hit weapons from triggering every frame.

## Music

See [the score research and implementation notes](music.md). The user’s Chrome score was inspected directly. All 67 reference recordings received signal analysis, not a claimed auditory review. Original compositions and legally redistributed samples are included; reference-game recordings and copied melodies are not.

## QA scope

Automated tests cover campaign gating, roster introductions, save compatibility, tribute settlement, regional loot, equipment identity, power requirements and score/sample validity. Browser tests cover the actual map, mobile armory, matching equipped models, exact forging values, enemy mechanics, ten power triggers/cooldowns and save/reload. The first mission is played with a fixed-step input bot under normal game rules. These checks are useful regression evidence, not a claim that all 24 missions have been manually balanced or tested on a physical phone.

### Verified opening ramp

An automated input bot won main missions 1–6 sequentially using only earned currency, loot and upgrades. Completion times were 60s, 55s, 59s, 69s, 65s, 84s. It used movement, melee, rally, normal recruitment and potions; combat stats were not overridden. Later mission balance still needs extended human playtesting.
