# 2.24.0 — tailored heroes

All three player heroes now use one fitted outer garment/armor builder. This replaces the previous stack of authored body pieces, imported harness, tailoring, fit and couture overlays. The existing animation skeleton, player physics, equipment ownership and campaign data remain intact.

## Character work

- Warden: shaped breast/back plate, overlapping clavicle plates and waist lames, articulated pauldrons, split teal/ivory surcoat, fitted helmet and inset heraldry.
- Ashwright: broader mature facial planes, weathered skin texture, fitted rounded beard, heavy stitched leather apron, pouches, caged ember lantern and work scarf. High-tier plate retains the apron and visible beard with an open-faced armored helmet.
- Veilranger: narrower facial planes, hood, overlapping diagonal scarf wraps, curved asymmetric brigandine, layered flexible coat panels and attached quiver harness.
- Shoulder width, waist fit, carried weapon/shield size and sword idle posture have been adjusted. The sword rests diagonally downward and rises for running/attacks.
- Dedicated material scans generated for this game replace the coarse world textures on the new garments. Warden and Ashwright use separate generated treatments of the existing CC0 skin atlas; Ranger retains that original atlas with a distinct face sculpt.
- Mantles have lower shoulder yokes and sewn straps connecting to front clasps. Skirt panels and trim follow the legs. Existing ground, leg and mounted-croup clearance remains active.
- Rarity changes cloth colors and adds fitted trim, fluting, crest details, armor coverage and restrained luminous inlays. Legendary retains covered sleeves; Mythic/Godly retain full plate. Class identity remains visible rather than giving every hero the same halo.
- Hero selection frames the body more closely while reserving space for preview controls. Armory framing continues to include equipment tips.

## Review process and limits

Two agents compared the original `output/assets/heroes-concept.png` with actual game model renders. The first identified stacked armor, barrel-shaped torsos, generic faces and a tent-shaped cape attachment. After implementation it also contributed a face and armor shaping pass. A second agent independently reviewed subsequent stills, actual 844×390 selection screens and sampled moving/attacking poses.

The review prompted successive corrections to clipping at the breastplate and waist, shoulder construction, cape attachment, the Ranger's quiver straps and scarf, fabric scale, Ashwright material readability, and preview-control framing.

These are substantial construction and presentation changes, not a claim of photographic equivalence to the concept art. Detailed facial likeness, fully sculpted costume tailoring and close-up material richness remain below that reference. Technical checks do not replace that visual assessment.

## Compatibility and validation

No save schema, inventory, skills, campaign progress, balance, audio or player collider changes are included. No new game is required.

Validation includes the unit suite; equipped geometry across 84 hero/armor-family/rarity combinations; walking, running, attack and mounted cape checks; actual mobile selection and sampled play; an installed-game update with saved progress; and offline loading. Final release verification records are retained under `work/hero-concept-review/`.

## Generated texture assets

Generated through the built-in image-generation tool. JPEG conversion is for delivery size; original PNGs are retained in the generated-images folder and review workspace. Underlying anatomical UV texture: MakeHuman, CC0, credited in the game.

- `public/materials/hero-crafted-atlas-v224.jpg` — steel, leather, cloth and brass atlas.
- `public/materials/ashwright-skin-v224.jpg` — mature face treatment of the existing skin atlas.
- `public/materials/warden-skin-v224.jpg` — weathered Warden face treatment of the existing skin atlas.

Exact generation prompts are recorded in [hero texture prompts](hero-texture-prompts-2.24.0.md).
