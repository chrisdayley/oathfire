# Oathfire: The Hollow March

## 2.21.1 — campaign save recovery

Loads the newest valid campaign across browser storage and IndexedDB, including backups. Invalid autosaves cannot replace a valid checkpoint. If only an interrupted battle is damaged, an explicit recovery action returns to town while retaining earned campaign progress; original save copies are archived and exportable from the title screen. The title shows the actual build, and installed games offer a save-and-reload action for waiting updates. No new campaign is required.

[Save recovery behavior and validation](docs/save-recovery-2.21.1.md)

## 2.20.1 — uninterrupted touch combat

Combat controls suppress text selection and iOS long-press callouts, including their nested labels. Holding Attack still charges and releasing still strikes; menus and editable save/settings fields keep their normal interactions.

## The turning tide — 2.20

Warned battlefield threats, interruptible attacks, perfect-guard counters and hero/army combinations give the player more ways to turn a battle. Siege flanks can silence artillery, establish a forward infirmary or delay enemy reinforcements. Every rescued region adds a permanent, themed improvement to Hearthwatch, returning residents and a short NPC homecoming.

[Gameplay rules, save compatibility and validation](docs/turning-tide-2.20.md)

## Earned battle strategy — 2.19

Perks and research now begin locked. Home-defense milestones, castle construction and holding specific towns earn your strategic choices. Unlock cards explain newly earned options; the map and upgrade previews show what you can gain. Suspended battles retain their existing bonuses.

[Perk requirements, research unlocks, reference evidence and validation](docs/earned-strategy-2.19.md)

## Daily town rewards — 2.18.1

Every campaign day pays Supplies from each town still held, after victories, defeats and withdrawals. New conquests begin paying immediately; lost towns stop paying that day. Battle reports itemize the payment by town, and the map shows each town’s daily rate and the total collected. Existing saved rewards are not collected again.

[Daily income rules and validation](docs/daily-town-rewards-2.18.1.md)

## The living campaign — 2.18

A mission advances one campaign day. Hearthwatch has its own 24-assault defense track, separate from the illustrated territory map. Eight town sieges, invasion deadlines, playable relief battles and temporary garrison protection make territorial control matter. Battle rewards end with an animated full-screen map report. Finish all defenses, hold every town and defeat the Hollow King at the Obsidian Crown to win.

[Campaign rules, reference research and validation](docs/living-campaign-2.18.md)

## Reedwater — 2.17

Flowing water follows a continuous riverbed with wet banks, reeds, shore stones and walkable shallows. Valley obstacles now remain visible to enemy navigation below world height zero, resolving stranded reinforcements. Wave status distinguishes enemies left from intermission seconds. Recruitment prices now separate cheap infantry from costly specialists and elites.

[River fixes, recruitment research and validation](docs/reedwater-2.17.md)

## People of Hearthwatch — 2.16

All interface screens respect camera cutouts and the home indicator, with a landscape safety margin for touch browsers that report no inset. The pause menu now opens character progression. Town services require visiting Torren, Rowan, Nell, Iona or Sera. The Town guide, tutorial, reward choices and preparation links mark their locations rather than remotely opening upgrades or missions.

[Phone layout, town flow and validation](docs/people-of-hearthwatch-2.16.md)

## The marching host — 2.15

Castle-focused enemies retaliate when attacked. Defensive waves now deliver reinforcements for 72–120 seconds, building into larger, stronger final packets and waiting for all survivors to fall. All three heroes receive fitted helmets, longer embroidered capes, more natural proportions and rarity-dependent armor coverage: Legendary sleeves, Mythic/Godly full plate.

[Combat rules, armor changes and validation](docs/marching-host-2.15.md)

## Hearthwatch stonework — 2.14

Reworked castle materials and construction: cut-stone relief, real vaulted passages, a recessed keep door, open window arches, staggered slate, aged timber and plaster, embedded flagstones, consolidated market stalls and a shaped forge. Independent concept comparison and repeated rendered reviews caught and corrected clipping, overlapping old geometry and missing furniture collision.

[Art changes, review evidence and validation](docs/hearthwatch-stonework-2.14.md)

## Evolved Oaths — 2.13

