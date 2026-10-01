# Command & Keep — mobile interface revision

## Reference research

The [Heroes & Castles 2 screenshot gallery](https://minireview.io/action/heroes-and-castles-2-premium) shows a dedicated battlefield HUD with Units and Research entry points, compact resource counters, heraldic lettering and framed buttons. Its [developer-published store listing](https://apps.apple.com/us/app/heroes-and-castles-2/id993873900) establishes the live hero/army/castle combination. The battlefield HUD screenshot was visually inspected; the exact original expanded recruitment popup was not reliably recovered. Oathfire's new Troops/Defenses hierarchy follows Chris's requested flow rather than claiming to reproduce that popup.

Apple's [Design advanced games for Apple platforms](https://developer.apple.com/videos/play/wwdc2024/10085/) recommends adapting layouts to the device instead of shrinking a desktop interface, comfortable type, 44-point touch targets, scrolling instead of tiny text, safe-area awareness, context-sensitive controls and visible press feedback. [Design great interfaces for handheld games](https://developer.apple.com/videos/play/meet-with-apple/243/) reinforces flexible layouts and legible, responsive handheld interfaces. These principles informed the hierarchy, larger targets and removal of unrelated destinations during combat. The web implementation uses CSS pixels; it is not a native UIKit interface.

No reference game's artwork, interface assets, or code were copied. Oathfire uses its own heraldic SVG icons, models and original styling.

## Navigation and visual decisions

- Battle Command opens a narrow right-side drawer over the paused battlefield. First choose Troops, Defenses or Orders. Lists show a name, rank/squad information, availability and a clearly labeled Command cost. Deploy works directly from the row. Tap the name to inspect the animated object and its stats in a dedicated view.
- Castle Keep has four primary destinations and a mission banner. Less frequent destinations live under Market, chronicle & settings. The global nine-tab navigation is removed.
- Character attributes, skill trees and equipped techniques are separate views. Equipment follows slot → inventory → piece → Benefits / Compare / Forge.
- Regiments and defenses follow roster → object → Overview / Stats / Abilities / Upgrade. A three-value summary precedes the full numerical detail. Rank preview, model changes, exact comparisons, doctrine options and castle emplacements remain accessible in their own layers.
- Typography uses Cinzel for names and heraldic headings, a heavier humanist sans for action labels, and larger numerical values. Warm charcoal/leather surfaces, brass borders, ivory text, crimson mission banners and pressed states replace the teal dashboard treatment.
- Back restores the prior level and list scroll. Close returns directly to play. All menus pause combat. The next mission's briefing still tells the story before starting a defense.

## Command and castle economy

Troops use their actual squad Command price at their owned rank. The list includes locked troops with their victory requirement. Unaffordable purchases and over-capacity squads are disabled; game logic enforces both constraints independently.

Battlefield defense costs: gate repair 45; arrow tower 55; ballista 75; cannon 90; frost obelisk 70; mortar 100; sanctuary 85; storm spire 110. Repair restores up to 250 health and cannot rebuild a fallen gate. Refitting replaces one of four emplacements at its permanent owned rank for this battle only. It does not change permanent ranks, Supplies, or the saved home layout. Other emplacements retain their firing cooldowns. Returning home restores the normal castle arrangement.

## Autonomous army behavior

New squads receive Seek & attack, including recruits deployed after older soldiers were told to Hold. Fighters search the whole battlefield for the nearest living enemy; Veil blades prioritize ranged enemies. Paths finish at the target instead of ending at an approximate grid cell outside melee reach. Fighters reacquire when targets die. Without enemies they stage ahead of the castle. Hold and Follow remain deliberate tactical options for the current army. Engineers defend and repair the gate.

Legacy saves without the new temporary layout and individual orders remain compatible. Suspended battles preserve temporary emplacements, Command, individual troop orders and the hold position. Shieldward's linked-shield perk checks the individual soldier's Hold order even in an army with mixed orders.

## Verification

- 31 automated progression, equipment, inspection and save tests pass.
- Browser QA covers the new navigation hierarchy, real deployments, costs, cap/lock presentation, all 230 troop/defense rank displays, 3D previews, retained stats/abilities, defense refits and save recovery.
- Actual DOM viewports: 667×375, 844×390 and 1280×720. Roster buttons meet a 44 CSS pixel minimum; no horizontal menu overflow was found in tested views. Screenshots were inspected for legibility and layout.
- Real Rapier movement/projectile tests: Shieldward, Longbows and Pikeguard cross 130–157 metre approaches, damage a target without hero orders and reacquire enemies on the opposite flank. Hold and Follow are exercised separately.
- All seven emplacement types are installed into the actual scene. Gate repair, fallen-gate protection, saved battle layout and returning to the permanent home layout are checked.
- A full first mission is won with movement, attacks, spells and squad purchases under normal game stats; all enemies are defeated and the guaranteed armor reward is retained.

Automated mobile-sized Chromium testing is not a physical iPhone/Android performance or touch-ergonomics test. Reproducible scripts: `scripts/menu-qa.mjs`, `scripts/command-qa.mjs`, and `scripts/campaign-test.mjs`. Set `PLAYWRIGHT_MODULE` or pass `--playwright-module` to an installed Playwright package. Build and serve on port 4180 before running.
