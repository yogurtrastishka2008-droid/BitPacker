# Implementation Plan: BitPacker: Visual Game Netcode Designer & Bandwidth Simulator

## Overview
We are building BitPacker, a premium, browser-based visual game netcode designer and traffic simulator for Roblox, s&box, and Unity. This tool enables developers to model compact network schemas, view their exact bit-packing layouts, simulate bandwidth consumption under various player counts and tick rates (including UDP/protocol header overheads), and export production-ready C# and Luau serialization code.

## Architecture Decisions
1. **Frontend Stack:** React (18+) + TypeScript + Vite. This ensures a fast developer loop, strict type safety for bit-packing algorithms, and component modularity.
2. **Styling Paradigm:** CSS Variables with pure CSS Modules for scoped styling. This guarantees complete control over the layout, avoiding external framework dependencies, and enables high-end custom styles (glassmorphism, glowing borders, dark theme, smooth micro-animations).
3. **SVG-Based Custom Charts:** Instead of pulling in heavy third-party charting libraries which can introduce version conflicts or rendering bugs, we will implement optimized, responsive, and animated SVG charts directly in React.
4. **Local Serialization Engine:** Calculations and code generation will be performed entirely client-side. This allows instant responsiveness, offline capabilities, and zero server overhead.

---

## Task List

### Phase 1: Foundation
- [ ] **Task 1: Project Setup & Initialization**
  - Setup Vite + React + TS in the `BitPacker/` directory.
  - Install dependencies (`lucide-react` for icons, `vitest` for unit tests).
  - Add basic project configurations.
- [ ] **Task 2: Core Bit-Packing Engine & Simulation Logic**
  - Create types in `src/types/index.ts`.
  - Write mathematical utilities for bit-packing layout (`src/utils/bitPacking.ts`).
  - Write bandwidth formulas and overhead calculations (`src/utils/simulation.ts`).
  - Write Vitest tests to confirm math accuracy for all targets (Roblox, s&box, Unity).

### Checkpoint: Foundation
- [ ] Unit tests for bitpacking and simulation logic pass 100%
- [ ] TypeScript compiles with no errors

### Phase 2: Visual Schema Designer
- [ ] **Task 3: Packet Schema Editor Component**
  - Implement a list-based editor to add, edit, and delete fields (`bool`, `int`, `float`, `vector3`, `string`).
  - Add inputs for name, min/max limits, precision, and custom bit-widths.
  - Show real-time individual bit-cost and overall packet totals.
- [ ] **Task 4: Interactive Byte Visualizer Grid**
  - Build the interactive bit/byte grid displaying byte indexes (0, 1, 2...).
  - Color-code bits based on the field they belong to.
  - Visualize byte alignment padding (remnants of the final byte).

### Checkpoint: Designer Core
- [ ] Schema editor correctly adds/updates/deletes fields
- [ ] Visualizer grid highlights bits accurately matching the schema
- [ ] Interactive changes update state instantly

### Phase 3: Simulator & Visualizer
- [ ] **Task 5: Traffic Simulation Dashboard**
  - Build sliders for player count (1-100), tick rate (10-100 Hz), message frequency, and packet drop.
  - Implement engine protocol selectors (Roblox RemoteEvent, s&box Network, Unity Netcode, Raw TCP/UDP/WebSockets) with detailed descriptions of their protocol wrapper overheads.
- [ ] **Task 6: High-End Custom SVG Bandwidth Chart**
  - Build dynamic, responsive SVG charts.
  - Graph bandwidth curves comparing BitPacked data vs. default replication JSON.
  - Add micro-animations and glowing indicators representing traffic volumes.

### Checkpoint: Simulation Functional
- [ ] Sliders calculate simulation outputs (Kbps, MB/hour) correctly.
- [ ] SVG charts update smoothly when changing sliders.

### Phase 4: Code Generation & Shell Design
- [ ] **Task 7: Code Generation Engine & Copyable Snippets**
  - Implement Luau (Roblox Buffer API), C# (s&box Stream/BitPacker), and C# (Unity FastBufferWriter/Reader) generator templates.
  - Create the `CodeGenerator` UI component with tabs and "Copy to Clipboard" buttons.
- [ ] **Task 8: Shell Theme Integration & UI Polish**
  - Implement dark-theme glassmorphism shell (`App.tsx`, `index.css`).
  - Ensure mobile and desktop responsiveness.
  - Add packet transmission animations (packets floating from "Client" to "Server").

### Checkpoint: Final Release
- [ ] The app builds cleanly in production mode (`npm run build`).
- [ ] All features are fully functional, responsive, and visually wowing.

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|:---|:---:|:---|
| Complex bit math errors in code generation | High | Implement comprehensive test suites in `tests/` confirming the Luau/C# generated logic aligns with the visual layout calculations. |
| Performance lag with massive packets in the byte visualizer | Med | Limit visualizer rendering to the first 128 bytes (1024 bits), showing pagination or overflow flags if a packet is abnormally large. |
| External CSS conflicts or Tailwind bloating | Low | Use pure CSS Modules and strict layout boundaries, avoiding complex Tailwind configurations. |

## Open Questions
None. The visual design scope and targets (Roblox, s&box, Unity, TCP/UDP/WS) have been defined and approved.
