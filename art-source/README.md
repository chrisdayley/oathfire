# Royal Atelier — editable art sources

These source files generate actual meshes used by the playable game. They are not the painted concept images.

| Source | Game asset | Use |
| --- | --- | --- |
| `warden.blend` | `public/models/atelier/warden.glb` | Fitted ivory cuirass, layered pauldrons, articulated hands, greaves, royal helmet and plume |
| `ashwright.blend` | `public/models/atelier/ashwright.glb` | Broad leather harness, forge apron, bronze fittings, tool pockets and ember lantern |
| `ranger.blend` | `public/models/atelier/ranger.glb` | Asymmetric armor, embroidered hood, split coat and quiver |
| `bow.blend` | `public/models/atelier/bow.glb` | Ten construction stages of the Longbowman |
| `castle-arch.blend` | `public/models/courtyard/castle-arch.glb` | Carved gate piers, columns and three archivolt courses |

## Rebuilding

Use Blender 4.2 or later. The scripts use only Blender's bundled Python API.

```sh
blender --background --factory-startup --python scripts/build-atelier-assets.py
node scripts/fetch-courtyard-assets.mjs
blender --background --factory-startup --python scripts/prepare-courtyard.py
npm run build
```

Character meshes are modeled in attachment coordinates, exported as glTF, loaded once, and bound to the existing Knight animation skeleton. `socket` chooses the bone; `surface` chooses the physical material; `minRank`, `maxRank`, `minForge` and `armorKind` choose appearance variants. Long garments blend into thigh movement. The cape remains an animated cloth surface. All three heroes retain the same combat and Rapier capsule interfaces.

The `.blend` files contain socket-local components, not assembled posed actors. Inspect the assembled result in `art-studio.html` or the game's character menu. Editing the Python source and rebuilding replaces the corresponding `.blend` and `.glb` files.

## Reused source art

- Fitted Warden breastplate and helmet: **crownjoshua**, [Knight (Rigged - Mid Poly)](https://opengameart.org/content/knight-rigged-mid-poly), CC0. `forged-armor.json` contains retargeted geometry. `scripts/extract-forged-armor.py` reproduces it from the original download at `work/art-production/artist-knight.blend`. Source file: https://opengameart.org/sites/default/files/Knight_0.blend. Open outside files with `--disable-autoexec`; the extraction script also sets `use_scripts=False`.
- Head anatomy and skin: MakeHuman system assets, CC0; existing provenance is in `public/materials/atelier-provenance.json`.
- Animation skeleton and clips: KayKit Adventurers, CC0; existing notices remain in `public/licenses/`.
- Castle doors, barrels, lanterns and tables: Poly Haven, CC0. Authors, source pages and file hashes are in `public/models/courtyard/provenance.json`.
- Remaining geometry and material arrangements were built for Oathfire. The crest, outfit combinations, prestige fittings and architectural assembly are original arrangements.

## Generated material bitmaps

Both assets were made with the **built-in OpenAI image generation tool**, then copied unaltered into the game. They are surface textures, not backgrounds substituting for 3D geometry. No image API, external key or separate fallback model was used.

`public/materials/royal-brocade.png` — prompt:

> Use case: game material texture. Create a square 2048x2048 physically plausible medieval royal textile base-color texture, a flat straight-on orthographic scan of richly woven deep indigo blue damask silk and fine wool, subtle repeating golden oak-leaf and small sun medallion embroidery, restrained and tasteful noble fantasy clothing. Fine thread detail, naturally varied threads and mildly abraded embroidery. Seamlessly tileable across all four edges, evenly distributed repeating pattern, no central hero emblem, no borders, no objects, no perspective, no folds, no scene, no lettering, no shadows or directional illumination. This bitmap will cover actual 3D royal hero capes and advanced archer clothing; deep beautiful royal blue base with warm antique gold fine filigree, muted enough for realistic PBR material. Image entirely filled with fabric surface.

`public/materials/hornbeam-leaf.png` — transparent background; prompt:

> A single botanically realistic European hornbeam leaf, isolated on a fully transparent background, straight-on flat orthographic photographic scan for a 3D game foliage texture. Leaf points upward, slender small stem exits at bottom center. The leaf blade is centered and fills the height, broadest a little below middle, tapered pointed tip, fine serrated edges, soft natural mid olive green, fine pale branching veins, subtle translucency. Absolutely no cast shadow, no background, no extra leaves, no border, no text. Flat diffuse neutral illumination, no bright baked reflections. Crisp natural detail, full leaf entirely visible with a small transparent margin. Square image, leaf approximately half as wide as the canvas.

## Fidelity limit

This is a reusable 3D asset pipeline and a further playable art pass. The stylized head, hair and garment modeling still fall short of the supplied cinematic paintings. The courtyard is substantially more dressed, but it is not a reconstruction at the paintings' fidelity. Future replacement meshes can use this same attachment interface without rewriting combat, navigation or saves. Physical-device GPU performance is not established by desktop browser emulation.
