# Living Horizons artwork — 2.6

Original assets generated for Oathfire with the built-in image generation tool on October 2, 2026. The attached castle concept supplied visual direction; no downloaded third-party landscape paintings were copied. Existing credited CC0 architectural surface scans and courtyard props remain in use.

The panoramas and tree atlas are 1774 × 887 pixels; the meadow clump is 1254 × 1254 pixels. The panorama prompts request larger dimensions, but the generated outputs did not provide them; these are not described as 4K assets. The game uses the original resolution. Panoramas were encoded as JPEG at quality 92. The foliage retains its alpha channel and was encoded as WebP at quality 93 for trees and 92 for meadow grass, with alpha quality 100. Original generation outputs remain in the Codex generated-images directory. This document records the exact prompts, including the requested dimensions.

The panorama is distant scenery, not explorable terrain. Windmills, surrounding town buildings, farm hills, roof tiles, dormers, galleries, and the cathedral are geometry. Birds and mill sails move in real time. Three regional paintings serve six map biomes: Crownlands for plain, forest, river and quarry; Northern for snow; Sunlands for desert.

## Crownlands panorama

Saved asset: `public/scenery/crownlands-panorama.jpg`

Use case: stylized-concept. Asset type: production environment panorama for a playable 3D medieval fantasy mobile game, Oathfire. Create a breathtaking high-detail 360-degree equirectangular matte-painted panorama, 2:1 aspect ratio, preferably 4096 by 2048. This is a distant-world skybox texture, NOT a screenshot or a concept sheet. The horizon must run continuously at exactly the vertical center, with everything in correct spherical equirectangular projection. Top half: beautiful enormous golden sunset clouds, soft blue and lavender upper sky, amber cloud edges, pale sun diffused through clouds on the right, atmospheric depth. At and below the horizon: layered blue mountains with sharply defined craggy ridges, emerald and autumn-gold wooded hills, a winding silver river, patchwork farms, distant terraced medieval towns with slate roofs, elegant arched stone bridges, scattered stone windmills, and one distant citadel on a high ridge. The world feels immense, richly lived in, grounded and beautiful. Everything is very distant, at least hundreds of meters away. The lower quarter can fade to dark olive-brown landscape, since playable terrain covers it. Cinematic realistic matte painting with exquisite geographic detail and beautiful warm cool contrast; no cartoon forms, no toy buildings, no low-poly hills. Left and right edges must join seamlessly with matching sky and hills; no border or labels, no UI, no people, no close foreground buildings, no foreground trees, no giant foreground objects, no text. Preserve enough soft haze at the horizon to blend behind 3D scenery.

## Northern panorama

Saved asset: `public/scenery/northern-panorama.jpg`

Use case: stylized-concept. Asset type: 360 degree equirectangular background panorama texture for the snowy regions of a playable 3D medieval fantasy game. 2:1 wide image, 4096x2048 if possible. Rich cinematic realistic matte painting. Horizon exactly halfway down. Upper half full of magnificent high altitude white and lavender clouds with a warm gold sunrise breaking through on the right, clean blue upper sky. At the horizon and lower half: vast layered snowy Alps with sharply detailed peaks, pine forests dark green against snow, scattered old stone villages, a faraway towering mountain abbey and stone aqueduct, blue glacial lakes and winding frozen rivers. Grand natural geographic scale, breathtaking detail, atmospheric layers. Landscape below lower quarter fades to soft dark bluish forest since game terrain covers it. All scenery is hundreds of metres distant. Spherical equirectangular skybox projection with left and right edges matching seamlessly. No labels, no text, no UI, no people or close foreground structures. Avoid low poly, cartoon, repeated triangular mountains or overly saturated colors.

## Sunlands panorama

Saved asset: `public/scenery/sunlands-panorama.jpg`

Use case: stylized-concept. Asset type: production equirectangular 360-degree landscape skybox panorama for a playable 3D fantasy medieval desert campaign. Wide 2:1 image. Horizon at the vertical center. Upper half magnificent warm golden clouds swept across deep muted blue sky, dusty peach sunset toward right. Lower half enormous layered red sandstone mesas, blue violet mountains in the distance, an emerald oasis river winding among date palms, tiny terraced ochre stone towns, a great distant fortified sun temple, ancient arched bridges, farms and green gardens where irrigation follows the river. Detailed breathtaking realistic cinematic matte painting, rich natural restrained colors, convincing geological erosion, sense of an enormous world with many places to explore. Foreground bottom quarter fades to muted dark sandy ochre, because 3D playable terrain will cover it. All objects hundreds of metres away, no close buildings or trees. Correct spherical equirectangular projection, left and right edges meet seamlessly. No UI, no people, no labels, no text, no logos, no borders, no low poly or toy shapes.

## Woodland atlas

Saved asset: `public/scenery/woodland-atlas.webp`

Use case: stylized-concept. Asset type: transparent foliage texture atlas for a realistic 3D medieval fantasy mobile game. Create exactly three isolated dense mature deciduous tree silhouettes side by side in three equal-width columns, all at same scale and same ground baseline, no overlap between trees. Full tree from trunk base to treetop, no cropping. Each tree has a beautifully full, irregular layered canopy of finely detailed tiny leaves and real branching: left green oak, middle autumn golden hornbeam, right muted moss-green beech. Photographic naturalism with warm late afternoon sidelight from upper left and soft shaded foliage, no outlines or cartoon. Each tree fits within its own column with transparent gaps; none touches the left right top or bottom image boundaries. Truly transparent background, clean realistic alpha edges and holes among branches, no ground, no grass base, no shadows on the ground, no sky, no white background, no text or labels. Wide landscape image.

## Meadow clump

Saved asset: `public/scenery/meadow-clump.webp`

Use case: stylized-concept. Asset type: a single production grass-clump cutout texture for a realistic medieval fantasy 3D game. Square image. One naturally irregular low clump of fine meadow grasses, all stems rooted along the same flat bottom baseline. Dense very thin elegantly curved sage green and olive blades, a few delicate straw-gold seed heads, several tiny pale meadow flowers. Botanical realism, finely detailed blade edges, convincing depth within the clump, warm late-afternoon light from top left. Clump wider than tall, with varied heights and irregular natural outline, filling most of image but no clipping. Camera exactly level from the side, not above. Entire clump isolated on true alpha-transparent background with holes between the fine blades. No ground, no soil patch, no rock, no shadow on ground, no pot, no outline, no text. No broad stylized leaves, no chunky triangles, no bright cartoon green. This will be used on crossed transparent planes about 50 cm tall in a 3D game; convincing natural silhouette is essential.

