import { describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import type { ChatStore } from "@/lib/storage/chat-store";
import type { BlobStore } from "@/lib/storage/blob-store";

vi.mock("ai", () => ({
  convertToModelMessages: vi.fn(async (messages: unknown[]) => messages),
  createUIMessageStream: vi.fn(({ execute }: { execute: (arg: { writer: any }) => Promise<void> }) => {
    const stream = new ReadableStream({
      async start(controller) {
        await execute({
          writer: {
            write: () => undefined,
            merge: () => undefined,
          },
        });
        controller.close();
      },
    });

    return stream;
  }),
  createUIMessageStreamResponse: vi.fn(({ stream }: { stream: ReadableStream }) =>
    new Response(stream, { status: 200 }),
  ),
  generateText: vi.fn(),
  streamText: vi.fn(),
  validateUIMessages: vi.fn(async ({ messages }: { messages: unknown[] }) => messages),
}));

const { createChatPostHandler } = await import("@/lib/chat-handler");

type TestMessage = UIMessage;

const buildRequest = (payload: unknown): Request =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

describe("api/chat handler", () => {
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

    const streamText = vi.fn().mockImplementation(async (options: any) => {
      await options.onFinish?.({
        response: {
          messages: [],
        },
        responseMessage: {
          id: "a-1",
          role: "assistant",
          parts: [{ type: "text", text: "respuesta final" }],
        },
        text: "respuesta final",
        finishReason: "stop",
      });

      return {
        toUIMessageStream: () =>
          new ReadableStream({
            start(controller) {
              controller.close();
            },
          }),
      };
    });

    const generateText = vi.fn().mockResolvedValue({ text: "Título generado" });

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      streamText,
      generateText,
      createModel: (runtimeModelId) => runtimeModelId,
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
    expect(saveMessage).toHaveBeenCalledTimes(2);
    expect(generateText).toHaveBeenCalledTimes(1);
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

    const streamText = vi.fn().mockImplementation(async (options: any) => {
      await options.onFinish?.({
        response: { messages: [] },
        responseMessage: {
          id: "a-2",
          role: "assistant",
          parts: [{ type: "text", text: "respuesta nueva" }],
        },
        text: "respuesta nueva",
        finishReason: "stop",
      });

      return {
        toUIMessageStream: () =>
          new ReadableStream({
            start(controller) {
              controller.close();
            },
          }),
      };
    });

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      streamText,
      generateText: vi.fn().mockResolvedValue({ text: "titulo" }),
      createModel: (runtimeModelId) => runtimeModelId,
    });

    await handler({
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

    

    expect(replaceAssistantMessageAfter).toHaveBeenCalledWith(
      "thread-1",
      "a-1",
      expect.objectContaining({
        role: "assistant",
        parts: [{ type: "text", text: "respuesta nueva" }],
      }),
    );
    expect(store.saveMessage).toHaveBeenCalledTimes(0);
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: "user",
            parts: [{ type: "text", text: "hola" }],
          },
        ],
      }),
    );
  });

  it("si falla generación no persiste respuesta parcial de asistente", async () => {
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

    const streamText = vi.fn().mockRejectedValue(new Error("bedrock timeout"));

    const handler = createChatPostHandler({
      chatStore: store,
      blobStore,
      streamText,
      generateText: vi.fn().mockResolvedValue({ text: "titulo" }),
      createModel: (runtimeModelId) => runtimeModelId,
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

    expect(saveMessage).toHaveBeenCalledTimes(1);
    expect(replaceAssistantMessageAfter).not.toHaveBeenCalled();
  });
});
