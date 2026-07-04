# BitPacker: Visual Game Netcode Designer & Bandwidth Simulator

<p align="left">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62C" alt="Vite" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tests-100%25%20Passing-emerald?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

[English README](./README.md) | [Русское руководство](./README.ru.md)

**BitPacker** is an interactive, browser-based network packet editor and traffic simulator built for multiplayer game developers. It optimizes network bandwidth for **Roblox (Luau)**, **s&box (C#)**, and **Unity (C# NGO)**.

By packing network variables down to their exact bit-level requirements and generating optimized serializer code, BitPacker eliminates protocol overhead and reduces server egress bandwidth by up to **90%**.

---

## ⚡ Key Features

* 🛠️ **Interactive Schema Designer:**
  * Define network fields: `bool`, `int` (range-constrained or static bit-widths), `float` (single, half, or custom quantized), `vector3` (full or quantized bounds), and `string` (fixed or dynamic).
  * Automatically calculates the minimum required bit-width for integers and float bounds using math-range mappings.
  * Strictly validates field names against reserved keywords and C#/Luau compiler symbols to prevent code generation errors.
* 👁️ **Bit-Layout Visualizer:**
  * Dynamic grid visualizer (8 bits per row) showing exactly where variables align in memory.
  * Color-coded bits mapping, making it easy to spot alignment padding and unused bits.
  * Real-time efficiency indicator showing utilized bits versus allocated byte boundaries.
* 📊 **Multiplayer Bandwidth Simulator:**
  * Models server-client replication rates using a quadratic broadcast scale: $O(P \cdot (P - 1) \cdot Size \cdot Hz)$.
  * Real-time custom SVG charts comparing traffic profiles: **BitPacked** vs. **Raw Struct** vs. **JSON String**.
  * Shows bandwidth overhead calculations for: Roblox RemoteEvents (+49B), Unity NGO (+40B), s&box Netcode (+42B), raw UDP (+28B), raw TCP (+40B), and WebSockets (+44B).
* 💻 **Multi-Engine Code Generator:**
  * Compiles packet schemas into ready-to-use serializer code.
  * **Roblox (Luau):** Uses standard Luau buffer API (`buffer.writeu8`, `buffer.writef32`) with custom IEEE 754 half-float (16-bit) serialization routines.
  * **s&box (C#):** Stream serialization via `BinaryWriter`/`BinaryReader` with safe UTF-8 byte boundary checking for strings.
  * **Unity (NGO C#):** Implements `INetworkSerializable` using `FastBufferWriter`/`FastBufferReader` with dynamic string mapping (e.g. `FixedString32Bytes`, `FixedString64Bytes`).

---

## 🚀 Quick Start

### Requirements
* **Node.js** (v18.0.0 or newer)

### Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### Run Server
Start the local development server (Vite):
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### Run Tests
Execute the unit tests verifying the layout calculations, simulation formulas, and code generators:
```bash
npm test
```

### Build Production
Compile the project for deployment:
```bash
npm run build
```

---

<details>
<summary>📖 Technical Reference & Math Models</summary>

### 1. Float & Vector Quantization Formula
Quantized floating-point numbers map real-world ranges into compact integers. For a given `minValue`, `maxValue`, and `precision`, the minimum bit-width $b$ is calculated as:
$$b = \lceil \log_2 \left( \frac{maxValue - minValue}{precision} \right) \rceil$$
During serialization, the floating-point value is clamped and scaled:
$$integer\_val = \text{round}\left( \frac{value - minValue}{precision} \right)$$
During deserialization, it is restored:
$$value = (integer\_val \cdot precision) + minValue$$

### 2. Bandwidth Replication Formula
In multiplayer game networks, state replication scales quadratically if the server broadcasts updates about all players to all other players. The simulator computes the server egress (upload) rate in Kilobits per second (Kbps) using:
$$\text{Egress (Kbps)} = \frac{P \cdot (P - 1) \cdot (Size + Overhead) \cdot \text{Rate} \cdot 8}{1000}$$
Where $P$ is the player count, $Size$ is the payload size in bytes, $Overhead$ is the network protocol envelope, and $Rate$ is the tick rate in Hz.
</details>

---

## 📂 Directory Structure

* [src/types/](file:///C:/Users/yogur/BitPacker/src/types/) — Shared TypeScript types.
* [src/components/](file:///C:/Users/yogur/BitPacker/src/components/) — Interactive UI panels (editors, SVG charts, visualizers).
* [src/utils/generators/](file:///C:/Users/yogur/BitPacker/src/utils/generators/) — Luau, s&box, and Unity Ngo serialization code templates.
* [src/utils/bitPacking.ts](file:///C:/Users/yogur/BitPacker/src/utils/bitPacking.ts) — Bit offset and byte boundary alignment calculators.
* [src/utils/simulation.ts](file:///C:/Users/yogur/BitPacker/src/utils/simulation.ts) — Bandwidth simulation formulas.
* [tests/](file:///C:/Users/yogur/BitPacker/tests/) — Unit tests for the layout calculators and code generators.

---

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
