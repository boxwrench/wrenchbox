# Deep Research Prompt: Music Layering Game Mechanics & Architecture

## Context
I'm building "wrenchbox" - an open-source music creation engine inspired by Incredibox,
My Singing Monsters, DropMix, and Sprunki. The goal is a web-based (HTML/JS/Web Audio API)
game where users layer sounds via characters/slots, with an eventual "horror mode"
transformation mechanic.

## Research Areas

### 1. AUDIO ENGINE ARCHITECTURE

Investigate how these games handle audio synchronization:

- **Loop quantization**: How do Incredibox/Sprunki ensure all loops stay in sync?
  What happens when a new sound is added mid-bar? Do they wait for the next downbeat?

- **Stem separation**: How does Fuser split songs into 4 stems (drums/bass/lead/vocals)?
  Is this done manually per song or via AI separation (like Spleeter/Demucs)?

- **Key/tempo matching**: DropMix and Fuser auto-match key and tempo. What algorithms
  are used? Time-stretching (phase vocoder, WSOLA)? Pitch shifting? Are there open-source
  implementations?

- **Web Audio API specifics**: What are the best practices for seamless looping with
  AudioBufferSourceNode? How do you handle the gap between loop iterations?
  Double-buffering techniques?

- **Latency compensation**: How do rhythm games compensate for audio latency across
  different devices/browsers?

### 2. GAME DESIGN PATTERNS

Analyze the interaction design of music layering games:

- **Affordances**: How does each game communicate what's draggable, droppable,
  mutable, soloable? What visual language do they use?

- **Feedback loops**: What immediate feedback do players get when adding/removing sounds?
  Visual pulses? Character animations? Waveform displays?

- **Constraint systems**: How do games prevent "bad" combinations? Do they allow
  dissonance or guide players toward harmony? Does DropMix's power level system
  create automatic "good" mixes?

- **Discovery mechanics**: How do players discover bonus combos in Incredibox?
  Is it trial-and-error or are there hints? How does Sprunki reveal lore through
  specific combinations?

- **Progression systems**: My Singing Monsters has breeding/leveling. Could wrenchbox
  have unlockable sounds, characters, or modes? What's the psychology of unlocks in
  music games specifically?

### 3. HORROR/TRANSFORMATION MECHANICS

Deep dive into Sprunki's corruption system and similar mechanics:

- **Trigger design**: What makes a good horror trigger? Instant vs gradual?
  Player-initiated vs automatic? Reversible vs permanent?

- **Audio horror techniques**: What specific audio processing creates "corrupted" sound?
  Bit crushing, ring modulation, granular synthesis, reverse reverb, pitch wobble?
  What sample rates/bit depths create that "degraded" feel?

- **Visual horror techniques**: Glitch effects, chromatic aberration, scanlines,
  frame stuttering, face distortion. How are these implemented in web (CSS filters,
  WebGL shaders, canvas manipulation)?

- **Psychological pacing**: How does Sprunki pace the horror? Does corruption accelerate?
  Are there "safe" moments? How does FNAF handle tension/release cycles?

- **Narrative through mechanics**: How does Sprunki reveal lore through gameplay
  (not cutscenes)? What combinations unlock story beats?

### 4. TECHNICAL IMPLEMENTATION

Research specific to web-based implementation:

- **Tone.js vs vanilla Web Audio API**: Tradeoffs? Is Tone.js overkill for this use case?
  What about Howler.js for simpler sample playback?

- **State management patterns**: How should slot state, corruption state, and audio
  state be synchronized? Is a state machine appropriate? Event-driven architecture?

- **Performance budgets**: How many simultaneous audio sources can Web Audio handle
  before degradation? What's the memory footprint of keeping 20+ samples loaded?

- **Offline/PWA considerations**: Can the game work offline? Service worker caching
  for audio assets?

- **Accessibility**: How do music games handle accessibility? Visual representations
  of audio for deaf players? Alternative input methods?

### 5. MODDING & DATA-DRIVEN DESIGN

How do these games support user-created content:

- **Incredibox mod format**: What's the exact JSON schema? Sprite sheet format?
  Audio requirements? How are bonuses defined?

- **My Singing Monsters Composer**: How does the piano roll work? What's the note
  resolution? Can you do microtiming or is it strictly quantized?

- **Mod distribution**: How do communities share mods? Itch.io? mod.io? Custom loaders?
  What validation/safety checks exist?

- **Tooling**: What tools do modders use? Are there community-built editors?
  What would make wrenchbox easy to mod?

### 6. LEGAL & ETHICAL CONSIDERATIONS

- **Music licensing**: How do DropMix/Fuser handle licensing for commercial songs?
  What about user-uploaded content? DMCA implications?

- **Fan game precedents**: How have Incredibox and Nintendo responded to fan games?
  What keeps Sprunki legal (parody, transformative work)?

- **Age-appropriate horror**: Sprunki is played by kids - how do they balance
  horror with accessibility? Content warnings? Parental controls?

### 7. ADJACENT INSPIRATIONS

Explore related games/tools that might offer unexpected insights:

- **Electroplankton** (Nintendo DS) - How did it handle generative music in 2005?
- **Rez / Tetris Effect** - How does gameplay generate music as a byproduct?
- **Björk's Biophilia** - App-based music creation with educational elements
- **Teenage Engineering OP-1/OP-Z** - Physical devices with game-like interfaces
- **Ableton Note / Koala Sampler** - Mobile DAWs with simplified interfaces
- **Chrome Music Lab** - Educational music toys in browser

### 8. OPEN SOURCE RESOURCES

Find existing code/libraries that could accelerate development:

- **Web Audio API examples**: Drum machines, synthesizers, loopers
- **Tone.js examples**: Sequencers, samplers, effects
- **Game engines with audio focus**: Phaser audio, PixiJS + PixiSound
- **Open source Incredibox clones**: Any with actual code (not just iframes)?
- **Audio visualization**: Waveforms, frequency analyzers, beat detection

## Output Format

For each research area, provide:
1. **Summary**: Key findings in 2-3 sentences
2. **Mechanics breakdown**: How the system works technically
3. **Code patterns**: Pseudocode or real code snippets where applicable
4. **Design implications**: What this means for wrenchbox specifically
5. **Open questions**: What remains unclear or needs prototyping
6. **Sources**: Links to documentation, videos, code repos

## Specific Questions to Answer

1. What's the minimum viable audio engine for an Incredibox clone?
2. How do you make "any combination sound good" like DropMix claims?
3. What's the most effective horror transformation technique for web?
4. How should corruption "spread" between characters mathematically?
5. What makes a mod system successful (easy to create, share, discover)?
6. Can Web Audio API do real-time pitch shifting for tempo matching?
7. What's the best way to structure audio assets for a data-driven system?
8. How do you balance creative freedom with guided "good" outcomes?

---

## How to Use This Prompt

1. Copy this entire document to your AI research tool (Claude, GPT-4, etc.)
2. Generate comprehensive research
3. Save output to `docs/research/` folder
4. Update DEVLOG.md with key findings
5. Apply insights to implementation

---

*Generated: 2026-01-18*
