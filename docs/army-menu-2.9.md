# Regiment dossiers — 2.9.0

The supplied Heroes & Castles 2 screenshot guides the hierarchy: a persistent troop list on the left, the selected animated soldier in the center, and its combat dossier on the right. Other destinations and unrelated resources disappear. Back returns to the keep or battle command; Close resumes play.

## Unit information

All 15 troops show health, damage, armor, range, attack interval, movement speed, soldiers per recruitment and armor penetration. Unit-specific values appear alongside these: healing strength/cadence, Command income, aura strength/radius, charge damage, knockback, siege bonuses, slow strength/duration and other applicable mechanics. These values come from the same inspection and training functions used by combat. Battle profiles include completed research and show actual recruitment prices and remaining army capacity.

Each unit has a short description, useful matchups and vulnerabilities. Support troops explain their best use instead of claiming damage counters. Advice describes existing behavior and does not introduce hidden counter multipliers. Abilities opens the complete mechanics with locked rank requirements; Stats & role returns to the dossier.

The rank selector previews all ten ranks without spending anything. Choosing Upgrade always previews the next *owned* rank, regardless of the rank previously inspected. It displays the next model, Supplies price, current balance, each changed value and its exact delta. Recruitment cost increases are marked as a tradeoff. Newly unlocked abilities are described. Burn damage is omitted before its rank-V unlock, then shown as a new benefit in that upgrade quote. Cancel restores the owned rank. Confirm purchases one rank; duplicate or stale confirmation is ignored. Locked, capped and unaffordable purchases remain protected.

## Equipment names

Actual inventory names, including rolled prefixes, appear above Overview / Compare / Improve and remain pinned while scrolling. The model caption uses the same name. Names wrap on narrow screens; missing legacy names fall back to the item's armor/weapon pattern and affix without changing saved equipment.

## Mobile layout

Landscape retains three columns. The roster scrolls independently; the dossier keeps its heading and action buttons visible while longer specialty descriptions can scroll. Portrait places roster and model above the full-width dossier. Model rotation and attack previews remain available. The battle roster renders the same inspection scene as the castle roster.

## Validation

- `npm test`: 118 tests pass. The new checks cover all 150 unit/rank profiles, all 135 upgrade quotes against actual purchases, squad-cost tradeoffs, ability unlocks and legacy equipment names.
- `scripts/regiment-menu-qa.mjs`: isolated browser campaign; no use of the player's campaign. Checks selection/model/rank synchronization, all displayed rank values, cancel/confirm/duplicate protection, insufficient funds, victory gates, max rank, live recruitment and research, equipment-name visibility, and save recovery.
- Browser layouts: 1280×720, 844×390, 667×375 and 390×844. Screenshots are inspected for the roster, next-rank quote, battle preview and equipment names. These are Chromium viewport checks, not physical iPhone/Safari tests.
- Production is built with Vite and the existing offline service worker. Deployment uses the existing GitHub Pages workflow; the release check compares every served build file to the local artifact.

No balance values, equipment rolls or campaign schema change in this release.
