import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export interface LoreData {
  worldName: string;
  creationMyth: string;
  era: string;
  cultures: Array<{
    name: string;
    description: string;
    values: string[];
    traditions: string[];
  }>;
  history: Array<{
    era: string;
    event: string;
    description: string;
  }>;
}

export class LoreGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);

    const schema = {
      description: "Lore data for a fantasy world",
      type: SchemaType.OBJECT,
      properties: {
        worldName: { type: SchemaType.STRING, description: "The name of the world" },
        creationMyth: { type: SchemaType.STRING, description: "A brief creation myth for the world" },
        era: { type: SchemaType.STRING, description: "The current era name" },
        cultures: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
              values: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              traditions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["name", "description", "values", "traditions"]
          }
        },
        history: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              era: { type: SchemaType.STRING },
              event: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING }
            },
            required: ["era", "event", "description"]
          }
        }
      },
      required: ["worldName", "creationMyth", "era", "cultures", "history"]
    };

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
  }

  async generateLore(worldData: any): Promise<LoreData> {
    const culturesList = worldData.pack.cultures.map((c: any) => c.name).join(", ");
    const statesList = worldData.pack.states.map((s: any) => s.name).join(", ");

    const prompt = `
      You are a master world-builder and RPG dungeon master. 
      I have generated a procedural fantasy world map with the following data:
      
      - Seed: ${worldData.seed}
      - Cultures: ${culturesList}
      - States: ${statesList}
      
      Generate a comprehensive lore bible for this world in JSON format.
      The lore should feel cohesive and respond to the names generated.
      Focus on a "High Fantasy" theme unless the names suggest otherwise.
      Provide a name for the world, a creation myth, and a timeline of 3 historical events.
      For each of the following cultures: ${culturesList}, provide a description, 3 core values, and 2 unique traditions.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text()) as LoreData;
    } catch (error) {
      console.error("Error generating lore with Gemini:", error);
      throw error;
    }
  }
}
