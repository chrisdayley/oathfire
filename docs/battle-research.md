# Compact battle HUD and temporary research — 1.5

## Reference and scope

Chris supplied a Heroes & Castles 2 battlefield screenshot showing corner vitals, resource and capacity counts, a recent-unit shortcut, and separate Units/Research entry points. That layout informed Oathfire's compact battle-only HUD. Castle preparation remains in Keep between missions.

The community [Research reference](https://heroesandcastles2.fandom.com/wiki/Research) documents four timed research choices per battle, cancellation of unfinished projects, and territory unlocks. Oathfire adopts that structure. The eight projects below are original balancing choices for Oathfire's roster, not a claim to reproduce all of the original game's research or its exact numerical balance. No reference artwork or code is included.

## On the battlefield

- Upper left: current health, stamina and magic with small proportion bars; Command and its regeneration rate. At the resource cap it reads Full.
- Below: up to four most recently purchased squad types, showing their current Command price. Tap to buy again without opening a menu. Free starting soldiers do not create purchase history. Unaffordable and over-capacity purchases are disabled, with independent enforcement in game logic.
- Upper right: living soldiers out of 24, remaining spaces, installed emplacements out of four, gate/beacon condition and wave. The four initial defenses are already installed, so the count starts at 4/4. A refit replaces one of them; it does not add a fifth. The gate is counted separately through its condition bar.
- Bottom: Command and Research. Command opens Troops / Defenses / Orders / Research. Research goes directly to four slots and Troops / Defenses filters. Tap a project name for details, or its Research button to start.

All four projects can progress concurrently. No Command or permanent currency is charged to start research: its costs are time and a committed slot. Menus pause timers. Canceling unfinished research frees its slot and loses its progress; a completed project stays committed until this battle ends. Existing troops receive completed effects immediately. New recruits and later defense refits use those same effects. A few projects increase the price of future recruits, displayed in both roster and quick-recruit buttons.

| Project | Duration | Unlock (victories) | Effect for this battle |
| --- | --- | --- | --- |
| Longbow drill | 25 s | 0 | Longbows +25% range; new squads cost 5 more Command. |
| Shield discipline | 35 s | 0 | Shieldward +25% maximum health, +20% damage; new squads cost 5 more Command. |
| Pike formations | 40 s | 1 | Pikeguard +35% damage, retaining their siege-target multiplier. |
| Runic focus | 50 s | 4 | Lanternkeepers, Cinder adepts, Rime scholars and Sun sworn +25% direct attack damage and healing, +15% maximum health. |
| Reinforced gate | 40 s | 0 | +20% maximum gate health; a one-time full repair if it still stands. A fallen gate stays fallen. |
| Windlass drills | 35 s | 0 | Archer tower, ballista, cannon and mortar fire 20% faster (interval divided by 1.2). |
| Siege payloads | 45 s | 2 | Ballista, cannon and mortar +25% damage, including their blasts. |
| Ward harmonics | 50 s | 4 | Rime obelisk, Storm spire and Sanctuary brazier +20% range and +25% damage/healing. |

Health upgrades preserve each living soldier's current health percentage. Damage, healing and range changes appear in battlefield Stats and Abilities; castle inspection continues to show permanent values. Permanent rank, doctrine and research multipliers compose without rewriting the owned ranks. Runic focus does not change fixed secondary ember-field or splinter values.

Research, remaining timers, completed choices and recent-purchase history are included in suspended battle checkpoints. Old saves that lack these optional fields remain valid. A new mission starts with empty slots; returning home and victory remove temporary research effects. Permanent equipment, upgrades, resources and hero progression are preserved.

The first mission briefing and How to play explain Research and quick recruitment. The large training card is hidden during combat to preserve battlefield visibility; preparation training remains at home.

## Verification

Verified for release 1.5: 38 Node tests, 28 research/HUD browser checks, 37 menu regression checks, and a full first-mission victory with all enemies defeated and the armor reward. No browser runtime errors were reported.

The reproducible Node suite covers formulas, all eight effects, four-slot limits, cancellation/restarts, territory locks, permanent-stat isolation and current/legacy suspended saves. `scripts/research-qa.mjs` exercises real touch clicks, actual troop stats and projectiles, healing, pause/resume, gate repair, quick recruitment and battle reset. It also captures actual 667×375 and 844×390 browser viewports, verifies separate HUD controls and 44 CSS pixel research/recruit targets, and checks for runtime errors.

`scripts/menu-qa.mjs` covers the existing tiered castle and battle menus. `scripts/campaign-test.mjs --research` plays the entire first defense with normal combat rules and four research choices; it requires victory, no surviving enemies and the armor reward. Use `PLAYWRIGHT_MODULE` or `--playwright-module` to provide Playwright. Browser emulation does not establish physical iPhone/Android performance or ergonomics.
