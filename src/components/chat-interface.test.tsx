import { fetchAuthSession } from "aws-amplify/auth";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { parseChatRequest } from "@/lib/chat-helpers";
import {
  LONG_STREAM_RECONCILIATION_OPTIONS,
  reconcileThreadAfterStream,
} from "@/lib/chat-reconciliation";
import type { ReconciliationTelemetryEvent } from "@/lib/chat-reconciliation";
import { canSubmitPromptMessage } from "@/lib/chat-utils";
import type { MyUIMessage } from "@/types/ui-message";
import {
  ChatRuntimeError,
  getChatTransportApi,
  getToolRenderingMetadata,
  prepareChatSendMessagesRequest,
  shouldShowArtifactPackageHeartbeat,
  summarizeMessagesForTelemetry,
  toolRenderKey,
} from "./chat-interface";

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

const fetchAuthSessionMock = vi.mocked(fetchAuthSession);

describe("canSubmitPromptMessage", () => {
  it("bloquea envío cuando no hay texto ni adjuntos", () => {
    expect(
      canSubmitPromptMessage({
        text: "   ",
        files: [],
      }),
    ).toBe(false);
  });

  it("permite envío cuando hay texto", () => {
    expect(
      canSubmitPromptMessage({
        text: "Hola",
        files: [],
      }),
    ).toBe(true);
  });

  it("permite envío cuando solo hay adjuntos", () => {
    expect(
      canSubmitPromptMessage({
        text: "",
        files: [
          {
            type: "file",
            mediaType: "text/plain",
            url: "data:text/plain;base64,QQ==",
            filename: "notes.txt",
          },
        ],
      }),
    ).toBe(true);
  });
});

describe("chat transport configuration", () => {
  it("uses the production Lambda Function URL by default", () => {
    expect(getChatTransportApi()).toBe(
      "https://i2bquluu4ttmvzpuxva665dlye0tnunw.lambda-url.us-east-1.on.aws/",
    );
  });
});

describe("prepareChatSendMessagesRequest", () => {
  it("serializes AI SDK v6 send options into the chat route payload contract", async () => {
    fetchAuthSessionMock.mockResolvedValueOnce({
      tokens: {
        accessToken: { toString: () => "access-token" },
      },
    } as Awaited<ReturnType<typeof fetchAuthSession>>);
    const messages: MyUIMessage[] = [
      {
        id: "message-1",
        role: "user",
        parts: [{ type: "text", text: "Draft a hearing summary" }],
      },
    ];

    const prepared = await prepareChatSendMessagesRequest({
      body: {
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
        webSearchEnabled: false,
      },
      messageId: undefined,
      messages,
      trigger: "submit-message",
    });

    expect(prepared.body).toEqual({
      threadId: "thread-1",
      messages,
      trigger: "submit-message",
      messageId: undefined,
      modelId: "claude-sonnet-4-6",
      webSearchEnabled: false,
    });
    expect(parseChatRequest(prepared.body).threadId).toBe("thread-1");
  });

  it("adds a Cognito access-token Authorization header", async () => {
    fetchAuthSessionMock.mockResolvedValueOnce({
      tokens: {
        accessToken: { toString: () => "access-token" },
      },
    } as Awaited<ReturnType<typeof fetchAuthSession>>);
    const messages: MyUIMessage[] = [
      {
        id: "message-1",
        role: "user",
        parts: [{ type: "text", text: "Hello" }],
      },
    ];

    const prepared = await prepareChatSendMessagesRequest({
      body: {
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
      },
      messageId: undefined,
      messages,
      trigger: "submit-message",
    });

    expect(prepared.headers).toEqual({ authorization: "Bearer access-token" });
    expect(prepared.body).toMatchObject({ threadId: "thread-1", messages });
  });

  it("preserves regenerate message ids for server-side regeneration", async () => {
    fetchAuthSessionMock.mockResolvedValueOnce({
      tokens: {
        accessToken: { toString: () => "access-token" },
      },
    } as Awaited<ReturnType<typeof fetchAuthSession>>);
    const messages: MyUIMessage[] = [
      {
        id: "message-1",
        role: "user",
        parts: [{ type: "text", text: "Try again" }],
      },
    ];

    const prepared = await prepareChatSendMessagesRequest({
      body: { threadId: "thread-1", modelId: "claude-sonnet-4-6" },
      messageId: "assistant-1",
      messages,
      trigger: "regenerate-message",
    });

    expect(prepared.body).toMatchObject({
      threadId: "thread-1",
      messageId: "assistant-1",
      trigger: "regenerate-message",
      webSearchEnabled: false,
    });
    expect(parseChatRequest(prepared.body).regenerateMessageId).toBe("assistant-1");
  });
});

