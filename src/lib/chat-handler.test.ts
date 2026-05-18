import type { UIMessage } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Agent } from "@/ai/agents/agent";
import { ATTACHMENT_ERROR_CODES } from "@/lib/chat-helpers";
import type { BlobStore } from "@/lib/storage/blob-store";
import type { ChatStore } from "@/lib/storage/chat-store";

type MockStreamWriter = {
  write: (chunk: unknown) => void;
  merge: () => void;
};

type MockAgentStreamOptions = {
  messages?: UIMessage[];
  onFinish?: (result: {
    text: string;
    model: string;
    finishReason: string;
    usage: { promptTokens: number; completionTokens: number };
  }) => Promise<void> | void;
};

type MockUIStreamOptions = {
  generateMessageId?: () => string;
  onFinish?: (result: {
    responseMessage: UIMessage;
    messages?: UIMessage[];
    isContinuation?: boolean;
    isAborted?: boolean;
  }) => Promise<void> | void;
};

const streamWrites: unknown[] = [];

// Mock the ai module
vi.mock("ai", () => ({
  convertToModelMessages: vi.fn(async (messages: unknown[]) => messages),
  createUIMessageStream: vi.fn(
    ({ execute }: { execute: (arg: { writer: MockStreamWriter }) => Promise<void> }) => {
      const stream = new ReadableStream({
        async start(controller) {
          await execute({
            writer: {
              write: (chunk: unknown) => {
                streamWrites.push(chunk);
              },
              merge: () => undefined,
            },
          });
          controller.close();
        },
      });

      return stream;
    },
  ),
  createUIMessageStreamResponse: vi.fn(
    ({ stream }: { stream: ReadableStream }) => new Response(stream, { status: 200 }),
  ),
  consumeStream: vi.fn(async () => undefined),
  generateText: vi.fn(),
  validateUIMessages: vi.fn(async ({ messages }: { messages: unknown[] }) => messages),
  // The chat-handler module pulls in `@/ai/agents/agent` transitively, which
  // evaluates `tool(...)`, `stepCountIs(...)`, and `new ToolLoopAgent(...)` at
  // module load time. Stub those three exports so test-time evaluation succeeds
  // without touching the real Bedrock provider.
  tool: vi.fn((config: unknown) => config),
  stepCountIs: vi.fn((count: number) => ({ __stopAt: count })),
  ToolLoopAgent: vi.fn(() => ({})),
}));

// Mock agent that signals isAborted=true with a message holding incomplete
// tool parts — exercises the sanitize-on-abort path end-to-end.
const createAbortingMockAgent = (responseMessage: UIMessage): Agent =>
  ({
    stream: vi.fn().mockImplementation(async () => ({
      toUIMessageStream: ({ onFinish: onUiFinish }: MockUIStreamOptions = {}) =>
        new ReadableStream({
          async start(controller) {
            await onUiFinish?.({
              responseMessage,
              messages: [],
              isContinuation: false,
              isAborted: true,
            });
            controller.close();
          },
        }),
    })),
  }) as unknown as Agent;

// Create a mock agent factory
const createMockAgent = (responseText: string): Agent => {
  return {
    stream: vi.fn().mockImplementation(async ({ onFinish }: MockAgentStreamOptions) => {
      await onFinish?.({
        text: responseText,
        model: "us.anthropic.claude-sonnet-4-6",
        finishReason: "stop",
        usage: { promptTokens: 100, completionTokens: 50 },
      });

      return {
        toUIMessageStream: ({
          generateMessageId,
          onFinish: onUiFinish,
        }: MockUIStreamOptions = {}) =>
          new ReadableStream({
            async start(controller) {
              await onUiFinish?.({
                responseMessage: {
                  id: generateMessageId?.() ?? "",
                  role: "assistant",
                  parts: [{ type: "text", text: responseText }],
                },
                messages: [],
                isContinuation: false,
                isAborted: false,
              });
              controller.close();
            },
          }),
      };
    }),
  } as unknown as Agent;
};

const { createChatPostHandler } = await import("@/lib/chat-handler");

type TestMessage = UIMessage;

const buildRequest = (payload: unknown): Request =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

const getTestOwner = vi.fn(async () => ({ userId: "user-id", identityId: "identity-id" }));

