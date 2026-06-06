import * as fs from "node:fs";
import { Command } from "commander";
import FlatQueue from "flatqueue";
import { LoreGenerator } from "../modules/lore-generator";
import { setupHeadless } from "../utils/headless";
import { PluginManager } from "../utils/plugin-manager";

// Ensure globals are ready
const _dom = setupHeadless();
(global as any).FlatQueue = FlatQueue;
if (global.window) {
  (global.window as any).FlatQueue = FlatQueue;
}

const pluginManager = new PluginManager();

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
  },
  // Added fields to support correct FMG generator module executions:
  statesNumber: { value: "10" },
  manorsInput: { value: "1000" }, // '1000' is considered auto in FMG towns generator
  religionsNumber: { value: "5" },
  provincesRatio: { value: "20" },
  emblemShape: {
    value: "random",
    selectedOptions: [{ parentElement: { getAttribute: () => "Diversiform" } }]
  },
  sizeVariety: { value: "1.5" },
  growthRate: { value: "1" },
  statesGrowthRate: { value: "1" },
  neutralRate: { value: "1" }
};

const originalGetElementById = document.getElementById;
document.getElementById = (id: string) => {
  const el = originalGetElementById.call(document, id);
  if (el && mockElements[id]) {
    const mock = mockElements[id];
    if (mock.value !== undefined) {
      Object.defineProperty(el, "value", { value: mock.value, writable: true, configurable: true });
      Object.defineProperty(el, "valueAsNumber", {
        get() {
          return parseFloat(mock.value);
        },
        set(val) {
          mock.value = String(val);
        },
        configurable: true
      });
    }
    if (mock.selectedOptions !== undefined) {
      Object.defineProperty(el, "selectedOptions", { value: mock.selectedOptions, writable: true, configurable: true });
    }
    if (mock.dataset) {
      for (const key in mock.dataset) {
        el.setAttribute(`data-${key}`, mock.dataset[key]);
      }
    }
  }
  return el;
};

// Global heightmapTemplates mock
(global as any).heightmapTemplates = {
  continents: {
    template:
      "Hill 1 80-85 60-80 40-60\nHill 1 80-85 20-30 40-60\nHill 6-7 15-30 25-75 15-85\nMultiply 0.6 land 0 0\nMask 4 0 0 0"
  }
};

/**
 * Core generation pipeline extracted for multi-interface support (CLI/API)
 */
