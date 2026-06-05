import express from "express";
import { runWorldGenerator } from "../bin/engine";

export function startServer(port: number, aiKey?: string, plugins?: string) {
  const app = express();
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/generate", async (req, res) => {
    const seed = req.body.seed || Math.random().toString(36).substring(2, 15);
    const output = `world_${seed}.json`;
    
    console.log(`📡 API Request: Generating world with seed ${seed}`);
    
    try {
      const worldData = await runWorldGenerator({
        seed,
        output,
        aiKey: req.body.aiKey || aiKey,
        plugins: req.body.plugins || plugins
      });
      
      res.status(200).json(worldData);
    } catch (error: any) {
      console.error("❌ API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`\n🚀 World Generator API listening at http://localhost:${port}`);
    console.log(`   POST /generate { "seed": "...", "aiKey": "..." }`);
    console.log(`   Check health: http://localhost:${port}/health\n`);
  });
}
