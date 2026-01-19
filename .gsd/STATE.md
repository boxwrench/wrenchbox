# STATE.md

## Current Position
- **Phase**: Post-Phase 6 Debugging (Regression Fixes)
- **Task**: Restoring polyphony and correcting horror audio routing
- **Status**: Paused at 2026-01-19 09:27

## Last Session Summary
- **Audio Overhaul**: Refactored `AudioEngine.js` to use `Tone.Player.sync()` and `start(0)` for professional-grade loop synchronization.
- **Rhythm Fixes**: Implemented smart snapping in `SampleManager.js` to eliminate loop seams. Restored quarter-note quantization for musical instrument entries.
- **Regression Fixes**: 
  - Fixed self-referential initialization crash in `HorrorEffects.js`.
  - Boosted Kick synth (freq C1 -> C2, volume +3dB) for audibility on small speakers.
  - Temporarily bypassed `HorrorEffects` audio routing to restore multi-instrument polyphony.

## In-Progress Work
- Audio polyphony is restored but `HorrorEffects` audio distortion is currently bypassed in `AudioEngine.js` to ensure the core mixer works.
- Files modified: `AudioEngine.js`, `Sequencer.js`, `SampleManager.js`, `main.js`, `HorrorEffects.js`, `theme.json`.

## Blockers
- **Audio Routing Conflict**: The `channel.disconnect()` in `HorrorEffects.createEffectChain()` was breaking the audio path for subsequent instruments when multiple items were added to the mix.

## Context Dump

### Decisions Made
- **Sync Over Scheduling**: Switched from `scheduleOnce` to `.sync()` for looping players. This and Transport-aligned starts (0) ensure perfect phase consistency without complex manual math.
- **Safety First**: Opted to bypass horror audio effects rather than leaving the user with a broken (silent) mixer.

### Approaches Tried
- **Manual Quantized Starts**: Failed (caused jitter/off-beat feeling).
- **Direct Effect Routing**: Failed (caused silence for 2nd+ instruments due to node disconnection conflicts).
- **Transport Sync**: **Succeeded** - perfectly aligns loops.

### Current Hypothesis
The Tone.js `Channel` nodes being reused or disconnected in `HorrorEffects` were not being reconnected properly to the global filter/destination for any instrument after the first one.

### Files of Interest
- `src/core/AudioEngine.js`: Central routing hub.
- `src/core/HorrorEffects.js`: The source of routing disconnections.
- `src/core/SampleManager.js`: Handles loop lengths and transients.

## Next Steps
1. **Verify Polyphony**: Confirm user can hear all tracks (Snare, Hi-Hat, Kick, Bass) together.
2. **Proper Effects Routing**: Re-implement `HorrorEffects` using a "Bus" or ensuring `connect()` logic doesn't orphan the channel.
3. **Volume Balancing**: Review mix level of all instruments after sync fixes.