export async function runWorldGenerator(options: {
  seed?: string;
  output: string;
  aiKey?: string;
  plugins?: string;
  size?: string;
}) {
  const timeStart = Date.now();

  try {
    // 0. Load Plugins
    if (options.plugins) {
      await pluginManager.loadPlugins(options.plugins);
    }
    await pluginManager.runHook("preGenerate", options);

    // Parse size option
    const sizePresetMap: Record<string, number> = {
      tiny: 1000,
      small: 2500,
      medium: 5000,
      large: 10000,
      huge: 20000,
      extreme: 30000,
      endless: 40000
    };

    let cellCount = 10000; // default to large
    if (options.size) {
      const normalized = options.size.toLowerCase().trim();
      if (normalized in sizePresetMap) {
        cellCount = sizePresetMap[normalized];
      } else if (normalized.endsWith("k")) {
        const num = parseFloat(normalized.slice(0, -1));
        if (!Number.isNaN(num) && num > 0) {
          cellCount = Math.round(num * 1000);
        }
      } else {
        const parsed = parseInt(normalized, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          cellCount = parsed;
        }
      }
    }

    console.log(`📏 World size set to ${cellCount} cells (${options.size || "default large"})`);

    // Dynamic configuration of mock elements based on size
    mockElements.pointsInput.dataset.cells = String(cellCount);
    mockElements.pointsInput.value = String(cellCount);

    const statesCount = Math.max(5, Math.min(30, Math.round(10 * (cellCount / 1000) ** 0.35)));
    const culturesCount = Math.max(3, Math.min(15, Math.round(7 * (cellCount / 1000) ** 0.25)));
    const religionsCount = Math.max(2, Math.min(10, Math.round(5 * (cellCount / 1000) ** 0.25)));

    mockElements.statesNumber.value = String(statesCount);
    mockElements.statesCountOutput.value = String(statesCount);

    mockElements.culturesInput.value = String(culturesCount);
    mockElements.culturesCountOutput.value = String(culturesCount);

    mockElements.religionsNumber.value = String(religionsCount);
    mockElements.religionsCountOutput.value = String(religionsCount);

    // Instantiate and bind mock elements to global scope
    for (const id in mockElements) {
      const el = document.getElementById(id);
      (global as any)[id] = el;
      if (global.window) {
        (global.window as any)[id] = el;
      }
    }

    // 1. Load Modules
    console.log("📦 Loading generation modules...");
    await import("../modules/index");
    const { generateGrid } = await import("../utils/graphUtils");

    // Initialize global biomesData
    if (global.Biomes) {
      (global as any).biomesData = global.Biomes.getDefault();
    }

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
        g: new Uint32Array(h.length).map((_, i) => i),
        biome: new Uint8Array(h.length).fill(1),
        f: new Uint32Array(h.length).fill(0),
        haven: new Uint32Array(h.length).fill(0),
        culture: new Uint16Array(h.length).fill(0),
        burg: new Uint16Array(h.length).fill(0),
        state: new Uint16Array(h.length).fill(0),
        religion: new Uint16Array(h.length).fill(0),
        area: new Float32Array(h.length).fill(100),
        pop: new Float32Array(h.length).fill(0),
        r: new Uint16Array(h.length).fill(0),
        fl: new Float32Array(h.length).fill(0),
        conf: new Uint8Array(h.length).fill(0),
        harbor: new Uint8Array(h.length).fill(0),
        routes: {}
      },
      vertices: global.grid.vertices,
      states: [{ i: 0, name: "Wildlands" }],
      burgs: [{ i: 0, name: "None", population: 0 }],
      cultures: [{ i: 0, name: "Wildlands" }],
      provinces: [],
      religions: [],
      rivers: [],
      features: [{ i: 0, type: "ocean" }]
    };

    // Calculate suitability and population (simplified rankCells)
    const rankCells = () => {
      const { cells } = global.pack;
      const length = cells.i.length;
      for (let i = 0; i < length; i++) {
        if (cells.h[i] < 20) {
          cells.s[i] = 0;
          cells.pop[i] = 0;
        } else {
          // Suitability is higher at lower elevations (FMG concept)
          const suitability = Math.max(10, 100 - cells.h[i]);
          cells.s[i] = suitability;
          cells.pop[i] = suitability;
        }
      }
    };
    rankCells();

    // Initialize global options
    (global as any).options = {
      year: 1000,
      era: "Common Era",
      eraShort: "CE",
      burgs: {
        groups: [
          {
            name: "Generic",
            active: true,
            order: 7,
            isDefault: true,
            preview: "watabou-city"
          }
        ]
      }
    };

    // 6. Run Pipeline
    console.log("🏛️ Generating geography, cultures and states...");
    if (global.Names) (global as any).nameBases = global.Names.getNameBases();
    if (global.Cultures) {
      global.Cultures.generate();
      global.Cultures.expand();
    }
    if (global.Burgs) {
      global.Burgs.generate();
    }
    if (global.States) {
      global.States.generate();
    }
    if (global.Routes) {
      global.Routes.generate();
    }
    if (global.Religions) {
      global.Religions.generate();
    }
    if (global.Burgs) {
      global.Burgs.specify();
    }
    if (global.States) {
      global.States.collectStatistics();
      global.States.defineStateForms();
    }

    // 7. Post-Geography Hook
    await pluginManager.runHook("postGeography", global);

    // 8. Generate AI Lore (Phase 2)
    let lore = null;
    if (options.aiKey) {
      console.log("🧠 Weaving world lore with Gemini AI...");
      const loreGenerator = new LoreGenerator(options.aiKey);
      lore = await loreGenerator.generateLore(global);
    }

    // 9. Post-Lore Hook
    if (lore) {
      await pluginManager.runHook("postLore", lore);
    }

    // 10. Export
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

    await pluginManager.runHook("onExport", worldData);

    fs.writeFileSync(options.output, JSON.stringify(worldData, null, 2));

    const duration = ((Date.now() - timeStart) / 1000).toFixed(2);
    console.log(`✅ World generated successfully in ${duration}s!`);
    console.log(`💾 Data saved to: ${options.output}`);

    return worldData;
  } catch (error) {
    console.error("❌ Error during generation:", error);
    throw error;
  }
}
