# Oathfire 2.7 — The Long March

## Siege geography and combat

- Friendly gate z = −17; enemy gate z = −1907. Separation is 1,890 metres, exactly 15 times the previous 126 metres.
- New sieges start outside the friendly gate at z = −27. Ground meshes, collision, navigation, water, footsteps, woodland and boundary walls extend to the new fortress.
- Four defended road camps at z = −315, −745, −1175, and −1605. Remain within 13 metres for six seconds with no living enemy within 35 metres to capture one. A captured camp advances recruitment and once restores 35% health to the hero and soldiers within 50 metres. No repeated healing exploit.
- Troops march at the hero's marching pace while far from enemies; ordinary combat movement resumes within 60 metres. A* searches local route segments and rasterizes obstacle bounds, avoiding a full 2 km search per soldier.
- Stronger fortress health: first gate 1,050 (previously 420), first keep 2,100 (previously 760); final gate 4,500 and keep 8,540. Bastions still use physical projectiles and are individually destructible.
- Continuous reinforcements become larger and more frequent. Time pressure is capped by the furthest point reached by the expedition, so a long opening does not create maximum fortress pressure at the first camp. Pressure never falls when retreating or reloading. The breach adds pressure. Road reinforcements enter 65 metres behind the defended camp rather than appearing inside its capture area. The final fortress escalates from three arrivals every 18 seconds to eight every 8 seconds; its old 5-second maximum cadence was overwhelming during the longer approach.
- The final expedition has a one-time 350 Command deployment reserve for an upgraded giant, crew, healer and standard. Normal regeneration still stops at 220; this does not increase recurring income. Other sieges retain their starting budgets.

## Command economy

Dawn standards unlock after the first main victory and cost 45 Command at rank I. Each living standard generates +0.15/s at rank I, rising by +0.025/s each rank to +0.375/s at rank X. The three strongest living standards contribute anywhere on the map. Their nearby damage/movement aura still uses the strongest source rather than stacking. Death removes that standard's income.

Castle → Command lodge is a separate permanent upgrade, using no emplacement or army slot:

| Rank | Castle income | Supplies | Main victories required |
|---|---:|---:|---:|
| I | +0.08/s | 280 | 0 |
| II | +0.16/s | 550 | 2 |
| III | +0.26/s | 1,000 | 5 |
| IV | +0.38/s | 1,800 | 10 |
| V | +0.52/s | 3,000 | 16 |

Base income is +0.60/s. Ridge camp income and Field logistics research still apply. The HUD always shows the potential passive rate, including when full. Tapping it pauses combat and lists the sources; it explains that income stops at capacity.

## Reward visuals

New main missions, optional rescues and the final fortress reveal their actual coordinates on the illustrated campaign map. Troops use their own rig and rank; rank-cap reveals preview the newly available appearance. Earned weapons use the same weapon geometry as equipment; armor displays bake the equipped chest/shoulder geometry into an item display. Shields and relics have dedicated previews. New chest items are appended to the reveal sequence without granting rewards again. Maps do not retain a hidden hero render underneath.

## Compatibility and QA

Old siege saves retain their damage, health, Command, army, research, loot and mission status. Their hero, soldiers, hold point and dropped chests move with the relocated fortress, and the four approach camps count as already cleared. Older pre-siege settlement saves begin at the friendly castle with their retained army and Command. Existing campaign data gets an unbuilt Command lodge at no cost.

Checks and reproducible scripts:

- `npm test`: progression, saved positions, chest settlement, Command stacking and limits, upgrade costs/gates, reveal routing, and siege pressure.
- `scripts/frontier-qa.mjs`: real mobile menus at 844×390 and 667×375, Command source breakdown, lodge purchase, troop/map/armor reveal content, and no-scrolling reveal layout.
- `scripts/frontier-resume-qa.mjs`: legacy position migration and exact campaign round-trip across a real reload.
- `scripts/siege-qa.mjs`: sword/projectile damage, intact gate collision, open breach traversal, autonomous army attacks, bastion damage, saved destruction, rewards, and final defense unlock.
- `scripts/siege-terrain-qa.mjs`: all nine siege maps, safe enemy spawns, plateau height, melee hits, pressure-six saves, and phone research menus.
- `scripts/frontier-balance-qa.mjs`: two seeded prepared early-campaign runs and unattended archer comparisons. Tests use normal movement, attacks, research, Command costs, health and potions; fixed ticks accelerate simulation only.
- `scripts/final-siege-qa.mjs`: endgame expedition playthrough with a trained army and equipment build.
- `scripts/scenery-qa.mjs`: regional artwork, castle/rock/stair collision, movement, both phone-sized layouts, rendering and save preservation.

Phone-sized checks use desktop Chromium with mobile viewports; these are not physical phone benchmarks. The music and original panorama assets are unchanged.

### Verified release results

107 automated tests pass. Browser checks cover all nine siege maps, 19 siege physics and campaign assertions, 16 Command/reveal UI assertions at both phone-sized viewports, five legacy-save/reload assertions, and the production siege and active-ability flows. The prepared level-30 final-fortress run completed all four camps and destroyed the keep in 13:38 using normal movement, combat, recruitment and research. Its specialist army used elite and Forge-band research, three income standards and the fully upgraded Command lodge. This is a tested build and route, not a guarantee that every army composition can win.
