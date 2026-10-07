# Hero texture generation — 2.24.0

Mode: built-in image generation. Material atlas: new generation. Character skin treatments: image edits referencing `public/materials/human-skin.png`, inspected before editing. No source-game artwork or textures are used. Output PNGs were converted to JPEG for game delivery without changing their UV layout.

## Crafted material atlas

Output: `public/materials/hero-crafted-atlas-v224.jpg`.

```text
Use case: photorealistic-natural. Asset type: production 3D game material albedo atlas, NOT a character illustration. Generate a square 2048x2048 image divided into four EXACT equal borderless quadrants with edges at 50 percent. Top left: neutral medium light silver forged steel plate, subtle fine hammer planishing, faint directional brushing, sparse hairline scuffs and gentle irregular patina. Top right: dark warm brown worn leather, natural small pores and supple fine creases, faint rubbed tan worn patches, no stitched seams. Bottom left: deep desaturated teal finely woven wool cloth, small irregular fiber texture, subtle dye variation, NO folds or shadows. Bottom right: muted warm antique brass, restrained tarnish and delicate micro scratches. Each square depicts about a 20 centimetre flat swatch. Strict orthographic flat unlit diffuse material scans with even illumination, physically realistic fine details, no shiny specular reflection or dramatic lighting baked in, no perspective, no modeled objects, no gradient background, NO words labels text borders gaps watermarks. Each quadrant fills its entire square corner-to-corner and is approximately seamless on opposite edges. Fine material detail suitable for close-up realistic medieval hero armor; not cartoon, not broad woodgrain.
```

## Ashwright skin atlas

Output: `public/materials/ashwright-skin-v224.jpg`.

```text
Edit this 2048 square MakeHuman UV skin texture atlas for use on exactly the SAME 3D mesh. This is a technical texture asset, not a portrait. Preserve EVERY UV island outline, position, rotation, scale, face feature position, eye and mouth position, ears, and all blank background exactly. Do not rearrange, add text, or crop. Change only the skin appearance of the large rotated head island on the RIGHT to an older rugged male blacksmith around age 55: realistic subtle forehead lines, crow's feet, under-eye creases, nasolabial folds, weathered cheeks, slight warm/cool skin variation, fine visible pores, and sparse salt-and-pepper stubble around jaw. Keep the original skin color close, with neutral diffuse scan lighting and no baked directional shadows or painted armor. Keep the rest of the torso/hands/feet atlas unchanged. The face must remain rotated sideways in its ORIGINAL UV location and all facial features must remain in their exact original positions. No separate portrait, no new face island, no illustration or cartoon treatment. Retain the existing small attribution marking.
```

## Warden skin atlas

Output: `public/materials/warden-skin-v224.jpg`.

```text
Edit this exact MakeHuman UV skin atlas for the SAME 3D mesh. Preserve all island shapes, placement, rotation and scale exactly, particularly the sideways head island on the RIGHT. Keep eye, nose, mouth and ear locations exactly aligned to the source. Do not create a portrait or rearrange anything. Change only the right-side head's skin appearance. Neutral flat diffuse/albedo scan lighting, real skin pores and subtle natural color variation, no directional shadows painted in. Preserve body, hands, feet and existing attribution. The character is the Warden: a realistic rugged male knight around age 32, lightly weathered olive-tan skin, strong jaw and cheek planes, short dark eyebrow hair, very light dark five-o'clock jaw stubble, tiny faded scar across the LEFT cheek away from eye, muted lips, subtle sun exposure on nose/cheeks. Distinguished, resolute, physically believable, not a smooth doll or stylized cartoon. The feature positions MUST remain those of the UV atlas, not newly arranged.
```