describe("tool rendering helpers", () => {
  it("hides internal loadSkill tool cards from the visible chat transcript", () => {
    const part = {
      type: "tool-loadSkill",
      state: "input-available",
      input: { skill: "h2o-field-brief" },
      toolCallId: "tool-1",
    } as unknown as MyUIMessage["parts"][number];

    expect(getToolRenderingMetadata(part)).toBeNull();
  });

  it("opens terminal artifact tools by default", () => {
    const part = {
      type: "tool-generateFieldBrief",
      state: "output-available",
      input: {},
      output: null,
      toolCallId: "tool-1",
    } as unknown as MyUIMessage["parts"][number];

    expect(getToolRenderingMetadata(part)).toMatchObject({
      kind: "artifact-tool",
      title: "Field Brief",
      defaultOpen: true,
    });
  });

  it("guards unknown objects that are not AI SDK tool parts", () => {
    expect(getToolRenderingMetadata({})).toBeNull();
    expect(getToolRenderingMetadata({ type: 123 })).toBeNull();
  });

  it("changes the tool render key when a tool becomes terminal", () => {
    expect(toolRenderKey("assistant-1", 0, false)).toBe("assistant-1-0-active");
    expect(toolRenderKey("assistant-1", 0, true)).toBe("assistant-1-0-terminal");
  });

  it("shows one high-level artifact package heartbeat while artifact tools are active", () => {
    const message: MyUIMessage = {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "tool-generateFieldBrief",
          state: "input-available",
          input: {},
          toolCallId: "tool-2",
        } as unknown as MyUIMessage["parts"][number],
        {
          type: "tool-generatePlaybook",
          state: "output-available",
          input: {},
          output: null,
          toolCallId: "tool-3",
        } as unknown as MyUIMessage["parts"][number],
      ],
    };

    expect(shouldShowArtifactPackageHeartbeat(message)).toBe(true);
  });

  it("hides the artifact package heartbeat once all artifact tools are terminal", () => {
    const message: MyUIMessage = {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "tool-generateFieldBrief",
          state: "output-available",
          input: {},
          output: null,
          toolCallId: "tool-2",
        } as unknown as MyUIMessage["parts"][number],
        {
          type: "tool-generatePlaybook",
          state: "output-error",
          input: {},
          errorText: "aborted",
          toolCallId: "tool-3",
        } as unknown as MyUIMessage["parts"][number],
      ],
    };

    expect(shouldShowArtifactPackageHeartbeat(message)).toBe(false);
  });

  it("summarizes visible and hidden parts for low-noise lifecycle telemetry", () => {
    const messages: MyUIMessage[] = [
      { id: "user-1", role: "user", parts: [{ type: "text", text: "Build artifacts" }] },
      {
        id: "assistant-1",
        role: "assistant",
        parts: [
          { type: "text", text: "Working" },
          {
            type: "tool-loadSkill",
            state: "output-available",
            input: {},
            output: "ok",
            toolCallId: "tool-1",
          } as unknown as MyUIMessage["parts"][number],
          {
            type: "tool-generateFieldBrief",
            state: "input-available",
            input: {},
            toolCallId: "tool-2",
          } as unknown as MyUIMessage["parts"][number],
        ],
      },
    ];

    expect(summarizeMessagesForTelemetry(messages)).toEqual({
      messageCount: 2,
      lastMessageId: "assistant-1",
      lastMessageRole: "assistant",
      visiblePartCount: 3,
      genericToolCount: 1,
      artifactToolCount: 1,
      hiddenPartCount: 1,
    });
  });
});

