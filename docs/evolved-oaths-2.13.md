# Evolved Oaths — 2.13

All 23 active abilities across Warden, Ashwright and Veilranger now have ten ranks. Passives keep their existing individual progression. Every active rank changes a real combat parameter; the same shared profiles supply training stats, descriptions and combat.

## Training economy and gates

| Rank | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Skill-point cost | 1* | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 4 | 5 |
| Starter ability minimum hero level | 1 | 2 | 6 | 9 | 12 | 15 | 18 | 21 | 24 | 27 |

*Starter rank one remains free. Signature abilities retain their existing three-point initial learning cost. Other abilities use the greater of the starter gate and their learning level plus rank minus one, so a newly introduced technique still needs further hero levels before mastery. Hero level remains capped at 30.

Earned points are `level - 1 + max(0, level - 4) + floor(max(0, level - 9) / 2)`, plus up to six earned quest points. Level two still awards one point. Later levels increase the available budget to 65 level-earned points at level 30, enough for two mastered starter abilities (46 points) plus passive training, not every ability. Extra level-derived points apply retroactively to existing saves. Old ranks, gear, inventories, resources and first-three-rank costs remain intact. Save validation rejects invalid evolutions, excessive budgets and new ranks above their level gates.

## Evolution choices

Rank ten unlocks two mutually exclusive evolutions per active ability, with no additional point cost. Players can switch paths freely at Hearthwatch; training and path changes are unavailable during a battle. Free respec clears purchased ranks and evolutions and restores the original starter loadout. The two equipped buttons and one-signature limit remain.

Furnace Fireball becomes either:

- **Furnace Corona:** a nine-metre fire circle, 180 immediate damage and 32 fire damage per second for six seconds, with knockback. Costs 26 focus; eight-second recovery.
- **Falling Sun:** one enormous travelling projectile, 420 direct plus 170 blast damage in six metres, and 32 fire damage per second for six seconds. Costs 30 focus; ten-second recovery. It uses actual projectile collision.

Other choices include piercing versus distributed arrow volleys, travelling versus anchored healing fields, defensive dash versus damaging charge, single-target execution marks versus group exposure, mine clusters versus a volcanic trap, and delayed meteor showers versus immediate shockwaves. These are separate combat branches with tailored casting poses, geometry, colours and release behaviour. Mobile effects are bounded and pooled particle budgets remain in place.

Training shows current and next-rank totals, exact point cost and level gate. A focused evolution view shows both choices, effects and animation preview before selection. The HUD uses the evolved ability name and actual resource cost. Level-up notifications/results use the revised earned-point totals.

## Independent visual review and revisions

An independent agent inspected actual rendered heroes, troops, enemies, castle, landscape, menus, battlefield, campaign and rewards at desktop and phone dimensions, compared them with official mobile-game imagery, reported problems, and re-inspected revisions. This is a representative product/visual review, not a claim to have completed every campaign mission or measured physical-phone frame rate.

Implemented from its feedback:

- Focused training/evolution screens remove redundant navigation. Every ability decision fits at 844×390 and 667×375; portrait remains usable.
- Orange/red procedural flames and embers replace opaque fire-circle ribbons. Persistent zones no longer repeatedly obscure combat with giant burst rings. Falling Sun's windup faces its target; previews use a miniature circle so the evolution is actually visible.
- Routine combat notifications collapse to one small edge notice.
- Hero portraits frame the body, with a closer inspection view; the armory retains complete oversized weapon framing. Small-phone preview controls stay in one row.
- Three overlapping distant terrain/woodland layers, soft horizon haze and irregular road verges connect the playable landscape to painted vistas. Decorative additions remain outside the collision boundary.
- Elite Longbowmen preserve their cobalt livery rather than inheriting a pink hero brocade tint.

The follow-up review caught and prompted repair of a reserved GLSL variable that hid the ground, oversized fireball windup effects, and small-phone overflow. Browser QA now checks shader console errors as well as JavaScript errors.

The reviewer did **not** find parity with the original concept paintings or premium contemporary mobile character assets. Faces, garment folds and some armor/architecture still need authored asset work. Those limitations should not be disguised by additional particles or assertions of completion.

Primary visual references inspected by the independent reviewer:

- [Foursaken's Heroes & Castles 2 listing](https://play.google.com/store/apps/details?id=com.foursakenmedia.heroesandcastles2): readable armor silhouettes, material separation and corner battle HUD.
- [Black Desert Mobile official site](https://www.world.blackdesertm.com/Ocean): scenery composition, layered depth and landmarks; promotional imagery is not a performance benchmark.
- [Blizzard's Diablo Immortal gameplay overview](https://news.blizzard.com/en-us/article/23557147/diablo-immortal-gameplay-overview-everything-you-need-to-know): Westmarch architecture, local light and material contrast. This older official image is an art-direction reference, not evidence of current UI.

## Validation

The release uses rules tests, actual browser casting/impact checks, all-ability mobile geometry checks, save migration/respec/reload tests, and regressions for scouting, Command equipment, wall soldiers and victory. Review captures and detailed execution reports are retained locally under `work/visual-review-2.13` and `work/qa-evolutions-compiled`. GitHub Pages deployment is checked against exact local production file hashes before the public handoff.
