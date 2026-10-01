# Steel & Sorcery: sound design

Build `oathfire-1.8.0-steel-and-sorcery`.

## Movement that follows the feet

The previous implementation requested a footstep on every moving physics tick, with a 0.14-second audio cooldown. This could produce seven contacts per second regardless of the animation. Footsteps now come from measured heel plants in the actual retargeted animation clip: Walking_A left 0.98 / right 0.48, Running_A left 0.15 / right 0.65, expressed as normalized clip phases. Toe-off minima are deliberately excluded.

Animation speed follows actual collision-constrained horizontal displacement. A blocked hero idles rather than running against a rock. A contact emits one surface recording and a much quieter armor layer 18 ms later. Five surface variations and four gear variations rotate without immediate repetition. A minimum separation only rejects duplicate events; it does not drive the cadence. Teleports, pauses and clip changes cannot replay missed steps. Airborne movement is silent; a jump ends with one landing contact.

The terrain and a downward collision ray choose stone, dirt, grass, shallow water, wooden bridge or snow. A rock above water remains stone, and a bridge above the river remains wood. Equipped Wayfarer armor uses leather, Starwoven/Dawnkeeper armor uses cloth, and metal armor uses plate movement. The same contact system continues in first-person view. Boots and equipment have a shared independent volume slider under Settings, defaulting to 65% of the authored movement mix, behind the master Sound effects control. Old saves without that setting retain their data and receive the same default.

## Weapons with weight

Sword sweeps, spear thrusts, hammer swings, bow releases and crossbow releases have separate quick/charged cues. The sound begins at the attack's windup or release rather than immediately on button press. Confirmed damage adds a material-specific impact: metal contact and a brief ring against armor, a heavier body thud against unarmored enemies, and distinct wood/stone contact for projectiles. Arrows add a short shaft knock; bolts have a lower, heavier response. Charged hits lower the pitch and increase weight. Misses get the swing without a false hit. Blocks use a separate shield/clash sound, with a brighter perfect block.

Damage-over-time ticks do not repeatedly clang. A projectile adds one contact cue; its splash damage does not replay that cue for every nearby target. Distance attenuation, stereo position, crowd cooldowns and a 40-voice ceiling keep nearby hero actions clearer than distant soldiers. Hero attacks and foot contacts can replace lower-priority army voices when the budget is full. Menus and background suspension fade active foley rather than letting delayed effects spill into resumed play.

## Elemental identities

The reference is the weight and layered character described by Bethesda audio director Mark Lampert in [Sounds of Skyrim](https://elderscrolls.bethesda.net/en-AU/news/7eS1lbZwCwhnYW3Na281AS/sounds-of-skyrim): real-world recordings combined and transformed to suggest magic. Oathfire uses its own designs and reusable recordings.

| Element | Sound direction |
| --- | --- |
| Fire | Rushing ignition, short crackles, low combustion and a fading roar |
| Ice | Glass-like fractures, bright brittle resonance and cold rushing air |
| Storm | Sharp electrical snaps over a low thunder body |
| Water | Recorded splash, a resonant swell and soft restoration tail |
| Nature | Twisting wood, moving leaves, earth and a living harmonic swell |
| Earth / forge | Mining impact, stone movement and low resonant weight |
| Holy / wards | Bell-like harmonics, a synthesized choral swell and spacious decay |
| Wind / volleys | Fast air movement with a light harmonic tail |
| Arcane | Glassy harmonics with a distinct pulse pattern |
| Grave | Low dissonant resonance and breath-like motion |
| Command | A broad, heraldic harmonic call |

Every one of the 23 hero techniques has a separate authored duration, root pitch, rhythm and texture combination. Four NPC elemental cast cues and nine impact families complete the combat set. Rank 2 adds a lighter elemental resonance; rank 3 adds a deeper and stronger layer. Existing rank-dependent visual effects remain in place. These are layered sound effects, not recordings of a live orchestra or a human choir.

## Sources and reproduction

- [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds) and [RPG Audio](https://kenney.nl/assets/rpg-audio): footsteps, impacts, creaks and swishes, CC0.
- [HaelDB armor footsteps](https://opengameart.org/content/footsteps-leather-cloth-armor): plate, leather and cloth, CC0 option of the author's dual license.
- [TinyWorlds surface steps](https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud): dirt, gravel and leaves, CC0. The author credits public-domain pdsounds recordings edited for Minetest.
- [Peludo water splashes](https://opengameart.org/content/water-splash-and-sand-footsteps), CC0; [creator's games](https://rnan.itch.io/).

`scripts/prepare-foley.py` downloads the source archives, trims, layers and normalizes the recordings, authors the elemental textures, and encodes five mono AAC banks at 32 kHz / 96 kbps. It requires Python with NumPy and soundfile, and macOS afconvert. The committed assets work without these build tools. `public/sfx/foley.json` contains exact sprite offsets, durations, source recording hashes, download URLs, archive hashes and final bank hashes. License notices are bundled under `public/licenses/`. There are 87 named cues and 191 variations; total compressed bank size is approximately 2.3 MB. Browser decoding resamples to the device rate, so memory use depends on that rate.

`scripts/sfx-qa.mjs` exercises actual input, character animation, terrain, physics contacts, attack timing, projectile collisions, all casts, settings, pause and voice budgeting in the browser. `scripts/sfx-render.mjs` checks the decoded recordings and renders movement/combat samples through an offline version of the game mix. Automated timing and signal checks do not substitute for a listener's judgment or physical phone speaker/headphone testing.
