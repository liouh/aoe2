# AOE2 Replay Viewer

Client-only Age of Empires II replay explorer built with Next.js. Upload a `.aoe2record` file to visualize the minimap over time, inspect build orders, and compare player timelines.

**Try the hosted version at: [liouh.com/aoe2/](https://liouh.com/aoe2/)**

## Features

- **Local Parsing**: Replay parsing runs fully in the browser via `aoe2rec-js` (WASM). No data is uploaded.
- **Interactive Minimap**:
    - High-fidelity isometric terrain rendering.
    - Persistent starting Town Center markers identified via building-event heuristics.
    - Zoom (+/-) and Pan controls for detailed inspection.
    - Toggle visibility for unit movements and buildings.
- **Detailed Timeline**:
    - Per-player event stream including buildings, unit training, and research.
    - Category filters to isolate specific build order components.
    - "Jump to Timeline" sync to correlate playback time with vertical scroll.
- **Player Stats**:
    - Automatic winner detection with victory crowns (👑).
    - Metrics including Civilization, Team, APM, and Age up timings.
- **Responsive Controls**: Scrub through playback time or use keyboard shortcuts (Arrow keys) to navigate.

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project Structure

- `src/app/page.tsx`: Main UI, playback state, and minimap canvas rendering logic.
- `src/lib/buildingFootprints.ts`: Data for accurate building sizes on the map.
- `src/lib/civMappings.ts`: Civilization and game type mappings.
- `src/lib/entityNames.ts`: Unified unit and building name lookup (auto-generated from game data).
- `src/lib/replay.ts`: Core parsing engine using `aoe2rec-js`, timeline construction, and heuristic calculations.
- `src/lib/techMappings.ts`: ID to name mappings for technologies and legacy unit exports.
- `src/lib/terrainPalette.ts`: Color mapping palette for minimap terrain IDs.

## Technical Notes

- **Initial State**: Starting town centers and resources are missing. Tracked in https://github.com/aoe2ct/aoe2rec/issues/31

- **Canvas Rendering**: Uses dual-layered rendering (offscreen terrain cache + active entity layer) for smooth performance even during high-zoom scrubbing.
