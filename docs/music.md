# Current music — Living Kingdom 2.2

The earlier synthesized arrangements described below have been replaced in the game by eight complete orchestral productions by Scott Buckley, licensed CC BY 4.0. These preserve the composer's full mixes instead of reconstructing an orchestra from isolated notes. The castle uses *Three Sheets to the Wind* (3:20); battles progress through a forward-only cue sequence, and each of the five bosses has a different opening recording. `src/recorded-score.js` defines the selections and `src/music.js` handles crossfades, pause/resume, volume and saved playheads. Full provenance and conversion details are in `public/music/recordings/credits.json`; credit links appear in Settings, the soundtrack page and game credits.

Pixabay's orchestra search was reviewed. It contains many short hits and accents; complete licensed compositions were selected for the sustained battle score instead. Sources: https://pixabay.com/sound-effects/search/orchestra/ and https://www.scottbuckley.com.au/library/using-this-music/ . This change does not claim original authorship of Buckley's work, a newly recorded live orchestra, or subjective listening approval on a physical phone.

The prior composition and sampled-instrument research follows as release history. Its timings, renderer and instrument-bank descriptions no longer describe the default music runtime.

---

# Kingdom & Melody — Oathfire 2.0

The score has been recomposed around recognizable melodies, breaths, answering phrases and contrasting sections. The replacement sample library uses stereo sections, a solo violin, short string and brass articulations, sustained sample loops, and soft/forceful brass layers. These are sampled performances arranged in the browser, not a recording of a live orchestra performing the complete pieces.

## Reference study and its limits

The user’s open Chrome tab was a violin/piano arrangement of **Scars of Time** by rdstewart. The supplied CreativeOyster arrangement was also opened in Chrome. The visible opening of the latter has a spacious 82 BPM introduction, guitar arpeggios, a flute entrance around measure 6, held notes answered by shorter ornaments, and a marked lift to 110 BPM with percussion at measure 20. Only the loaded opening notation was inspected; later pages did not load reliably. These observations concern those arrangements, not a verified transcription of the original recording.

- [Violin/piano arrangement inspected in Chrome](https://musescore.com/user/34965227/scores/7279922)
- [Supplied ensemble arrangement inspected in Chrome](https://musescore.com/user/9405616/scores/5292881)
- [Chrono Cross soundtrack reference](https://archive.org/details/chrono_cross-original_soundtrack-1999)

All **67 recordings** in that soundtrack listing were downloaded into an ignored research folder and processed across their full durations for energy contours, pulse estimates, crest factor and section contrasts. Those are signal measurements, not listening or note transcription. Automated tempo estimates can be half or double the musical pulse. The tools used in this session do not provide auditory perception, so no claim is made that all tracks were listened to or that the new music has passed a human listening review. The copyrighted reference recordings are not distributed with the game.

Mitsuda describes folk melody and the need to avoid stiffness, including revising an initially unsatisfactory opening demo. The practical lesson here is to let a small, memorable melody carry the piece before adding orchestral density. [Translated 2000 Mitsuda interview](https://shmuplations.com/yasunorimitsuda2/).

Uematsu discusses individuality and composing in response to characters and story. Accordingly, the castle, each act and each boss receive different musical identities rather than one interchangeable background bed. [2010 Uematsu interview](https://squareenixmusic.com/features/interviews/nobuouematsu2.shtml).

Mitsuda also describes the relationship between game imagery, story and music, and using accessible song structures with folk influences. The design uses repeating melodic ideas with varied answers and orchestration, rather than making every bar unrelated. [2005 Mitsuda interview](https://squareenixmusic.com/features/interviews/yasunorimitsuda.shtml).

## New score

| Scene | Theme | Shape |
|---|---|---|
| Hearthwatch | A Kingdom Wakes | 96 bars; approximately **3:35 before looping**. Quiet oboe/harp prelude, singing violin, court dance, woodwind middle, full royal return. 92/96/112 BPM. |
| Act I | Run with the Banners | 132 BPM. Rhythmic violin hook, held peaks, marching percussion and offbeat strings. |
| Act II | Across the Amber River | 138 BPM. Longer lyrical answers, horn counterphrases and moving bass. |
| Act III | Names in the Starlight | 144 BPM. Broad melodic rise over urgent strings. |
| Act IV | Wings over Winter | 140 BPM. Woodwind exchanges and a lighter contrasting middle. |
| Act V | The Road We Choose | 148 BPM. The banner melody returns with a different tonal center and heavier arrangement. |
| Bell Knight | The Broken Bell | 126 BPM. Chromatic bell motif and weighty low strings. |
| Ash Castellan | Dance of the Furnace King | 156 BPM. Angular melody, short trombone accents and hammering percussion. |
| Marshal Veyr | A Crown Cannot Hold the Dawn | 150 BPM. Broad, conflicted melody with answering horns. |
| Glass Regent | The Regent of Glass | 146 BPM. Celesta, cold chromatic turns and sharp brass. |
| Hollow King | Until Every Voice Is Free | 164 BPM. A separate final-boss melody, bells and short brass. |
| Victory | Carry the Light Home | 108 BPM. Horn-led homecoming. |
| Defeat | Still, an Ember | 76 BPM. Exposed solo line and a restrained accompaniment. |

Battle playback does not seek back to the beginning or wrap its measure counter. Five 96-bar developments move through different tonal centers. Themes and accompaniment patterns recur intentionally; this is not an assertion of infinitely unique music. Wave progression adds string pulse, brass, ornaments, upper strings and low reinforcement without abruptly changing tempo. Quieter middle sections preserve contrast even at high intensity. Boss entrances change to their own score and retain it until the encounter finishes.

## Rendering

The sampler retains pitch corrections and WAV sustain-loop points from source SFZ mappings. Sustained notes can ring for their written duration instead of fading after a short one-shot. It selects nearby recorded pitches, alternate takes where available, and soft/forte brass recordings. Notes receive expression envelopes, slight timing/pitch variation, stereo placement, velocity-dependent filtering and shared hall reverb. A 32 kHz AudioContext keeps the complete decoded orchestra at approximately 108 MB in the tested browser. A 112-voice ceiling bounds realtime work. Music and effects retain independent volume controls; menus pause combat music position, and saves retain measure, beat and elapsed time.

Primary implementation references: [Virtual Playing Orchestra](https://virtualplaying.com/virtual-playing-orchestra/), [standard articulation documentation](https://virtualplaying.com/standard-orchestra-documentation/), [performance documentation](https://virtualplaying.com/performance-orchestra-documentation/), and [EastWest orchestral performance manual](https://media.soundsonline.com/manuals/EW-Symphonic-Orchestra-User-Manual.pdf). No EastWest samples are included.

## Provenance and reproducibility

`scripts/prepare-orchestra-v2.py` compacts the source recordings into 26 instrument banks, including four retained percussion banks. Download size is **7,219,025 bytes**. `public/music/chamber/orchestra.json` records roots, offsets, durations, loops, tuning, sources and SHA-256 hashes. Full source attribution and license links are in `public/music/chamber/LICENSES.txt` and the included VPO license document. These assets have mixed source licenses; they are **not all CC0**.

Run `npm test` for score/bank validation, `scripts/music-render.mjs` for full castle and excerpts of every other cue, and `scripts/music-qa.mjs` for live scheduling, pause/resume, scene changes, volume isolation, offline access and download failure recovery. Technical audio tests can detect silence and clipping; they cannot determine whether a melody is beautiful or catchy.
