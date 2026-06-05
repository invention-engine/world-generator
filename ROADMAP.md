# Project Roadmap: World Generator

This roadmap outlines the phases for transforming the Fantasy Map Generator into a headless, AI-integrated RPG data pipeline.

## Phase 1: The Headless Transition (Completed)
**Goal:** Run the core generation logic in Node.js without a browser environment.

- [x] **DOM Mocking:** Integrated `jsdom` and custom global proxies in `src/utils/headless.ts`.
- [x] **CLI Scaffolding:** Implemented a `commander` based CLI in `src/bin/generate.ts`.
- [x] **Module Isolation:** Successfully isolated and ran `src/modules/` math logic headlessly.
- [x] **JSON Export:** Created a standardized `world.json` output format.

## Phase 2: Gemini AI Lore Integration (Completed)
**Goal:** Use Google Gemini to weave narrative depth into the geographic data.

- [x] **Gemini 2.5-Flash Support:** Integrated the latest Google Generative AI SDK.
- [x] **Structured Output:** Implemented strict JSON schema enforcement for AI responses.
- [x] **World Bible Generation:** Weaves creation myths, eras, and cultural values from procedural data.
- [x] **CLI Integration:** Added `--ai-key` flag for seamless lore generation.

## Phase 3: Extendability & Plugins (Completed)
**Goal:** Create an open interface for community mods and custom logic.

- [x] **Plugin Hook System:** Implemented `PluginManager` with lifecycle hooks (`preGenerate`, `postGeography`, `postLore`, `onExport`).
- [x] **CLI Plugin Support:** Added `--plugins` flag to load external JS/TS scripts.
- [x] **Theme Templates:** Enabled via the plugin system (allows programmatic theme overrides).
- [ ] **Asset Pipeline:** (Deferred) Integrate headless rendering (Puppeteer) for high-res map images.

## Phase 4: Ecosystem Integration
**Goal:** Finalize connectivity with the Invention Engine game framework.

- [ ] **Standardized .world Format:** A compressed package containing SQLite/JSON data and visual assets.
- [ ] **API Endpoint:** A lightweight local server mode to serve data to the game engine during development.
- [ ] **Direct "Vibe" Configuration:** Support for high-level natural language descriptors that drive the entire generation pipeline.

---

## Strategy for Vibe Coding
This project is designed to be built via **AI Directives**.
1. **Architectural Purity:** Keep logic decoupled so the AI can easily understand and modify individual modules.
2. **Test-Driven:** Every generation step should have a validation script to ensure the data output is consistent.
3. **Iterative Refinement:** We will build the "bone" (Geography) first, then the "muscle" (Politics), and finally the "soul" (AI Lore).
