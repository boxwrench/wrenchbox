# goal: Fix Audio State Loss and Routing Bug

Fix the issue where only Slot 0 is registered in the `AudioEngine` and `Sequencer` internal states, and ensure the audio signal path is correctly routed through `HorrorEffects` back to `toDestination()`.

## Status: FINALIZED

## Context
- Phase: 7 (Optimization & Polish) / Phase 8 (Horror Mode)
- Problem: Dragging icons to slots (1, 2, 3...) updates UI but fails to persist in `audioEngine.slots` or `sequencer.activeSlots`.
- Symptoms: Silence for all slots except possibly slot 0. `horrorEffects.effectChains` also only contains slot 0.

## Requirements
- [x] Re-enable `HorrorEffects` routing in `AudioEngine.js`.
- [ ] Identify why slots 1-6 fail to register in internal state.
- [ ] Fix state management to ensure all active slots are tracked.
- [ ] Verify audio routing from `Source -> Channel -> Effects (if any) -> Destination`.
- [ ] Confirm `audioEngine.slots.size` matches UI state in browser.

## Verification
- Browser console: `audioEngine.slots.size` should equal number of filled slots.
- Browser console: `horrorEffects.effectChains.size` should equal number of filled slots.
- Audio: Sound should be audible for all active slots.
