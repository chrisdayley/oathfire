# The Royal Orchestra — 1.7

The music is original Oathfire composition played with recordings of acoustic orchestral instruments. Strings, brass, woodwinds, harp, timpani, bells and percussion share a stereo concert-hall mix. It is a sampled orchestra, not a recording of a live ensemble playing these pieces together.

## Pieces

| Scene | Piece | Character and form |
| --- | --- | --- |
| Hearthwatch | Banners in the Morning | D major, 108 BPM. Bright royal procession, singable violin theme, garden dance, woodwind bridge and full royal return. 72 measures in nine eight-bar sections: **160 seconds / 2:40 before the suite repeats**. |
| Act I battles | The Hearthguard March | D minor. Dotted trumpet call, answering horns and marching snare; strings and brass gather with the waves. |
| Act II battles | Standards through the Ash | C minor. A lower, resolute theme, with moving strings and denser low brass. |
| Act III battles | The Last Banner | E minor. A rising military anthem with the strongest late-wave arrangement. |
| Bell Knight | The Bell That Calls the Dead | D Phrygian, 132 BPM. Tolling bells, threatening semitone movement, horns and marching drums. |
| Ash Castellan | The Furnace Crown | C harmonic minor, 150 BPM, 3/4. A furnace dance with hammering trombones and racing strings. |
| Marshal Veyr | No More Borrowed Souls | C-sharp harmonic minor, 156 BPM. Trumpets over independent violin lines, bells and heavy percussion. |
| Victory | The Oath Holds | Warm royal horn reprise, harp and woodwinds. |
| Defeat | An Ember Remains | Slow oboe lament with restrained strings, horn and harp. |

Castle form: Processional → Hearthwatch theme → The banners rise → Garden dance → Woodwind promenade → The sunlit court → Royal return → Bells over Hearthwatch → Homeward cadence. The full suite repeats only after its coda. Recurring melodies are intentional musical themes; this is not a two-minute sequence of unrelated notes.

## Music follows the fight

The battle score is composed measure by measure from authored themes, harmonic movements, variations and countermelodies. Its measure cursor never wraps, and no audio buffer loops. It continues for a fight of any duration instead of running out or restarting a fixed recording. Melodic motifs return in developed arrangements.

At each wave, tempo increases by 5 BPM. Arrangement intensity adds faster string figures, lower brass, doubled melody, stronger timpani, snare flams and rolls. The next measure takes the new arrangement, preserving musical position. Related-key movements and horn/woodwind responses develop longer battles. Intensity is independent of the volume slider.

The act-ending encounters are missions 5, 10 and 15. The boss's arrival crossfades to its individual score. That theme remains until the battle ends, including if the boss dies before its accompanying enemies. Victory and defeat have separate orchestral aftermath cues. Returning home restores the castle suite.

## Playback, controls and saves

- Music and effects have independent volume controls in Settings. Existing preferences are preserved; a new campaign starts with music at 50% and effects at 55%.
- Castle menus keep music playing at 52% of the chosen music level. Battle menus pause notes and musical time; closing them resumes sample offsets and pending notes.
- Suspended battles save score ID, measure, beat and elapsed musical time. A reload restores that position. Legacy saves without music data remain valid.
- Backgrounding pauses the transport and suspends audio. Returning through a user gesture resumes playback, as required by mobile browser autoplay rules.
- An unavailable sample download does not stop gameplay. A later audio-unlocking interaction retries it. The standalone player provides an explicit retry message.
- [The soundtrack player](../soundtrack.html) previews every main piece and lets players choose battle intensity without unlocking missions. It also works offline after the game has cached this release.

## Assets and implementation

82 source recordings become 22 mono AAC banks at 32 kHz, totaling **2,552,337 bytes**. The bank manifest stores sample offsets, actual SFZ pitch centers, source paths, source hashes and pinned commits. Octave names in different instruments' filenames do not consistently use the same convention, so pitch centers come from the source SFZ mappings.

`src/music-score.js` contains the themes and orchestration. `src/music.js` manages scene changes, beat transport, pause/resume and checkpoints. `src/orchestra.js` schedules sampled voices, envelopes, stereo seating and a shared hall impulse. The mobile browser renderer uses at most 96 simultaneous voices and loads banks with four concurrent requests. Measured decoded audio memory in Chromium was 48.3 MB at its audio sample rate. Banks ship with the game and are precached by its service worker; runtime playback has no dependency on a third-party music host.

`scripts/prepare-orchestra.py` reproduces the banks using Python with NumPy, curl and macOS afconvert. `scripts/music-render.mjs` renders audio diagnostic WAVs using Web Audio's OfflineAudioContext. The game build uses the checked-in banks and needs none of those asset preparation tools. Browser scripts accept `PLAYWRIGHT_MODULE` or `--playwright-module` and `GAME_URL`.

## Source and licensing

Instrument recordings: [Versilian Studios VSCO 2 Community Edition](https://versilian-studios.com/vsco-community/) and its [source repository](https://github.com/sgossner/VSCO-2-CE). Recordings by Sam Gossner and Simon Dalzell; sample cutting by Elan Hickler / Soundemote. CC0 1.0 permits redistribution and modifications. The full license is included in `public/licenses/VSCO-2-CE-CC0.txt`.

- Source samples: `440300901dfe9275fd84e0b7763af1f8443ae62e`.
- SFZ mapping: `6dd651d55dde97fd4028699be9d4481f26917891`.
- Per-file provenance: `public/music/orchestra.json`.

Scheduling and offline rendering follow the browser [AudioBufferSourceNode API](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start) and [OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext).

## Verification scope

Automated score checks cover duration, form, wave escalation, all boss signatures, valid notes and samples, legacy saves and 1,200 measures per battle/boss score without a cursor wrap. Audio renders cover the full castle suite, 24 measures of every act/boss piece, and both aftermath cues. The measured renders have no clipped samples; the loudest peak is 0.974 at 100% music gain. Live browser QA checks actual nonzero audio, independent volume channels, menus, saves, real boss spawns, background/resume, download retry, offline banks and phone-sized layouts. These objective checks do not substitute for listening feedback or sustained tests on physical iOS and Android devices.
