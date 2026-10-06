# 2.22.0 — flowing music and fitted heroes

## Music

Battle wave cues blend over eight seconds using a smooth, constant-power gain curve. The outgoing recording continues while the incoming file buffers; the next likely cue is prefetched on the idle deck. Fade timing waits for playable audio and detects quiet introductions, with a bounded ten-second lead-in. Buffer stalls restore the outgoing track. Both decks pause together in combat menus and resume the same blend. Rapid scene requests cannot reclaim an audible deck. A failed cue leaves the current recording playing and remains available for retry on interaction.

Crossfades begin before the end of a nonlooping recording. Only the castle piece loops. Music checkpoints preserve the dominant track, its playhead and wave; entering battle cannot save castle music as the battle cue. Existing recordings, composer credits and licenses are unchanged.

## Hero refinement

All three heroes share the fitted shoulder mantle. The attachment sits below the neck, with a curved yoke, leather ties and visible pins. A narrower, asymmetric hem reveals more of the feet. Diagonal folds and irregular dye variation replace parallel painted bands. Animated leg and ground clearance remain in use; mounted cloth additionally drapes over the horse's croup in its local coordinate system, including larger mounts and independent riding headings.

Skin has subtle warm/cool anatomical variation and restrained muscle-crease shading. Forged metal has cooler recesses and warmer worn areas, with less artificial fill light. Leather stitching is more legible. The common maul's head is 23% smaller while rare silhouettes retain their scale. Nearby world shadows use a tighter light camera and smaller normal bias; shadow map counts and resolution budgets are unchanged.

These are incremental improvements to the existing real-time models, not concept-art parity. Horse tack alignment and the broader horse model have not been redesigned in this update.

## Persistent training dismissal

The close button hides the card and waypoint immediately, without creating redundant notifications. The optional saved `guide.hidden` preference applies to tutorial lessons, town tasks and homecoming reminders—including The bowyers return. Explicitly requesting an NPC destination or restarting training restores guidance. Earlier saves without this field retain their existing behavior; campaign progress is preserved.

The installed-game update prompt also ignores first installation and cannot cover character selection or modal actions. Save-and-reload remains an explicit action.

## Validation

- 222 unit tests, including constant-power fades, quiet/buffering cues, retired decks, dominant-track checkpoints, legacy-save visibility and NPC guidance.
- Real media browser checks cover delayed loading, measured mixed PCM throughout a wave transition, pause/resume, checkpoint reload, blocked playback retry and rapid scene changes.
- Mobile browser checks reproduce the reported homecoming reminder, dismiss it, reload the saved campaign, restore explicit guidance and restart training.
- 84 hero/armor-family/rarity combinations render with finite geometry, helmet/sleeve/plate coverage and connected mantles. Nine hero/tier movement samples verify idle/walk/run/attack and ground clearance. Mounted cloth is checked against the croup through common and godly strides.
- Independent visual review drove a second refinement and caught mounted cape penetration; that collision was corrected and reviewed again.
- Production music and service-worker update/offline regression results are recorded in the local QA artifacts.

Physical iPhone playback and GPU performance have not been measured; touch-layout tests run in isolated mobile-sized Chromium contexts. No real user save is reset or modified during testing.
