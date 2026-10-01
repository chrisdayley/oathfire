# Oathfire: The Hollow March

A landscape mobile browser game combining direct 3D hero combat, battlefield army commands, castle defense and permanent RPG progression.

**Play:** https://chrisdayley.github.io/oathfire/

Three playable heroes; five weapon styles; quick and charged attacks; physical arrows, bolts and elemental magic; fifteen regiment types with ten ranks each; eight castle defenses with ten ranks; fifteen battles across six landscapes; a free-roam castle, vendors, hidden chests and a crypt puzzle.

Version 1.1 replaces the original visible character bodies with original adult-proportioned armor and undead designs. The world now uses scanned surfaces, image-based lighting, detailed foliage and masonry; the armory and new Hollow Host compendium show the animated models in a stone chamber. The original painted concept studies are art direction references, not screenshots of the shipped renderer. See [design and implementation](docs/design.md) and [QA evidence](docs/qa.md).

## Play

Mobile: left stick to move; drag the open screen to look; tap Attack for a quick strike, or hold and release for a charged attack. Guard just before a hit to counter. Jump over low obstacles. Army opens a paused command menu.

Desktop: WASD movement; right mouse drag camera; J or left click attack; K guard; Space jump; Q/E equipped techniques; R potion; F interact; V first/third person; Escape pause; Tab army.

**Start your first mission:** finish or skip the opening story, then tap **Start first defense** in the world. Read Sera’s briefing and tap **Begin defense**. You can also walk to Sera at the war table beside the beacon. The gold training card teaches movement, camera control, quick/charged attacks, magic, jumping, regiments, defenses, deployment and orders. Replay it from **Journal → Restart guided training**. Explore the keep and the broad field between battles. Permanent upgrades use Supplies and Salvage. Battlefield units use regenerating Command. Skills use points earned from levels and discoveries.

Progress saves in the browser's local storage and IndexedDB. Use Settings to export/import a backup. The service worker supports offline play after the first complete online load. No account, ads or real-money purchases.

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

Original world, weapons, mounts, story, systems, interface, animation layers and procedural audio for Oathfire. Animation rig and shared skeletal clips by Kay Lousberg, CC0; the source body meshes are removed at runtime. Surface scans and sky by Poly Haven contributors, CC0. Download URLs, source pages and verified hashes are recorded in `public/materials/provenance.json`. Three.js (MIT), Rapier (Apache 2.0), Vite (MIT); Cinzel and Inter (OFL). Full asset provenance and licenses are in [credits](public/credits.html) and `public/licenses/`.
