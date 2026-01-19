# Development Log

This file tracks development sessions, decisions, and context for continuity across sessions and devices. Claude (or any AI assistant) should read this first when picking up the project.

---

## Project Status

**Current State:** Phase 3 - Sample-based audio (infrastructure complete, using synth fallback)
**Primary Goal:** Open-source music creation engine (Incredibox-style → Sprunki horror mode)
**Tech Stack:** Vanilla HTML/CSS/JS, Tone.js (replaces vanilla Web Audio)

---

## Quick Context for New Sessions

```
This repo: Music creation game engine built iteratively
Inspiration: Incredibox → My Singing Monsters → Sprunki
Key differentiator: Open source, data-driven, horror transformation system
7 phases: Foundation → Incredibox Core → Audio → Data-Driven → Bonus → Horror → Polish
```

## Debugging Workflow

When encountering issues:

1. **Check docs/ FIRST** before any code changes
   - `PLAN.md` - Phase roadmap and architecture
   - `TOOLS.md` - Recommended tools and libraries
   - `research/` - Generated research documents

2. **Search docs for specific issue** (e.g., "audio sync", "drag drop", "corruption")

3. **Only after docs** - Try code modifications based on documented behavior

---

## Session Log

### 2026-01-18 - Project Setup

**What was done:**
- Created wrenchbox repo structure
- Wrote PLAN.md with 7-phase roadmap
- Scaffolded Phase 1: Foundation
  - AudioEngine.js - Web Audio API wrapper (oscillators, noise, filters)
  - Sequencer.js - Pattern-based timing (8/16 beat loops)
  - main.js - App logic with click-to-toggle UI
- Deep research into music layering games:
  - Incredibox mod system (JSON + assets)
  - My Singing Monsters (Composer Island piano roll)
  - DropMix (NFC cards, power levels, auto key/tempo matching)
  - Fuser (4-stem separation, AI mixing engine)
  - Sprunki (corruption tiers, horror transformation)
  - NodeBeat, Patatap (generative/interactive approaches)

**Key findings from research:**
```
Mechanic                         | Source              | Potential Use
---------------------------------|---------------------|----------------------------------
Power levels (1-3)               | DropMix             | Dominant sounds influence tempo
4-stem separation                | Fuser               | Enforce 4 categories (beats/effects/melody/voice)
Progressive corruption (0-100%)  | Sprunki             | Not binary, gradual transformation
Composer Island (piano roll)     | My Singing Monsters | Custom note sequences per character
Auto key/tempo matching          | DropMix/Fuser       | Future stretch goal
```

**Files created:**
- PLAN.md - 7-phase development roadmap
- DEVLOG.md - This file
- TOOLS.md - Tool recommendations
- RESEARCH_PROMPT.md - Deep research prompt for external generation
- src/core/AudioEngine.js
- src/core/Sequencer.js
- src/main.js
- index.html, style.css

**Next steps:**
- Generate deep research using RESEARCH_PROMPT.md
- Test Phase 1 scaffold in browser
- Implement missing Phase 1 features (visual polish)

**Blocking issues:** None

---

### 2026-01-18 - Research Integration & Tone.js Refactor

**What was done:**
- Integrated comprehensive research document (docs/research/Music Game Mechanics & Architecture Research.md)
- Major decision: **Switched from vanilla Web Audio API to Tone.js**
- Refactored all Phase 1 code to use Tone.js:
  - AudioEngine.js - Now uses Tone.js synths (MembraneSynth, NoiseSynth, MetalSynth, MonoSynth)
  - Sequencer.js - Now uses Tone.Transport and Tone.Sequence for timing
  - main.js - Async initialization with start overlay
  - index.html - Added Tone.js CDN, start overlay for AudioContext unlock
  - style.css - Added start overlay styles, beat indicator styles

**Key research findings applied:**

| Finding | Source | Implementation |
|---------|--------|----------------|
| Tone.js over vanilla Web Audio | Research doc | Solves clock drift, lookahead scheduling built-in |
| Lookahead scheduling | Research doc | Tone.Transport handles 25ms interval, 100ms lookahead |
| Start overlay pattern | Browser requirements | Click-to-start unlocks AudioContext |
| Harmonic constraints | Research doc | All patterns in C minor, 120 BPM |
| Cellular automata corruption | Research doc | Documented in PLAN.md for Phase 6 |

**Why Tone.js was chosen:**
```
Problem: Vanilla Web Audio has clock drift issues on sustained playback
Solution: Tone.js Transport provides:
- Lookahead scheduling (25ms check interval, 100ms schedule ahead)
- Built-in BPM sync across all sequences
- Effects like BitCrusher, PitchShift for horror mode
- Abstracts Safari/mobile quirks
- ~10-30KB gzipped (acceptable)
```

**Tone.js synth mapping:**
```
Sound   | Tone.js Synth    | Character
--------|------------------|------------------
kick    | MembraneSynth    | Deep pitched membrane
snare   | NoiseSynth       | Filtered white noise
hihat   | MetalSynth       | Metallic inharmonic
bass    | MonoSynth        | Triangle wave + filter
lead    | MonoSynth        | Square wave + filter
```

