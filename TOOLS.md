# wrenchbox Tools & Resources

Curated list of tools for developing wrenchbox, organized by category.

---

## AI-Assisted Development

### Code & General
| Tool | Use Case | Notes |
|------|----------|-------|
| **Antigravity IDE** | Primary development | Based on Cursor/VS Code |
| **Claude** | Code generation, research | Current assistant |
| **GitHub Copilot** | Code completion | VS Code extension |

### Art & Assets
| Tool | Use Case | Notes |
|------|----------|-------|
| **Nano Banana** | AI image generation | Google Gemini 2.5 Flash Image |
| **Nano Banana Pro** | Higher quality images | Gemini 3 Pro Image, up to 4K |
| **Midjourney** | Character concept art | Discord-based |
| **DALL-E 3** | Quick concepts | ChatGPT integrated |

### Music & Audio
| Tool | Use Case | Notes |
|------|----------|-------|
| **Suno AI** | Full song generation | v4.5+, stem extraction on Premier plan |
| **Udio** | Alternative to Suno | Similar capabilities |
| **AIVA** | MIDI + stems export | MP3, WAV, MIDI, stems |
| **Stable Audio** | Sound effects | Stability AI |

---

## AI MIDI Generators

| Tool | Type | Best For | Notes |
|------|------|----------|-------|
| **AIVA** | Web app | Full compositions | Exports MIDI, MP3, WAV, stems |
| **Magenta Studio** | Ableton plugin | DAW integration | Offline, AI-powered, appears abandoned |
| **Hookpad Aria** | Web app | Co-writing | 2024 release, chord progressions |
| **MIDI Agent** | VST3/AU plugin | DAW integration | LLM-powered, bring-your-own-key |
| **AudioCipher** | DAW plugin | Text-to-MIDI | v4.0 (Sept 2024), chord inversions |
| **Suno Studio** | Web app | Stem-to-MIDI | Transcribes audio → MIDI (Premier plan) |

