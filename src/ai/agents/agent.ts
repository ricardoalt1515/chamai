import {
  generateText,
  NoSuchToolError,
  type PrepareStepFunction,
  type SystemModelMessage,
  stepCountIs,
  ToolLoopAgent,
  type ToolSet,
} from "ai";
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
// 1 closing text = 8. Cap at 10 to leave 2 steps of headroom for tool-input
// repair attempts. The loop terminates naturally when the model decides it's
// done — typically after the closing text step where prepareStep has filtered
// completed artifact tools out of `activeTools`, leaving only `loadSkill`.
// The model sees no useful tool to call and generates a closing summary.
const AGENT_MAX_STEPS = 10;

// Sonnet 4.6 supports up to 64K output tokens; cap at 32K to leave headroom for
// large tool-call payloads (Field Brief JSON ~3-4K) plus a long closing reply
// without giving the model unlimited budget on a single step.
const AGENT_MAX_OUTPUT_TOKENS = 32_768;

const MODEL_TOKEN_PRICES_USD_PER_MILLION: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-opus-4-7": { input: 5, output: 25 },
};

const estimateTokenCostUsd = ({
  modelId,
  inputTokens,
  outputTokens,
}: {
  modelId: string;
  inputTokens: number;
  outputTokens: number;
}): number | null => {
  const prices = MODEL_TOKEN_PRICES_USD_PER_MILLION[modelId];
  if (!prices) {
    return null;
  }

  return (inputTokens / 1_000_000) * prices.input + (outputTokens / 1_000_000) * prices.output;
};

const ARTIFACT_TOOL_SEQUENCE = [
  "generateFieldBrief",
  "generatePlaybook",
  "generateAnalyticalRead",
  "generateProposalShell",
] as const;

type ArtifactToolName = (typeof ARTIFACT_TOOL_SEQUENCE)[number];

export type ArtifactKind = "field-brief" | "playbook" | "analytical-read" | "proposal-shell";

const ARTIFACT_TOOL_TO_KIND: Record<ArtifactToolName, ArtifactKind> = {
  generateFieldBrief: "field-brief",
  generatePlaybook: "playbook",
  generateAnalyticalRead: "analytical-read",
  generateProposalShell: "proposal-shell",
};

type StepContentPartLike = {
  type?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
};

type LoadSkillInputLike = {
  name?: unknown;
  skill?: unknown;
};

const isArtifactToolName = (toolName: string | undefined): toolName is ArtifactToolName =>
  typeof toolName === "string" && ARTIFACT_TOOL_SEQUENCE.includes(toolName as ArtifactToolName);

const loadSkillNameFrom = (value: unknown): string | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const input = value as LoadSkillInputLike;
  if (typeof input.name === "string") {
    return input.name;
  }
  if (typeof input.skill === "string") {
    return input.skill;
  }

  return null;
};

const isLoadedSkillPart = (part: StepContentPartLike, skillName: string): boolean =>
  part.toolName === "loadSkill" &&
  (loadSkillNameFrom(part.input) === skillName || loadSkillNameFrom(part.output) === skillName);

const activeToolsWithoutCompletedArtifacts = (
  completedArtifacts: Set<ArtifactToolName>,
): ReturnType<PrepareStepFunction<ToolSet>> =>
  ({
    activeTools: [
      "loadSkill",
      ...ARTIFACT_TOOL_SEQUENCE.filter((toolName) => !completedArtifacts.has(toolName)),
    ],
  }) as ReturnType<PrepareStepFunction<ToolSet>>;

