import { type SystemModelMessage, stepCountIs, ToolLoopAgent, type ToolSet } from "ai";
import { h2oAllegiantPrompt } from "@/ai/prompts/h2o-allegiant";
import { buildSkillsXmlBlock } from "@/ai/skills/discover";
import { loadSkillTool } from "@/ai/tools/load-skill";
import { MODELS } from "@/config/models";
import { bedrockProvider } from "@/lib/bedrock-provider";

// Skills block is auto-discovered at module load from src/ai/skills/*/SKILL.md.
// Runs ONCE per Lambda container (top-level evaluation) — not per request.
const SKILLS_BLOCK = buildSkillsXmlBlock();

// Exported for tests + inspection tooling that needs the concatenated content
// the agent runs against. The runtime composition uses the array shape below
// for cache stability.
export const H2O_AGENT_INSTRUCTIONS = `${h2oAllegiantPrompt.trim()}\n\n${SKILLS_BLOCK}`;

// The `instructions` slot accepts Array<SystemModelMessage>, which lets us
// split the prompt into a STABLE cacheable prefix (the static H2O prompt) and
// a DYNAMIC suffix (the auto-discovered skills block). Bedrock prompt cache
// hashes the prefix up to each cachePoint, so editing any SKILL.md no longer
// invalidates the ~10K-token static prefix — only the small skills suffix
// (~600 bytes) has to be re-sent on cache miss. Without this split, ANY edit
// to any SKILL.md description would blow the 1h cache for the entire account.
//
// Sonnet 4.6 supports a 1h cache TTL. The static prompt is well above the
// 1024-token cache marker minimum and is stable across turns, so the cache
// write happens on the first turn and every subsequent step within the TTL
// reads the cache instead of paying full input cost again.
const H2O_AGENT_SYSTEM_MESSAGES: SystemModelMessage[] = [
  {
    role: "system",
    content: h2oAllegiantPrompt.trim(),
    providerOptions: {
      bedrock: { cachePoint: { type: "default", ttl: "1h" } },
    },
  },
  {
    role: "system",
    content: SKILLS_BLOCK,
  },
];

// Worst case opportunity-advancing turn: loadSkill (up to 3) + 4 generate* +
// 1 closing reply = 8. Cap at 10 so the model has 2 steps of headroom to
// recover from a tool-error (malformed input → tool-error → retry) without
// hitting the stop condition mid-recovery.
const AGENT_MAX_STEPS = 10;

// Sonnet 4.6 supports up to 64K output tokens; cap at 32K to leave headroom for
// large tool-call payloads (Field Brief JSON ~3-4K) plus a long closing reply
// without giving the model unlimited budget on a single step.
const AGENT_MAX_OUTPUT_TOKENS = 32_768;

type CreateAgentOptions = {
  tools?: ToolSet;
};

export const createAgent = ({ tools = {} }: CreateAgentOptions = {}) =>
  new ToolLoopAgent({
    model: bedrockProvider(MODELS[0].runtimeModelId),
    instructions: H2O_AGENT_SYSTEM_MESSAGES,
    stopWhen: stepCountIs(AGENT_MAX_STEPS),
    maxOutputTokens: AGENT_MAX_OUTPUT_TOKENS,
    tools: {
      loadSkill: loadSkillTool,
      ...tools,
    },
    onStepFinish: ({ toolCalls, finishReason, usage }) => {
      const toolNames = toolCalls.map((call) => call.toolName).join(",") || "none";
      const outputTokens = usage.outputTokens ?? 0;

      console.log("[agent] step:finish", {
        finishReason,
        tools: toolNames,
        usage: {
          input: usage.inputTokens,
          output: outputTokens,
          cacheRead: usage.inputTokenDetails?.cacheReadTokens,
          cacheWrite: usage.inputTokenDetails?.cacheWriteTokens,
          total: usage.totalTokens,
        },
      });
    },
  });

export const agent = createAgent();

export type Agent = ReturnType<typeof createAgent>;
