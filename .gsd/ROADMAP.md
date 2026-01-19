# Roadmap - Fix Audio State Loss

## Phase 1: Diagnostics & State Logging
- [x] Add enhanced logging to `AudioEngine.js`, `Sequencer.js`, and `HorrorEffects.js`.
- [x] Verify `slotId` types and values during `createSource` and `startPattern`.
- [x] Check for silent errors in Tone.js `scheduleOnce` or effect creation.

## Phase 2: Fix State Persistence
- [x] Ensure `audioEngine.slots` correctly persists all instruments.
- [x] Prevent accidental `disposeSlot` calls.
- [x] Synchronize `Sequencer` and `AudioEngine` slot maps.

## Phase 3: Routing & Horror Mode Stability
- [x] Verify signal path for all instruments (Synth/Sample -> Effects -> Master).
- [x] Fix any race conditions between corruption spread and source creation.

## Phase 4: Final Verification
- [x] Browser test: Drag all sounds, confirm `audioEngine.slots.size === 7`.
- [x] Browser test: Verify horror mode activation and effect routing.
