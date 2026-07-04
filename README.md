# BitPacker: Visual Game Netcode Designer & Bandwidth Simulator

BitPacker is a web-based, premium interactive optimizer and traffic simulator designed for multiplayer game developers targeting **Roblox (Luau)**, **s&box (C#)**, and **Unity (C#)**. It enables developers to visually design network packet schemas, analyze bit-level layouts, simulate real-time traffic under different player scales (including protocol wrappers like IPv4/UDP, WebSockets), and instantly generate production-ready serializer/deserializer code.

## 🚀 Key Features

1. **Interactive Schema Designer:**
   - Define custom network variables with dedicated formats: `bool`, `int` (range-constrained or static bit-widths), `float` (single, half, or custom quantized), `vector3` (full or quantized bounds), and `string` (fixed or dynamic header length).
   - Instant computation of custom precision bit-widths to compress numbers down to their exact mathematical requirements.

2. **Bit-Layout Visualizer:**
   - A grid representation of byte blocks (8 bits per row) that color-codes each variable's physical allocation.
   - Highlights unused padding bits at the end of byte boundaries to encourage efficient alignment.
   - Hover metrics revealing exact global offsets, bit numbers, and byte indexes.

3. **Multiplayer Bandwidth Simulator:**
   - Models $O(N^2)$ server-client broadcast scaling typical in game replication.
   - Simulates upload (egress) and download (ingress) rates for clients and servers.
   - Support for multiple protocols with baseline overhead headers: Roblox RemoteEvents (+49B), Unity NGO (+40B), s&box Netcode (+42B), raw UDP (+28B), raw TCP (+40B), and WebSockets (+44B).

4. **Multi-Engine Code Generator:**
   - Instant compilation to high-performance Roblox Luau (using modern `buffer` API).
   - Clean stream serialization in C# (s&box BinaryWriter/Reader stream operations).
   - High-performance low-level serialization in C# (Unity NGO `FastBufferWriter`/`Reader` API).

5. **Animated Custom SVG Charts:**
   - Real-time scaling graphs displaying bandwidth usage curves (BitPacked vs standard JSON vs Raw replication) matching slider parameters.
   - Dynamic threshold alert warnings for network packet congestion.

---

## 🛠️ Tech Stack & Scripts

- **Language & Bundler:** TypeScript, Vite, React (19)
- **Styling:** Scoped CSS Variables, CSS Modules (for custom glassmorphism / dark neon UI)
- **Icons:** `lucide-react`
- **Testing:** `vitest`

### Commands

To run or build the application, make sure Node.js is installed.

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:5173)
npm run dev

# Run unit tests
npm test

# Build production assets (outputs to /dist)
npm run build
```

---

## 📖 Directory Structure

- `src/components/` - Interactive UI widgets (Byte Visualizers, Charts, Editors, Code Generators).
- `src/utils/` - Mathematical engines (bit calculations, traffic scaling, code compile templates).
- `src/types/` - Shared TypeScript schemas.
- `tests/` - Unit tests for mathematical model correctness.