**Files modified:**
- PLAN.md - Added research findings, corruption algorithm, JSON schema
- src/core/AudioEngine.js - Complete rewrite for Tone.js
- src/core/Sequencer.js - Complete rewrite for Tone.Transport/Sequence
- src/main.js - Async init, start overlay handling, keyboard shortcuts
- index.html - Tone.js CDN, start overlay markup
- style.css - Start overlay, beat indicator styles

**Next steps:**
- Test Phase 1 in browser
- Begin Phase 2: Drag-drop interface

**Blocking issues:** None

---

### 2026-01-18 - Phase 2: Incredibox Core

**What was done:**
- Saved Phase 1 milestone to `phases/01-foundation/` with git tag `v0.1.0-phase1`
- Implemented drag-drop interface:
  - Created `src/ui/DragDrop.js` - HTML5 Drag and Drop handler
  - Palette icons draggable to slots
  - Slots draggable to other slots (move) or palette (remove)
- Added mute/solo controls:
  - M button per slot toggles mute (volume 0, pattern keeps playing)
  - S button toggles solo (mutes all others)
  - Only one slot can be soloed at a time
- Slots now empty by default (drop sounds to assign)
- Quantized activation: sounds start on next bar boundary
- Keyboard shortcuts: 1-7 mute slots, Space/Esc reset

**Files created:**
- `src/ui/DragDrop.js` - Drag-drop handler class
- `phases/01-foundation/` - Phase 1 milestone snapshot

**Files modified:**
- `src/main.js` - Complete rewrite for Phase 2 mechanics
- `style.css` - Drag states, mute/solo buttons, empty slot styling
- `index.html` - Added DragDrop.js script, updated phase badge

**Phase 2 Features Checklist:**
- [x] Drag icon from palette to slot
- [x] Drag slot to palette to remove
- [x] Drag slot to slot to move/swap
- [x] Mute button (M) - slot plays silently
- [x] Solo button (S) - mute all other slots
- [x] Quantized start (sounds begin on next bar)
- [x] Empty slots by default
- [x] Visual feedback during drag

**Next steps:**
- Test Phase 2 in browser
- Begin Phase 3: Sample-based audio (Tone.Player)

**Blocking issues:** None

---

## Architecture Notes

```
Phase Progression:
1. Foundation     - Click-toggle, synth sounds (CURRENT)
2. Incredibox     - Drag-drop, mute/solo
3. Audio          - MP3 samples, loop A/B
4. Data-Driven    - JSON config, modding
5. Bonus          - Combo detection, videos
6. Horror         - Corruption system, effects
7. Polish         - Recording, export, mobile
```

## Key Design Decisions

### Audio Architecture (Updated)
- **Library:** Tone.js (not vanilla Web Audio) - solves clock drift, lookahead scheduling
- Phase 1-2: Synthesized (Tone.js synths) - simpler, no assets needed
- Phase 3+: Sample-based (Tone.Player) - richer sound, more memory
- Horror effects: Tone.BitCrusher, Tone.FrequencyShifter, Tone.Distortion

### Corruption System (Phase 6)
- Progressive, not binary (0-100% per character)
- Spreads between adjacent characters
- Audio effects scale: normal → detuning → bit crushing → full distortion
- Visual effects scale similarly
- Reversible through specific "cure" combos

### Data Format (Phase 4)
- Incredibox-compatible-ish structure for familiarity
- JSON config + asset folders
- Support for community themes/mods

## Known Issues / Tech Debt

- [ ] Phase 1 needs browser testing with Tone.js
- [ ] No mobile touch support yet (Phase 7)
- [x] Audio context initialized via start overlay (solved)

## Related Resources

- [Tone.js Docs](https://tonejs.github.io/) - Primary audio library
- [Tone.js GitHub](https://github.com/Tonejs/Tone.js)
- [Incredibox Mod Docs](https://www.incredibox.com/mod/doc)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- Internal: `docs/research/Music Game Mechanics & Architecture Research.md`

---

### 2026-01-19 - Phase 3 & 4 Completion: Data-Driven Audio & Assets
**What was done:**
- **Fixed Audio State Loss Bug**:
  - Diagnosed `Tone.Transport.scheduleOnce` failing on looped transport.
  - Replaced with direct `Tone.Sequence` and `Tone.Player` sync, which aligns naturally to Transport.
  - Verified routing persistence for all slots (0-6).
- **Audio Polish**:
  - Tuned `MetalSynth` (Hi-Hat) for a tighter, crisper "tsk" sound (shorter decay/release, adjusted modulation).
- **Asset Pipeline**:
  - Generated instrument icons (neon style).
  - Created Python script (`make_icons.py`) to programmatically remove black backgrounds for transparency.
  - Verified icons load correctly in the UI.

**Technical Decisions:**
- **Synchronous startPattern**: Instead of scheduling a callback (which can be dropped if the time is "in the past" relative to loop start), we now instantiate the source immediately. `Tone.Sequence.start(0)` ensures musical timing is correct regardless of when the object is created.
- **Background Removal**: Since image generation often produces solid backgrounds, a post-processing script using `PIL` was established as a standard workflow for assets.

**Status:**
- Phase 3 (Audio Engine) is stable.
- Phase 4 (Data/Assets) foundations are solid with working Asset Pipeline.
- Ready for deeper Horror Mode integrations.

*Last updated: 2026-01-19*
