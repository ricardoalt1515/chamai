import { readFileSync } from "node:fs";
import { ToolLoopAgent } from "ai";
import { loadSkillTool } from "@/ai/tools/load-skill";
import { MODELS } from "@/config/models";
import { bedrockProvider } from "@/lib/bedrock-provider";

const instructions = readFileSync(
  new URL("../prompts/water-sector.md", import.meta.url),
  "utf8",
).trim();

export const agent = new ToolLoopAgent({
  model: bedrockProvider(MODELS[0].runtimeModelId),
  instructions,
  tools: {
    loadSkill: loadSkillTool,
  },
});

export type Agent = typeof agent;
