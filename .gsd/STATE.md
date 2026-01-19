# State - Fix Audio State Loss

## Current Position
- **Phase**: 1 (Diagnostics & State Logging)
- **Task**: Debugging audio state loss and routing bug
- **Status**: Paused at 2026-01-19T10:00:44-08:00

## Last Session Summary
Diagnosed a critical bug where `AudioEngine` internal state loses track of all slots except active slot 0. Refactored `createSource` to avoid aggressive `channel.disconnect()` calls, but the state loss persists. Created a full GSD plan (SPEC, ROADMAP, STATE) to address this.

## In-Progress Work
- `AudioEngine.js`: Refactored `createSource` (uncommitted fixes).
- `HorrorEffects.js`: Removed `disconnect()` (uncommitted fixes).
- `implementation_plan.md`: Created plan for logging.

## Blockers
- **Root Cause Unknown**: Why does `state.slots` in `main.js` have 4 items, but `audioEngine.slots` only have 1?
- **Silent Failures**: No console errors explain the missing Map entries.

## Context Dump
### Decisions Made
- **Safe Routing**: Decided to remove `channel.disconnect()` from `HorrorEffects` and instead instantiate fresh channels without destinations in `AudioEngine`. This prevents "AudioContext not started" or routing loops.
- **Instrument Persistence**: We observed that Slot 0 works, but 1-3 disappear from internal maps. This suggests a reset or overwrite happening somewhere.

### Current Hypothesis
- **Race Condition**: `assignSoundToSlot` calls `startPattern`, which calls `createSource`. If `reset()` or `disposeSlot()` is triggered inadvertently (maybe by the `DragDrop` logic detecting a "move" vs "copy"?), it clears the maps.
- **Type Mismatch**: `slotId` passed as string "1" vs number 1 might be causing Map lookups to fail or overwrite wrong keys.

### Files of Interest
- `src/core/AudioEngine.js`: The `slots` Map resides here.
- `src/main.js`: Manages the UI state `state.slots`.
- `src/core/Sequencer.js`: Manages `activeSlots`.

## Next Steps
1. **Execute Logging Plan**: Implement the diagnostic logging in `implementation_plan.md`.
2. **Verify Types**: Check if `slotId` is consistently a specific type (Number).
3. **Trace Lifecycle**: creating source -> registering -> (accidental disposal?) -> final state.
