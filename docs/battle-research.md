# Combat research and menus — 1.6

The combat interface follows the expanded Heroes & Castles 2 research screen: an icon matrix, a selected description/action pane, and four committed slots. Troop and defense screens use the same selection pattern, with a live animated model, cost and three headline stats beside the roster. Full Stats & Abilities remain one tap deeper. Selection preserves list scroll. Castle preparation retains its separate tiered menus.

## Reference evidence

The [iPhone AC review](https://iphoneac-blog.com/archives/8821956.html) contains an [actual expanded Research screenshot](https://livedoor.blogimg.jp/kamurai2nd-iphone/imgs/5/d/5d44a7db.jpg), inspected during this revision. It shows a six-column icon matrix, selected research details on the right, and four slots below. The expanded Units screen was not independently recovered; our troop layout applies the confirmed Research screen's pattern. The user's screenshot supplies the closed battle HUD reference. All Oathfire icons, rendering and interface code are original.

The [community research catalog](https://heroesandcastles2.fandom.com/wiki/Research) and [Japanese strategy guide](https://nerusora.com/heroes-and-castles-2-walkthrough/) informed the mechanics: four timed choices, emergency wall repairs, reinforcements, veterancy, elemental rain, hero improvements and faction bonuses. These are adapted mechanics, not a claim of identical balance or reproduction of the original game. The guide's advice to preserve a repair option influenced the commitment rules. [TouchArcade's review](https://toucharcade.com/2015/05/21/heroes-and-castles-2-review/) corroborates paused management and automatic army behavior.

## Rules

Research costs battle time and one of four slots, with no Command or permanent-currency payment. All chosen projects run concurrently while gameplay advances. Menus pause them. Canceling unfinished work frees its slot and discards its progress. Completed work remains committed through the battle. Updated in 2.19: all options start locked and require named towns or castle construction plus campaign milestones. See [earned strategy](earned-strategy-2.19.md).

Thirty-three choices include adaptations of all 24 cataloged reference options and nine Oathfire additions. The source of truth for names, times, unlocks and exact effects is `src/research.js`; the selected in-game pane displays the complete description. Runtime effects live in `src/research-combat.js`.

The reference families cover wall reinforcement/demolition, hero health/damage/armor/stun/armor bypass/regeneration/siege resistance, free archers and Command, archer reload/range, infantry and spears, veterans/champions, mages, and three army-wide traditions. Oathfire maps the original races to Hearth, Wild and Forge regiments. Longbow distance is adapted to our world scale; Fast shot uses a 0.35 s reload; reserve archers queue at the 24-soldier cap; Siege hero targets our siege brutes and captains. Walls II replaces Walls I's maximum-health multiplier. Boss stun durations are shorter. Faction, champion and veteran multipliers compose; permanent ranks stay unchanged.

Oathfire additions:

- Shield discipline: +25% health, +20% damage; new squads cost 5 extra Command.
- Pike formations: +35% Pikeguard damage.
- Runic focus: +25% attack/healing power and +15% health for the support/caster regiments.
- Windlass drills: mechanical defenses fire 20% faster.
- Siege payloads: +25% siege damage, including blasts.
- Ward harmonics: +20% magical-defense range, +25% damage/healing.
- Crossfire doctrine: allied ranged attacks and defenses gain +20% damage against slowed or marked targets.
- Field logistics: +20% Command regeneration; future recruits cost 10% less after surcharges, rounded up.
- The last oath: survive one fatal hero hit at 30% health with three seconds of invulnerability. A destroyed beacon still loses the battle.

Health improvements preserve current health percentage. Standing walls repair once when reinforcement completes. General's rally can bank Command above 220; this reserve remains until spent. Normal regeneration resumes below 220. Veterans arrive with stronger models and retain their individual veteran flag in suspended saves. Mage's fortune launches five visible falling fireballs or ice shards; it is not a number-only bonus.

Battlefield inspection includes active research modifiers and relevant additional abilities. Quick-recruit prices use the same cost calculation as the selected troop pane. Research, timers, reserves, triggered one-use perks, recruited veterans, and recent-purchase history survive suspension. Older saves without those optional fields load normally. Returning home or beginning another mission removes temporary effects.

## Compact battle HUD

Upper left: health, stamina, magic, Command and income; below, up to four recently purchased squad shortcuts with their current costs. Upper right: living soldiers / 24, free capacity, emplacements / four, gate/beacon condition and wave. Command and Research have separate bottom controls. Castle currencies and management destinations stay in castle preparation.

See [battle rewards](battle-rewards.md) for settlement and chest behavior, and [QA evidence](qa.md) for verified release checks.