Ten ranks for all 23 active abilities, rising training costs and hero-level gates, and two rank-ten evolution paths per ability. Focused mobile training shows exact upgrades and previews. Existing progress is preserved. An independent visual review led to clearer fire effects, closer hero portraits, less intrusive combat notices, integrated distant scenery and corrected veteran troop colors.

[Progression, evolution mechanics, review findings and validation](docs/evolved-oaths-2.13.md)

## Scouting, battle plans and wall troops — 2.12

New enemies now feature prominently in their debut missions. Before launch, animated scouting reports explain their stats, behavior and counters. Choose two preparation perks and inspect your Command totals, then deploy a separate eight-soldier wall garrison with 75% extra range. Stormriders are expensive armored charge cavalry. Command grows through standards, the castle lodge, research, perks and high-tier gear. Victories have an animated, player-controlled transition before the saved report.

[Mechanics, progression, sources and validation](docs/battle-preparation-2.12.md)

## Forged heroes and shorter sieges — 2.11

Equipment lists now keep each item's name, rarity, level and main stat beside its icon, including on narrow phones. All three heroes gain more defined materials, anatomy and fitted armor; weapons gain forged edges, engraving and functional detail. Character menus include a full-screen Inspect view. An independent visual review approved the revised armor and weapon detail against the supplied Heroes & Castles 2 screenshot.

Siege routes are half as long, with closer encounters, larger reinforcement groups and four repositioned camps. Existing suspended sieges migrate with their army, Command, health and castle damage intact.

[Changes, independent review and validation](docs/forged-heroes-2.11.md)

## Hero physique and movement — 2.10

All three heroes have stronger adult proportions with fitted armor. The Ashwright has textured, anatomically shaped arms with blended elbow weights. Walking and running use separate arm poses, shoulder counter-rotation, stable gait transitions, and weapon-aware carrying, including a two-handed hammer grip. Combat clips and collision dimensions stay compatible with existing campaigns.

[Implementation and validation](docs/hero-motion-2.10.md)

## Regiment dossiers — 2.9

The army menu now opens directly to a troop list, animated model, and combat dossier. Every unit shows its actual stats, tactical role, strengths and vulnerabilities. Upgrade previews show the next-rank model, exact stat changes, newly unlocked abilities, and cost before confirmation. Battle recruitment uses the same layout with current research and Command prices. Equipment names remain visible above Overview, Compare and Improve. Existing saves are preserved.

[Menu behavior and validation](docs/army-menu-2.9.md)

## Exalted equipment — 2.8

Armor and weapons visibly change with equipped rarity on all three heroes. Legendary gear gains ornate construction and rich liveries; Mythic and Godly gear add luminous details and oversized weapons. Magical weapon auras follow the actual rune, power or affix. Shields now use their equipped item, and the portrait armory has a full-width model stage. Existing saves and items are preserved.

