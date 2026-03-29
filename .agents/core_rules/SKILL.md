---
name: core_rules
description: Primary development and interaction guidelines for the AOE2 Replay Viewer.
---

# Project Core Rules

These rules apply to all agent interactions and development tasks within the **AOE2 Replay Viewer** project. 

### 1. Verification & Workflow
> [!IMPORTANT]
> **NEVER open a browser for verification.** 
> All UI changes and functionality should be verified by the user manual check. Do not use the `browser_subagent` or `read_browser_page` for verification purposes unless explicitly requested for a specific task.
> 
> [!TIP]
> **Proceed automatically on high-confidence tasks.**
> For simple, non-destructive, and high-confidence tasks, you may bypass the formal implementation plan step and proceed directly to execution.

### 2. Isometric Logic & Coordinates
Age of Empires II uses a specific isometric diamond coordinate system.
- **Top-Left Anchors**: Building positions in the replay are typically center-ish coordinates; they must be translated to true top-left anchors for accurate footprint rendering.
- **Isometric Projection**: Use the `toCanvas` helper for all coordinate transformations to ensure consistency with terrain rendering.
- **Footprints**: Refer to `src/lib/buildingFootprints.ts` for all building dimensions.

### 3. UI Design & Aesthetics
- **Player Colors**: Use dynamic player colors for all entity rendering. Outlines should use the dedicated `getPlayerOutline` function for contrast.

### 4. Replay Processing
- **Event-Driven**: The viewer is driven by the `TimelineEvent` stream. Logic for identifying starting TCs or player wins lives in `src/lib/tcPlacement.ts` and `src/lib/replayProcessor.ts`.

---
*Note: These rules are living documentation. Update them as the project patterns evolve.*
