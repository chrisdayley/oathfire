# Campaign save recovery — 2.21.1

The reported title-screen message did not identify the failing validation rule. The phone's actual stored data was unavailable, so this release does not claim to identify its exact corrupt field. Older hard-coded title version labels were also unreliable indicators of the running build.

## Confirmed failure paths

- A readable but invalid localStorage save prevented the loader from trying IndexedDB.
- Malformed or missing primary JSON bypassed the local backup unless a later validation happened to throw.
- Loading picked the first copy found rather than the newest valid timestamp.
- Autosave wrote unchecked snapshots and rotated potentially invalid data into its only local backup.
- Rejected saves exposed no export or recovery action on the title screen. Starting a new game could replace them without the existing-campaign confirmation.

## Changes

The loader examines local current, backup and validated checkpoint, plus IndexedDB current and backup. Each candidate is migrated and validated on a copy, preserving original bytes. It chooses the newest fully valid copy. Invalid copies are archived separately before subsequent writes. Autosave validates a detached snapshot before either storage system is changed and retains a validated previous checkpoint.

When a newer rejected save becomes valid with only its temporary battle removed, the title offers **Recover latest campaign**. The recovery panel explicitly explains that the interrupted battle restarts. Recovery preserves inventory, hero levels, ranks, currencies, completed defenses and town/campaign progress; it returns the player to Hearthwatch and dismounts them. It neither rewards the unfinished mission nor advances a campaign day. Invalid core campaign fields are never silently invented or reset. Original copies remain available through **Export recovery file**.

The title offers import/recovery even when no valid save can be loaded. Replacing an unreadable campaign requires the existing new-game confirmation. No browser data is cleared.

Installed clients check the worker without using the HTTP cache. A waiting update exposes **Save & reload** on the title or while paused, never over active play. It activates the new asset cache while preserving both save stores. Navigation requests bypass the HTTP cache and still fall back to the offline app when disconnected.

## Validation

- 215 unit tests pass, including actual save fixtures produced by commit `6f78d20` (2.15), retained progression, invalid primary/backup combinations, quarantine and invalid-autosave protection.
- `scripts/save-recovery-qa.mjs`: real IndexedDB fallback, resumed Reedwater battle, newest-copy selection, mobile recovery actions, preserved equipment/levels/resources, persistent reload, old victory reports without duplicated rewards, raw export, replacement confirmation and offline continuation. Isolated browser contexts; no player profile touched.
- `scripts/save-update-qa.mjs`: real service-worker install/update/activation, no interruption during play, save-and-reload preservation and offline restart.

A player's phone-only save cannot be verified from the development machine. If it cannot be loaded or repaired, the recovery export retains the available copies and precise validator errors for diagnosis.
