import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type generateText,
  validateUIMessages,
} from "ai";
import { nanoid } from "nanoid";
import type { Agent } from "@/ai/agents/agent";
import { createH2oArtifactTools } from "@/ai/tools/h2o-artifacts";
import { MODELS } from "@/config/models";
import type { ArtifactStore } from "@/lib/artifacts/artifact-store";
import type { ArtifactPdfStorage } from "@/lib/artifacts/pdf-storage";
import type { OwnerContext } from "@/lib/auth/owner-context";
import { bedrockProvider } from "@/lib/bedrock-provider";
import {
  ATTACHMENT_ERROR_CODES,
  ChatRequestValidationError,
  parseChatRequest,
} from "@/lib/chat-helpers";
import {
  ensureServerMessageId,
  extractLastUserMessage,
  isStableThreadTitle,
  sanitizeAbortedToolParts,
  type ToolPartLike,
} from "@/lib/chat-runtime";
import {
  attachmentRefToPersistedPart,
  buildAttachmentRef,
  filePartToAttachmentRef,
  isSupportedAttachmentMediaType,
} from "@/lib/storage/attachment-metadata";
import type { BlobStore } from "@/lib/storage/blob-store";
import type { ChatStore } from "@/lib/storage/chat-store-types";
import type { MyUIMessage } from "@/types/ui-message";

type GenerateTextFn = typeof generateText;

const titleModel = bedrockProvider(MODELS[0].runtimeModelId);

type CreateAgentInput = {
  artifactContext?: {
    owner: OwnerContext;
    threadId: string;
  };
  tools?: ReturnType<typeof createH2oArtifactTools>;
};

type Dependencies = {
  chatStore: ChatStore;
  blobStore: BlobStore;
  agent?: Agent;
  createAgent?: (input: CreateAgentInput) => Agent;
  artifactStore?: ArtifactStore;
  pdfStorage?: ArtifactPdfStorage;
  artifactBaseUrl?: string;
  generateText: GenerateTextFn;
  getOwner: () => Promise<OwnerContext>;
};

const titlePrompt = (text: string): string =>
  `Genera un título breve de máximo 6 palabras para esta conversación:\n\n${text}`;

const sanitizeTitle = (title: string): string => {
  const next = title.replace(/[\n\r]+/g, " ").trim();
  if (!next) {
    return "New Stream";
  }

  return next.slice(0, 80);
};

