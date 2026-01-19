# wrenchbox - Development Plan

A learning-focused music creation engine, built iteratively from simple to complex.

## Philosophy

Each phase produces a **working, playable build**. No phase depends on future work - you can stop at any phase and have a complete product.

---

## Completed Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation (Tone.js) | ✅ Complete |
| 2 | Incredibox Core (Drag-Drop) | ✅ Complete |
| 3 | Sample-Based Audio | ✅ Complete |
| 4 | Bonus System | ✅ Complete |
| 5 | Horror Mode | ✅ Complete |
| 6 | Data-Driven Theming | ✅ Complete |
| 7 | Polish & Recording | 🔮 Future |

---

## Key Architectural Decisions (from Research)

### Audio Engine: Tone.js
Based on deep research, **Tone.js** is recommended over vanilla Web Audio API:
- Solves the critical "clock drift" problem with built-in `Transport`
- Provides lookahead scheduling (25ms interval, 100ms ahead)
- Built-in effects (`BitCrusher`, `PitchShift`) for horror mode
- Abstracts Safari/mobile quirks
- ~10-30KB gzipped (acceptable overhead)

### Harmonic Constraint System
To ensure "any combination sounds good":
- **All loops in a version must share the same BPM and Root Key**
- Enforce uniform tempo (e.g., 120 BPM) and key (e.g., C Minor)
- Avoid real-time pitch shifting (artifacts, CPU cost)
- Use Camelot Wheel for future key-change features

### Corruption Algorithm: Cellular Automata
Horror mode uses progressive infection, not binary toggle:
```
If slot[i] is corrupted:
  For each neighbor (i-1, i+1):
    Apply probability P (spreadRate) to infect per tick
```

### Mobile Constraints
- iOS Safari: ~300-400MB RAM limit (lazy load horror assets)
- Android: 100ms+ latency (masked by bar quantization)
- Requires "Click/Tap to Start" overlay to unlock AudioContext

---

## Phase 1: Foundation ✅

**Goal**: Click-to-toggle sound mixer with Tone.js

### Features
- [x] 7 character slots (visual only, no drag-drop yet)
- [x] Click character to toggle sound on/off
- [x] 5 synthesized sounds using Tone.js
  - Kick (MembraneSynth)
  - Snare (NoiseSynth + filter)
  - Hi-hat (MetalSynth)
  - Bass (MonoSynth, triangle wave)
  - Lead (MonoSynth, square wave)
- [x] Pattern-based sequencer using Tone.Sequence
- [x] Visual feedback (active/inactive states)
- [x] Reset all button
- [x] "Click to Start" overlay (unlocks audio)

### Technical Stack
- Tone.js (CDN)
- Vanilla JavaScript (ES6)
- CSS Grid/Flexbox

### Learning Outcomes
- Tone.js basics (Transport, Synths, Sequences)
- Lookahead scheduling concept
- Pattern arrays for sequencing

---

## Phase 2: Incredibox Core ✅

**Goal**: Drag-drop interface with mute/solo controls

### Features
- [x] Icon palette with category colors
- [x] Drag icon → drop on character slot
- [x] Drag off character to remove sound
- [x] Mute button per slot (volume 0, keeps playing)
- [x] Solo button per slot (mute all others)
- [x] Replace sound by dropping new icon on occupied slot
- [x] Quantized activation (sound starts on next bar)
- [x] Keyboard shortcuts (1-7 mute, Space/Esc reset)

### Technical Additions
- HTML5 Drag and Drop API
- Tone.js Channel for per-slot volume/mute
- State management for slots

### Learning Outcomes
- HTML5 Drag and Drop
- State management patterns
- Audio routing with Tone.js

---

## Phase 3: Sample-Based Audio ✅

**Goal**: Support pre-recorded loops alongside synths

### Features
- [x] SampleManager for loading audio files
- [x] Tone.Player for loop playback
- [x] Loop A/B alternation (variation system)
- [x] Graceful fallback to synths when samples unavailable
- [x] Micro-fade on stop (prevent clicks)

### Audio Specifications
```
Format:     OGG Vorbis (primary), MP3 (fallback)
Sample Rate: 44.1kHz
Bit Depth:   16-bit
Channels:    Stereo for music, mono for SFX
Target Size: 50-100KB per loop
```

### Learning Outcomes
- Sample playback vs synthesis
- Asset loading strategies
- Seamless looping techniques

---

## Phase 4: Bonus System ✅

**Goal**: Unlock animated sequences with specific combos

### Features
- [x] BonusManager detects combos
- [x] Animated overlay when bonus triggers
- [x] Multiple animation types (pulse, wave, shake, disco, fireworks)
- [x] Bonus indicator badges in header
- [x] Repeatable vs one-time bonuses
- [x] Particle system for fireworks effect

