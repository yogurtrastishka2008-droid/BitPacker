# Spec: BitPacker: Visual Game Netcode Designer & Bandwidth Simulator

## Objective
BitPacker is a web-based, visually stunning visual game netcode designer and bandwidth simulator. It helps developers for **Roblox (Luau)**, **s&box (C#)**, and **Unity (C#)** optimize their multiplayer games' networking payloads. The application allows users to visually design packet layouts, simulate bandwidth consumption with protocol-level overhead calculations, and generate production-ready code.

### Core User Stories
1. **Visual Packet Designer:** As a netcode designer, I want to add packet fields (booleans, integers, floats, vectors, quaternions, custom ranges, strings) and visually inspect how they pack into bits and bytes (including color-coded representation of bits).
2. **Bandwidth Simulator:** As a game developer, I want to input my tick rate, player count, frequency of packet updates, and network protocol (UDP, WebSocket, etc.) to see real-time graphs showing payload bandwidth vs. packet-header overhead, comparing optimized bit-packed data against standard JSON/high-overhead replication.
3. **Multi-Engine Code Generator:** As an engineer, I want to immediately get clean, performant, copy-pasteable serialization and deserialization code in Luau (using Roblox `buffer` API), s&box C# (binary serialization), and Unity C# (`FastBufferWriter`/`Reader`).
4. **Interactive Dashboard:** As a user, I want a premium dashboard with rich aesthetics (dark mode, neon glows, glassmorphism, smooth animations) that feels like a professional game developer utility.

---

## Tech Stack
- **Bundler & Tooling:** Vite, TypeScript
- **UI Library:** React (18+)
- **Styling:** CSS Variables, Vanilla CSS (CSS Modules) for maximum flexibility, custom layouts, and premium glassmorphic/cyberpunk aesthetics.
- **Icons:** `lucide-react`
- **Charts:** Custom animated SVG-based charts (highly reliable, no external heavyweight charting library dependency issues).
- **Testing:** Vitest + React Testing Library (for unit and integration tests)

---

## Commands
- **Dev Server:** `npm run dev`
- **Production Build:** `npm run build`
- **Run Tests:** `npm test`
- **Lint Code:** `npm run lint`

---

## Project Structure
```text
BitPacker/
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── SPECIFICATION.md
├── tasks/
│   ├── plan.md
│   └── todo.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── BitVisualizer.tsx       # Interactive byte-grid showing bit placement
│   │   ├── PacketEditor.tsx        # Add/edit packet fields and compression rules
│   │   ├── SimulatorDashboard.tsx  # Sliders for players, tick rate, packet frequency
│   │   ├── BandwidthChart.tsx      # SVG chart showing bandwidth utilization & comparison
│   │   ├── CodeGenerator.tsx       # Luau/sbox/Unity generated source code output
│   │   └── Common/                 # Reusable UI elements (slider, input, tabs, modal)
│   ├── utils/
│   │   ├── bitPacking.ts           # Bitpacking layout calculators & estimates
│   │   ├── generators/
│   │   │   ├── roblox.ts           # Luau buffer code generator
│   │   │   ├── sbox.ts             # s&box C# code generator
│   │   │   └── unity.ts            # Unity C# FastBuffer code generator
│   │   └── simulation.ts           # Bandwidth calculation formulas
│   └── types/
│       └── index.ts                # TypeScript interfaces for Fields, Packet, and Config
└── tests/
    ├── bitPacking.test.ts          # Core packing logic verification
    └── simulation.test.ts          # Simulator math verification
```

---

## Code Style
We use clean, documented TypeScript. We prioritize functional programming, clean type definitions, and semantic component design.

```typescript
// Example: src/utils/bitPacking.ts
export interface PacketField {
  id: string;
  name: string;
  type: 'bool' | 'int' | 'float' | 'string' | 'vector3';
  bitWidth: number; // e.g., 1 for bool, 3 for int range 0-7
  minValue?: number;
  maxValue?: number;
  precision?: number; // e.g., 0.1 for float compression
}

/**
 * Calculates the total bits required for a set of fields,
 * returning both absolute bits and byte-aligned size.
 */
export function calculatePacketSize(fields: PacketField[]): { totalBits: number; totalBytes: number } {
  const totalBits = fields.reduce((sum, field) => sum + field.bitWidth, 0);
  const totalBytes = Math.ceil(totalBits / 8);
  return { totalBits, totalBytes };
}
```

---

## Testing Strategy
- **Framework:** Vitest (provides blazing-fast unit tests).
- **Coverage Target:** 80%+ on utility functions (bit layout calculation, math formulas for bandwidth simulator).
- **Test File Location:** `tests/` directory matching the source file structure.

---

## Boundaries
- **Always do:**
  - Add descriptive comments for complex bit-shifting math.
  - Implement robust validation for min/max values (e.g., preventing bitWidth being negative or too large).
  - Use semantic HTML tags and proper ARIA labels for accessible, premium-grade dashboard control elements.
- **Ask first:**
  - Adding major third-party visual layout libraries (e.g., node-editing canvas frameworks). We should prefer building a crisp list/tree layout editor to maintain performance and control.
- **Never do:**
  - Add inline style overrides that break CSS variables.
  - Hardcode engine-specific baseline packet overhead values without allowing the simulator to configure or explain them.

---

## Success Criteria
1. **Visual Packet Designer:**
   - User can add fields with types: `bool` (1 bit), `int` (custom bit-width 1-32, with range min/max), `float` (half-float 16-bit, single-float 32-bit, or custom range-quantized float like mapping a value between -50 and 50 using 10 bits), `string` (UTF-8, dynamic or fixed length), and `Vector3` (compressed fixed-point or full precision).
   - Real-time bit-grid updates dynamically: highlighting bytes (0, 1, 2...) and how each bit is occupied by fields using a gorgeous colored visual block diagram.
2. **Bandwidth Simulation Math & Visualization:**
   - Calculates bandwidth in Kbps (Kilobits per second) and MB/hour.
   - Computes protocol overhead: IPv4/UDP (28 bytes), WebSocket (2-10 bytes overhead per message), Roblox RemoteEvent baseline overhead (approx. 9-40 bytes depending on argument packaging), Unity Netcode payload envelope.
   - Draws beautiful animated comparison charts: BitPacked vs. standard JSON payload vs. Raw replication.
3. **Multi-Engine Code Generation:**
   - Correctly generates Luau code using standard Roblox `buffer` API.
   - Correctly generates s&box C# code writing to `NetWrite` / `BinaryWriter`.
   - Correctly generates Unity C# code using `FastBufferWriter`/`Reader`.
4. **Rich Aesthetic UI:**
   - Full dark mode dashboard featuring glassmorphism, responsive panels, glowing packet transmission indicators, and copyable code blocks with custom syntax highlight vibes.

---

## Open Questions
1. **Packet Structure Editor Layout:** Should we implement a list-based card interface where users configure fields and see them compile into a grid immediately, or a full canvas-based node-editor?
   - *Recommendation:* A list-based schema editor with a drag-and-drop hierarchy is highly intuitive, compact, and extremely robust for this type of packet packing. Let's start with a beautiful drag-to-reorder list, showing real-time packing size.
2. **WebSocket vs UDP Simulator:** Should the simulator focus on general UDP / TCP / WebSocket packets, or engine-specific wrappers?
   - *Recommendation:* Include a toggle for Engine Baseline protocols: Roblox RemoteEvents (which run over Roblox's custom reliable UDP channels), s&box network packets, and Unity netcode, calculating their respective overheads.
