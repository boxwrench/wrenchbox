# wrenchbox - Development Plan

A learning-focused music creation engine, built iteratively from simple to complex.

## Philosophy

Each phase produces a **working, playable build**. No phase depends on future work - you can stop at any phase and have a complete product.

---

## Phase 1: Foundation (webchestra-level)

**Goal**: Click-to-toggle sound mixer with synthesized audio

### Features
- [ ] 7 character slots (visual only, no drag-drop yet)
- [ ] Click character to toggle sound on/off
- [ ] 5 synthesized sounds (Web Audio API oscillators)
  - Kick (sine wave pitch bend)
  - Snare (filtered noise)
  - Hi-hat (highpass noise)
  - Bass (triangle wave pattern)
  - Lead (square wave pattern)
- [ ] Pattern-based sequencer (8-beat drums, 64-beat melodies)
- [ ] Visual feedback (active/inactive states)
- [ ] Reset all button

### Technical Stack
- Single `index.html` file
- Vanilla JavaScript
- Web Audio API
- CSS Grid/Flexbox

### Learning Outcomes
- Web Audio API basics (oscillators, gain nodes, filters)
- Scheduling and timing
- Pattern arrays for sequencing

---

## Phase 2: Incredibox Core

**Goal**: Drag-drop interface with mute/solo controls

### Features
- [ ] Icon palette (4 categories × 5 icons = 20 sounds)
- [ ] Drag icon → drop on character slot
- [ ] Drag off character to remove sound
- [ ] Click character to mute/unmute (sound keeps playing, volume 0)
- [ ] Solo button per slot (mute all others)
- [ ] Replace sound by dropping new icon on occupied slot
- [ ] Category colors (beats=red, effects=blue, melodies=green, voices=yellow)

### Technical Additions
- Drag and Drop API
- Slot management system
- Gain node control for mute (not stop)
- State machine for character states

### Learning Outcomes
- HTML5 Drag and Drop
- State management patterns
- Audio routing (gain nodes as volume control)

---

## Phase 3: Audio Expansion

**Goal**: Replace synthesized sounds with sample-based audio

### Features
- [ ] Load MP3/WAV samples instead of oscillators
- [ ] Loop A/B alternation (variation system)
- [ ] All loops same duration (configurable BPM/bars)
- [ ] Quantized start (new sounds wait for next bar)
- [ ] Crossfade on loop boundaries

### Technical Additions
- AudioBuffer and AudioBufferSourceNode
- fetch() for loading audio files
- Beat-aligned scheduling with AudioContext.currentTime
- Double-buffering for seamless loops

### Learning Outcomes
- Sample playback vs synthesis
- Precise audio scheduling
- Buffer management

---

## Phase 4: Data-Driven System

**Goal**: JSON configuration for easy theming/modding

### Features
- [ ] `config.json` defines all sounds, icons, colors
- [ ] Dynamic UI generation from config
- [ ] Hot-reload config during development
- [ ] Mod folder structure (sounds/, icons/, config.json)

### Config Structure
```json
{
  "name": "My Theme",
  "bpm": 90,
  "loopBars": 4,
  "categories": [
    {
      "name": "beats",
      "color": "#ff4444",
      "sounds": [
        { "id": "kick", "icon": "kick.svg", "audio": "kick.mp3" }
      ]
    }
  ],
  "slots": 7
}
```

### Learning Outcomes
- Separation of data and code
- Dynamic asset loading
- Mod/theme architecture

---

## Phase 5: Bonus System

**Goal**: Unlock animated sequences with specific combos

### Features
- [ ] Define bonus combos in config
- [ ] Detect when combo is active
- [ ] Play bonus video/animation
- [ ] Bonus icon display
- [ ] Return to normal after bonus ends

### Technical Additions
- Combo detection algorithm
- Video element integration
- Animation overlay system

### Learning Outcomes
- Set comparison algorithms
- Media synchronization
- Layer management (game + bonus overlay)

---

## Phase 6: Sprunki Horror Mode

**Goal**: Add the horror/corruption mechanic

### Features
- [ ] Normal mode vs Horror mode toggle
- [ ] "Corruption" state per character
- [ ] Visual transformation (sprites swap)
- [ ] Audio transformation (sounds distort/change)
- [ ] Trigger conditions (specific combos, random chance, timer)
- [ ] Atmosphere effects (screen shake, color shift, glitch)
- [ ] Horror-specific bonuses

### Technical Additions
- Dual asset sets (normal + horror)
- Audio effects (distortion, pitch shift, reverb)
- CSS filters and animations for visual effects
- WebGL shaders (optional, for advanced effects)

### Learning Outcomes
- Audio effects processing
- State-driven asset swapping
- Visual effects techniques
- Atmosphere/mood design

---

## Phase 7: Polish & Recording

**Goal**: Production-ready features

### Features
- [ ] Record session (capture all actions)
- [ ] Playback recording
- [ ] Export as audio file (MediaRecorder API)
- [ ] Share link generation
- [ ] Auto-play mode (random composition)
- [ ] Mobile touch support
- [ ] Fullscreen mode
- [ ] Keyboard shortcuts

### Learning Outcomes
- MediaRecorder API
- Action replay systems
- Cross-platform input handling

---

## File Structure

```
wrenchbox/
├── index.html              # Main entry point
├── style.css               # Global styles
├── PLAN.md                 # This file
├── src/
│   ├── core/
│   │   ├── AudioEngine.js  # Web Audio management
│   │   ├── Sequencer.js    # Beat/pattern timing
│   │   └── SlotManager.js  # Character slot state
│   ├── ui/
│   │   ├── DragDrop.js     # Drag-drop handling
│   │   ├── Renderer.js     # UI updates
│   │   └── Effects.js      # Visual effects
│   ├── data/
│   │   └── ConfigLoader.js # JSON config parsing
│   └── utils/
│       └── helpers.js      # Utility functions
├── assets/
│   ├── sounds/             # Audio files
│   ├── sprites/            # Character animations
│   ├── icons/              # Draggable sound icons
│   └── backgrounds/        # Stage backgrounds
├── themes/                 # Mod/theme folders
│   └── default/
│       ├── config.json
│       ├── sounds/
│       └── icons/
└── phases/                 # Milestone snapshots
    ├── 01-foundation/
    ├── 02-incredibox/
    └── 03-sprunki/
```

---

## Current Status

**Active Phase**: 1 - Foundation

**Next Milestone**: Playable click-to-toggle mixer with 5 synth sounds

---

## Development Notes

- Each phase gets committed as a working state
- `phases/` folder contains snapshots you can revert to
- Test in Chrome first (best Web Audio support)
- Mobile testing starts Phase 7