### Bonuses
| Name | Combo | Animation |
|------|-------|-----------|
| Full Beat | kick + snare + hihat | pulse |
| Melody Master | bass + lead | wave |
| Low End Theory | kick + bass | shake |
| Groove Machine | kick + snare + bass | disco |
| Full Band | all 5 sounds | fireworks |

### Learning Outcomes
- Set comparison algorithms
- CSS keyframe animations
- Overlay layer management

---

## Phase 5: Horror Mode ✅

**Goal**: Progressive corruption mechanic with audio/visual transformation

### Features
- [x] Corruption state per slot (0-100%)
- [x] Trigger: Placing "cursed" (💀) sound
- [x] Spread: Cellular automata to neighbors
- [x] Audio transformation via effect chain
- [x] Visual transformation (CSS filters + glitch)
- [x] Multiple corruption tiers
- [x] Cure button to reduce corruption

### Corruption Tiers
| Level | Audio Effect | Visual Effect |
|-------|--------------|---------------|
| 0-24% | None | None |
| 25-49% | Subtle detuning | Slight hue shift, wobble |
| 50-74% | Bitcrushing (12→8 bit) | Glitch flicker, desaturation |
| 75-99% | Ring mod + distortion | Hard glitch, chromatic aberration |
| 100% | All effects maxed | Full inversion, chaos |

### Audio Effect Chain (Tone.js)
```javascript
PitchShift → BitCrusher → FrequencyShifter → Distortion → Tremolo
```

### Learning Outcomes
- Real-time audio effects processing
- Cellular automata algorithms
- CSS filter animations
- State-driven transformation

---

## Phase 6: Data-Driven Theming ✅

**Goal**: JSON configuration for easy theming/modding

### Features
- [x] `theme.json` defines all sounds, icons, colors
- [x] ThemeLoader for dynamic config loading
- [x] Theme folder structure for drop-in mods
- [x] URL parameter support: `?theme=my-theme`
- [x] CSS variable injection for colors
- [x] Graceful fallback (emoji icons, synth sounds)

### Theme Structure
```
themes/my-theme/
├── theme.json          # Config (required)
├── sounds/             # Audio loops (.ogg)
├── icons/              # Sound icons (.png, .svg)
├── backgrounds/        # Stage backgrounds
└── effects/            # Bonus/corruption effects
```

### theme.json Schema
```json
{
  "meta": { "name": "Theme Name", "bpm": 120, "key": "C Minor" },
  "colors": { "accent": "#00ffff", "beats": "#ff4444", ... },
  "sounds": { "kick": { "pattern": [...], "icon": "icons/kick.png" } },
  "bonuses": [ { "requiredSounds": ["kick", "snare"], ... } ],
  "corruption": { "enabled": true, "spreadRate": 0.4 }
}
```

### Learning Outcomes
- Separation of data and code
- JSON schema design
- Dynamic asset loading
- Mod/plugin architecture

---

## Phase 7: Polish & Recording 🔮

**Goal**: Production-ready features (Future)

### Planned Features
- [ ] Record session (capture user actions)
- [ ] Playback recording
- [ ] Export as audio file (Tone.Recorder)
- [ ] Share link generation (encode state in URL)
- [ ] Mobile touch support
- [ ] Fullscreen mode
- [ ] Accessibility (reduce motion, visual indicators)

---

## File Structure

```
wrenchbox/
├── index.html              # Main entry point
├── style.css               # Global styles
├── PLAN.md                 # This file
├── DEVLOG.md               # Session tracking
├── src/
│   ├── core/
│   │   ├── AudioEngine.js      # Tone.js wrapper
│   │   ├── Sequencer.js        # Pattern timing
│   │   ├── SampleManager.js    # Audio sample loading
│   │   ├── BonusManager.js     # Combo detection
│   │   ├── CorruptionManager.js # Horror mode logic
│   │   └── HorrorEffects.js    # Audio/visual effects
│   ├── ui/
│   │   ├── DragDrop.js         # Drag-drop handling
│   │   └── BonusOverlay.js     # Bonus animations
│   └── data/
│       ├── ThemeLoader.js      # JSON config loading
│       ├── samples.js          # Sample definitions
│       └── bonuses.js          # Bonus definitions
├── themes/
│   ├── README.md           # Theme creation guide
│   └── default/
│       └── theme.json      # Default theme config
└── phases/                 # Milestone snapshots
    ├── 01-foundation/
    ├── 02-incredibox/
    ├── 04-bonus/
    └── 05-horror/
```

---

## Current Status

**All core phases complete!** (1-6)

The engine is fully functional with:
- Drag-drop sound mixing
- Mute/solo controls
- Bonus combo detection
- Horror mode corruption
- Data-driven theming

**Next steps**: Add assets (sounds, icons, backgrounds) to create custom themes.

---

## Research References

See `docs/research/` for detailed findings:
- `Music Game Mechanics & Architecture Research.md` - Comprehensive technical analysis
- Lookahead scheduling, cellular automata, DSP techniques, legal considerations
