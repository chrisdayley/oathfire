# Hearthwatch stonework — 2.14

This release refines the real castle and building geometry and materials, using the existing locally bundled CC0 scans. It adds no remote runtime asset dependency and does not alter campaign progression, equipment, music or saved resources.

## Material and construction changes

- Cut stones, quoins and arch stones use continuous grain instead of a picture of another smaller stone wall. Broad infill walls retain appropriately scaled rubble masonry. Four restrained stone variations, recessed joints, chamfers and continuous weathering establish different surface scales.
- Slate uses a separate material, staggered overlapping courses, restrained color variation and thinner eased edges. Plaster has a quiet porous surface and broad discoloration; timber and crenellations have softened edges and supporting brackets/joints.
- Gate faces connect through a real curved soffit. Elliptical arch stones are wedges, replacing rotated rectangular blocks. The keep has a recessed oak double door, curved vault, metal straps, rivets and handles. Its rose window, portal and cornices no longer overlap.
- A pre-existing reversed inner-arc contour made window caps cover their openings. Corrected arch contours restore open windows. Obsolete window details behind gate banners were removed; banners hang beyond the wall relief and their animated displacement, on connected brackets.
- A broad irregular flagstone route is embedded among the courtyard setts. Ground materials have wear/soil variation. Local foundation and furniture contact shade complements the wider castle shadow coverage.
- Overlapping old stall canopies and unsupported pennant/garlands were removed. The remaining stalls have planked legged counters, small pottery and bowls of produce. Spheres on carts are replaced by tied, creased sacks with neutral woven cloth.
- The forge has a shaped and beveled anvil with horn/heel, stump, tools, soot, charcoal and local ember light. Foreground trees have smaller restrained leaves, bent tapering trunks and exposed roots.

Architecture is merged into the existing spatial static-mesh batches. Small chamfered blocks use 28 triangles rather than the previous rounded box's 108. No new texture images are needed; the measured scene texture count remains 81. A same-view 844×390 desktop browser sample rendered about 2.44 million triangles / 723 calls versus 2.24 million / 698 in 2.13. This is not a physical-phone frame-rate claim.

## Physics and access

The main gate and a parallel route at x=3 remain open. New counters, anvil and the recessed keep door have matching colliders/navigation bounds. Review found and prompted repair of the pre-existing missing war-table collider. It now stops the actor in front of the visible table while keeping the campaign interaction reachable. Thin paving relief stays below the character controller's step threshold.

## Independent review

A separate agent viewed the supplied original castle concept, captured the actual game from identical eye-height viewpoints before and after changes, and provided repeated feedback. Five implementation captures were followed by an independent final capture and another review after geometry optimization/contact shading. Main hero/HUD were hidden only for the architectural plates; phone gameplay captures retain normal presentation. No replacement backgrounds or mockup renders were used as evidence of the game.

Verified corrections include coherent masonry, connected vaults, open windows, clear banners, embedded paving, consolidated stalls, improved forge/props, and physical furniture. The reviewer independently used the actual Rapier controller to check gateway clearance, obstruction at furniture/door, and a usable war-table interaction. It found no remaining release-blocking geometry, shader or traversal issue in the reviewed sample.

This is a significant refinement, not parity with the concept painting. The concept has more terraced terrain, authored irregularity, dense individual props and localized lighting. The playable plaza remains broader/flatter and close foliage/props remain simpler. Those differences are recorded rather than hidden behind a claim of completion.

Local evidence is under `work/castle-214-review`: original baseline, successive passes, `final-review.md`, fresh independent captures, collision results and same-machine performance samples. Detailed browser results are under `work/qa-castle-v214`, `work/qa-castle-garrison-v214` and `work/qa-castle-siege-v214`.

## Validation

143 rules/geometry tests pass, including preserved chamfer dimensions and open arch passages. Production browser checks cover two landscape phone sizes, six campaign biomes, runtime/shader errors, architectural revision, gateway traversal, furniture collision and reachable mission-table interaction. Wall soldiers, research, preparation, Command equipment, rewards and siege approaches retain their existing regression checks. GitHub Pages is verified against exact production file hashes before handoff; a disposable-save castle check is also run on the live release.
