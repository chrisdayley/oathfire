# Living Horizons — 2.6

## Visual changes

- Three locally bundled original matte-painted panoramas: Crownlands, Northern and Sunlands. They show cloud banks, craggy mountains, valleys, rivers and distant settlements. These are backgrounds; the distant painted cities are not mission destinations.
- Full 3D curved roofs replace overlapping hut pyramids and obsolete floating roof-course meshes. They include individual slate courses, timber gable ends, ridge caps, brackets and glazed dormers. The great hall gets a new roof, three-ring entry portal and stone balustrades.
- Sixteen surrounding town houses on terraces and a cathedral beyond the rear wall make the castle feel part of a larger city. Solid sections within the playable bounds have Rapier colliders and navigation footprints.
- Three animated windmills, farm hills, a circling flock, chimney smoke, potted flowers and turned barrels add varied silhouettes and movement.
- A transparent three-tree painted atlas replaces the rough canvas-drawn horizon trees. Placement follows the distant ground height. Near trees retain their 3D trunks, branches, leaves and collision.
- Original transparent meadow clumps with fine grasses, seed heads and flowers replace rectangular grass strips. Crossed instanced cards sway in the wind. Courtyard camera starts closer to a level horizon so the architecture and sky are visible.

## Rendering and preservation

Static geometry is merged in 96-metre spatial sections centered on the courtyard, preserving each object's shadow setting. Windmill sails compact into three material meshes per mill. Shared panorama and foliage textures survive world disposal/rebuild. Generated foliage was encoded as WebP with its alpha preserved; the five new image files total about 3.5 MB. Existing HDR environment lighting and credited surface scans remain.

No economy, progression, equipment, ability, reinforcement, mission-unlock or save-schema changes. New architecture follows the existing layout; primary combat lanes, the open gate, hall entry, treasure stairs and crypt approach remain available. The distant scenery is deliberately outside the playable bounds.

## Verification

- 101 automated tests pass, including transformed-geometry preservation, spatial culling bounds, shadow settings and unpartitioned fortress merging.
- `scenery-qa.mjs` checks alpha transparency, animated mill meshes, all six biomes, finite geometry, correct regional textures, rock collision/jumping, stairs, gate and hall passage, upper-town collision, two phone viewports, save preservation and runtime/shader errors.
- Actual browser viewport sizes: 844×390 and 667×375. Recorded frame timings describe the desktop test machine rendering those viewport sizes; they are not physical-phone benchmarks.
- `scenery-visual-qa.mjs` captures the playable camera looking at the gate, great hall, market, distant landscape and windmill.
- Existing siege regression covers gate damage and collision, recruitment, breach navigation, save reload and rewards after the scenery changes.

Evidence is saved in ignored `output/world-26/` and `output/siege/`. Exact art-generation prompts and saved asset paths are in `scenery-art-2.6.md`. This improves the real-time game world but does not claim photorealistic parity with the original painted concept.
