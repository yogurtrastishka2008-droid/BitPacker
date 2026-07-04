# BitPacker Task Checklist

## Phase 1: Foundation

- [x] **Task 1: Project Setup & Initialization**
  - **Acceptance:** Vite + React + TS boilerplate is initialized, required dependencies installed, and server starts.
  - **Verify:** Run `npm run dev` and check that the boilerplate loads in a browser.
  - **Files:** `package.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
  - **Scope:** Small

- [x] **Task 2: Core Bit-Packing Engine & Simulation Logic**
  - **Acceptance:** Core TypeScript types defined, bit size calculators implemented, simulation/overhead calculations completed, and unit tests passing.
  - **Verify:** Run unit tests with `npm test`.
  - **Files:** `src/types/index.ts`, `src/utils/bitPacking.ts`, `src/utils/simulation.ts`, `tests/bitPacking.test.ts`, `tests/simulation.test.ts`
  - **Scope:** Medium

### Checkpoint: Foundation
- [x] Core math unit tests pass 100%.
- [x] Code builds without compilation errors.

---

## Phase 2: Visual Schema Designer

- [x] **Task 3: Packet Schema Editor Component**
  - **Acceptance:** UI displays a list of schema fields. User can add, edit (type, size, bounds, precision), and remove fields.
  - **Verify:** Manually test adding different field types and verify total bit count updates.
  - **Files:** `src/components/PacketEditor.tsx`, `src/components/Common/`
  - **Scope:** Medium

- [x] **Task 4: Interactive Byte Visualizer Grid**
  - **Acceptance:** Grid displays a sequence of bytes. Bits are colored to represent which field they map to. Hovering over a bit highlights the field details.
  - **Verify:** Add fields in the editor and confirm the bit grid populates and colors correctly.
  - **Files:** `src/components/BitVisualizer.tsx`
  - **Scope:** Medium

### Checkpoint: Designer Core
- [x] Drag/add field state connects seamlessly to the byte visualizer grid.
- [x] Reordering or updating field bitwidths updates the layout in real time.

---

## Phase 3: Simulator & Visualizer

- [x] **Task 5: Traffic Simulation Dashboard**
  - **Acceptance:** Multi-slider control dashboard for simulator configuration (tick rate, players, message count, protocol toggle). Computes baseline and optimized bandwidth.
  - **Verify:** Adjust sliders and see the text-based summary update outputs for BitPacked vs JSON.
  - **Files:** `src/components/SimulatorDashboard.tsx`
  - **Scope:** Small

- [x] **Task 6: High-End Custom SVG Bandwidth Chart**
  - **Acceptance:** Draws responsive, glowing SVG charts plotting comparison curves for bandwidth usage vs overhead.
  - **Verify:** Change slider parameters and see SVG chart lines animate and scale dynamically.
  - **Files:** `src/components/BandwidthChart.tsx`
  - **Scope:** Medium

### Checkpoint: Simulation Functional
- [x] Simulation math is reactive to control inputs.
- [x] Visual charts scale properly under maximum and minimum traffic settings.

---

## Phase 4: Code Generation & UI Integration

- [x] **Task 7: Code Generation Engine & Copyable Snippets**
  - **Acceptance:** Generates valid, performant Luau code (Roblox buffer), C# code (s&box Stream), and C# code (Unity FastBuffer). Tab system allows copying code.
  - **Verify:** Generate a mixed packet schema and verify code output syntax is correct for Roblox, s&box, and Unity.
  - **Files:** `src/utils/generators/roblox.ts`, `src/utils/generators/sbox.ts`, `src/utils/generators/unity.ts`, `src/components/CodeGenerator.tsx`
  - **Scope:** Medium

- [x] **Task 8: Shell Theme Integration & UI Polish**
  - **Acceptance:** Dark glassmorphic layout is applied. Includes floating glowing packets, headers, side panels, and responsive margins.
  - **Verify:** Run build command `npm run build` to verify production assets bundle without warnings. Verify layout responsiveness on window resize.
  - **Files:** `src/App.tsx`, `src/index.css`
  - **Scope:** Medium

### Checkpoint: Complete Project Release
- [x] All tests pass.
- [x] Production build succeeds.
- [x] UI is fully functional, visual theme is premium, and code generator is copyable.
