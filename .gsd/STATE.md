# State - Fix Audio State Loss

## Current Position
- **Phase**: 4 (Final Verification)
- **Task**: Polished audio & finalized milestone
- **Status**: Done (2026-01-19T10:16:17-08:00)

## Last Session Summary
Debugged `AudioEngine` state loss. Root cause was `Tone.Transport.scheduleOnce` failing to fire callbacks for slots > 0 because `Tone.Transport` loops (4m) and the calculated start time was outside the immediate execution window or lost due to looping logic. **Fixed** by removing `scheduleOnce` and allowing `Tone.Sequence` and `Tone.Player` to handle their own sync, which is the correct Tone.js pattern.

## In-Progress Work
- `src/main.js`: Fixed `startPatternQuantized` to execute immediately.
- `src/core/AudioEngine.js`: Verified state persistence.

## Blockers
## Blockers
- None

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
