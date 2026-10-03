# Daily town rewards — Oathfire 2.18.1

Each campaign day now pays Supplies from every town still held. One completed battle advances one day: defense, siege, relief, victory, defeat or withdrawal. This replaces the previous home-defense-victory-only tribute.

Ownership resolves before payment. A newly captured or recaptured town pays immediately; a town lost to a failed relief or expired invasion no longer pays. Threatened towns pay until actually lost. The final fortress victory also pays. Nothing accrues from real-world time, menus, reloading or replaying a saved result screen.

| Town | Supplies per day |
| --- | ---: |
| Willowmill | 28 |
| Reedhaven | 42 |
| Coppergate | 62 |
| Whitepine | 80 |
| Sunspire | 102 |
| Briarhaven | 126 |
| Greywake | 152 |
| Dawnmere | 180 |
| All eight | 772 |

The town rates are unchanged; their payment frequency now follows the campaign calendar. They are additional to battle, chest and conquest rewards. Each report stores the actual per-town amounts paid on that day. Expand **Day … town income** in Summary or Loot to inspect every contribution. The total is already included in Supplies, not a second claimable reward. The final map shows the amount collected, and the war table shows the current Supplies/day rate. Tutorial, town briefing and new journal entries use the same rule.

Existing saves and already settled reports are preserved. Old reports retain their original totals and display legacy tribute without manufacturing a daily breakdown or granting backdated income. New reports validate their per-town contributions against the held-town snapshot and total. The existing report-ID guard prevents repeated settlement.

## Reference

The [Heroes & Castles 2 community wiki's Crystals page](https://heroesandcastles2.fandom.com/wiki/Crystals) documents certain territories paying crystals after a specified number of battles, with varying rewards. It does not establish that every territory pays every day. Oathfire follows the requested rule of every held town paying each campaign day, with its own currency and rates.

## Validation

- 179 automated tests pass, including all battle types/outcomes, first capture, recapture, deadline loss, failed relief, final fortress, exact-once reload behavior, historical-report compatibility and invalid payment rejection.
- 18 focused production-browser checks cover actual battle settlement, report reload, map transition, loss of income and all eight contributions. The payment fixtures deliberately finish battles directly to isolate rewards; these are not combat-balance playthroughs.
- Phone layouts are checked at 844×390, 667×375, 390×844 and 320×568. The longest contribution list remains readable and accessible inside the report; the map displays income without changing its navigation.
- Reproduce with `scripts/daily-income-qa.mjs`. Disposable browser contexts preserve player saves. Screenshots and reports live in ignored `work/qa-daily-income-release/` and `work/qa-daily-income-live/`.
