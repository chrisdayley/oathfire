# Oathfire — playable design, version 1

## The promise

A hero worth mastering, an army worth leading and a home worth returning to. The camera defaults to third person, with an optional first-person view. Landscape mobile controls keep movement under the left thumb and guard, jump, quick/charged attack and two active techniques under the right.

The design grew from research into Heroes & Castles 2, including direct hero combat alongside army purchasing and castle defense. Oathfire uses an original story and assets. No source-game code, artwork or names are copied.

## The Hollow March

The beacon network once carried the voices of the fallen. Marshal Veyr tried to free those souls, but his broken oath bound them into the Hollow Host. Hearthwatch holds the last uncorrupted ember. Reclaim fifteen strongholds across three acts, defeat the Bell Knight, break the Ash Castellan and reach Veyr at the Crown of Ash. The ending releases the fallen rather than inheriting their army.

Torren tends the forge, Iona equips expeditions, Rowan trains regiments, Nell rebuilds the defenses and Sera marks the campaign. The oathkeeper's crypt gives the world a small environmental puzzle: Seed, Flame, Dawn.

## Home and field

The castle courtyard is freely explorable. Vendors are physical characters; its western stairs and parapet are walkable. The central gate opens between battles. Rocks, trees, walls, buildings and terrain use actual colliders. A capsule controller handles sliding, small steps, slopes and gravity. Jumping can clear low rocks; large rocks remain obstacles.

The field spans roughly 250 by 286 metres rather than a single corridor. A ridge supply camp rewards movement with immediate Command and fewer enemy reinforcements. Chests wait on the rampart, outside the mill, on the ridge and among distant ruins. Field caches use territory-specific collection IDs; permanent home caches cannot be repeatedly looted.

Six terrain families alter hills, vegetation, water, visibility and obstacles: open downs, river crossings, quarry terraces, woodland ruins, snowfields and desert strongholds. Fifteen territory definitions combine those terrains with escalating waves and three captains. This first release reuses the Hearthwatch castle kit across territories rather than offering fifteen bespoke castle interiors.

## Combat and animation

Quick release performs a light strike; holding more than 0.32 seconds produces a charged attack. Swords cycle diagonal/horizontal/stab actions, spears thrust, hammers cleave and chop, bows shoot arrows and staves cast flame. Damage is applied at the strike's impact phase, not immediately when the button is pressed. Charged attacks consume more stamina, commit longer and can stagger a crowd.

Rigged models animate limbs, torso and head while walking, running, jumping, guarding, attacking, casting, taking hits and dying. Shared licensed skeletal clips are retimed and layered with game-specific casting poses, cloth motion and equipment. Stormriders have separately articulated four-legged mounts. First-person mode supplies animated arms and the currently equipped weapon.

Arrows and bolts contain shafts, heads and fletching. Each projectile sweeps through its travelled segment to resolve walls or bodies. Flame uses a bright core, rising flame particles, embers and smoke. Roots grow along curved tendrils; wards rise as translucent shield plates; healing water expands as a spray. Skill ranks change casting clips, body overlays and effect geometry/counts as well as mechanics.

Sword, spear and hammer swings have separate procedural swishes; armored contact produces layered metallic transients. Each named technique has a unique pitch/rhythm signature layered over its elemental sound. Sound starts only after a player gesture and can be adjusted or muted.

## Hero progression

Three heroes share the kingdom and inventory, but keep independent levels, XP and three skill trees. The Warden combines guard counters, command support and fire rites. The Ashwright combines a heavy weapon, explosive runes and healing quench. The Veilranger combines ranged attacks, a mobility step and living roots.

The level cap is 30. Each level grants one skill point, with up to six extra discovery/captain points per hero. Skills have 1–5 ranks, prerequisites, level gates and points-spent gates. Foundational stat gains taper; advanced nodes change timing, targeting, protection, resource conversion or party behavior. Late branches offer tradeoffs, including greater ally damage at the cost of personal weapon damage, or cheaper techniques with reduced healing. One capstone is active at a time. Respecialization is free at the keep.

The playable tooltip data in `src/data.js` is the authoritative mechanical contract. Earlier concept studies describe additional formation states and alternative capstone triggers; those are not represented as working mechanics in the interface.

## Equipment

Five weapon types plus armor, shield and relic slots. Rarity changes item strength; affixes change play through burns, armor stripping, life return, attack speed, guard efficiency, command damage or resource capacity. Enemy victory rewards and hidden chests give randomized equipment. Duplicate or unwanted items can be salvaged, but equipped items cannot be destroyed.

Forging preserves identity and reaches +10. +3 unlocks an ember/frost/vital rune; +6 unlocks swift/sunder/guard tempering; +10 awakens after Act II. Shield power increases stamina capacity and relic power increases focus. Inventory, equipped items, forged levels and modifiers are included in save backups.

## Regiments and castle

Shieldward, Longbows, Pikeguard, Lanternkeepers, Ashbreakers, Siege Crew, Stormriders and an Oathbound Giant. All have ten permanent ranks. Rank II adds reinforcement, III shoulder armor, IV bracers, V heraldry, VI greaves, VII a larger mantle, VIII a pennant, IX winged trim and X a full crest. Weapons and shields also evolve. Unlocks are tied to territory victories; training gates open ranks I–V, then VI–VII after Act I, then VIII–X after Act II.

Command regenerates during a battle and pays for units without consuming permanent Supplies. Deploy at most 24 allied soldiers. Hold, follow and assault commands can change the front. Lanternkeepers heal nearby injured units. Later Shieldward reduce projectile damage when adjacent and holding; mounts and giants change speed and scale.

Gate, archer towers and ballistae each have ten construction ranks. The live world and preview share their geometry builders. Towers gain roof, masonry, shutters, buttresses, a stair turret and standards. Ballistae gain feet, crank, ratchet, shield, ammunition rack, torsion drums, counterweights and a Sunlance mechanism. Gate upgrades reinforce the frame, bracing, upper towers and heraldry.

At rank V choose tower range versus suppression cadence, or ballista penetration versus pinning. Rank VIII towers mark or slow. Rank X towers replace a normal shot with a three-arrow volley every 18 seconds. Rank X ballistae wind up a solid, burning Sunlance bolt every 22 seconds. The live crew and mechanisms animate when firing.

## Menus and persistence

Character and equipment screens show the equipped hero; regiment and defense screens show the selected object. Future ranks are inspectable without spending. Shops, inventory comparison, equip, forge, runes, temper, salvage, training, defense construction, campaign travel, journal, settings, save export/import and pause/resume are functional.

The game pauses in menus. Saves use local storage plus IndexedDB and a previous-checkpoint backup. Battle snapshots include the current wave, living enemies, army, gate, hero resources and cooldowns. Imports validate ranges and references before replacing a campaign. No network account is required.

## Visual target and release boundary

The painted mockups established warm stone, a teal-and-gold kingdom, lived-in vendors and a broad landscape. The first executable release reproduces that composition and interface structure with a lighter stylized renderer. It does not match the paintings' photorealistic material detail. Its character foundations remain visibly stylized.

This release focuses on a complete playable campaign loop. It does not include multiplayer, dialogue voice acting, seamless travel across all fifteen territories, destructible terrain, advanced squad routing morale or hand-animated cinematic cutscenes. Physical iPhone/Android device performance remains a separate validation step; browser viewport emulation does not certify it.
