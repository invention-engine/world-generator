import * as fs from "node:fs";
import * as path from "node:path";
import { Command } from "commander";
import FlatQueue from "flatqueue";
import { LoreGenerator } from "../modules/lore-generator";
import { setupHeadless } from "../utils/headless";

// Initialize headless environment
const _dom = setupHeadless();
(global as any).FlatQueue = FlatQueue;

// Mock some essential UI elements data for the generator
const mockElements: Record<string, any> = {
  pointsInput: { dataset: { cells: "1000" }, value: "1000" },
  templateInput: { value: "continents" },
  precOutput: { value: "100" },
  windsInput: { value: "1,1,1,1,1,1" },
  temperatureEquatorOutput: { value: "30" },
  temperaturePoleOutput: { value: "-30" },
  heightExporter: { value: "1" },
  lakeElevationLimitOutput: { value: "80" },
  statesCountOutput: { value: "10" },
  provincesCountOutput: { value: "20" },
  burgsCountOutput: { value: "50" },
  religionsCountOutput: { value: "5" },
  culturesCountOutput: { value: "7" },
  culturesInput: { value: "7" },
  culturesSet: {
    value: "all",
    selectedOptions: [{ dataset: { max: "100" } }]
  }
};

const originalGetElementById = document.getElementById;
document.getElementById = (id: string) => {
  const el = originalGetElementById.call(document, id);
  if (el && mockElements[id]) {
    const mock = mockElements[id];
    if (mock.value !== undefined) {
      Object.defineProperty(el, "value", { value: mock.value, writable: true });
    }
    if (mock.selectedOptions !== undefined) {
      Object.defineProperty(el, "selectedOptions", { value: mock.selectedOptions, writable: true });
    }
    if (mock.dataset) {
      for (const key in mock.dataset) {
        el.setAttribute(`data-${key}`, mock.dataset[key]);
      }
    }
  }
  return el;
};

// Global heightmapTemplates mock (simplified)
(global as any).heightmapTemplates = {
  continents: {
    template:
      "Hill 1 80-85 60-80 40-60\nHill 1 80-85 20-30 40-60\nHill 6-7 15-30 25-75 15-85\nMultiply 0.6 land 0 0\nMask 4 0 0 0"
  }
};

const program = new Command();

program.name("world-generator").description("CLI tool to generate fantasy maps headlessly").version("1.0.0");

program
  .command("generate")
  .description("Generate a new world")
  .option("-s, --seed <string>", "Seed for the random number generator")
  .option("-o, --output <path>", "Path to save the generated JSON", "world.json")
  .option("-k, --ai-key <string>", "Google Gemini API Key for lore generation")
  .action(async options => {
    console.log("🚀 Starting world generation...");
    const timeStart = Date.now();

    try {
      // 1. Load Modules
      console.log("📦 Loading generation modules...");
      await import("../modules/index");
      const { generateGrid } = await import("../utils/graphUtils");

      // 2. Setup World State
      (global as any).seed = options.seed || Math.random().toString(36).substring(2, 15);
      (global as any).graphWidth = 1000;
      (global as any).graphHeight = 1000;
      console.log(`🌱 Seed: ${global.seed}`);

      // 3. Generate Grid
      console.log("🕸️ Generating Voronoi grid...");
      (global as any).grid = generateGrid(global.seed, global.graphWidth, global.graphHeight);
      global.grid.cells.temp = new Int8Array(global.grid.cells.i.length).fill(20);
      global.grid.cells.prec = new Uint8Array(global.grid.cells.i.length).fill(50);

      // 4. Generate Heightmap
      console.log("🏔️ Generating heightmap...");
      const h = await global.HeightmapGenerator.generate(global.grid);
      global.grid.cells.h = h;

      // 5. Initialize Pack
      console.log("📦 Initializing pack data...");
      (global as any).pack = {
        cells: {
          ...global.grid.cells,
          p: global.grid.points,
          h: new Uint8Array(h),
          s: new Uint16Array(h.length).fill(100),
          t: new Int8Array(h.length).fill(20),
          prec: new Uint8Array(h.length).fill(50),
          g: new Uint32Array(h.length).map((_, i) => i), // Map to grid cells
          biome: new Uint8Array(h.length).fill(1), // Mock biome
          f: new Uint32Array(h.length).fill(0), // Mock feature
          haven: new Uint32Array(h.length).fill(0), // Mock haven
          culture: new Uint16Array(h.length).fill(0),
          burg: new Uint16Array(h.length).fill(0), // Mock burg IDs
          state: new Uint16Array(h.length).fill(0) // Mock state IDs
        },
        states: [{ i: 0, name: "Wildlands" }],
        burgs: [{ i: 0, name: "None" }],
        cultures: [{ i: 0, name: "Wildlands" }],
        provinces: [],
        religions: [],
        rivers: [],
        features: [{ i: 0, type: "ocean" }]
      };

      // 6. Run Pipeline (Minimal for now)
      console.log("🌊 Simulating climate and biomes...");
      // In a full implementation, we'd call:
      // global.Rivers.generate();
      // global.Biomes.define();
      // etc.

      // For Phase 1, we just want a valid data structure.
      console.log("🏛️ Generating cultures and states...");
      if (global.Names) (global as any).nameBases = global.Names.getNameBases();

      if (global.Cultures) global.Cultures.generate();
      if (global.States) global.States.generate();
      if (global.Burgs) global.Burgs.generate();

      // 7. Generate AI Lore (Phase 2)
      let lore = null;
      if (options.aiKey) {
        console.log("🧠 Weaving world lore with Gemini AI...");
        const loreGenerator = new LoreGenerator(options.aiKey);
        lore = await loreGenerator.generateLore(global);
      }

      // 8. Export
      const worldData = {
        seed: global.seed,
        lore: lore,
        grid: {
          spacing: global.grid.spacing,
          cells: {
            h: Array.from(global.grid.cells.h)
          }
        },
        pack: {
          states: global.pack.states,
          burgs: global.pack.burgs,
          cultures: global.pack.cultures
        }
      };

      fs.writeFileSync(options.output, JSON.stringify(worldData, null, 2));

      const duration = ((Date.now() - timeStart) / 1000).toFixed(2);
      console.log(`✅ World generated successfully in ${duration}s!`);
      console.log(`💾 Data saved to: ${options.output}`);
    } catch (error) {
      console.error("❌ Error during generation:", error);
      process.exit(1);
    }
  });

program.parse();
