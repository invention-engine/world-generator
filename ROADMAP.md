# Project Roadmap: World Generator

This roadmap outlines the phases for transforming the Fantasy Map Generator into a headless, AI-integrated RPG data pipeline.

## Phase 1: The Headless Transition (Current Focus)
**Goal:** Run the core generation logic in Node.js without a browser environment.

- [ ] **DOM Mocking:** Integrate `jsdom` or `linkedom` to satisfy browser dependencies in Node.js.
- [ ] **CLI Scaffolding:** Implement a command-line interface using `commander`.
- [ ] **Module Isolation:** Decouple the `src/modules/` math logic from the `src/renderers/` SVG logic.
- [ ] **JSON Export:** Create a standardized export format for raw world data (cells, burgs, states).

## Phase 2: Gemini AI Lore Integration
**Goal:** Use Google Gemini to weave narrative depth into the geographic data.

- [ ] **Prompt Chain Pipeline:** Build a sequence of prompts to generate lore in layers (World -> Culture -> State -> NPC).
- [ ] **Structured Output:** Implement strict JSON schema enforcement for AI responses.
- [ ] **Timeline Generator:** Create a historical simulation that builds on the generated world state.
- [ ] **NPC Engine:** Generate remarkable characters for every major city and faction.

## Phase 3: Extendability & Plugins
**Goal:** Create an open interface for community mods and custom logic.

- [ ] **Plugin Hook System:** Allow external scripts to modify the world data at specific lifecycle stages (Pre-AI, Post-AI).
- [ ] **Asset Pipeline:** Integrate headless rendering (Puppeteer) to export high-res map images alongside data.
- [ ] **Theme Templates:** Preset configurations for different RPG genres (High Fantasy, Grimdark, Sci-Fi).

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
