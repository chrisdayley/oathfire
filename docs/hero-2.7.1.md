# Hero selection, playback recovery and Furnace Fireball — 2.7.1

## Character selection

The selector builds a detached starter loadout and displays the same animated character, weapon and armor models used during play. Browsing does not write a save. Warden starts with sword and shield, the most health and armor; Ashwright starts with a war hammer and explosive/healing magic; Veilranger starts with a longbow, a dodge and an enemy root. Health, armor and magic come from the real starter stats. Plain ability summaries replace flavor taglines. The player can rotate the model and preview an attack or cast. Back releases the preview, and canceling campaign replacement restores the selected hero without changing the existing save.

## Furnace Fireball

The Ashwright-exclusive active costs 17 magic and has a 4.2-second cooldown. These values are before armor and other combat modifiers. A directly hit enemy also receives the explosion. Ground damage requires remaining inside the burning area.

| Rank | Direct hit | Explosion | Radius | Ground fire | Armor weakening |
| --- | ---: | ---: | ---: | --- | --- |
| I | 58 | 24 | 3 m | 8 damage/s for 3 s | None |
| II | 78 | 32 | 3.5 m | 12 damage/s for 4 s | 20% for 4 s |
| III | 104 | 42 | 4 m | 16 damage/s for 5 s | 20% for 6 s |

A starter rune-staff shot deals 35 total damage to an unarmored directly hit target; a charged shot deals 65. Furnace I deals 82 immediately and up to 106 including its full burn. Furnace II and III total 158 and 226. The armored target calculations continue to use the existing combat rules. The larger orb has increasing incandescent rings and a fuller flame trail. Staff shots have a separate rune-bolt sound and never gain Furnace's fields or armor effect by learning the spell. Other troop fireballs retain their own existing progression.

## Recorded music

The approved licensed orchestral recordings are retained. Both reusable HTML media decks are activated during the first user gesture, and play is requested before awaiting downloaded metadata. Every trusted tap/key can resume a suspended or interrupted Web Audio context and recover an unexpectedly paused deck. Returning to the page attempts recovery. A failed track transition retains the requested track and playhead for retry. Deliberate pause and saved music volume remain authoritative; audio resume errors do not prevent starting the game.

## Verification

- 107 automated rules, progression and save tests.
- Hero selection: all three actual starter models and weapons; no scrolling at 844×390, 667×375 and 390×844; attack/cast controls; Back; campaign replacement cancellation and save preservation.
- Furnace: actual Rapier projectile impacts at all three ranks, compared with normal and charged rune-staff attacks; neighboring targets, full burn duration, larger projectile, exact resource cost, armor weakening and independent staff damage.
- Music: measured nonzero audio output, mute isolation, wave crossfades, boss cues, paused command menus, reload playhead preservation and castle looping. Recovery exercises delayed loading, external media pause, audio-context suspension, a deliberately rejected track change and pause/mute preservation.

Browser checks use isolated, touch-enabled Chromium profiles. Phone-size layout checks do not establish physical iPhone/Safari playback or device performance.