const extractAssistantText = (message: MyUIMessage): string =>
  message.parts
    .filter(
      (part): part is Extract<MyUIMessage["parts"][number], { type: "text" }> =>
        part.type === "text",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();

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
      const saved = await params.blobStore
        .put({
          bytes,
          filename: part.filename ?? "attachment",
          mediaType: part.mediaType,
          threadId: params.threadId,
        })
        .catch(() => {
          throw new ChatRequestValidationError(
            ATTACHMENT_ERROR_CODES.malformedPayload,
            "We couldn't store an attachment. Remove it and try again.",
          );
        });

      const metadata = buildAttachmentRef({
        filename: part.filename,
        mediaType: part.mediaType,
        s3Key: saved.key,
        sizeBytes: saved.sizeBytes,
        url: saved.url,
      });

      nextParts.push(
        attachmentRefToPersistedPart(metadata) as unknown as MyUIMessage["parts"][number],
      );
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
      nextParts.push(
        attachmentRefToPersistedPart(existing) as unknown as MyUIMessage["parts"][number],
      );
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

      const bytes = await blobStore.get(metadata.s3Key).catch(() => {
        throw new ChatRequestValidationError(
          ATTACHMENT_ERROR_CODES.malformedPayload,
          "We couldn't load an attachment. Remove it and try again.",
        );
      });
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
    let params: ReturnType<typeof parseChatRequest>;
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

    const owner = await deps.getOwner();
    const thread = await deps.chatStore.getThreadById(params.threadId);
    const isNewThread = !thread;

    if (thread && thread.resourceId !== owner.userId) {
      return new Response("Thread not found.", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-error-code": "THREAD_NOT_FOUND",
        },
      });
    }

    const createdThread = !thread
      ? await deps.chatStore.createThread(params.threadId, owner.userId, "New Chat")
      : null;

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

      let persistedUserMessage: MyUIMessage;
      try {
        persistedUserMessage = await withAttachmentPersistence(ensureServerMessageId(userMessage), {
          threadId: params.threadId,
          blobStore: deps.blobStore,
        });
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

        throw error;
      }

      await deps.chatStore.saveMessage(params.threadId, persistedUserMessage);
      persistedHistory = [...persistedHistory, persistedUserMessage];
    }

    let historyForModel: MyUIMessage[];
    try {
      historyForModel = await withBedrockAttachmentData(persistedHistory, deps.blobStore);
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

      throw error;
    }

    const artifactTools =
      deps.artifactStore && deps.pdfStorage
        ? createH2oArtifactTools({
            artifactStore: deps.artifactStore,
            pdfStorage: deps.pdfStorage,
            baseUrl: deps.artifactBaseUrl,
            owner,
            threadId: params.threadId,
          })
        : undefined;
    const requestAgent = deps.createAgent
      ? deps.createAgent({
          artifactContext: { owner, threadId: params.threadId },
          tools: artifactTools,
        })
      : deps.agent;

    if (!requestAgent) {
      throw new Error("Chat handler requires an agent or createAgent dependency.");
    }

    const uiMessages = historyForModel.map(({ id: _id, ...rest }) => rest);
    // System prompt + cachePoint live in the agent's `instructions` slot
    // (see src/ai/agents/agent.ts). Do NOT prepend a system message here —
    // the AI SDK warns about system-in-messages and the canonical slot
    // handles Bedrock providerOptions correctly.
    //
    // ignoreIncompleteToolCalls filters out tool parts in input-streaming or
    // input-available states (AI SDK v6 only — not approval-requested or any
    // other intermediate state) before sending to Bedrock. Without it, a
    // prior turn that aborted mid-tool would feed a malformed conversation
    // (tool_use without tool_result) and poison subsequent turns. The wider
    // sanitization on persist (sanitizeAbortedToolParts) covers the gap by
    // converting approval-requested + the same input-* states to
    // output-error before they reach storage.
    const modelMessages = await convertToModelMessages(uiMessages, {
      ignoreIncompleteToolCalls: true,
    });

    const stream = createUIMessageStream<MyUIMessage>({
      execute: async ({ writer }) => {
        // Track whether onFinish persisted a response so the catch block can
        // decide if it needs to write a placeholder. onFinish DOES fire on
        // mid-stream abort (with isAborted=true), but it does NOT fire if
        // requestAgent.stream() rejects before returning a result — that path
        // (e.g. timeout that aborts the very first model call, network error)
        // would otherwise leave the thread with a phantom user message and no
        // assistant reply.
        let assistantPersisted = false;

        try {
          if (createdThread) {
            writer.write({
              id: `new-thread-created-${params.threadId}`,
              type: "data-new-thread-created",
              data: {
                threadId: createdThread.id,
                title: createdThread.title ?? "New Chat",
                resourceId: createdThread.resourceId,
                createdAt: createdThread.createdAt,
                updatedAt: createdThread.updatedAt,
              },
            });
          }

          const result = await requestAgent.stream({
            messages: modelMessages,
            // Lambda Duration.minutes(5) = 300s hard cap. Keep totalMs below
            // that cap so onFinish persistence/cleanup can complete on abort.
            // Artifact generation is now sequentially guarded by prepareStep;
            // stepMs gives each model/tool step (one artifact render + S3/DDB
            // persist) its own budget instead of sharing only one long turn cap.
            timeout: { totalMs: 240_000, stepMs: 120_000 },
          });

          writer.merge(
            result.toUIMessageStream({
              originalMessages: persistedHistory,
              generateMessageId: nanoid,
              onError: (error) => {
                console.error("[chat] stream:error", {
                  message: error instanceof Error ? error.message : String(error),
                });
                return "We couldn't complete the response right now.";
              },
              onFinish: async ({
                responseMessage,
                isAborted,
              }: {
                responseMessage: MyUIMessage;
                isAborted: boolean;
              }) => {
                // When the stream aborts (e.g. totalMs cap), tool parts can be
                // left in input-streaming / input-available with no output.
                // Persisting them as-is leaves stuck "Pending"/"Running" cards
                // on refresh AND feeds a malformed history to subsequent
                // turns. Sanitize before persist.
                const sanitized = isAborted
                  ? sanitizeAbortedToolParts(responseMessage)
                  : responseMessage;
                const persistedResponseMessage = ensureServerMessageId(sanitized);

                const toolPartSummary = persistedResponseMessage.parts
                  .map((p) => {
                    const candidate = p as ToolPartLike;
                    return candidate.type?.startsWith("tool-")
                      ? `${candidate.type}:${candidate.state}`
                      : candidate.type;
                  })
                  .join(",");
                console.log("[chat] onFinish:before-save", {
                  isAborted,
                  messageId: persistedResponseMessage.id,
                  partCount: persistedResponseMessage.parts.length,
                  parts: toolPartSummary,
                });

                try {
                  if (
                    params.trigger === "regenerate-message" &&
                    params.regenerateMessageId &&
                    persistedResponseMessage.role === "assistant"
                  ) {
                    await deps.chatStore.replaceAssistantMessageAfter(
                      params.threadId,
                      params.regenerateMessageId,
                      persistedResponseMessage,
                    );
                  } else {
                    await deps.chatStore.saveMessage(params.threadId, persistedResponseMessage);
                  }
                  assistantPersisted = true;
                  console.log("[chat] onFinish:saved", {
                    messageId: persistedResponseMessage.id,
                    threadId: params.threadId,
                  });
                } catch (saveError) {
                  console.error("[chat] onFinish:save-failed", {
                    messageId: persistedResponseMessage.id,
                    message: saveError instanceof Error ? saveError.message : String(saveError),
                  });
                  throw saveError;
                }

                if (isAborted) {
                  // Skip title generation on abort — partial text isn't
                  // representative of the conversation. The persisted partial
                  // message is enough to make the thread recoverable.
                  return;
                }

                const generatedText = extractAssistantText(persistedResponseMessage);
                if (!generatedText) {
                  return;
                }

                const currentThread = await deps.chatStore.getThreadById(params.threadId);
                const mustGenerateTitle = !isStableThreadTitle(currentThread?.title);

                if (isNewThread && mustGenerateTitle) {
                  try {
                    const titleResult = await deps.generateText({
                      model: titleModel,
                      prompt: titlePrompt(generatedText),
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
            }),
          );
        } catch (error) {
          console.error("[chat] agent:error", {
            message: error instanceof Error ? error.message : String(error),
          });

          if (!assistantPersisted) {
            // requestAgent.stream() rejected before any partial response
            // reached onFinish. Persist a placeholder so the thread isn't left
            // with a user message and no reply — the user can retry instead of
            // seeing a phantom message after refresh.
            try {
              const placeholder: MyUIMessage = ensureServerMessageId({
                id: nanoid(),
                role: "assistant",
                parts: [
                  {
                    type: "text",
                    text: "[Response interrupted. Please retry.]",
                  },
                ],
              });

              if (params.trigger === "regenerate-message" && params.regenerateMessageId) {
                await deps.chatStore.replaceAssistantMessageAfter(
                  params.threadId,
                  params.regenerateMessageId,
                  placeholder,
                );
              } else {
                await deps.chatStore.saveMessage(params.threadId, placeholder);
              }
            } catch (persistError) {
              console.error("[chat] placeholder:persist-failed", {
                message:
                  persistError instanceof Error ? persistError.message : String(persistError),
              });
            }
          }

          writer.write({
            type: "error",
            errorText: "We couldn't complete the response right now.",
          });
        }
      },
      onError: () => "Something went wrong while generating the response.",
    });

    // consumeSseStream tees the SSE stream and drains the copy server-side
    // via consumeStream. This guarantees the source stream's flush() fires
    // (which in turn calls onFinish + persistence) even if the HTTP response
    // body is not fully read by the consumer — e.g. browser disconnect, fetch
    // abort, or the Lambda Function URL idle cut. Without this, a partial
    // assistant message can leak away unpersisted.
    return createUIMessageStreamResponse({ stream, consumeSseStream: consumeStream });
  };
};
