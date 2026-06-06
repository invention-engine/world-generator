import { Command } from "commander";
import { startServer } from "../utils/server";
import { runWorldGenerator } from "./engine";

const program = new Command();

program.name("world-generator").description("Headless RPG World Generator with Gemini AI").version("1.0.0");

program
  .command("generate")
  .description("Generate a new world data package")
  .option("-s, --seed <string>", "Seed for the random number generator")
  .option("-o, --output <path>", "Path to save the generated JSON", "world.json")
  .option("-k, --ai-key <string>", "Google Gemini API Key for lore generation")
  .option("-p, --plugins <path>", "Directory containing plugins", "plugins")
  .option(
    "-z, --size <string>",
    "World size: tiny (1K), small (2.5K), medium (5K), large (10K), huge (20K), extreme (30K), endless (40K), or custom count",
    "large"
  )
  .action(async options => {
    try {
      await runWorldGenerator(options);
    } catch (_error) {
      process.exit(1);
    }
  });

program
  .command("serve")
  .description("Start a lightweight API server for on-demand generation")
  .option("-P, --port <number>", "Port to listen on", "3000")
  .option("-k, --ai-key <string>", "Default AI Key for server-side generation")
  .option("-p, --plugins <path>", "Plugin directory", "plugins")
  .option(
    "-z, --size <string>",
    "Default world size: tiny (1K), small (2.5K), medium (5K), large (10K), huge (20K), extreme (30K), endless (40K), or custom count",
    "large"
  )
  .action(options => {
    startServer(parseInt(options.port, 10), options.aiKey, options.plugins, options.size);
  });

program.parse();
