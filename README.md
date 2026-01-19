# wrenchbox

A music creation engine inspired by Incredibox and Sprunki. Drag sounds onto characters to build beats, unlock bonuses with combos, and watch things get weird with horror mode.

**[Try it live](https://boxwrench.github.io/wrenchbox/)** (coming soon)

## Features

- **Drag & Drop Mixing** - Drop sound icons onto character slots to build your beat
- **Mute/Solo Controls** - Fine-tune your mix with per-slot controls
- **Bonus Combos** - Trigger animations by playing certain sounds together
- **Horror Mode** - Drop the cursed sound and watch corruption spread
- **Custom Themes** - Create your own themes with custom sounds, colors, and icons

## Quick Start

1. Clone the repo
2. Open `index.html` in a browser (or use a local server for audio samples)
3. Click to start
4. Drag sounds from the bottom palette onto the character slots
5. Experiment!

**Note:** For audio samples to work, run from a local server:
```bash
# Python
python -m http.server 8080

# Node.js
npx serve

# Or use VS Code's Live Server extension
```

## Create Your Own Theme

Want to make your own version with custom sounds and visuals?

Check out the **[Modding Guide](docs/MODDING_GUIDE.md)** - a step-by-step tutorial for beginners. No coding experience needed.

## Tech Stack

- **Tone.js** - Audio engine with Transport scheduling
- **Vanilla JS** - No frameworks, easy to learn from
- **CSS Variables** - Theme colors injected at runtime

## Project Structure

```
wrenchbox/
├── index.html          # Main entry point
├── style.css           # All styles
├── src/
│   ├── core/           # Audio, sequencer, effects
│   ├── ui/             # Drag-drop, overlays
│   └── data/           # Theme loader, configs
├── themes/
│   └── default/        # Default theme (copy to make your own)
└── docs/
    └── MODDING_GUIDE.md
```

## Development

This project was built in phases as a learning exercise:

1. **Foundation** - Tone.js basics, click-to-toggle
2. **Incredibox Core** - Drag-drop, mute/solo
3. **Sample Audio** - Load custom audio loops
4. **Bonus System** - Combo detection and animations
5. **Horror Mode** - Corruption spread with audio/visual effects
6. **Theming** - JSON-driven configuration

See [PLAN.md](PLAN.md) for the full development roadmap.

## License

MIT
