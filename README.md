# AOE2 Replay Viewer

Client-only Age of Empires II replay explorer built with Next.js. Upload a `.aoe2record` file to visualize the minimap over time, inspect build orders, and compare player timelines.

**Try the hosted version at: [liouh.com/aoe2/](https://liouh.com/aoe2/)**

## Features

- **Local Parsing**: Replay parsing runs fully in the browser via `aoe2rec-js` (WASM). No data is uploaded.
- **Interactive Minimap**:
    - High-fidelity isometric terrain rendering.
    - Starting Town Centers identified via building-event heuristics.
    - Zoom (+/-) and Pan controls for detailed inspection.
    - Toggle visibility for unit movements and buildings.
- **Detailed Timeline**:
    - Per-player event stream including buildings, unit training, and research.
    - Category filters to isolate specific build order components.
    - "Jump to Timeline" sync to correlate playback time with vertical scroll.
- **Player Stats**:
    - Automatic winner detection with victory crowns (👑).
    - Metrics including APM, units trained, market usage, and age up timings.
- **Responsive Controls**: Scrub through playback time or use keyboard shortcuts (Arrow keys) to navigate.

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Technical Notes

- **Initial State**: Starting town centers and resources are missing. Tracked in https://github.com/aoe2ct/aoe2rec/issues/31