describe("api/chat handler", () => {
  beforeEach(() => {
    streamWrites.length = 0;
  });

  it("persiste mensaje de usuario y respuesta final de asistente", async () => {
    const saveMessage = vi.fn<ChatStore["saveMessage"]>().mockResolvedValue(undefined);
    const getThreadById = vi
      .fn<ChatStore["getThreadById"]>()
      .mockResolvedValueOnce(null)
      .mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "New Chat",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    const store = {
      saveMessage,
      getThreadById,
      createThread: vi.fn<ChatStore["createThread"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "New Chat",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      updateThreadTitle: vi.fn<ChatStore["updateThreadTitle"]>().mockResolvedValue(undefined),
      getThreadMessages: vi.fn<ChatStore["getThreadMessages"]>().mockResolvedValue([]),
      listThreads: vi.fn<ChatStore["listThreads"]>().mockResolvedValue([]),
      deleteThread: vi.fn<ChatStore["deleteThread"]>().mockResolvedValue(undefined),
      replaceAssistantMessageAfter: vi
        .fn<ChatStore["replaceAssistantMessageAfter"]>()
        .mockResolvedValue(undefined),
      cloneThread: vi.fn<ChatStore["cloneThread"]>().mockResolvedValue({
        id: "thread-2",
        resourceId: "user-id",
        title: "cloned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    } satisfies ChatStore;

    const blobStore = {
      put: vi.fn<BlobStore["put"]>().mockResolvedValue({
        key: "secondstream/attachments/thread-1/file.txt",
        url: "https://bucket.s3.us-east-1.amazonaws.com/secondstream/attachments/thread-1/file.txt",
        sizeBytes: 4,
      }),
      get: vi.fn<BlobStore["get"]>().mockResolvedValue(Buffer.from("test", "utf8")),
      delete: vi.fn<BlobStore["delete"]>().mockResolvedValue(undefined),
    } satisfies BlobStore;

    const generateText = vi.fn().mockResolvedValue({ text: "Título generado" });
    const mockAgent = createMockAgent("respuesta final");

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      agent: mockAgent,
      generateText,
      getOwner: getTestOwner,
    });

    const response = await handler({
      request: buildRequest({
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [{ type: "text", text: "hola" }],
          } satisfies TestMessage,
        ],
      }),
    });

    await response.text();

    expect(response.status).toBe(200);
    expect(mockAgent.stream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "user",
            parts: [{ type: "text", text: "hola" }],
          }),
        ]),
        timeout: { totalMs: 240_000, stepMs: 120_000 },
      }),
    );
    // System prompt + cachePoint live in the agent's `instructions` slot
    // (see agent.ts + agent.test.ts) — handler must NOT prepend a system message.
    const streamArgs = (mockAgent.stream as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(streamArgs.messages.every((m: { role: string }) => m.role !== "system")).toBe(true);
    expect(saveMessage).toHaveBeenCalledTimes(2);
    expect(saveMessage).toHaveBeenLastCalledWith(
      "thread-1",
      expect.objectContaining({
        role: "assistant",
        id: expect.stringMatching(/^[\w-]+$/),
      }),
    );
    expect(generateText).toHaveBeenCalledTimes(1);
    expect(streamWrites).toContainEqual(
      expect.objectContaining({
        type: "data-new-thread-created",
        data: expect.objectContaining({
          threadId: "thread-1",
          title: "New Chat",
          resourceId: "user-id",
        }),
      }),
    );
  });

  it("sanitizes incomplete tool parts before persist when stream aborts", async () => {
    const saveMessage = vi.fn<ChatStore["saveMessage"]>().mockResolvedValue(undefined);
    const store = {
      saveMessage,
      getThreadById: vi.fn<ChatStore["getThreadById"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Existing",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      createThread: vi.fn<ChatStore["createThread"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Existing",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      updateThreadTitle: vi.fn<ChatStore["updateThreadTitle"]>().mockResolvedValue(undefined),
      getThreadMessages: vi.fn<ChatStore["getThreadMessages"]>().mockResolvedValue([]),
      listThreads: vi.fn<ChatStore["listThreads"]>().mockResolvedValue([]),
      deleteThread: vi.fn<ChatStore["deleteThread"]>().mockResolvedValue(undefined),
      replaceAssistantMessageAfter: vi
        .fn<ChatStore["replaceAssistantMessageAfter"]>()
        .mockResolvedValue(undefined),
      cloneThread: vi.fn<ChatStore["cloneThread"]>().mockResolvedValue({
        id: "thread-2",
        resourceId: "user-id",
        title: "cloned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    } satisfies ChatStore;

    const blobStore = {
      put: vi.fn<BlobStore["put"]>().mockResolvedValue({
        key: "k",
        url: "https://example/k",
        sizeBytes: 0,
      }),
      get: vi.fn<BlobStore["get"]>().mockResolvedValue(Buffer.from("", "utf8")),
      delete: vi.fn<BlobStore["delete"]>().mockResolvedValue(undefined),
    } satisfies BlobStore;

    const partialResponse: UIMessage = {
      id: "a-aborted",
      role: "assistant",
      parts: [
        { type: "text", text: "preamble" },
        {
          type: "tool-generateFieldBrief",
          state: "output-available",
          input: { kind: "field-brief" },
          output: { artifactId: "a-1", title: "FB" },
          toolCallId: "t1",
        } as unknown as UIMessage["parts"][number],
        {
          type: "tool-generatePlaybook",
          state: "input-streaming",
          input: { kind: "playbook" },
          toolCallId: "t2",
        } as unknown as UIMessage["parts"][number],
      ],
    };

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      agent: createAbortingMockAgent(partialResponse),
      generateText: vi.fn(),
      getOwner: getTestOwner,
    });

    const response = await handler({
      request: buildRequest({
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [{ type: "text", text: "generate" }],
          } satisfies TestMessage,
        ],
      }),
    });

    await response.text();

    expect(saveMessage).toHaveBeenCalledTimes(2);
    const [, persistedMessage] = saveMessage.mock.calls[1];
    const parts = persistedMessage.parts as Array<{
      type: string;
      state?: string;
      errorText?: string;
      output?: unknown;
    }>;
    expect(parts[0]).toMatchObject({ type: "text", text: "preamble" });
    expect(parts[1]).toMatchObject({
      type: "tool-generateFieldBrief",
      state: "output-available",
    });
    expect(parts[2]).toMatchObject({
      type: "tool-generatePlaybook",
      state: "output-error",
    });
    expect(parts[2].errorText).toMatch(/interrupted/i);
    expect("output" in parts[2]).toBe(false);
  });

  it("en regeneración reemplaza mensaje asistente en vez de duplicar", async () => {
    const replaceAssistantMessageAfter = vi
      .fn<ChatStore["replaceAssistantMessageAfter"]>()
      .mockResolvedValue(undefined);

    const store = {
      saveMessage: vi.fn<ChatStore["saveMessage"]>().mockResolvedValue(undefined),
      getThreadById: vi.fn<ChatStore["getThreadById"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Título",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      createThread: vi.fn<ChatStore["createThread"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Título",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      updateThreadTitle: vi.fn<ChatStore["updateThreadTitle"]>().mockResolvedValue(undefined),
      getThreadMessages: vi.fn<ChatStore["getThreadMessages"]>().mockResolvedValue([
        {
          id: "u-1",
          role: "user",
          parts: [{ type: "text", text: "hola" }],
        },
        {
          id: "a-1",
          role: "assistant",
          parts: [{ type: "text", text: "respuesta vieja" }],
        },
      ]),
      listThreads: vi.fn<ChatStore["listThreads"]>().mockResolvedValue([]),
      deleteThread: vi.fn<ChatStore["deleteThread"]>().mockResolvedValue(undefined),
      replaceAssistantMessageAfter,
      cloneThread: vi.fn<ChatStore["cloneThread"]>().mockResolvedValue({
        id: "thread-2",
        resourceId: "user-id",
        title: "cloned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    } satisfies ChatStore;

    const blobStore = {
      put: vi.fn<BlobStore["put"]>().mockResolvedValue({
        key: "secondstream/attachments/thread-1/file.txt",
        url: "https://bucket.s3.us-east-1.amazonaws.com/secondstream/attachments/thread-1/file.txt",
        sizeBytes: 4,
      }),
      get: vi.fn<BlobStore["get"]>().mockResolvedValue(Buffer.from("test", "utf8")),
      delete: vi.fn<BlobStore["delete"]>().mockResolvedValue(undefined),
    } satisfies BlobStore;

    const mockAgent = createMockAgent("respuesta nueva");

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      agent: mockAgent,
      generateText: vi.fn().mockResolvedValue({ text: "titulo" }),
      getOwner: getTestOwner,
    });

    const response = await handler({
      request: buildRequest({
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
        trigger: "regenerate-message",
        messageId: "a-1",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [{ type: "text", text: "hola" }],
          } satisfies TestMessage,
        ],
      }),
    });

    await response.text();

    expect(replaceAssistantMessageAfter).toHaveBeenCalledWith(
      "thread-1",
      "a-1",
      expect.objectContaining({
        role: "assistant",
        parts: [{ type: "text", text: "respuesta nueva" }],
      }),
    );
    expect(store.saveMessage).toHaveBeenCalledTimes(0);
  });

  it("si falla generación persiste placeholder asistente para que el thread sea recuperable", async () => {
    const saveMessage = vi.fn<ChatStore["saveMessage"]>().mockResolvedValue(undefined);
    const replaceAssistantMessageAfter = vi
      .fn<ChatStore["replaceAssistantMessageAfter"]>()
      .mockResolvedValue(undefined);

    const store = {
      saveMessage,
      getThreadById: vi.fn<ChatStore["getThreadById"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Título",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      createThread: vi.fn<ChatStore["createThread"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Título",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      updateThreadTitle: vi.fn<ChatStore["updateThreadTitle"]>().mockResolvedValue(undefined),
      getThreadMessages: vi.fn<ChatStore["getThreadMessages"]>().mockResolvedValue([]),
      listThreads: vi.fn<ChatStore["listThreads"]>().mockResolvedValue([]),
      deleteThread: vi.fn<ChatStore["deleteThread"]>().mockResolvedValue(undefined),
      replaceAssistantMessageAfter,
      cloneThread: vi.fn<ChatStore["cloneThread"]>().mockResolvedValue({
        id: "thread-2",
        resourceId: "user-id",
        title: "cloned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    } satisfies ChatStore;

    const blobStore = {
      put: vi.fn<BlobStore["put"]>().mockResolvedValue({
        key: "secondstream/attachments/thread-1/file.txt",
        url: "https://bucket.s3.us-east-1.amazonaws.com/secondstream/attachments/thread-1/file.txt",
        sizeBytes: 4,
      }),
      get: vi.fn<BlobStore["get"]>().mockResolvedValue(Buffer.from("test", "utf8")),
      delete: vi.fn<BlobStore["delete"]>().mockResolvedValue(undefined),
    } satisfies BlobStore;

    const mockAgent = {
      stream: vi.fn().mockRejectedValue(new Error("bedrock timeout")),
    } as unknown as Agent;

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      agent: mockAgent,
      generateText: vi.fn().mockResolvedValue({ text: "titulo" }),
      getOwner: getTestOwner,
    });

    const response = await handler({
      request: buildRequest({
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [{ type: "text", text: "hola" }],
          } satisfies TestMessage,
        ],
      }),
    });

    await response.text();

    expect(saveMessage).toHaveBeenCalledTimes(2);
    expect(saveMessage).toHaveBeenLastCalledWith(
      "thread-1",
      expect.objectContaining({
        role: "assistant",
        parts: expect.arrayContaining([
          expect.objectContaining({
            type: "text",
            text: expect.stringMatching(/interrupted/i),
          }),
        ]),
      }),
    );
    expect(replaceAssistantMessageAfter).not.toHaveBeenCalled();
  });

  it("regenerate + stream failure writes interrupted placeholder via replaceAssistantMessageAfter, not saveMessage", async () => {
    const saveMessage = vi.fn<ChatStore["saveMessage"]>().mockResolvedValue(undefined);
    const replaceAssistantMessageAfter = vi
      .fn<ChatStore["replaceAssistantMessageAfter"]>()
      .mockResolvedValue(undefined);

    const store = {
      saveMessage,
      getThreadById: vi.fn<ChatStore["getThreadById"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Título",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      createThread: vi.fn<ChatStore["createThread"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Título",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      updateThreadTitle: vi.fn<ChatStore["updateThreadTitle"]>().mockResolvedValue(undefined),
      getThreadMessages: vi.fn<ChatStore["getThreadMessages"]>().mockResolvedValue([
        {
          id: "u-1",
          role: "user",
          parts: [{ type: "text", text: "hola" }],
        },
        {
          id: "a-1",
          role: "assistant",
          parts: [{ type: "text", text: "respuesta vieja" }],
        },
      ]),
      listThreads: vi.fn<ChatStore["listThreads"]>().mockResolvedValue([]),
      deleteThread: vi.fn<ChatStore["deleteThread"]>().mockResolvedValue(undefined),
      replaceAssistantMessageAfter,
      cloneThread: vi.fn<ChatStore["cloneThread"]>().mockResolvedValue({
        id: "thread-2",
        resourceId: "user-id",
        title: "cloned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    } satisfies ChatStore;

    const blobStore = {
      put: vi.fn<BlobStore["put"]>().mockResolvedValue({
        key: "secondstream/attachments/thread-1/file.txt",
        url: "https://bucket.s3.us-east-1.amazonaws.com/secondstream/attachments/thread-1/file.txt",
        sizeBytes: 4,
      }),
      get: vi.fn<BlobStore["get"]>().mockResolvedValue(Buffer.from("test", "utf8")),
      delete: vi.fn<BlobStore["delete"]>().mockResolvedValue(undefined),
    } satisfies BlobStore;

    const mockAgent = {
      stream: vi.fn().mockRejectedValue(new Error("bedrock timeout")),
    } as unknown as Agent;

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      agent: mockAgent,
      generateText: vi.fn().mockResolvedValue({ text: "titulo" }),
      getOwner: getTestOwner,
    });

    const response = await handler({
      request: buildRequest({
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
        trigger: "regenerate-message",
        messageId: "a-1",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [{ type: "text", text: "hola" }],
          } satisfies TestMessage,
        ],
      }),
    });

    await response.text();

    expect(replaceAssistantMessageAfter).toHaveBeenCalledTimes(1);
    expect(replaceAssistantMessageAfter).toHaveBeenCalledWith(
      "thread-1",
      "a-1",
      expect.objectContaining({
        role: "assistant",
        parts: expect.arrayContaining([
          expect.objectContaining({
            type: "text",
            text: expect.stringMatching(/interrupted/i),
          }),
        ]),
      }),
    );
    expect(saveMessage).not.toHaveBeenCalledWith(
      "thread-1",
      expect.objectContaining({ role: "assistant" }),
    );
  });

  it("returns a typed attachment error when a new attachment cannot be stored", async () => {
    const store = {
      saveMessage: vi.fn<ChatStore["saveMessage"]>().mockResolvedValue(undefined),
      getThreadById: vi.fn<ChatStore["getThreadById"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Thread with file",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      createThread: vi.fn<ChatStore["createThread"]>(),
      updateThreadTitle: vi.fn<ChatStore["updateThreadTitle"]>(),
      getThreadMessages: vi.fn<ChatStore["getThreadMessages"]>().mockResolvedValue([]),
      listThreads: vi.fn<ChatStore["listThreads"]>().mockResolvedValue([]),
      deleteThread: vi.fn<ChatStore["deleteThread"]>().mockResolvedValue(undefined),
      replaceAssistantMessageAfter: vi.fn<ChatStore["replaceAssistantMessageAfter"]>(),
      cloneThread: vi.fn<ChatStore["cloneThread"]>(),
    } satisfies ChatStore;

    const blobStore = {
      put: vi.fn<BlobStore["put"]>().mockRejectedValue(new Error("s3 put unavailable")),
      get: vi.fn<BlobStore["get"]>(),
      delete: vi.fn<BlobStore["delete"]>(),
    } satisfies BlobStore;

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      agent: createMockAgent("should not run"),
      generateText: vi.fn().mockResolvedValue({ text: "titulo" }),
      getOwner: getTestOwner,
    });

    const response = await handler({
      request: buildRequest({
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [
              { type: "text", text: "read this" },
              {
                type: "file",
                mediaType: "text/plain",
                filename: "notes.txt",
                url: "data:text/plain;base64,aGVsbG8=",
              },
            ],
          } satisfies TestMessage,
        ],
      }),
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("x-error-code")).toBe(ATTACHMENT_ERROR_CODES.malformedPayload);
    expect(store.saveMessage).not.toHaveBeenCalled();
  });

  it("returns a typed attachment error when a persisted attachment cannot be loaded", async () => {
    const store = {
      saveMessage: vi.fn<ChatStore["saveMessage"]>().mockResolvedValue(undefined),
      getThreadById: vi.fn<ChatStore["getThreadById"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "user-id",
        title: "Thread with file",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      createThread: vi.fn<ChatStore["createThread"]>(),
      updateThreadTitle: vi.fn<ChatStore["updateThreadTitle"]>(),
      getThreadMessages: vi.fn<ChatStore["getThreadMessages"]>().mockResolvedValue([
        {
          id: "u-old",
          role: "user",
          parts: [
            { type: "text", text: "read this" },
            {
              type: "file",
              mediaType: "text/plain",
              filename: "notes.txt",
              url: "s3://lambda-chat/attachments/users/user-id/threads/thread-1/notes.txt",
              metadata: {
                version: 1,
                mediaType: "text/plain",
                s3Key: "lambda-chat/attachments/users/user-id/threads/thread-1/notes.txt",
                sizeBytes: 12,
                url: "https://bucket.s3.us-east-1.amazonaws.com/lambda-chat/attachments/users/user-id/threads/thread-1/notes.txt",
              },
            } as unknown as TestMessage["parts"][number],
          ],
        },
      ] as never),
      listThreads: vi.fn<ChatStore["listThreads"]>().mockResolvedValue([]),
      deleteThread: vi.fn<ChatStore["deleteThread"]>().mockResolvedValue(undefined),
      replaceAssistantMessageAfter: vi.fn<ChatStore["replaceAssistantMessageAfter"]>(),
      cloneThread: vi.fn<ChatStore["cloneThread"]>(),
    } satisfies ChatStore;

    const blobStore = {
      put: vi.fn<BlobStore["put"]>(),
      get: vi.fn<BlobStore["get"]>().mockRejectedValue(new Error("s3 unavailable")),
      delete: vi.fn<BlobStore["delete"]>(),
    } satisfies BlobStore;

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      agent: createMockAgent("should not run"),
      generateText: vi.fn().mockResolvedValue({ text: "titulo" }),
      getOwner: getTestOwner,
    });

    const response = await handler({
      request: buildRequest({
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [{ type: "text", text: "continue" }],
          } satisfies TestMessage,
        ],
      }),
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("x-error-code")).toBe(ATTACHMENT_ERROR_CODES.malformedPayload);
    expect(blobStore.get).toHaveBeenCalledWith(
      "lambda-chat/attachments/users/user-id/threads/thread-1/notes.txt",
    );
  });

  it("rejects access to a thread owned by another authenticated user", async () => {
    const store = {
      saveMessage: vi.fn<ChatStore["saveMessage"]>().mockResolvedValue(undefined),
      getThreadById: vi.fn<ChatStore["getThreadById"]>().mockResolvedValue({
        id: "thread-1",
        resourceId: "other-user-id",
        title: "Other user's thread",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      createThread: vi.fn<ChatStore["createThread"]>(),
      updateThreadTitle: vi.fn<ChatStore["updateThreadTitle"]>(),
      getThreadMessages: vi.fn<ChatStore["getThreadMessages"]>().mockResolvedValue([]),
      listThreads: vi.fn<ChatStore["listThreads"]>().mockResolvedValue([]),
      deleteThread: vi.fn<ChatStore["deleteThread"]>().mockResolvedValue(undefined),
      replaceAssistantMessageAfter: vi.fn<ChatStore["replaceAssistantMessageAfter"]>(),
      cloneThread: vi.fn<ChatStore["cloneThread"]>(),
    } satisfies ChatStore;

    const blobStore = {
      put: vi.fn<BlobStore["put"]>(),
      get: vi.fn<BlobStore["get"]>(),
      delete: vi.fn<BlobStore["delete"]>(),
    } satisfies BlobStore;

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      agent: createMockAgent("should not run"),
      generateText: vi.fn().mockResolvedValue({ text: "titulo" }),
      getOwner: getTestOwner,
    });

    const response = await handler({
      request: buildRequest({
        threadId: "thread-1",
        modelId: "claude-sonnet-4-6",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [{ type: "text", text: "hola" }],
          } satisfies TestMessage,
        ],
      }),
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("x-error-code")).toBe("THREAD_NOT_FOUND");
    expect(store.saveMessage).not.toHaveBeenCalled();
  });
});
