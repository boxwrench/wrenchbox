# wrenchbox - Development Plan

A learning-focused music creation engine, built iteratively from simple to complex.

## Philosophy

Each phase produces a **working, playable build**. No phase depends on future work - you can stop at any phase and have a complete product.

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

## Phase 1: Foundation

**Goal**: Click-to-toggle sound mixer with Tone.js

### Features
- [ ] 7 character slots (visual only, no drag-drop yet)
- [ ] Click character to toggle sound on/off
- [ ] 5 synthesized sounds using Tone.js
  - Kick (MembraneSynth)
  - Snare (NoiseSynth + filter)
  - Hi-hat (MetalSynth)
  - Bass (MonoSynth, triangle wave)
  - Lead (MonoSynth, square wave)
- [ ] Pattern-based sequencer using Tone.Sequence
- [ ] Visual feedback (active/inactive states)
- [ ] Reset all button
- [ ] "Click to Start" overlay (unlocks audio)

### Technical Stack
- Tone.js (CDN or npm)
- Vanilla JavaScript (ES6 modules)
- CSS Grid/Flexbox

### Learning Outcomes
- Tone.js basics (Transport, Synths, Sequences)
- Lookahead scheduling concept
- Pattern arrays for sequencing

---

## Phase 2: Incredibox Core

**Goal**: Drag-drop interface with mute/solo controls

### Features
- [ ] Icon palette (4 categories × 5 icons = 20 sounds)
- [ ] Drag icon → drop on character slot
- [ ] Drag off character to remove sound
- [ ] Click character to mute/unmute (volume 0, keeps playing)
- [ ] Solo button per slot (mute all others)
- [ ] Replace sound by dropping new icon on occupied slot
- [ ] Category colors (beats=red, effects=blue, melodies=green, voices=yellow)
- [ ] Quantized activation (sound starts on next bar)

### Technical Additions
- HTML5 Drag and Drop API
- Slot management system
- Tone.js Channel for per-slot volume/mute
- State machine for character states

### Learning Outcomes
- HTML5 Drag and Drop
- State management patterns
- Audio routing with Tone.js

---

## Phase 3: Sample-Based Audio

**Goal**: Replace synthesized sounds with pre-recorded loops

### Features
- [ ] Load MP3/OGG samples using Tone.Player
- [ ] Loop A/B alternation (variation system)
- [ ] All loops same duration (enforced by config)
- [ ] Quantized start (Tone.Transport.scheduleOnce)
- [ ] Micro-fade on stop (prevent clicks)

### Technical Additions
- Tone.Player and Tone.Players
- Asset preloading with Tone.loaded()
- AAC/MP3 for bandwidth, decode to PCM

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

## Phase 4: Data-Driven System

**Goal**: JSON configuration for easy theming/modding

### Features
- [ ] `config.json` defines all sounds, icons, colors
- [ ] Dynamic UI generation from config
- [ ] Hot-reload config during development
- [ ] Mod folder structure

### Config Schema (Research-Validated)
```json
{
  "meta": {
    "name": "Wrenchbox Default",
    "bpm": 120,
    "loopLengthSeconds": 8.0,
    "baseKey": "C Minor",
    "version": "1.0.0"
  },
  "categories": [
    {
      "id": "beats",
      "name": "Beats",
      "color": "#ff4444"
    },
    {
      "id": "effects",
      "name": "Effects",
      "color": "#4488ff"
    },
    {
      "id": "melodies",
      "name": "Melodies",
      "color": "#44ff88"
    },
    {
      "id": "voices",
      "name": "Voices",
      "color": "#ffdd44"
    }
  ],
  "slots": [
    {
      "id": "slot_1",
      "category": "beats",
      "assets": {
        "normal": {
          "sound": "sounds/kick_clean.mp3",
          "icon": "icons/kick.png",
          "animation": "anim/kick_idle.json"
        },
        "horror": {
          "sound": "sounds/kick_distorted.mp3",
          "icon": "icons/kick_evil.png",
          "animation": "anim/kick_glitch.json",
          "audioEffects": ["bitcrusher"]
        }
      }
    }
  ],
  "corruption": {
    "triggerItemId": "cursed_hat",
    "spreadAlgorithm": "neighbor_infection",
    "spreadRate": 0.5,
    "tickIntervalMs": 2000,
    "globalEffectChain": ["bitcrusher", "reverb"]
  },
  "bonuses": [
    {
      "id": "bonus_1",
      "title": "Secret Chorus",
      "requiredSlots": ["beat_1", "melody_2", "voice_1", "voice_3", "effect_2"],
      "video": "bonus/secret_chorus.mp4",
      "loopCount": 2
    }
  ]
}
```

### Learning Outcomes
- Separation of data and code
- JSON schema design
- Dynamic asset loading

---

## Phase 5: Bonus System

**Goal**: Unlock animated sequences with specific combos

### Features
- [ ] Define bonus combos in config
- [ ] Detect when all required slots are active
- [ ] Play bonus video/animation overlay
- [ ] Bonus icon display in UI
- [ ] Return to normal after bonus ends

### Combo Detection Algorithm
```javascript
function checkBonus(activeSlotIds) {
  for (const bonus of config.bonuses) {
    const required = new Set(bonus.requiredSlots);
    const active = new Set(activeSlotIds);
    if ([...required].every(id => active.has(id))) {
      return bonus;
    }
  }
  return null;
}
```

### Learning Outcomes
- Set comparison algorithms
- Video/audio synchronization
- Overlay layer management

---

