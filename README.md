# World Generator (CLI)

The **World Generator** is a headless, AI-enhanced world-building tool for RPGs. Forked from [Azgaar's Fantasy Map Generator](https://github.com/Azgaar/Fantasy-Map-Generator), this project decouples the core geographic and political generation logic from the browser and integrates **Google Gemini AI** to generate deep lore, timelines, cultures, and remarkable characters.

This tool is part of the **Invention Engine** ecosystem, designed to feed structured world data into game engines for automated web-RPG creation.

## 🌟 Vision

A "vibe-coded" world generator that transforms a simple prompt into a massive, structured JSON database containing:
- **Geography:** Accurate Voronoi-based terrain, biomes, and climate.
- **Geopolitics:** Procedurally generated states, provinces, and burgs.
- **Lore:** AI-generated world bibles, creation myths, and historical eras.
- **NPCs:** Notable characters with motivations, relationships, and backgrounds.

## 🏗️ Ecosystem Role

1. **Game Engine:** Consumes the output of this generator to manage world mechanics and entities.
2. **World Generator (This Repo):** The "Brain" that produces the base-line story and spatial data.
3. **Modding Interface:** An extendable plugin system to allow manual overrides and custom generation rules.
4. **Personalization Layer:** The user-facing configuration that directs the generator's intent.

## 🚀 Getting Started

*Note: This project is currently in the transition phase from a browser-based tool to a headless CLI.*

### Current Status: Final Integration
- [x] Initial Repository Setup
- [x] Headless Node.js Implementation
- [x] Gemini AI Integration
- [x] Plugin System & Extendability

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. Based on work by Azgaar.
