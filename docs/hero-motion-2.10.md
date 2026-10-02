# Hero physique and movement — 2.10

The hero previously inherited a shared downward upper-arm adjustment during the run. Narrow chest, upper-arm and leg meshes compounded the impression of a stick figure. This release changes the visible body and locomotion, while retaining the existing animation skeleton, combat timings, collider and save format.

## Body and armor

- Warden: broad armored chest, shoulders, upper arms, thighs and calves.
- Ashwright: a heavier smith build and continuous anatomical arm surfaces with biceps, triceps, elbows and tapered forearms. The surface retains MakeHuman skin UVs and blended elbow weights.
- Veilranger: a leaner athletic build with a wider torso and fuller limbs.
- Armor and details fit the enlarged body; cape clearance increases behind the chest. Hero necks now use skin material. Faces and exposed arms use a rough skin material with fine pore relief.
- glTF names are normalized before outfit filtering, so plain equipment and the removed tube-shaped Ashwright sleeves are correctly recognized.
- These remain real-time game models, not reproductions of the painted concepts.

The anatomical arm source is CC0 MakeHuman system geometry and its male/muscle targets. `public/licenses/hero-anatomy.json` records source URLs and SHA-256 hashes. `scripts/build-hero-anatomy.mjs` reproduces the approximately 2,000-triangle arm pair from the pinned sources in `work/atelier/`. No runtime modeling service or external asset request is needed.

## Locomotion

`src/hero-locomotion.js` adds a two-bone arm solution over the existing foot animation. Walks have a looser, lower arm swing; running bends the elbows, raises the hands and adds shoulder counter-rotation. Sword and shield, bow, staff, spear and hammer carry differently. The hammer support hand follows its actual handle through the stride.

Speed smoothing and separate enter/exit thresholds avoid flickering between walk and run. The motion layer yields to attacks, charging, guard, casting and death. Jumping fades the ground locomotion layer out. Original foot-contact markers continue to drive footstep audio; weapon hit timings and physical movement are unchanged.

## Verification

- `npm test`: includes gait boundary, proportion, carry direction and anatomical asset validation.
- `scripts/hero-motion-qa.mjs`: isolated browser QA for 15 hero/weapon combinations, elbow bend, hand swing, grip contact, footfalls, attack/guard/charge/cast/jump transitions, finite skinned geometry, mobile views, rock collision, jump clearance and save reload.
- Rendered inspection of common and Godly equipment on all three heroes, including side and rear views.
- Production build includes the new anatomy asset in the offline cache.

QA uses disposable browser data. Physical-phone performance and motion quality still benefit from player feedback; the automated mobile run uses a phone-sized browser viewport.
