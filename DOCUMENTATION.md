# World Generator Documentation

Welcome to the **World Generator**, a headless, AI-integrated RPG data pipeline. This tool is designed to generate complex, lore-rich fantasy worlds that can be consumed by modern game engines.

## 🚀 Quick Start

### Installation
Ensure you have **Node.js (>= 24.0.0)** and **Yarn** installed.

```bash
git clone https://github.com/invention-engine/world-generator
cd world-generator
yarn install
```

### Basic Generation
Generate a basic world data file (`world.json`):
```bash
yarn tsx src/bin/generate.ts generate
```

### Generation with AI Lore
Generate a world with a comprehensive creation myth, cultures, and timelines using Google Gemini:
```bash
yarn tsx src/bin/generate.ts generate --ai-key "YOUR_GEMINI_API_KEY"
```

### Running as an API Server
Start a lightweight server that handles on-demand generation requests:
```bash
yarn tsx src/bin/generate.ts serve --port 3000 --ai-key "OPTIONAL_DEFAULT_KEY"
```

---

## 🏗️ Architecture

The tool operates as a multi-stage pipeline:

1.  **Geography Engine (Headless FMG):** Uses Voronoi triangulation and climate simulation to create the physical world (heightmaps, biomes, rivers).
2.  **Geopolitical Engine:** Procedurally places cities (burgs), draws state borders, and assigns cultures based on geography.
4.  **Lore Engine (Gemini AI):** Takes the raw data and "weaves" it into a narrative. It generates world names, historical eras, and cultural values.
5.  **Plugin Layer:** Allows external scripts to intercept and modify data at any stage.
6.  **Exporter:** Standardizes the output into a structured JSON package.

See the full [Data Schema Reference](DATA_SCHEMA.md) for a field-by-field breakdown of the output.


---

## 🔌 Plugin System

You can extend the generator by creating scripts in the `plugins/` directory.

### Plugin Interface
A plugin is a JS/TS file that exports an object with the following optional hooks:

```typescript
export default {
  preGenerate: (options) => { /* Modify CLI options */ },
  postGeography: (global) => { /* Mutate raw FMG data */ },
  postLore: (lore) => { /* Refine AI-generated text */ },
  onExport: (worldData) => { /* Add custom metadata */ }
};
```

---

## 📡 API Reference (`POST /generate`)

**Endpoint:** `http://localhost:3000/generate`

**Body:**
```json
{
  "seed": "optional_seed_string",
  "aiKey": "optional_overriding_key",
  "plugins": "path/to/plugins"
}
```

**Response:** Returns the full `world.json` object.

---

## ⚖️ License
Licensed under the MIT License. Forked from Azgaar's Fantasy Map Generator.