### Free/Open Source MIDI Tools
| Tool | Use Case | Link |
|------|----------|------|
| **Magenta.js** | Browser-based AI music | [magenta.github.io](https://magenta.github.io/magenta-js/) |
| **Tone.js** | Web Audio framework | [tonejs.github.io](https://tonejs.github.io/) |
| **midi.js** | MIDI file parsing | [github.com/mudcube/MIDI.js](https://github.com/mudcube/MIDI.js) |

---

## Audio Libraries (Web)

| Library | Size | Best For | Synth | Samples | 3D Audio |
|---------|------|----------|-------|---------|----------|
| **Vanilla Web Audio API** | 0KB | Full control, learning | ✅ | ✅ | ✅ |
| **Howler.js** | ~7KB | Game audio, simple playback | ❌ | ✅ | ✅ (plugin) |
| **Tone.js** | ~150KB | Music creation, sequencing | ✅ | ✅ | ✅ |
| **Pizzicato.js** | ~15KB | Simple effects chain | ❌ | ✅ | ❌ |
| **Wavesurfer.js** | ~50KB | Waveform visualization | ❌ | ✅ | ❌ |

### Recommendation for wrenchbox
- **Phase 1-2:** Vanilla Web Audio API (learning, no dependencies)
- **Phase 3+:** Consider Howler.js (sample playback) or Tone.js (if adding synthesis)

---

## Audio File Formats

| Format | Compression | Loop Support | Browser Support | Use Case |
|--------|-------------|--------------|-----------------|----------|
| **WAV** | None | ✅ Seamless | All | Short SFX, highest quality |
| **OGG Vorbis** | Lossy | ✅ Seamless | All except Safari | Background music, loops |
| **MP3** | Lossy | ❌ Gap issues | All | Fallback, wide compatibility |
| **Opus** | Lossy | ✅ Seamless | Modern browsers | Best quality/size, low latency |
| **WebM** | Lossy | ✅ | Most browsers | Alternative to OGG |
| **AAC (M4A)** | Lossy | ✅ | All (in MP4) | Safari-friendly alternative |

### Recommended Strategy
```
Primary:   OGG Vorbis (best loop support, good compression)
Fallback:  MP3 (Safari compatibility)
SFX:       WAV (no compression artifacts for short sounds)
```

### Audio Specs for Game Loops
- **Sample Rate:** 44.1kHz or 48kHz
- **Bit Depth:** 16-bit
- **Channels:** Stereo for music, mono for SFX
- **Target Size:** 50-100KB per loop (Incredibox standard)

---

## VS Code / Antigravity Extensions

### Essential for This Project
| Extension | Purpose |
|-----------|---------|
| **Live Server** | Local dev server with hot reload |
| **Audio Preview** | Preview audio files in editor |
| **ESLint** | JavaScript linting |
| **Prettier** | Code formatting |
| **GitLens** | Git history visualization |

### Helpful Additions
| Extension | Purpose |
|-----------|---------|
| **Color Highlight** | Visualize color codes in CSS |
| **CSS Peek** | Jump to CSS definitions |
| **Path Intellisense** | Autocomplete file paths |
| **TODO Highlight** | Highlight TODO/FIXME comments |
| **Error Lens** | Inline error display |
| **Thunder Client** | API testing (if adding backends) |

### Audio-Specific (Optional)
| Extension | Purpose |
|-----------|---------|
| **Aural Coding** | Keyboard sounds while typing (fun) |
| **Sound-in-Code** | Play audio from within VS Code |

---

## Sprite & Animation Tools

### Creation
| Tool | Type | Best For |
|------|------|----------|
| **Aseprite** | Pixel art editor | Sprite sheets, animations |
| **Piskel** | Free web-based | Quick pixel art |
| **Nano Banana** | AI generation | Character concepts |
| **Adobe Animate** | Vector animation | Incredibox-style (Flash heritage) |
| **Spine** | 2D skeletal animation | Complex character animation |

### Sprite Sheet Tools
| Tool | Purpose |
|------|---------|
| **TexturePacker** | Sprite sheet packing |
| **ShoeBox** | Free alternative |
| **Leshy SpriteSheet Tool** | Web-based, free |

### Format Conversion
| Tool | Converts |
|------|----------|
| **ImageMagick** | CLI image processing |
| **FFmpeg** | Audio/video conversion |
| **Sharp (Node.js)** | Programmatic image processing |

---

## Audio Production

### DAWs (Digital Audio Workstations)
| Tool | Cost | Notes |
|------|------|-------|
| **Audacity** | Free | Basic editing, good for trimming loops |
| **LMMS** | Free | Full DAW, MIDI support |
| **GarageBand** | Free (Mac) | Easy loop creation |
| **FL Studio** | Paid | Industry standard for electronic |
| **Ableton Live** | Paid | Great for loops, Magenta integration |
| **Reaper** | $60 | Professional, affordable |

### Audio Effects & Processing
| Tool | Use Case |
|------|----------|
| **iZotope RX** | Audio cleanup |
| **Soundtrap** | Browser-based DAW |
| **BandLab** | Free online DAW |

### AI Stem Separation
| Tool | Notes |
|------|-------|
| **Demucs** | Meta's open-source separator |
| **Spleeter** | Deezer's separator |
| **LALAL.AI** | Web service |
| **Moises.ai** | Web/mobile app |

---

## Horror/Glitch Effects

### Audio Effects (for corruption)
| Effect | Library/Tool | Parameters |
|--------|--------------|------------|
| **Bit Crushing** | Tone.js BitCrusher | bits: 1-16 |
| **Ring Modulation** | Web Audio OscillatorNode | frequency |
| **Pitch Wobble** | Web Audio detune | cents: ±100 |
| **Distortion** | Web Audio WaveShaperNode | curve |
| **Reverse Reverb** | Convolver with reversed IR | wet/dry |
| **Granular** | Tone.js GrainPlayer | grainSize |

### Visual Effects (CSS/Canvas)
| Effect | Implementation |
|--------|----------------|
| **Glitch/RGB Split** | CSS filter + animation |
| **Scanlines** | CSS pseudo-element overlay |
| **Chromatic Aberration** | Separate RGB channels offset |
| **Screen Shake** | CSS transform: translate |
| **Noise/Static** | Canvas noise generation |
| **CRT Effect** | WebGL shader |
| **Face Distortion** | Canvas pixel manipulation |

### Libraries for Effects
| Library | Use Case |
|---------|----------|
| **PixiJS** | 2D WebGL rendering, filters |
| **Three.js** | 3D/shader effects |
| **GSAP** | Animation library |
| **Anime.js** | Lightweight animations |

---

## Data & Config

### JSON Editors
| Tool | Notes |
|------|-------|
| **VS Code** | Built-in JSON support |
| **JSON Editor Online** | Web-based visual editor |
| **jq** | CLI JSON processor |

### Validation
| Tool | Use |
|------|-----|
| **JSON Schema** | Define config structure |
| **Ajv** | JS schema validator |
| **Zod** | TypeScript-first validation |

---

## Testing & Debugging

### Browser DevTools
- **Chrome DevTools** - Best Web Audio debugging
- **Audion Extension** - Web Audio graph visualizer

### Performance
| Tool | Measures |
|------|----------|
| **Chrome Performance tab** | Frame timing, CPU |
| **Lighthouse** | Overall web performance |
| **stats.js** | In-page FPS counter |

### Audio Testing
| Tool | Purpose |
|------|---------|
| **Web Audio Inspector** | Debug audio graph |
| **Tone.js Transport** | Precise timing tests |

---

## Hosting & Deployment

| Platform | Cost | Notes |
|----------|------|-------|
| **GitHub Pages** | Free | Static hosting, good for demos |
| **Vercel** | Free tier | Auto-deploy from GitHub |
| **Netlify** | Free tier | Similar to Vercel |
| **itch.io** | Free | Game-focused, community |

---

## Community & Inspiration

### Incredibox Modding
- [mod.io/g/incredibox](https://mod.io/g/incredibox) - Official mod hub
- [Incredibox Mod Docs](https://www.incredibox.com/mod/doc) - Technical specs

### Open Source Music Games
- [webchestra](https://github.com/mikebionic/webchestra) - Simple Incredibox-style
- [Chrome Music Lab](https://musiclab.chromeexperiments.com/) - Educational toys

### Audio Programming
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tone.js Docs](https://tonejs.github.io/docs/)
- [The Audio Programmer (YouTube)](https://www.youtube.com/@TheAudioProgrammer)

---

## Quick Start Checklist

### Phase 1 (Now)
- [ ] Live Server extension installed
- [ ] Audio Preview extension installed
- [ ] Test scaffold in browser
- [ ] Verify audio works on click

### Phase 3 (When adding samples)
- [ ] Audacity for audio editing
- [ ] OGG/MP3 encoder ready
- [ ] Consider Howler.js

### Phase 4 (When adding modding)
- [ ] JSON schema defined
- [ ] Asset folder structure documented
- [ ] Validation in place

### Phase 6 (Horror mode)
- [ ] Research Tone.js effects
- [ ] Test CSS glitch effects
- [ ] Plan corruption audio chain

---

*Last updated: 2026-01-18*
