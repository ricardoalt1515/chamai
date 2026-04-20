import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  validateUIMessages,
  type UIMessage,
} from "ai";
import { FAST_TITLE_RUNTIME_MODEL_ID } from "@/config/models";
import { ASSISTANT_SYSTEM_PROMPT } from "@/ai/prompts/assistant";
import {
  ensureServerMessageId,
  extractLastUserMessage,
  isStableThreadTitle,
  toBedrockModelId,
} from "@/lib/chat-runtime";
import {
  ATTACHMENT_ERROR_CODES,
  ChatRequestValidationError,
  parseChatRequest,
} from "@/lib/chat-helpers";
import {
  attachmentRefToPersistedPart,
  buildAttachmentRef,
  filePartToAttachmentRef,
  isSupportedAttachmentMediaType,
} from "@/lib/storage/attachment-metadata";
import type { BlobStore } from "@/lib/storage/blob-store";
import type { ChatStore } from "@/lib/storage/chat-store";
import { getChatStore } from "@/lib/storage/chat-store";
import { createS3BlobStore } from "@/lib/storage/s3-blob-store";
import { getEnv } from "@/config/env";
import type { MyUIMessage } from "@/types/ui-message";

const RESOURCE_ID = "user-id";

type StreamTextFn = typeof streamText;
type GenerateTextFn = typeof generateText;
type CreateModelFn = (runtimeModelId: string) => unknown;

type Dependencies = {
  chatStore: ChatStore;
  blobStore: BlobStore;
  streamText: StreamTextFn;
  generateText: GenerateTextFn;
  createModel: CreateModelFn;
};

const titlePrompt = (text: string): string =>
  `Genera un título breve de máximo 6 palabras para esta conversación:\n\n${text}`;

const sanitizeTitle = (title: string): string => {
  const next = title.replace(/[\n\r]+/g, " ").trim();
  if (!next) {
    return "New Chat";
  }

  return next.slice(0, 80);
};

const toAssistantMessage = (event: { text?: string }): MyUIMessage | null => {
  const text = typeof event.text === "string" ? event.text.trim() : "";

  if (!text) {
    return null;
  }

  return ensureServerMessageId({
    role: "assistant",
    parts: [{ type: "text", text }],
  });
};

const decodeDataUrl = (url: string): Buffer => {
  const parts = url.split(",", 2);
  if (parts.length !== 2) {
    throw new ChatRequestValidationError(
      ATTACHMENT_ERROR_CODES.malformedPayload,
      "Invalid attachment payload.",
    );
  }

  return Buffer.from(parts[1], "base64");
};

const withAttachmentPersistence = async (
  message: MyUIMessage,
  params: {
    threadId: string;
    blobStore: BlobStore;
  },
): Promise<MyUIMessage> => {
  const nextParts: MyUIMessage["parts"] = [];

  for (const part of message.parts) {
    if (part.type !== "file") {
      nextParts.push(part);
      continue;
    }

    if (!isSupportedAttachmentMediaType(part.mediaType)) {
      throw new ChatRequestValidationError(
        ATTACHMENT_ERROR_CODES.unsupportedMime,
        "Unsupported file format.",
      );
    }

    if (part.url.startsWith("data:")) {
      const bytes = decodeDataUrl(part.url);
      const saved = await params.blobStore.put({
        bytes,
        filename: part.filename ?? "attachment",
        mediaType: part.mediaType,
        threadId: params.threadId,
      });

      const metadata = buildAttachmentRef({
        filename: part.filename,
        mediaType: part.mediaType,
        s3Key: saved.key,
        sizeBytes: saved.sizeBytes,
        url: saved.url,
      });

      nextParts.push(attachmentRefToPersistedPart(metadata) as unknown as MyUIMessage["parts"][number]);
      continue;
    }

    const existing = filePartToAttachmentRef({
      type: "file",
      mediaType: part.mediaType,
      filename: part.filename,
      url: part.url,
      metadata: (part as { metadata?: unknown }).metadata,
    });

    if (existing) {
      nextParts.push(attachmentRefToPersistedPart(existing) as unknown as MyUIMessage["parts"][number]);
      continue;
    }

    nextParts.push(part);
  }

  return {
    ...message,
    parts: nextParts,
  };
};

const withBedrockAttachmentData = async (
  messages: MyUIMessage[],
  blobStore: BlobStore,
): Promise<MyUIMessage[]> => {
  const next: MyUIMessage[] = [];

  for (const message of messages) {
    if (!Array.isArray(message.parts)) {
      next.push({
        ...message,
        parts: [],
      });
      continue;
    }

    const parts: MyUIMessage["parts"] = [];

    for (const part of message.parts) {
      if (part.type !== "file") {
        parts.push(part);
        continue;
      }

      const metadata = filePartToAttachmentRef({
        type: "file",
        mediaType: part.mediaType,
        filename: part.filename,
        url: part.url,
        metadata: (part as { metadata?: unknown }).metadata,
      });

      if (!metadata) {
        parts.push(part);
        continue;
      }

      const bytes = await blobStore.get(metadata.s3Key);
      parts.push({
        type: "file",
        mediaType: metadata.mediaType,
        filename: metadata.filename,
        url: `data:${metadata.mediaType};base64,${bytes.toString("base64")}`,
      } as MyUIMessage["parts"][number]);
    }

    next.push({
      ...message,
      parts,
    });
  }

  return next;
};

