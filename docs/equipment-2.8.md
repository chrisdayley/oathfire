# Exalted equipment — 2.8

Equipped armor rarity now drives the hero's construction, colors and ornamentation independently of hero level. Existing items are not rerolled or replaced. Equipping an existing Legendary immediately changes the appearance on all three heroes. Troop ranks remain independent.

| Rarity | Construction and livery | Weapon length factor above the grip |
| --- | --- | --- |
| Common | Plain cloth, dull metal, simple fittings | 0.92 |
| Uncommon | Cleaner metal and upgraded fittings | 1.00 |
| Rare | Distinct family colors, inlay and gems | 1.08 |
| Epic | Articulated tassets, circlets and more elaborate weapon guards | 1.17 |
| Legendary | Dark plate, gold tracery, ornate pauldrons and long embroidered mantle | 1.30 |
| Mythic | Luminous inlays, engraved channels, silver crests and deep colored cloth | 1.50 |
| Godly | Ivory/gold armor, segmented solar nimbus, crest plates and luminous weapon details | 1.72 |

Bow limbs use a gentler length scaling to preserve the draw pose. Grip geometry and hand sockets stay aligned; cosmetic size does not enlarge collision capsules or attack reach. New armor geometry is bound to the existing skeleton. Capes retain their movement. Resting shields sit below the face; the guarding pose still raises them.

The seven armor families retain their identity and distinct liveries. Mythic/Godly glow colors reflect each family: Cinderforged orange, Wayfarer green, Starwoven violet, Bastion cyan, Dawnkeeper/Marchwarden gold. Weapon runes take precedence over active named powers and affixes; a second aura preserves a different secondary power. Fire is orange, frost cyan, lightning lavender, nature green, life-drain crimson, water turquoise, arcane violet and protective magic gold. Dormant named powers do not light up by themselves. Basic rune staves have an innate orange fire aura matching their projectile; an active named power or socketed rune can take precedence.

The actual same equipment builders serve combat, first-person weapons, armory inspection, hero selection, loot reveals and the separate equipment atelier. The atelier can compare any hero, armor family, weapon pattern, rarity and rune without reading or writing a campaign. Example: `art-studio.html?role=warden&rarity=6`.

## Obtaining exalted gear

- Before 12 main victories: previous loot roll distribution is retained.
- From 12 main victories: Mythic occupies the top 1.5% of the mission/treasure roll. Legendary occupies the next 3.5%.
- From 20 main victories: the top 0.2% becomes Godly; the next 1.3% remains Mythic.
- First conquest of the final fortress guarantees at least Mythic. First victory in the final defense guarantees Godly. Replays use ordinary late-campaign odds.
- Late-campaign chest contents can roll higher than the chest's five-tier container. Chests still contain one or two items; container rarity remains the minimum content quality.
- Inventory capacity remains 160. Rewards overflow to Salvage as before.

Mythic and Godly use item-value multipliers 1.75 and 2.05, alongside the existing forging and armor-benefit rules. Save and battle-report validation accept both new qualities and reject values outside the seven-tier range. No earned levels, resources or items are reset.

## Validation

Automated unit coverage includes rarity/hero-level independence, magic color precedence, rare-drop gates, final mission guarantees, item persistence and late-campaign chest validation. Browser QA covers all 21 hero/rarity combinations, all 35 weapon/rarity combinations, seven armor families, real equip actions, full-body animations, first-person models, reload persistence and repeated swaps. Mobile layout is checked at 844×390, 667×375 and 390×844 using Chromium; this is browser viewport testing, not physical iPhone/Safari certification.
