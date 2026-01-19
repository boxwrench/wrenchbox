# Development Log

This file tracks development sessions, decisions, and context for continuity across sessions and devices. Claude (or any AI assistant) should read this first when picking up the project.

---

## Project Status

**Current State:** Phase 1 - Foundation complete (Tone.js refactor done)
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

*Last updated: 2026-01-18*