[Compare the actual gear models](https://chrisdayley.github.io/oathfire/art-studio.html?role=warden&rarity=6) · [Rules and validation](docs/equipment-2.8.md)

## Hero selection and Furnace Fireball — 2.7.1

Character selection displays the actual animated starter hero, with weapon, health, armor, magic, role and starting abilities. Each preview can rotate, attack and cast. Music activates both recording players on a touch and recovers interrupted playback or a failed cue without changing the player's volume preferences.

Ashwright's Furnace Fireball now has its own larger projectile, area explosion and burning ground from rank I. Rank II and III widen the field and weaken enemy armor. Ordinary rune-staff shots no longer inherit Fireball's learned effects, and use a separate casting sound. Existing campaigns keep their progress.

See [damage values and verification](docs/hero-2.7.1.md).

## The Long March — 2.7

Sieges now start at Hearthwatch, with 1.9 km between castle gates, four defended recruitment camps, stronger keeps, and pressure that increases with time and distance. Dawn standards generate passive Command anywhere; a five-rank Command lodge permanently improves income. Tap the HUD income rate for its breakdown. Reward reveals show the actual troop, equipment, or marked location on the campaign map. Existing saves migrate without resetting their earned progress.

See [rules, migration and QA](docs/frontier-2.7.md).

## Living Horizons — 2.6

Three original painted landscape panoramas replace the sparse horizon: golden Crownlands, snowy northern valleys and the Sunlands. Castle roofs now use curved slate courses, solid timber gables, glazed dormers and deep eaves. A terraced upper town and cathedral enlarge Hearthwatch's skyline. Animated windmills, circling birds, chimney smoke, painted woodland, tapered grass, pottery and gallery details add color and life. World geometry is merged in spatial sections and windmill sails are compacted into a few meshes. Existing campaign progress and siege rules remain unchanged.

See [artwork and exact generation prompts](docs/scenery-art-2.6.md) and [implementation and QA](docs/scenery-2.6.md).

A landscape mobile browser game combining direct 3D hero combat, battlefield army commands, castle defense and permanent RPG progression.

**Play:** https://chrisdayley.github.io/oathfire/

Three playable heroes; five weapon styles; quick and charged attacks; physical arrows, bolts and elemental magic; fifteen regiment types with ten ranks each; eight castle defenses with ten ranks; 24 main defenses, eight optional castle sieges and a required final fortress across six landscapes; a free-roam castle, vendors, hidden chests and a crypt puzzle.

Version 1.1 replaces the original visible character bodies with original adult-proportioned armor and undead designs. The world now uses scanned surfaces, image-based lighting, detailed foliage and masonry; the armory and new Hollow Host compendium show the animated models in a stone chamber. The original painted concept studies are art direction references, not screenshots of the shipped renderer. See [design and implementation](docs/design.md) and [QA evidence](docs/qa.md).

## Crownfall — 2.5

The eight settlement rescues are now assaults on enemy castles. Breach the gate and destroy the dread keep to win; enemy armies keep spawning, with larger reinforcement groups at shorter intervals as time passes. The two gun bastions can be destroyed to remove their fire. The hero and troops damage fortifications with their actual attacks and projectiles, and the gate's collision and navigation footprint disappear when it falls. Siege troops and engineers have useful roles against masonry.

After **The Door of Names**, the required **Obsidian Crown** siege opens. Destroying it sends the Hollow King to **Hearthwatch** for **The Last Dawn**, the sixth-wave final defense. The campaign only ends after that defense. Previously completed campaigns keep their ending and rescued territory.

Original fortress geometry adds vaulted gates, layered basalt walls, crown spires, gun towers, chains, regional standards and lit windows. Hearthwatch gains a rose window with colored glass, a carved great-hall arch and gable, buttresses, copper roof ribs, window galleries and colored market drapes. Geometry uses existing credited PBR surfaces; no new downloads or licenses are required. These are real-time assets, not a claim of parity with the painted concepts.

[Siege rules, save compatibility and QA](docs/siege-2.5.md).

## Active Oaths — 2.4

**Character → Abilities** now lists the active techniques for your hero, separately from passive training. Select one to inspect its effects, learn or improve it with skill points, preview its casting animation, and equip it to either combat button. Every hero gains a new choice at level 2; later techniques unlock at levels 5, 8 (Ashwright and Veilranger), 10, 14 and 18. Level-up reveals explain each new active. Starter techniques are rank I for free; old saves keep their ranks and receive back the previously wasted first training point.

All 15 regiments now gain tactical benefits through all ten ranks: range, squad size, armor penetration, push strength, charge speed, healing, repairs, auras, limited Command generation or elemental control. Inspection and Upgrade show the same values used by combat, with exact before/after comparisons. Shieldwards muster two soldiers at IV and three at VIII; Longbows remain one per recruit at every rank. Training starts at 320 Supplies and grows to 4,050 or more for the last rank; core stat gains are larger. Early mission waves grow from 7 to 12 to 17 enemies, rewarding active hero play.

[Progression tables, economy and verification](docs/progression-2.4.md). Existing campaign saves are preserved. Testing includes 91 automated tests, all 23 active casts in the browser, real tactical effects, phone layouts, reloads and two reproducible active-versus-idle battle simulations.

## Royal Atelier — 2.3

All three heroes now load editable Blender assets: fitted Warden armor, the Ashwright’s forge apron and ember lantern, and the Veilranger’s embroidered hood and split coat. Higher appearance ranks add different liveries, layered hip armor, clasps, runes and crest details. The Longbowman has ten construction stages, from leather recruit to armored royal archer. Equipped armor families and their forge states remain visible. [Inspect the actual animated models](https://chrisdayley.github.io/oathfire/art-studio.html).

The forge–market–gate route includes carved gate masonry, sculpted doors, wooden barrels, tables, lanterns, draped canopies, slate shingles, a brick forge hood and detailed leaf textures. Solid foreground props retain collision; the gate and rampart remain traversable. Asset files are included in the offline cache. The supplied paintings remain more detailed than these real-time models; this release does not claim equivalent photorealism.

[Editable sources, rebuild steps and credits](art-source/README.md). Browser verification covers every hero and Longbowman rank, armor families, combat animation, collision, mobile inspection/reveal screens and offline startup. Phone-sized browser testing is not a physical-device performance benchmark.

## Play

Mobile: left stick to move; drag the open screen to look; tap Attack for a quick strike, or hold and release for a charged attack. Guard just before a hit to counter. Jump over low obstacles. Command opens the paused battlefield menu; Keep opens castle preparation.

Desktop: WASD movement; right mouse drag camera; J or left click attack; K guard; Space jump; Q/E equipped techniques; R potion; F interact; V first/third person; Escape pause; Tab command / keep.

**Start your first mission:** finish or skip the opening story, then tap **Start first defense** in the world. Read Sera’s briefing and tap **Begin defense**. You can also walk to Sera at the war table beside the beacon. The gold training card teaches movement, camera control, quick/charged attacks, magic, jumping, regiments, defenses, deployment and orders. Replay it from **Keep → Market, chronicle & settings → Chronicle → Restart guided training**. Explore the keep and the broad field between battles. Permanent upgrades use Supplies and Salvage. Battlefield units use regenerating Command. Skills use points earned from levels and discoveries.

Progress saves in the browser's local storage and IndexedDB. Use Settings to export/import a backup. The service worker supports offline play after the first complete online load. No account, ads or real-money purchases.

## Living Kingdom — 2.2

Regiment liveries now advance through leather and muted cloth into royal blue, crimson, ivory, copper and amethyst. Higher ranks add enamel breastplate insets, jewels, engraved vambraces, layered tassets and sculpted shoulder armor. Rank previews use the same models as battle.

Hearthwatch gains colored shutters, striped market awnings, flower boxes, lanterns, carts, stocked stalls and more varied masonry. Battlefields gain wildflowers, ferns, a working watermill, a ruined chapel, farms and supply crates. Beyond the arena are hillside settlements, an abbey, a stone viaduct, branching woodland and three mountain ranges. Solid foreground scenery is registered with physics and troop navigation. The navigation grid now accounts for an obstacle's full cell overlap to prevent soldiers walking into thin walls.

New soldiers deploy one at a time. Shieldward, Longbows and Pikeguard gain a two-soldier muster at rank VII with an 80% deployment surcharge. Base Command income is 0.6/second, rising to 0.75 with a captured camp; direct hero kills grant 2 Command, while allied kills grant none. Opening Command is 55, with one starting Shieldward. Waves increase their numbers, health and damage; the first mission grows from 7 to 11 to 14 attackers. Rank-up cards display the old/new level, increased health and earned skill points without tutorial filler.

Eight full orchestral recordings by Scott Buckley, CC BY 4.0, replace the note sequencer. The 3:20 castle jig is the only looping cue. Battle waves crossfade forward through unused recordings; each act boss has a distinct opening theme. Pausing and saved games preserve the recording and playhead. [Credits and source hashes](public/music/recordings/credits.json). These are professionally produced orchestral recordings, not a claim of a newly recorded live orchestra. Legacy sampled banks remain credited in the repository but are excluded from the offline cache.

## Hearthwatch Atelier — 2.1

After victory, a saved sequence introduces each newly unlocked regiment, defense, combat research project and optional rescue. Each screen shows an animated model, four key stats, its tactical purpose and instructions. Swipe or use Next. The final screen offers training, defenses, character/armory, campaign and exploration; a contextual town guide follows the chosen activity. Returning after field exploration and reloading cannot silently discard a pending sequence. Chronicle can replay the latest unlocks.

All 15 regiments have ten distinct physical appearances, progressing from quilted leather through mail and fitted plate to gilded elite armor, plumes and embroidered capes. Anatomical faces replace spherical heads; class-specific quivers, tools, stoles and standards preserve recognizable roles. Seven armor families keep their appearance and gain details at every forge rank. Enemies gain distinct sallets, ragged vestments, layered plate and furnace harnesses. The existing skeleton, weapon effects and Rapier collision controller remain in use.

The castle gains a taller gatehouse and keep skyline, masonry galleries, portcullis teeth, heraldic banners, slate roofs, timber upper floors, market canopies, ivy, courtyard planting and patrolling residents. A photographed sunset HDR supplies the sky and reflections. New solid props have collision surfaces; the gate and western stairs remain traversable.

These are real-time mobile models and still fall short of the painted concept art's full detail. This release makes substantial model and material changes; it does not use the concept images as scenery or advertise them as gameplay.

Validation: 75 automated rules/save checks; the atelier browser suite checks 150 animated troop appearances, seven armor families, collision and jump behavior, resumable reveals, phone layouts at 844×390 / 667×375 / 390×844 and town guidance. Separate movement/audio and combat suites check foot contacts, projectile hits, weapon powers and a full late-game army. Browser emulation is not a physical iPhone/Android performance test. Asset URLs, licenses and hashes are in [atelier provenance](public/materials/atelier-provenance.json).

## Kingdom & Melody — 2.0

24 main missions across five acts and eight optional settlement rescues now appear on an illustrated, interactive map. Rescued settlements send tribute after main victories. New enemy roles include bombers, long-range hunters, heralds, shield tanks, healers, reavers, mortars, wraiths and warpriests. Five act bosses have separate themes.

The armory has 15 weapon designs, matching held models, ten signature powers, regional equipment rewards and exact upgrade comparisons. Seven armor patterns retain their visible designs and build bonuses. Existing saves migrate without losing gear or completed mission IDs.

The music has been recomposed, with a 3:35 castle suite, five act arrangements, five boss scores and victory/defeat cues. A 7.2 MB sampled library adds stereo sections, solo violin, sustain loops, soft/forceful brass and short articulations. The separate soundtrack player lets you hear each theme and its wave intensities. See [music research and honest review limits](docs/music.md), [campaign and equipment design](docs/kingdom-and-melody.md), and [source credits](public/music/chamber/LICENSES.txt).

## Steel & Sorcery — 1.8

Footsteps now follow the left and right foot plants in the walking/running animations. Boots sound different on stone, dirt, grass, water, timber and snow; quieter plate, leather or cloth movement follows the equipped armor. Standing still, pushing against a wall, jumping and opening menus no longer generate repeated steps. Landing gets one heavier contact. **Settings → Footsteps & armor** adjusts both movement layers without changing weapon or spell volume.

Five weapon types have different swings and confirmed-hit sounds, with separate armor, body, stone and wood responses. Quick and charged attacks follow their animation windup. Arrows and bolts sound on collision. All 23 hero techniques have individual elemental sound designs; higher ranks add resonance and depth. Distant army sounds are quieter and positioned across the stereo field. The 87 cues / 191 variations use 2.3 MB of local audio and work with the offline cache. See [sound design and provenance](docs/sound-effects.md).

## Music playback

Full stereo orchestral recordings play through reusable media decks. Advancing waves crossfade to new cues; combat menus pause the playhead, and suspended saves restore it. Effects and music have separate volume controls. The offline cache supports byte-range requests for audio seeking. [Listen to the score](https://chrisdayley.github.io/oathfire/soundtrack.html).

## Spoils & Strategy — 1.6

Combat menus now use an icon/roster grid with one selected action pane, guided by the inspected expanded Heroes & Castles 2 Research screen. Troops and defenses show a live 3D model, Command cost and core stats; full Stats & Abilities remain one tap away.

**Research** offers 33 battle-only projects: 24 adapted reference mechanics plus nine Oathfire choices. Choose four timed projects. Explosive gates, reserve archers, veteran recruits, elemental rain and hero improvements join Crossfire, Field logistics and The last oath. Completed choices commit their slot; unfinished work can be canceled. Battle HUD corners retain vitals, Command, recruitment shortcuts and capacity. See [research details](docs/battle-research.md).

**Battle reports** show time, kills, damage by source, troops lost/surviving, spending, research, XP, loot and story aftermath. Enemies can drop physical chests; walking nearby secures one, and victory retrieves any left behind. Open recovered chests with a short 3D animation and sound, or use instant/reveal-all. Rewards save before opening, and unfinished reports resume after reload. See [reward rules and references](docs/battle-rewards.md).

## Command & Keep update — 1.4

Newly deployed soldiers automatically seek enemies across the battlefield, close to actual attack range, and reacquire targets when an enemy falls. Explicit Hold and Follow orders apply to soldiers already on the field; engineers remain gate repair specialists. Individual orders and hold positions survive a suspended battle.

**During battle:** Command → Troops / Defenses / Orders / Research. The paused battlefield stays visible beside a compact roster with an explicit Command cost for every entry. Select a roster entry for its animated model, cost and core stats, then Recruit or Refit; Stats & Abilities opens the detailed profile. Seven emplacement types can be refitted for this battle using Command; the eighth entry repairs a standing gate. Replacing a defense preserves the other emplacements' cooldowns. Permanent training and the castle's home arrangement are preserved.

**At the castle:** Keep → Character / Armory / Regiments / Castle, with a prominent mission destination. Equipment follows slot → inventory → item, then Benefits / Compare / Forge. Regiments and defenses follow roster → object → Overview / Stats / Abilities / Upgrade. Full numerical information and all ten visual ranks remain available without appearing together on a deployment screen. Market, Chronicle, Bestiary and Settings sit one level deeper. Back restores the previous list and scroll position.

The interface uses warmer brass, leather and ivory colors, heraldic headings, larger body type and touch targets of at least 44 CSS pixels for menu buttons. See [research and navigation decisions](docs/mobile-menus.md).

## Armor update — 1.3

**Armory → Armor** opens a dedicated armor slot and filtered inventory. Six new patterns drop from hidden treasure and victory rewards: Bastion harness, Wayfarer leathers, Starwoven vestments, Cinderforged mail, Dawnkeeper mantle and Marchwarden cuirass. Each supports a different build, with real combat benefits and its own animated outfit. The first victory at Hearthwatch guarantees an Uncommon-or-better pattern when inventory has room.

Select armor to try it on without equipping, compare your hero's actual totals, then equip it independently of the weapon. Rarity, rolled bonuses, ten forge upgrades, defensive runes and tempers add further choices. Forge ranks add visible metal seals and progressively reinforced construction. Existing items, their IDs, upgrades and each hero's equipment selections are preserved.

## First Oath update — 1.2

The opening introduces Sera, Iona and Rowan, with a personal reason to defend the refugees’ road. All fifteen missions have a briefing, tactical advice, explicit win/loss conditions, unlock previews and an aftermath. Story screens pause the world; their action buttons remain visible on landscape phones.

Seven new regiments add engineers, a battle standard, assassins, fire and ice casters, armor-piercing marksmen and healing champions. Five new defense designs add a cannon, ice obelisk, stone lobber, sanctuary brazier and chain-lightning spire. Four emplacements can be refitted freely at home; the gate is always present. Existing campaigns migrate with all earned ranks, loot and resources preserved. See [research, roles and unlocks](docs/first-oath.md).

## Develop

Node 22 recommended.

```sh
npm ci
npm run dev -- --port 4178
npm test
npm run build
npm run preview -- --port 4180
```

`src/` holds the game; `src/character-designs.js` builds the original skinned bodies; `public/models/Knight.glb` supplies the CC0 animation rig and clips; `public/materials/` holds the licensed PBR surface scans and sky; `tests/` checks permanent progression and saves. `scripts/compact-models.py` reproducibly compacts source models when the original downloaded models are present. `scripts/service-worker.mjs` writes the build-specific offline cache.

The browser QA scripts use Playwright. Set `PLAYWRIGHT_MODULE` to an installed Playwright module path if it is not available as a normal dependency. Local QA reports and screenshots are generated in `work/qa/` and excluded from commits.

GitHub Actions runs the progression tests, builds the Vite site and publishes the exact main-branch commit to Pages.

## Credits

Original world, weapons, mounts, story, systems, interface, animation layers and original score for Oathfire. Sampled orchestra: Virtual Playing Orchestra 3.3 and its individually credited source libraries under their respective licenses. See `public/music/chamber/LICENSES.txt`. Animation rig and shared skeletal clips by Kay Lousberg, CC0; the source body meshes are removed at runtime. Surface scans and sky by Poly Haven contributors, CC0. Download URLs, source pages and verified hashes are recorded in `public/materials/provenance.json`. Three.js (MIT), Rapier (Apache 2.0), Vite (MIT); Cinzel and Inter (OFL). Full asset provenance and licenses are in [credits](public/credits.html) and `public/licenses/`.