// Builds a prepareStep policy that optionally announces the next artifact
// kind via `onNextArtifact` before returning the active tool set. The
// announcement closes the user-visible gap where the model is silently
// composing the next artifact's tool input JSON for tens of seconds.
const buildArtifactPrepareStep =
  (onNextArtifact?: (kind: ArtifactKind) => void): PrepareStepFunction<ToolSet> =>
  ({ steps }) => {
    let artifactStarted = false;
    let fieldBriefSkillLoaded = false;
    const completedArtifacts = new Set<ArtifactToolName>();

    for (const step of steps) {
      for (const part of step.content as StepContentPartLike[]) {
        if (isLoadedSkillPart(part, "h2o-field-brief")) {
          fieldBriefSkillLoaded = true;
        }
        if (!isArtifactToolName(part.toolName)) {
          continue;
        }

        if (
          part.type === "tool-call" ||
          part.type === "tool-result" ||
          part.type === "tool-error"
        ) {
          artifactStarted = true;
        }

        if (part.type === "tool-result") {
          completedArtifacts.add(part.toolName);
        }
      }
    }

    if (!artifactStarted && !fieldBriefSkillLoaded) {
      return undefined;
    }

    if (onNextArtifact) {
      const nextTool = ARTIFACT_TOOL_SEQUENCE.find((tool) => !completedArtifacts.has(tool));
      if (nextTool) {
        onNextArtifact(ARTIFACT_TOOL_TO_KIND[nextTool]);
      }
    }

    return activeToolsWithoutCompletedArtifacts(completedArtifacts);
  };

type AgentToolSet = { loadSkill: typeof loadSkillTool } & ToolSet;

const repairInvalidToolInput: NonNullable<
  ConstructorParameters<typeof ToolLoopAgent<AgentToolSet>>[0]["experimental_repairToolCall"]
> = async ({ toolCall, tools, error, messages, system }) => {
  if (NoSuchToolError.isInstance(error)) {
    return null;
  }

  const result = await generateText({
    model: bedrockProvider(MODELS[0].runtimeModelId),
    system,
    messages: [
      ...messages,
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            input: toolCall.input,
          },
        ],
      },
      {
        role: "tool" as const,
        content: [
          {
            type: "tool-result",
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            output: { type: "text", value: error.message },
          },
        ],
      },
    ],
    tools,
  });

  const repairedToolCall = result.toolCalls.find(
    (candidate) => candidate.toolName === toolCall.toolName,
  );

  return repairedToolCall == null
    ? null
    : {
        type: "tool-call" as const,
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        input: JSON.stringify(repairedToolCall.input),
      };
};

type CreateAgentOptions = {
  tools?: ToolSet;
  usageContext?: {
    threadId: string;
    userId: string;
  };
  // Fires once per step transition with the next artifact kind the agent is
  // about to invoke. The chat handler uses this to write a
  // `data-agent-status` chunk so the UI can label the silent model-thinking
  // window between artifact tool calls.
  onNextArtifact?: (kind: ArtifactKind) => void;
};

export const createAgent = ({
  tools = {},
  usageContext,
  onNextArtifact,
}: CreateAgentOptions = {}) =>
  new ToolLoopAgent({
    model: bedrockProvider(MODELS[0].runtimeModelId),
    instructions: H2O_AGENT_SYSTEM_MESSAGES,
    stopWhen: stepCountIs(AGENT_MAX_STEPS),
    maxOutputTokens: AGENT_MAX_OUTPUT_TOKENS,
    tools: {
      loadSkill: loadSkillTool,
      ...tools,
    },
    prepareStep: buildArtifactPrepareStep(
      onNextArtifact,
    ) as unknown as PrepareStepFunction<AgentToolSet>,
    experimental_repairToolCall: repairInvalidToolInput,
    onStepFinish: ({ stepNumber, toolCalls, finishReason, usage }) => {
      const toolNames = toolCalls.map((call) => call.toolName).join(",") || "none";
      const inputTokens = usage.inputTokens ?? 0;
      const outputTokens = usage.outputTokens ?? 0;

      const model = MODELS[0];
      const estimatedCostUsd = estimateTokenCostUsd({
        modelId: model.id,
        inputTokens,
        outputTokens,
      });

      console.log("AI_USAGE", {
        threadId: usageContext?.threadId,
        userId: usageContext?.userId,
        modelId: model.id,
        runtimeModelId: model.runtimeModelId,
        inputTokens,
        outputTokens,
        totalTokens: usage.totalTokens,
        estimatedCostUsd,
      });

      console.log("[agent] step:finish", {
        event: "agent_step_finished",
        stepNumber,
        finishReason,
        tools: toolNames,
        usage: {
          input: inputTokens,
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
