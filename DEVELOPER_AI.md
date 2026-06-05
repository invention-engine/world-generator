# Developer Guide (AI Agent Focused)

This document is intended for AI coding agents tasked with maintaining or extending this codebase. It explains the project's unique "Headless Port" architecture and how to navigate browser-dependent logic in a Node.js environment.

## 🧠 System Context
This project is a headless fork of Azgaar's Fantasy Map Generator (FMG). FMG is a legacy browser app that heavily relies on `window`, `document`, and SVG DOM. We have wrapped it in a **JSDOM** mock to run it in Node.js.

## 🛠️ Essential Files for AI Agents
- `src/utils/headless.ts`: **The most critical file.** This sets up the fake browser environment. If a new module crashes due to a missing browser global (e.g., `Node is not defined`), you must add the mock here.
- `src/bin/engine.ts`: The core pipeline. It orchestrates the sequence of `Cultures -> States -> Burgs -> AI Lore`.
- `src/modules/lore-generator.ts`: Manages communication with Google Gemini. Uses strict JSON schemas.

## ⚠️ Common Pitfalls & Anti-Patterns
1.  **Implicit Globals:** Many FMG modules assign variables to the `window` object (e.g., `window.pack`). Always check `global` or `window` if a variable seems "missing."
2.  **DOM Crashes:** If a module tries to update a UI element (e.g., `document.getElementById('msg').innerHTML`), the current `headless.ts` will return a dummy `div`. If it crashes on a specific property (like `selectedOptions`), you must expand the mock in `src/bin/engine.ts` or `headless.ts`.
3.  **Module Side-Effects:** FMG modules are often imported for their side-effects (they attach instances to `window`). Use `await import("../modules/index")` to ensure everything is initialized.

## 🔄 How to add a new "Step" to Generation
If you need to add a new FMG step (like `Religions` or `Military`):
1.  Verify the module is imported in `src/modules/index.ts`.
2.  In `src/bin/engine.ts`, call the generator (e.g., `global.Religions.generate()`).
3.  Ensure any required state (like `global.pack.religions = []`) is initialized in the `Initialize Pack` section of `engine.ts`.

## 🤖 Vibe Coding Philosophy
- **Decouple Logic from View:** Never allow SVG/Canvas rendering logic to enter the core `engine.ts`.
- **Schema First:** Always define the TypeScript interface before updating the Gemini prompt.
- **Fail Gracefully:** If the AI Lore generation fails, the pipeline should still export the geographic data.
