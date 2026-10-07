# 2.25.1 — concept hero refinement

This continues the 2.24 hero reconstruction against `output/assets/heroes-concept.png`. The independent reviewer set three essential acceptance criteria before implementation: distinct heads and class silhouettes, believable waist-to-knee costume construction, and a clear hierarchy of garment, protection and fastening materials. The standard is a recognizable real-time adaptation at normal game scale, not photographic equality to the painting.

## Visible changes

- **Warden:** shortened, narrowed split tabard exposes the articulated tassets, thigh plates, knees and greaves. A peaked lower breastplate replaces intersecting straight bands. Shaped helmet guards and visible dark forelocks frame the face.
- **Ashwright:** short gray beard, moustache, temple hair and mature face retain an older craftsman identity. The stitched apron, shoulder straps, buckles, pouches and visible tools remain over higher-tier bronze plate instead of disappearing into the Warden's costume.
- **Veilranger:** asymmetric leather and cloth coat tails replace repeated pointed strips. One darker shoulder contrasts with the silver side; the diagonal harness and brigandine remain outside high-tier protective plate. The hood and visible fringe retain the scout identity.
- **Construction:** sewn garment borders follow the actual folded surface and its leg weights. Equipment belts have tongues, keepers and punched holes. Boots gain fitted welts and soles. The cloak's upper yoke gathers near the neck and drops onto the back.
- **Materials:** the authored scan now varies roughness as well as color, producing uneven polish on metal and worn leather edges. Class colors and protection remain distinct at Common, Epic and Godly.
- **Weapons:** forged sword profiles, joined hilt fittings, leather grips, shaped hammer faces and tapered laminated bows. Inlays follow the actual weapon surfaces, including the curved Oathbell. Rarity and magical aura behavior remain intact.

## Review loop

The independent reviewer did not edit the implementation. Initial review rejected the shared skullcaps, robe-like lower garments and generic shoulder/chest construction. Subsequent reviews caught high-tier class identity loss, intersecting Ranger chest layers and a rigid hood. All were corrected and reviewed again. A final side-view inspection also caught waist-layer intersections; the armor envelope was corrected, and normal-shadow idle and attack recaptures were clean. The independent reviewer passed all three heroes against the unchanged practical real-time adaptation criteria, with no remaining essential issues in the reviewed sample. This is not photographic parity with the painting. Hair and weapon implementation agents also inspected their own work, but their checks do not replace the independent verdict.

Review evidence and the final independent verdict are retained under `work/hero-concept-review/`; weapon geometry/pose evidence is under `work/weapon-finish-2.25/`. Fine skin pores, individual hair strands and the concept's painted lighting are outside the real-time acceptance criterion. The underlying limitations of procedural sculpting remain visible in extreme closeups.

## Compatibility

No campaign schema, inventory, progression, combat balance, player collider, attack reach or weapon attachment origins change. Existing campaigns remain compatible; no new game is required. QA uses isolated browser contexts rather than a player's save.

## Validation

Validation passed 226 unit tests; all 84 hero/armor-family/rarity combinations; 105 weapon-pattern/rarity combinations; equipped quick and charged attacks; walking, running and mounted cloth clearance; actual phone-sized selection and movement; installed-game save/update/offline behavior; and verification of published assets against the tested build. These checks do not claim physical-phone frame rate or absence of every possible transient intersection.

## Mission-transition regression

The live 2.25.0 smoke check exposed a first-person weapon cleanup assumption: sculpted weapons may have a material array, while the old cleanup called `dispose` on the array itself. Version 2.25.1 disposes each unique material once, retains shared geometry, and has a regression test for repeated weapon replacement. This fix does not change the reviewed visuals.
