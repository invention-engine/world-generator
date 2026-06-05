import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

export interface PluginHooks {
  /** Called before the generation pipeline starts */
  preGenerate?: (options: any) => Promise<void> | void;

  /** Called after geography (FMG) is generated, but before Lore (AI) */
  postGeography?: (worldData: any) => Promise<void> | void;

  /** Called after Lore (AI) is generated */
  postLore?: (worldData: any) => Promise<void> | void;

  /** Called just before the final data is exported to JSON */
  onExport?: (worldData: any) => Promise<void> | void;
}

export class PluginManager {
  private plugins: PluginHooks[] = [];

  async loadPlugins(pluginsDir: string) {
    if (!fs.existsSync(pluginsDir)) {
      console.warn(`Plugin directory not found: ${pluginsDir}`);
      return;
    }

    const files = fs.readdirSync(pluginsDir);
    for (const file of files) {
      if (file.endsWith(".js") || file.endsWith(".ts")) {
        try {
          const pluginPath = path.resolve(pluginsDir, file);
          const pluginUrl = pathToFileURL(pluginPath).href;
          // Using dynamic import. Note: for .ts we rely on tsx/ts-node
          const plugin = await import(pluginUrl);
          this.plugins.push(plugin.default || plugin);
          console.log(`🔌 Loaded plugin: ${file}`);
        } catch (error) {
          console.error(`❌ Failed to load plugin ${file}:`, error);
        }
      }
    }
  }

  async runHook(hookName: keyof PluginHooks, data: any) {
    for (const plugin of this.plugins) {
      const hook = plugin[hookName];
      if (typeof hook === "function") {
        try {
          await hook(data);
        } catch (error) {
          console.error(`❌ Error in plugin hook ${hookName}:`, error);
        }
      }
    }
  }
}