describe("reconcileThreadAfterStream", () => {
  it("uses a long artifact reconciliation budget with capped backoff", () => {
    expect(LONG_STREAM_RECONCILIATION_OPTIONS).toEqual({
      maxDurationMs: 300_000,
      maxRetryMs: 10_000,
      retryMs: 2_000,
      settleMs: 500,
    });
  });

  it("invalidates thread list and replaces useChat messages from persisted thread history", async () => {
    const invalidateQueries = vi.fn();
    const setMessages = vi.fn();
    const freshMessages: MyUIMessage[] = [
      {
        id: "assistant-1",
        role: "assistant",
        parts: [{ type: "text", text: "Persisted truth" }],
      },
    ];
    const fetchMessages = vi.fn().mockResolvedValue({ messages: freshMessages });
    const onTelemetry = vi.fn<(event: ReconciliationTelemetryEvent) => void>();

    await reconcileThreadAfterStream({
      fetchMessages,
      onTelemetry,
      getCurrentMessages: () => freshMessages,
      queryClient: { invalidateQueries },
      setMessages,
      settleMs: 0,
      threadId: "thread-1",
    });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["threads"] });
    expect(fetchMessages).toHaveBeenCalledWith({ threadId: "thread-1" });
    expect(setMessages).toHaveBeenCalledWith(freshMessages);
    expect(onTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "decision",
        reason: "applied",
        attempt: 1,
        currentLength: 1,
        freshLength: 1,
      }),
    );
  });

  it("does not replace live assistant messages with stale persisted history", async () => {
    const setMessages = vi.fn();
    const liveMessages: MyUIMessage[] = [
      { id: "user-1", role: "user", parts: [{ type: "text", text: "Build artifacts" }] },
      { id: "assistant-live", role: "assistant", parts: [{ type: "text", text: "Working" }] },
    ];
    const persistedBehind: MyUIMessage[] = [liveMessages[0]];
    const fetchMessages = vi.fn().mockResolvedValue({ messages: persistedBehind });
    const onTelemetry = vi.fn<(event: ReconciliationTelemetryEvent) => void>();

    await reconcileThreadAfterStream({
      fetchMessages,
      onTelemetry,
      getCurrentMessages: () => liveMessages,
      maxAttempts: 1,
      queryClient: { invalidateQueries: vi.fn() },
      setMessages,
      settleMs: 0,
      threadId: "thread-1",
    });

    expect(setMessages).not.toHaveBeenCalled();
    expect(onTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ type: "decision", reason: "persisted_behind", attempt: 1 }),
    );
    expect(onTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ type: "decision", reason: "exhausted", attempt: 1 }),
    );
  });

  it("polls until persisted history catches up to the live assistant message", async () => {
    const setMessages = vi.fn();
    const liveMessages: MyUIMessage[] = [
      { id: "user-1", role: "user", parts: [{ type: "text", text: "Build artifacts" }] },
      { id: "assistant-live", role: "assistant", parts: [{ type: "text", text: "Working" }] },
    ];
    const caughtUpMessages: MyUIMessage[] = [
      liveMessages[0],
      { id: "assistant-persisted", role: "assistant", parts: [{ type: "text", text: "Done" }] },
    ];
    const fetchMessages = vi
      .fn()
      .mockResolvedValueOnce({ messages: [liveMessages[0]] })
      .mockResolvedValueOnce({ messages: caughtUpMessages });

    await reconcileThreadAfterStream({
      fetchMessages,
      getCurrentMessages: () => liveMessages,
      maxAttempts: 2,
      queryClient: { invalidateQueries: vi.fn() },
      retryMs: 0,
      setMessages,
      settleMs: 0,
      threadId: "thread-1",
    });

    expect(fetchMessages).toHaveBeenCalledTimes(2);
    expect(setMessages).toHaveBeenCalledWith(caughtUpMessages);
  });

  it("polls until persisted terminal artifact states are available before applying", async () => {
    const setMessages = vi.fn();
    const liveMessages: MyUIMessage[] = [
      { id: "user-1", role: "user", parts: [{ type: "text", text: "Build artifacts" }] },
      {
        id: "assistant-live",
        role: "assistant",
        parts: [
          {
            type: "tool-generateFieldBrief",
            state: "input-available",
            input: {},
            toolCallId: "tool-1",
          } as unknown as MyUIMessage["parts"][number],
        ],
      },
    ];
    const nonTerminalSnapshot: MyUIMessage[] = [
      liveMessages[0],
      {
        id: "assistant-live",
        role: "assistant",
        parts: [
          {
            type: "tool-generateFieldBrief",
            state: "input-available",
            input: {},
            toolCallId: "tool-1",
          } as unknown as MyUIMessage["parts"][number],
        ],
      },
    ];
    const terminalSnapshot: MyUIMessage[] = [
      liveMessages[0],
      {
        id: "assistant-live",
        role: "assistant",
        parts: [
          {
            type: "tool-generateFieldBrief",
            state: "output-available",
            input: {},
            output: null,
            toolCallId: "tool-1",
          } as unknown as MyUIMessage["parts"][number],
        ],
      },
    ];
    const fetchMessages = vi
      .fn()
      .mockResolvedValueOnce({ messages: nonTerminalSnapshot })
      .mockResolvedValueOnce({ messages: terminalSnapshot });

    await reconcileThreadAfterStream({
      fetchMessages,
      getCurrentMessages: () => liveMessages,
      maxAttempts: 2,
      queryClient: { invalidateQueries: vi.fn() },
      retryMs: 0,
      setMessages,
      settleMs: 0,
      threadId: "thread-1",
      waitForTerminalArtifactTools: true,
    });

    expect(fetchMessages).toHaveBeenCalledTimes(2);
    expect(setMessages).toHaveBeenCalledWith(terminalSnapshot);
  });

  it("does not replace an active artifact tool with a stale non-terminal persisted snapshot", async () => {
    const setMessages = vi.fn();
    const liveMessages: MyUIMessage[] = [
      { id: "user-1", role: "user", parts: [{ type: "text", text: "Build artifacts" }] },
      {
        id: "assistant-live",
        role: "assistant",
        parts: [
          {
            type: "tool-generateFieldBrief",
            state: "input-available",
            input: {},
            toolCallId: "tool-1",
          } as unknown as MyUIMessage["parts"][number],
        ],
      },
    ];
    const fetchMessages = vi.fn().mockResolvedValue({ messages: liveMessages });
    const onTelemetry = vi.fn<(event: ReconciliationTelemetryEvent) => void>();

    await reconcileThreadAfterStream({
      fetchMessages,
      getCurrentMessages: () => liveMessages,
      maxAttempts: 1,
      onTelemetry,
      queryClient: { invalidateQueries: vi.fn() },
      setMessages,
      settleMs: 0,
      threadId: "thread-1",
      waitForTerminalArtifactTools: true,
    });

    expect(setMessages).not.toHaveBeenCalled();
    expect(onTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "artifact_terminal_missing", attempt: 1 }),
    );
  });

  it("does not replace messages when a newer reconciliation supersedes the request", async () => {
    const setMessages = vi.fn();
    const fetchMessages = vi.fn().mockResolvedValue({
      messages: [{ id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "old" }] }],
    });

    await reconcileThreadAfterStream({
      fetchMessages,
      getCurrentMessages: () => [],
      queryClient: { invalidateQueries: vi.fn() },
      setMessages,
      settleMs: 0,
      shouldApply: () => false,
      threadId: "thread-1",
    });

    expect(setMessages).not.toHaveBeenCalled();
  });

  it("reports persisted-message fetch errors without throwing", async () => {
    const onError = vi.fn();
    const fetchError = new Error("history unavailable");

    await expect(
      reconcileThreadAfterStream({
        fetchMessages: vi.fn().mockRejectedValue(fetchError),
        getCurrentMessages: () => [],
        onError,
        queryClient: { invalidateQueries: vi.fn() },
        setMessages: vi.fn(),
        settleMs: 0,
        threadId: "thread-1",
      }),
    ).resolves.toBeUndefined();

    expect(onError).toHaveBeenCalledWith(fetchError);
  });
});

describe("ChatRuntimeError", () => {
  it("renders server/model failures as a visible alert", () => {
    const markup = renderToStaticMarkup(
      <ChatRuntimeError message="Amplify outputs are not configured" />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Chat request failed");
    expect(markup).toContain("Amplify outputs are not configured");
  });
});
