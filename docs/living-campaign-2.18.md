# The living campaign — Oathfire 2.18

The campaign now connects home defense, territorial conquest and enemy counterattacks. The war table shows a whole illustrated continent with nine destinations. Hearthwatch's defense track sits separately above it. After the battle rewards and unlocks, an animated full-screen map shows the day advance, new routes, captured or lost towns, and incoming armies.

## Rules

- **24 home defenses.** Each fresh defense uses Hearthwatch's home terrain and castle. Mission names identify campaign chapters/attacking hosts. Briefings now describe an attack on home, rather than travel to another beacon. An already suspended battle retains its old regional terrain until it finishes.
- **Eight town sieges.** Routes open after home assaults 1, 3, 6, 9, 12, 15, 18 and 21. Break a town's enemy gate and keep to liberate it. These conquests are required to finish the campaign.
- **One battle, one day.** Victory, defeat and withdrawal each advance one day when rewards settle. Reloading, repeating the results presentation, changing heroes, exploring town or spending real time does not. Saves and reports preserve the calendar.
- **Home attack deadline.** A new or migrated campaign gets three days' warning. Repelling a new assault gives four days through the opening five defenses and three days thereafter. You may fight the next home assault early. At zero days, defend Hearthwatch before leaving on another mission or replaying an old defense. Losing the battle does not postpone that assault.
- **Invasions.** The first check occurs on day 5; later invasions are spaced four campaign days apart. Only held, unprotected towns can be targeted. Warnings always give three mission-days. At most one town is threatened before defense 12, and at most two afterward. Capturing a town protects it through the next three days; winning a relief battle protects it through four days.
- **Playable relief battles.** Each town has a regional encounter with two or three streamed waves. Defeat every enemy while the town beacon survives. The army's roster and difficulty follow that region's campaign stage, without an escalating punishment for repeated invasions.
- **Missed deadlines.** An ignored invasion, or defeat during its relief mission, loses that town and its tribute. Its original siege becomes available for recapture. Hero progress, gear, trained units and first-capture history remain intact. Recapture pays replay rewards rather than repeating the first-conquest loot guarantee.
- **Tribute.** Each currently held town pays its listed Supplies after a home-defense victory, including replays. Threatened towns still pay until lost. Relief victories preserve tribute but don't pay an extra home-defense tribute reward.
- **Final victory.** Repel all 24 defenses, hold all eight towns and resolve active invasions to enter the Obsidian Crown. The King’s Hand now leads the last home assault. The Hollow King emerges at his own fortress when its gate breaks. **Both the king and the keep must be destroyed.** Neither objective alone wins. The campaign ending stops further invasions.

## Presentation and town flow

The map uses gold/teal control markers, muted unexplored routes, enemy-held strongholds and red marching invasion paths with day badges. Twenty-four defense marks show completed and remaining home assaults. Newly liberated regions recolor and raise their banner during the battle report. The next-day number and latest defense mark animate into place; Skip animation and reduced-motion preferences are supported.

The report lists only actual campaign changes. Defense chapters no longer appear as location-unlock cards. The final map screen returns the player home and sets a waypoint to Sera. It does not remotely start a mission or bypass town vendors. The war-table mission preparation screen states the day cost and the relevant deadline.

Existing victories, inventory, town ownership and final-fortress credit are preserved. The new calendar starts at day 1 for old saves, without guessing how many historical replays were played or imposing retroactive invasions. Old pending territory notification cards are removed while preserving the position among genuine rewards. A previously earned ending that is missing the newly required town conquests now shows those unfinished objectives.

## Reference research

Foursaken's [official Heroes & Castles 2 listing](https://play.google.com/store/apps/details?hl=en-GB&id=com.foursakenmedia.heroesandcastles2) describes defending the home castle while capturing and protecting outposts, then destroying the enemy castle in a final siege. That separation informs Oathfire's home-defense track and territorial campaign.

A [firsthand community discussion](https://heroesandcastles2.fandom.com/f/p/2866484074250509352) describes frustration with multiple outpost attacks overlapping a short home-defense deadline and enemies growing too difficult. It informed the concurrency limit, three-day warning, protected garrisons and region-bounded relief armies. The day intervals above are Oathfire's own design values; they are not presented as verified original-game numbers.

## Validation

- 170 automated tests pass, including exact-once day settlement, deadline enforcement, relief victory/defeat, loss and recapture, tribute, invasion caps, save migration, corrupt-state rejection and final-boss victory conditions.
- A deterministic campaign-state simulation followed recommendations through 42 successful battles: 24 defenses, eight conquests, nine relief actions and the final fortress. It reached the ending on day 43 without a progression deadlock. This checks progression rules, not the combat balance of all 42 battles.
- Browser QA plays the entire two-wave Reedhaven relief encounter through the normal reinforcement, navigation and combat systems. It uses an explicitly prepared army and invulnerable hero fixture to isolate wave completion; it is not a claim of untouched starting-hero balance.
- Final-fortress browser checks breach the gate, verify exactly one boss and boss music, save and reload, destroy the keep while the king remains alive, and then defeat the king. Campaign victory settles once only after both objectives.
- Phone checks at 844×390, 667×375, 390×844, 375×667 and 320×568 cover map fit, safe-area boundaries, report resume without duplicate days, Sera guidance, actionable invasion details and reduced-motion behavior. The new map itself requires no panning.

Browser checks and screenshots are reproducible with `scripts/war-campaign-qa.mjs`. Reports live in ignored `work/qa-war-release/` and `work/qa-war-live/` folders. No player save is used; browser contexts are disposable.
