# People of Hearthwatch — 2.16

## Phone camera clearance

The game canvas still fills the display. A shared protected interface region now contains the HUD, character/army/gear menus, story dialogs, hero selection, preparation/scouting, victory, battle reports and unlock reveals. It reserves the device-reported safe area on all four sides. Landscape touch devices also reserve 48 CSS pixels on both sides when a browser reports no camera inset, so rotating the phone does not put controls back underneath the camera or its activity overlays. The bottom inset keeps buttons above the home indicator.

Older per-element safe-area additions were removed to avoid counting insets twice. Character/weapon previews use the resulting element rectangles; the rendering canvas and physics are unchanged. World guidance markers clamp to the protected region. Floating combat numbers outside it are hidden rather than displayed beneath a cutout. The town directory fits on one landscape screen.

## Visit the town

Pause now opens the hero's level, stats, abilities, passives and ability loadout. Options retains settings, save backup, the chronicle and enemy information. The main menu no longer offers remote equipment, regiment, castle, market or mission tiles.

The world HUD's **Town** button opens a directory. Selecting a person returns to the world and marks their location; it does not teleport the hero or open their service. Tutorial links, the **Find Sera** shortcut, post-battle choices, preparation links and the campaign keyboard shortcut use the same rule.

- **Torren, forge:** equip, compare and improve weapons/armor; runes, tempering and salvage.
- **Captain Rowan, barracks:** permanent regiment training and doctrines.
- **Nell, engineer:** permanent castle upgrades, emplacements and Command lodge.
- **Iona, market:** buy provisions, salvage and equipment.
- **Sera, war table:** choose missions, read briefings, scout enemies, select perks and launch.

Opening a service and performing a permanent transaction require being close to the appropriate NPC. Launching a mission requires being at Sera's table. Interaction reach is 4.5 m to allow talking across physical counters, including Torren's forge; it still checks vertical distance and does not permit remote service use. Battle recruitment, orders and temporary research remain in the combat interface.

Directions persist with the campaign. Existing progress, inventory, music and battle mechanics are preserved. Visiting the NPC clears its destination marker; the ordinary war-table marker remains available afterward.

## Verification

154 rules tests pass, including service proximity, height and battle restrictions, transaction routing, and destination persistence without teleportation or currency changes. The production browser walkthrough physically moves the hero through existing collision to all five services, then buys a weapon improvement, trains a regiment, upgrades a defense, purchases a potion and launches a mission from Sera.

Layout checks cover simulated 64-pixel left and right camera exclusions with a 21-pixel bottom inset at 844×390, a 667×375 landscape touch fallback, and 390×844 portrait with a 34-pixel bottom inset. They cover character progression, the town guide, forge, preparation, battle HUD, victory, results and post-battle choices. Save/reload verifies the upgrades, resources and selected destination. Browser checks validate bounds and interaction; these are not claims of physical-iPhone testing.

The existing 17-check assault regression covers castle targeting/damage, streamed reinforcements, saved schedules, boss entry, victory and HUD layout. The release is verified against exact live GitHub Pages files, then the town walkthrough is repeated using a disposable campaign on the public site.

Local evidence: `work/qa-town-safe-production`, `work/qa-assault-216`, `work/qa-town-safe-live-216` and `work/build/v2160-*`.
