# Phase 1: Foundation (Milestone)

Snapshot of Phase 1 completion - click-to-toggle mixer with Tone.js.

## Features
- 7 character slots (5 with pre-assigned sounds)
- Click slot to toggle sound on/off
- 5 synthesized sounds via Tone.js:
  - Kick (MembraneSynth)
  - Snare (NoiseSynth + filter)
  - Hi-hat (MetalSynth)
  - Bass (MonoSynth, triangle)
  - Lead (MonoSynth, square)
- Pattern-based sequencer using Tone.Sequence
- Keyboard shortcuts (1-7 for slots, Space/Esc for reset)
- Start overlay (unlocks AudioContext)
- Reset all button

## Tech Stack
- Vanilla HTML/CSS/JS
- Tone.js v14.8.49 (CDN)

## To Run
Open `index.html` in a browser, click to start, click slots to toggle sounds.

## Commit
`707bfbd` - Refactor Phase 1 to Tone.js based on research findings
