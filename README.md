# Oathfire: The Hollow March

A landscape mobile browser game combining direct 3D hero combat, battlefield army commands, castle defense and permanent RPG progression.

**Play:** https://chrisdayley.github.io/oathfire/

Three playable heroes; five weapon styles; quick and charged attacks; physical arrows, bolts and elemental magic; fifteen regiment types with ten ranks each; eight castle defenses with ten ranks; fifteen battles across six landscapes; a free-roam castle, vendors, hidden chests and a crypt puzzle.

Version 1.1 replaces the original visible character bodies with original adult-proportioned armor and undead designs. The world now uses scanned surfaces, image-based lighting, detailed foliage and masonry; the armory and new Hollow Host compendium show the animated models in a stone chamber. The original painted concept studies are art direction references, not screenshots of the shipped renderer. See [design and implementation](docs/design.md) and [QA evidence](docs/qa.md).

## Play

Mobile: left stick to move; drag the open screen to look; tap Attack for a quick strike, or hold and release for a charged attack. Guard just before a hit to counter. Jump over low obstacles. Command opens the paused battlefield menu; Keep opens castle preparation.

Desktop: WASD movement; right mouse drag camera; J or left click attack; K guard; Space jump; Q/E equipped techniques; R potion; F interact; V first/third person; Escape pause; Tab command / keep.

**Start your first mission:** finish or skip the opening story, then tap **Start first defense** in the world. Read Sera’s briefing and tap **Begin defense**. You can also walk to Sera at the war table beside the beacon. The gold training card teaches movement, camera control, quick/charged attacks, magic, jumping, regiments, defenses, deployment and orders. Replay it from **Keep → Market, chronicle & settings → Chronicle → Restart guided training**. Explore the keep and the broad field between battles. Permanent upgrades use Supplies and Salvage. Battlefield units use regenerating Command. Skills use points earned from levels and discoveries.

Progress saves in the browser's local storage and IndexedDB. Use Settings to export/import a backup. The service worker supports offline play after the first complete online load. No account, ads or real-money purchases.

## Kingdom & Melody — 2.0

24 main missions across five acts and eight optional settlement rescues now appear on an illustrated, interactive map. Rescued settlements send tribute after main victories. New enemy roles include bombers, long-range hunters, heralds, shield tanks, healers, reavers, mortars, wraiths and warpriests. Five act bosses have separate themes.

The armory has 15 weapon designs, matching held models, ten signature powers, regional equipment rewards and exact upgrade comparisons. Seven armor patterns retain their visible designs and build bonuses. Existing saves migrate without losing gear or completed mission IDs.

The music has been recomposed, with a 3:35 castle suite, five act arrangements, five boss scores and victory/defeat cues. A 7.2 MB sampled library adds stereo sections, solo violin, sustain loops, soft/forceful brass and short articulations. The separate soundtrack player lets you hear each theme and its wave intensities. See [music research and honest review limits](docs/music.md), [campaign and equipment design](docs/kingdom-and-melody.md), and [source credits](public/music/chamber/LICENSES.txt).

## Steel & Sorcery — 1.8

Footsteps now follow the left and right foot plants in the walking/running animations. Boots sound different on stone, dirt, grass, water, timber and snow; quieter plate, leather or cloth movement follows the equipped armor. Standing still, pushing against a wall, jumping and opening menus no longer generate repeated steps. Landing gets one heavier contact. **Settings → Footsteps & armor** adjusts both movement layers without changing weapon or spell volume.

Five weapon types have different swings and confirmed-hit sounds, with separate armor, body, stone and wood responses. Quick and charged attacks follow their animation windup. Arrows and bolts sound on collision. All 23 hero techniques have individual elemental sound designs; higher ranks add resonance and depth. Distant army sounds are quieter and positioned across the stereo field. The 87 cues / 191 variations use 2.3 MB of local audio and work with the offline cache. See [sound design and provenance](docs/sound-effects.md).

## Music playback

Battle music develops without resetting its measure counter; familiar themes return in changed arrangements and tonal centers. Wave progression adds orchestral layers. Combat menus pause playback position, and suspended saves restore measure and beat. Effects and music have separate volume controls. [Listen to the score](https://chrisdayley.github.io/oathfire/soundtrack.html).

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
