import { PluginHooks } from "../src/utils/plugin-manager";

const SamplePlugin: PluginHooks = {
  preGenerate: (options) => {
    console.log("🛠️ [Sample Plugin] preGenerate hook called. Target output:", options.output);
  },
  
  postGeography: (globalData) => {
    console.log("🌍 [Sample Plugin] postGeography hook called. Cells generated:", globalData.grid.cells.i.length);
    // Example mutation: Force a specific state name if it exists
    if (globalData.pack.states.length > 0) {
      globalData.pack.states[0].name = "The Unified Empire";
    }
  },
  
  postLore: (lore) => {
    console.log("📚 [Sample Plugin] postLore hook called. World name:", lore.worldName);
    // Example mutation: Append a subtitle to the world name
    lore.worldName += " (The Eternal Realm)";
  },
  
  onExport: (worldData) => {
    console.log("💾 [Sample Plugin] onExport hook called. Adding custom metadata...");
    (worldData as any).metadata = {
      generatedBy: "Invention Engine World Generator",
      timestamp: new Date().toISOString(),
      pluginApplied: "SamplePlugin"
    };
  }
};

export default SamplePlugin;
