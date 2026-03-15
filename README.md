# AOE2 replay viewer

Client-only Age of Empires II replay explorer built with Next.js. Upload a `.aoe2record` or `.mgz` file to visualize the minimap over time, inspect build orders, and compare player timelines.

Hosted at: https://liouh.com/aoe2/

## Features

- Replay parsing runs fully in the browser via `aoe2rec-js`
- Interactive minimap with zoom/pan and unit/building overlays
- Timeline view per player (builds and unit training)
- Player stats panel with civ, team, APM, and age timings

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project Structure

- `src/app/page.tsx`: Main UI and replay rendering logic
- `src/lib/replay.ts`: Replay parsing helpers and timeline extraction
- `src/lib/civMappings.ts`: Civilization ID to name mapping

## Notes

- The minimap and timelines are generated from replay data and update as you scrub time.
- This app does not upload replays to a server; parsing stays local in the browser.

## TODO

- Starting town centers
- Walls
- Resources
- More metrics