export const createChatPostHandler = (deps: Dependencies) => {
  return async ({ request }: { request: Request }) => {
    let params;
    try {
      params = parseChatRequest(await request.json());
    } catch (error) {
        if (error instanceof ChatRequestValidationError) {
        return new Response(error.message, {
          status: error.statusCode,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "x-error-code": error.code,
          },
        });
      }

      return new Response("We couldn't process that request.", {
        status: 400,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-error-code": "REQUEST_INVALID",
        },
      });
    }

    const thread = await deps.chatStore.getThreadById(params.threadId);
    const isNewThread = !thread;

    if (!thread) {
      await deps.chatStore.createThread(params.threadId, RESOURCE_ID, "New Chat");
    }

    const validated = await validateUIMessages<MyUIMessage>({
      messages: params.messages,
    });

    let persistedHistory = await deps.chatStore.getThreadMessages(params.threadId);

    if (params.trigger === "regenerate-message" && params.regenerateMessageId) {
      const targetIndex = persistedHistory.findIndex(
        (message) => message.id === params.regenerateMessageId,
      );

      if (targetIndex > -1) {
        persistedHistory = persistedHistory.slice(0, targetIndex);
      }
    } else {
      const userMessage = extractLastUserMessage(validated);

      if (!userMessage) {
        return new Response("We couldn't find a valid user message.", {
          status: 400,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "x-error-code": "REQUEST_INVALID",
          },
        });
      }

      const persistedUserMessage = await withAttachmentPersistence(ensureServerMessageId(userMessage), {
        threadId: params.threadId,
        blobStore: deps.blobStore,
      });

      await deps.chatStore.saveMessage(params.threadId, persistedUserMessage);
      persistedHistory = await deps.chatStore.getThreadMessages(params.threadId);
    }

    const historyForModel = await withBedrockAttachmentData(persistedHistory, deps.blobStore);

    const modelMessages = await convertToModelMessages(
      historyForModel.map(({ id: _id, ...rest }) => rest),
    );

    const stream = createUIMessageStream<MyUIMessage>({
      execute: async ({ writer }) => {
        try {
          const result = await deps.streamText({
            model: deps.createModel(params.runtimeModelId),
            system: ASSISTANT_SYSTEM_PROMPT,
            messages: modelMessages,
            onFinish: async (event) => {
              const responseMessage = toAssistantMessage(event);

              if (!responseMessage) {
                return;
              }

              if (
                params.trigger === "regenerate-message" &&
                params.regenerateMessageId &&
                responseMessage.role === "assistant"
              ) {
                await deps.chatStore.replaceAssistantMessageAfter(
                  params.threadId,
                  params.regenerateMessageId,
                  responseMessage,
                );
              } else {
                await deps.chatStore.saveMessage(params.threadId, responseMessage);
              }

              const currentThread = await deps.chatStore.getThreadById(params.threadId);
              const mustGenerateTitle = !isStableThreadTitle(currentThread?.title);

              if (isNewThread && mustGenerateTitle && event.text.trim().length > 0) {
                try {
                  const titleResult = await deps.generateText({
                    model: deps.createModel(FAST_TITLE_RUNTIME_MODEL_ID),
                    prompt: titlePrompt(event.text),
                  });

                  const finalTitle = sanitizeTitle(titleResult.text);
                  await deps.chatStore.updateThreadTitle(params.threadId, finalTitle);

                  writer.write({
                    id: `conversation-title-${params.threadId}`,
                    type: "data-conversation-title",
                    data: {
                      title: finalTitle,
                    },
                  });
                } catch {
                  // keep chat response successful even if title generation fails
                }
              }
            },
          });

          writer.merge(result.toUIMessageStream());
        } catch {
          writer.write({
            type: "error",
            errorText: "We couldn't complete the response right now.",
          });
        }
      },
      onError: () => "Something went wrong while generating the response.",
    });

    return createUIMessageStreamResponse({ stream });
  };
};

let cachedHandler: ReturnType<typeof createChatPostHandler> | null = null;

const getDefaultHandler = async (): Promise<ReturnType<typeof createChatPostHandler>> => {
  if (cachedHandler) {
    return cachedHandler;
  }

  const env = getEnv();
  const chatStore = await getChatStore();
  const blobStore = createS3BlobStore({
    bucket: env.CHAT_ATTACHMENTS_S3_BUCKET,
    prefix: env.CHAT_ATTACHMENTS_S3_PREFIX,
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    sessionToken: env.AWS_SESSION_TOKEN,
  });

  const { createAmazonBedrock } = await import("@ai-sdk/amazon-bedrock");
  const bedrock = createAmazonBedrock({ region: env.AWS_REGION });

  cachedHandler = createChatPostHandler({
    chatStore,
    blobStore,
    streamText,
    generateText,
    createModel: (runtimeModelId) => bedrock(toBedrockModelId(runtimeModelId)),
  });

  return cachedHandler;
};

export const chatPost = async ({ request }: { request: Request }): Promise<Response> => {
  const handler = await getDefaultHandler();
  return handler({ request });
};
