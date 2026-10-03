# Earned battle strategy — Oathfire 2.19

New campaigns have no preparation perks or selectable research. Strategic options are earned through home-defense milestones, castle construction and control of named towns. Hero starter abilities, normal recruitment and baseline Command remain available.

## Reference and adaptation

The [Heroes & Castles 2 research catalog](https://heroesandcastles2.fandom.com/wiki/Research) describes unlocks from owning particular territories and upgrading the Fell Crystal. The [territory catalog](https://heroesandcastles2.fandom.com/wiki/Territories) lists those research rewards alongside territorial income and discounts. The [rune catalog](https://heroesandcastles2.fandom.com/wiki/Runes) documents starting-Command bonuses and higher-rarity passive Command income. These are community sources; they do not establish an identical two-slot preparation system in the original game.

Oathfire retains its own two preparation selections and four timed research choices. Its existing gate, archer tower and Command lodge serve as construction requirements. The milestone values and town assignments below are Oathfire balance choices. There is no new currency, additional purchase for an earned plan, or change to research durations/effects.

## Preparation perks

| Perk | Unlock requirement | Effect |
| --- | --- | --- |
| Supply wagons | Win two home defenses | +25 starting Command |
| Signal fires | Win two home defenses and build Command lodge I | +0.15 Command/second |
| Veteran drills | Win three home defenses | +10% recruited troop health |
| Spoils of war | Win five home defenses | +1 Command per hero kill |
| Eagle watch | Hold Reedhaven | An additional +15% wall-troop range |
| Deep foundations | Win four home defenses and build Gate III | +20% gate health |

Choose up to two earned perks at Sera's war table. Locked cards show their effect and exact requirement. A town-dependent selection is removed from the next battle plan if that town is lost.

## Territory research

| Town to hold | Research unlocked |
| --- | --- |
| Willowmill | Shield discipline; Pike formations after two home defenses; Footman training after four |
| Reedhaven | Longbows; Bolstered defense |
| Coppergate | TNT; Forge veterancy; Siege payloads |
| Whitepine | Lead foot; Regeneration; Infinity spears |
| Sunspire | Heavy blows; Mage's fortune; Runic focus |
| Briarhaven | Fast shot; Warrior path; Crossfire doctrine |
| Greywake | The elite; Mankind's resolve |
| Dawnmere | Dwarven runes; The last oath |

Threatened towns still support their plans. Losing one removes access to starting its research in subsequent battles; retaking it restores access. An already running battle keeps its chosen projects and effects. The map shows each town's plans and any additional defense milestone. Conquest and recapture reports reveal newly available research and perks individually, with their purpose and visual preview.

## Construction research

Both the listed construction and defense milestone must be satisfied.

| Construction | Home defenses won | Research unlocked |
| --- | ---: | --- |
| Gate II | 2 | Reinforced walls I |
| Archer tower II | 2 | Windlass drills |
| Command lodge II | 4 | Magic imbuement; Hero health I; Hero damage I |
| Command lodge III | 6 | Siege hero |
| Gate V | 8 | Reinforced walls II |
| Command lodge III | 8 | General's rally; Field logistics |
| Command lodge IV | 12 | Hero health II; Hero damage II; Ward harmonics |

Nell's upgrade previews show the plans associated with the next construction rank. If construction completes the requirements, a dismissible notice explains each new option immediately. If the building already exists and a later defense completes the requirement, the battle's unlock sequence explains it instead.

Research choices still cost time and one of four battle slots, without spending Supplies or Command. Locked entries remain inspectable, list their requirements, and cannot be started through either the UI or game actions. The combat HUD identifies when research has not yet been unlocked.

## Save compatibility

Existing gear, progress, currencies and buildings are preserved. Previously selected preparation perks that have not met the new requirements are cleared from the next battle plan. Earned selections remain. Suspended battles preserve their snapshotted perks and selected research, including unfinished timers. Old reward reports remain valid. Future choices use the new requirements.

## Verification

186 automated tests cover every option's initial lock, milestone and building combinations, specific-town ownership, loss and recapture, unlock notices, unchanged research effects, legacy selections and suspended battles. Browser QA uses disposable saves and the actual UI, construction purchases, mission settlement, research timers and recruited-archer stats. It covers fresh and progressed preparation, new research reveals, map reward visibility, resume behavior and phone layouts.

Run `scripts/strategy-progression-qa.mjs` with a production preview or the live URL. Evidence and screenshots are stored under ignored `work/qa-strategy-release/` and `work/qa-strategy-live/`. These checks isolate progression and effects; they do not claim a new full-campaign combat-balance playthrough.