## Phase 6: Horror Mode (Sprunki-Style)

**Goal**: Progressive corruption mechanic with audio/visual transformation

### Features
- [ ] Corruption state per slot (0-100%)
- [ ] Trigger: Placing specific "cursed" item
- [ ] Spread: Cellular automata to neighbors
- [ ] Audio transformation via effect chain
- [ ] Visual transformation (sprite swap + CSS effects)
- [ ] Multiple corruption tiers with escalating effects
- [ ] Optional "cure" mechanic (specific combos reverse corruption)

### Corruption Tiers
| Level | Audio Effect | Visual Effect |
|-------|--------------|---------------|
| 0-25% | None | None |
| 25-50% | Subtle detuning (+/- 10 cents) | Slight hue shift |
| 50-75% | Bitcrushing (12-bit) | Glitch flicker, desaturation |
| 75-100% | Ring modulation (30Hz) + distortion | Full sprite swap, chromatic aberration |

### Cellular Automata Algorithm
```javascript
function spreadCorruption(slots, spreadRate) {
  const newStates = [...slots];
  for (let i = 0; i < slots.length; i++) {
    if (slots[i].corruption >= 75) {
      // Infect neighbors
      if (i > 0 && Math.random() < spreadRate) {
        newStates[i-1].corruption = Math.min(100, newStates[i-1].corruption + 25);
      }
      if (i < slots.length - 1 && Math.random() < spreadRate) {
        newStates[i+1].corruption = Math.min(100, newStates[i+1].corruption + 25);
      }
    }
  }
  return newStates;
}
```

### Audio Horror Techniques (Tone.js)
```javascript
// Ring Modulation (robotic/metallic)
const ringMod = new Tone.FrequencyShifter(30).toDestination();

// Bitcrushing (degraded digital)
const crusher = new Tone.BitCrusher(4).toDestination();

// Tape Warble (unstable pitch)
const vibrato = new Tone.Vibrato(0.5, 0.3).toDestination();

// Distortion (harsh clipping)
const dist = new Tone.Distortion(0.8).toDestination();
```

### Visual Horror Techniques (CSS)
```css
/* Corruption level 50-75% */
.slot.corrupted-medium {
  filter: hue-rotate(180deg) saturate(0.5);
  animation: glitch 0.3s infinite;
}

/* Corruption level 75-100% */
.slot.corrupted-full {
  filter: invert(100%) contrast(150%);
  animation: glitch-hard 0.1s infinite;
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  25% { transform: translate(-2px, 1px); }
  75% { transform: translate(2px, -1px); }
}
```

### Learning Outcomes
- Real-time audio effects processing
- Cellular automata algorithms
- CSS filter animations
- State-driven asset swapping

---

## Phase 7: Polish & Recording

**Goal**: Production-ready features

### Features
- [ ] Record session (capture all user actions with timestamps)
- [ ] Playback recording
- [ ] Export as audio file (Tone.Recorder → WAV/MP3)
- [ ] Share link generation (encode state in URL)
- [ ] Auto-play mode (random composition)
- [ ] Mobile touch support (touch events + gesture recognition)
- [ ] Fullscreen mode
- [ ] Keyboard shortcuts (1-7 for slots, space for reset)
- [ ] Accessibility (reduce motion toggle, visual audio indicators)

### Learning Outcomes
- Tone.Recorder API
- Action replay systems
- Cross-platform input handling
- PWA considerations

---

## File Structure

```
wrenchbox/
├── index.html              # Main entry point
├── style.css               # Global styles
├── PLAN.md                 # This file
├── DEVLOG.md               # Session tracking
├── TOOLS.md                # Tool recommendations
├── src/
│   ├── core/
│   │   ├── AudioEngine.js  # Tone.js wrapper
│   │   ├── Sequencer.js    # Pattern timing (uses Tone.Transport)
│   │   ├── SlotManager.js  # Character slot state
│   │   └── Corruption.js   # Horror mode logic
│   ├── ui/
│   │   ├── DragDrop.js     # Drag-drop handling
│   │   ├── Renderer.js     # UI updates
│   │   └── Effects.js      # Visual effects (CSS/Canvas)
│   ├── data/
│   │   └── ConfigLoader.js # JSON config parsing
│   └── utils/
│       └── helpers.js      # Utility functions
├── assets/
│   ├── sounds/             # Audio files (OGG/MP3)
│   ├── sprites/            # Character animations
│   ├── icons/              # Draggable sound icons
│   └── backgrounds/        # Stage backgrounds
├── themes/                 # Mod/theme folders
│   └── default/
│       ├── config.json
│       ├── sounds/
│       └── icons/
├── docs/
│   └── research/           # Generated research documents
└── phases/                 # Milestone snapshots
    ├── 01-foundation/
    ├── 02-incredibox/
    └── 03-sprunki/
```

---

## Current Status

**Active Phase**: 1 - Foundation (Tone.js refactor)

**Next Milestone**: Playable click-to-toggle mixer with 5 Tone.js synths

---

## Development Notes

- Each phase gets committed as a working state
- `phases/` folder contains snapshots you can revert to
- Test in Chrome first (best Web Audio support)
- Mobile testing starts Phase 7
- All audio assets must share same BPM and key (harmonic constraint)
- Horror assets lazy-loaded to save mobile memory

---

## Research References

See `docs/research/` for detailed findings:
- `Music Game Mechanics & Architecture Research.md` - Comprehensive technical analysis
- Lookahead scheduling, cellular automata, DSP techniques, legal considerations
