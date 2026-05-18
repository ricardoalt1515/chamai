import { readFileSync } from "node:fs";
import type { ToolSet } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

const toolLoopAgentMock = vi.hoisted(() => vi.fn());
const stepCountIsMock = vi.hoisted(() => vi.fn((count: number) => ({ __stopAt: count })));

const generateTextMock = vi.hoisted(() => vi.fn());

vi.mock("ai", () => ({
  ToolLoopAgent: toolLoopAgentMock,
  stepCountIs: stepCountIsMock,
  tool: vi.fn((config: unknown) => config),
  generateText: generateTextMock,
  NoSuchToolError: { isInstance: vi.fn(() => false) },
}));
vi.mock("@/lib/bedrock-provider", () => ({ bedrockProvider: vi.fn((id: string) => ({ id })) }));

const { createAgent } = await import("./agent");

describe("createAgent", () => {
  beforeEach(() => {
    generateTextMock.mockReset();
  });
  it("preserves loadSkill while adding request-scoped artifact tools", () => {
    const artifactTool = { description: "artifact" } as unknown as ToolSet[string];

    createAgent({ tools: { generateFieldBrief: artifactTool } });

    expect(toolLoopAgentMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tools: expect.objectContaining({
          loadSkill: expect.anything(),
          generateFieldBrief: artifactTool,
        }),
      }),
    );
  });

  it("caps step count at 10 (8 worst-case + 2 for model self-recovery) and wires accounting callbacks", () => {
    createAgent();

    expect(stepCountIsMock).toHaveBeenCalledWith(10);
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];
    expect(settings).toEqual(
      expect.objectContaining({
        stopWhen: { __stopAt: 10 },
        onStepFinish: expect.any(Function),
        maxOutputTokens: 32_768,
      }),
    );
    expect(settings.experimental_repairToolCall).toEqual(expect.any(Function));
  });

  it("splits instructions into a cacheable static prompt + dynamic skills suffix", () => {
    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];
    // Array shape lets the Bedrock cachePoint hash the static prompt prefix
    // independently of the dynamic auto-discovered skills block. Editing any
    // SKILL.md should not invalidate the static prefix cache.
    expect(Array.isArray(settings.instructions)).toBe(true);
    expect(settings.instructions).toHaveLength(2);

    const [staticMsg, skillsMsg] = settings.instructions;

    expect(staticMsg).toEqual(
      expect.objectContaining({
        role: "system",
        content: expect.stringContaining("H2O Allegiant"),
        providerOptions: {
          bedrock: { cachePoint: { type: "default", ttl: "1h" } },
        },
      }),
    );

    // Dynamic suffix must NOT carry a cachePoint — it changes per SKILL.md edit.
    expect(skillsMsg).toEqual(
      expect.objectContaining({
        role: "system",
        content: expect.stringContaining("<available_skills>"),
      }),
    );
    expect(skillsMsg.providerOptions).toBeUndefined();
  });

  it("auto-discovered skills suffix contains at least one known H2O skill name", () => {
    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];
    const skillsMsg = settings.instructions[1];
    const knownSkills = [
      "h2o-evidence-and-context",
      "h2o-stage-and-gaps",
      "h2o-positioning",
      "h2o-field-brief",
      "h2o-allegiant-brand",
    ];
    expect(knownSkills.some((name) => skillsMsg.content.includes(name))).toBe(true);
  });

  it("static prompt encodes the trigger-condition contract (file attach + explicit phrases)", () => {
    // Behavioral pin: if a future prompt edit drops the trigger semantics, this
    // test fails loudly. The agent has no server-side reminder anymore, so the
    // prompt itself must carry the contract.
    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];
    const staticContent: string = settings.instructions[0].content;
    // File attachment trigger
    expect(staticContent.toLowerCase()).toMatch(/file attachment|attaches a file/);
    // Explicit-request trigger phrases
    expect(staticContent).toContain("give me the brief");
    expect(staticContent).toContain("field brief please");
    // The four tool names must be present so the model can resolve them
    for (const tool of [
      "generateFieldBrief",
      "generatePlaybook",
      "generateAnalyticalRead",
      "generateProposalShell",
    ]) {
      expect(staticContent).toContain(tool);
    }
  });

  it("keeps artifact tools available after field brief skill load without forcing a named artifact", () => {
    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];

    expect(settings.prepareStep({ steps: [] })).toBeUndefined();

    const afterFieldBriefSkill = settings.prepareStep({
      steps: [
        {
          content: [
            { type: "tool-call", toolName: "loadSkill", input: { name: "h2o-field-brief" } },
            { type: "tool-result", toolName: "loadSkill", output: { name: "h2o-field-brief" } },
          ],
        },
      ],
    });

    expect(afterFieldBriefSkill).toEqual({
      activeTools: [
        "loadSkill",
        "generateFieldBrief",
        "generatePlaybook",
        "generateAnalyticalRead",
        "generateProposalShell",
      ],
    });
  });

  it("removes completed artifact tools from the active set without forcing the next named tool", () => {
    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];

    const afterFieldBrief = settings.prepareStep({
      steps: [
        {
          content: [
            { type: "tool-call", toolName: "generateFieldBrief" },
            { type: "tool-result", toolName: "generateFieldBrief" },
          ],
        },
      ],
    });

    expect(afterFieldBrief).toEqual({
      activeTools: [
        "loadSkill",
        "generatePlaybook",
        "generateAnalyticalRead",
        "generateProposalShell",
      ],
    });

    const afterPlaybook = settings.prepareStep({
      steps: [
        {
          content: [
            { type: "tool-result", toolName: "generateFieldBrief" },
            { type: "tool-result", toolName: "generatePlaybook" },
          ],
        },
      ],
    });

    expect(afterPlaybook).toEqual({
      activeTools: ["loadSkill", "generateAnalyticalRead", "generateProposalShell"],
    });
  });

  it("keeps artifact tools unrestricted before field brief composition and disables tools after all artifacts finish", () => {
    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];

    expect(
      settings.prepareStep({
        steps: [{ content: [{ type: "tool-call", toolName: "loadSkill" }] }],
      }),
    ).toBeUndefined();

    expect(
      settings.prepareStep({
        steps: [
          {
            content: [
              { type: "tool-result", toolName: "generateFieldBrief" },
              { type: "tool-result", toolName: "generatePlaybook" },
              { type: "tool-result", toolName: "generateAnalyticalRead" },
              { type: "tool-result", toolName: "generateProposalShell" },
            ],
          },
        ],
      }),
    ).toEqual({ toolChoice: "none" });
  });

  it("repairs invalid tool input by re-asking for the same tool call", async () => {
    generateTextMock.mockResolvedValueOnce({
      toolCalls: [{ toolName: "generateFieldBrief", input: { title: "Fixed brief" } }],
    });

    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];

    const repaired = await settings.experimental_repairToolCall({
      toolCall: {
        type: "tool-call",
        toolCallId: "call-1",
        toolName: "generateFieldBrief",
        input: "{bad json",
      },
      tools: { generateFieldBrief: { description: "brief" } },
      error: new Error("Invalid tool input"),
      messages: [{ role: "user", content: "build a field brief" }],
      system: "system prompt",
      inputSchema: vi.fn(),
    });

    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        system: "system prompt",
        tools: { generateFieldBrief: { description: "brief" } },
      }),
    );
    expect(repaired).toEqual({
      type: "tool-call",
      toolCallId: "call-1",
      toolName: "generateFieldBrief",
      input: JSON.stringify({ title: "Fixed brief" }),
    });
  });

  it("does not repair invalid tool names", async () => {
    const { NoSuchToolError } = await import("ai");
    vi.mocked(NoSuchToolError.isInstance).mockReturnValueOnce(true);

    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];

    const repaired = await settings.experimental_repairToolCall({
      toolCall: {
        type: "tool-call",
        toolCallId: "call-2",
        toolName: "unknownTool",
        input: "{}",
      },
      tools: {},
      error: new Error("No such tool"),
      messages: [{ role: "user", content: "make a pdf" }],
      system: "system prompt",
      inputSchema: vi.fn(),
    });

    expect(repaired).toBeNull();
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("static prompt and field brief skill describe sequential real artifact tools only", () => {
    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];
    const staticContent: string = settings.instructions[0].content;
    const skillContent = readFileSync("src/ai/skills/h2o-field-brief/SKILL.md", "utf8");

    expect(staticContent).toContain("one artifact tool at a time");
    expect(staticContent).toContain("Direct Q&A");
    expect(staticContent).toContain("Recoverable tool/schema/content issue");
    expect(staticContent).not.toContain("emit ALL FOUR tool_use calls");
    expect(staticContent).not.toContain("single parallel tool-call batch");

    expect(skillContent).toContain("generateFieldBrief");
    expect(skillContent).toContain("generateProposalShell");
    expect(skillContent).not.toContain("present_files");
    expect(skillContent).not.toContain("/mnt/user-data/outputs");
  });

  it("onStepFinish logs structured usage", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    createAgent();
    const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];

    settings.onStepFinish({
      stepNumber: 3,
      toolCalls: [{ toolName: "generateFieldBrief" }],
      finishReason: "tool-calls",
      usage: {
        inputTokens: 5000,
        outputTokens: 28_000,
        totalTokens: 33_000,
        inputTokenDetails: { cacheReadTokens: 4500, cacheWriteTokens: 0 },
      },
    });

    expect(logSpy).toHaveBeenCalledWith(
      "[agent] step:finish",
      expect.objectContaining({
        event: "agent_step_finished",
        stepNumber: 3,
        finishReason: "tool-calls",
        tools: "generateFieldBrief",
        usage: expect.objectContaining({ input: 5000, output: 28_000, cacheRead: 4500 }),
      }),
    );
    expect(warnSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
