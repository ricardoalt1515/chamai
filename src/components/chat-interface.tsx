"use client";

import { useChat } from "@ai-sdk/react";
import { getThreadMessages } from "@app/actions/messages";
import { cloneThread, type Thread } from "@app/actions/threads";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DefaultChatTransport,
  type DynamicToolUIPart,
  isToolUIPart,
  type PrepareSendMessagesRequest,
  type ToolUIPart,
} from "ai";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  BarChart3Icon,
  BookOpenIcon,
  ClipboardListIcon,
  FileTextIcon,
  GitBranchIcon,
  RefreshCcwIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArtifactToolCard } from "@/components/ai-elements/artifact-tool-card";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { ChatPromptComposer } from "@/components/chat-prompt-composer";
import { useDraftInput } from "@/hooks/use-draft-input";
import {
  LONG_STREAM_RECONCILIATION_OPTIONS,
  reconcileThreadAfterStream,
} from "@/lib/chat-reconciliation";
import {
  canSubmitPromptMessage,
  shouldShowAgentStatusProgress,
  shouldShowLoadingShimmer,
} from "@/lib/chat-utils";
import type { AgentStatusData, MyUIMessage } from "@/types/ui-message";
import { CopyButton } from "./copy-button";

const EMPTY_STATE_SUGGESTIONS = [
  "Summarize a recent water quality report",
  "Explain a current water regulation",
  "Draft a maintenance procedure",
] as const;

const ARTIFACT_TOOL_CONFIGS = {
  "tool-generateFieldBrief": { title: "Field Brief", Icon: FileTextIcon },
  "tool-generatePlaybook": { title: "Conversation Playbook", Icon: BookOpenIcon },
  "tool-generateAnalyticalRead": { title: "Analytical Read", Icon: BarChart3Icon },
  "tool-generateProposalShell": { title: "Proposal Shell", Icon: ClipboardListIcon },
} as const;

type ArtifactToolType = keyof typeof ARTIFACT_TOOL_CONFIGS;

type ArtifactToolPart = Extract<MyUIMessage["parts"][number], { type: ArtifactToolType }>;

type AnyToolPart = ToolUIPart | DynamicToolUIPart;

type ToolRenderingMetadata = {
  kind: "artifact-tool";
  title: string;
  defaultOpen: boolean;
};

const TERMINAL_TOOL_STATES = new Set(["output-available", "output-error"]);

const isArtifactToolPart = (part: unknown): part is ArtifactToolPart =>
  typeof part === "object" &&
  part !== null &&
  "type" in part &&
  typeof part.type === "string" &&
  part.type in ARTIFACT_TOOL_CONFIGS;

const asToolPart = (part: unknown): AnyToolPart | null => {
  if (typeof part !== "object" || part === null || !("type" in part)) {
    return null;
  }

  const candidate = part as AnyToolPart;
  return typeof candidate.type === "string" && isToolUIPart(candidate) ? candidate : null;
};

export const getToolRenderingMetadata = (part: unknown): ToolRenderingMetadata | null => {
  const state = typeof part === "object" && part !== null && "state" in part ? part.state : null;
  const defaultOpen = typeof state === "string" && TERMINAL_TOOL_STATES.has(state);

  if (isArtifactToolPart(part)) {
    return {
      kind: "artifact-tool",
      title: ARTIFACT_TOOL_CONFIGS[part.type].title,
      defaultOpen,
    };
  }

  return null;
};

export const toolRenderKey = (messageId: string, partIndex: number, defaultOpen: boolean): string =>
  `${messageId}-${partIndex}-${defaultOpen ? "terminal" : "active"}`;

export const shouldShowArtifactPackageHeartbeat = (message: MyUIMessage): boolean => {
  const artifactParts = message.parts.filter(isArtifactToolPart);
  return (
    artifactParts.length > 0 &&
    artifactParts.some(
      (part) => !(typeof part.state === "string" && TERMINAL_TOOL_STATES.has(part.state)),
    )
  );
};

export function ArtifactPackageHeartbeat(): React.JSX.Element {
  return (
    <div className="rounded-md border bg-muted/40 px-3 py-2 text-muted-foreground text-sm">
      <Shimmer as="p">Generating artifact package… this can take a few minutes.</Shimmer>
    </div>
  );
}

export const summarizeMessagesForTelemetry = (messages: MyUIMessage[]) => {
  const lastMessage = messages.at(-1);
  let visiblePartCount = 0;
  let genericToolCount = 0;
  let artifactToolCount = 0;
  let hiddenPartCount = 0;

  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === "text" || part.type === "reasoning" || part.type === "file") {
        visiblePartCount += 1;
        continue;
      }

      const toolMetadata = getToolRenderingMetadata(part);
      if (toolMetadata?.kind === "artifact-tool") {
        artifactToolCount += 1;
        visiblePartCount += 1;
        continue;
      }
      const toolPart = asToolPart(part);
      if (toolPart) {
        genericToolCount += 1;
      }

      hiddenPartCount += 1;
    }
  }

  return {
    messageCount: messages.length,
    lastMessageId: lastMessage?.id,
    lastMessageRole: lastMessage?.role,
    visiblePartCount,
    genericToolCount,
    artifactToolCount,
    hiddenPartCount,
  };
};

const summarizeToolPartsForTelemetry = (messages: MyUIMessage[]) =>
  messages.flatMap((message, messageIndex) =>
    message.parts.flatMap((part, partIndex) => {
      const toolPart = asToolPart(part);
      if (!toolPart) return [];

      const output =
        "output" in toolPart && typeof toolPart.output === "object" && toolPart.output !== null
          ? (toolPart.output as Record<string, unknown>)
          : undefined;

      return [
        {
          messageIndex,
          messageId: message.id,
          role: message.role,
          partIndex,
          type: toolPart.type,
          state: toolPart.state,
          toolCallId: "toolCallId" in toolPart ? toolPart.toolCallId : undefined,
          preliminary: "preliminary" in toolPart ? toolPart.preliminary : undefined,
          outputStatus: typeof output?.status === "string" ? output.status : undefined,
          outputArtifactType:
            typeof output?.artifactType === "string" ? output.artifactType : undefined,
          rendersAsArtifact: getToolRenderingMetadata(part)?.kind === "artifact-tool",
        },
      ];
    }),
  );

type ChatSendRequestInput = Pick<
  Parameters<PrepareSendMessagesRequest<MyUIMessage>>[0],
  "body" | "messageId" | "messages" | "trigger"
>;

const CHAT_LAMBDA_URL = "https://i2bquluu4ttmvzpuxva665dlye0tnunw.lambda-url.us-east-1.on.aws/";

type PreparedChatRequest = {
  body: object;
  headers?: Record<string, string>;
};

export const getChatTransportApi = (): string => CHAT_LAMBDA_URL;

const getAccessToken = async (): Promise<string> => {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  if (!token) {
    throw new Error("No Cognito access token is available for Lambda chat transport.");
  }
  return token;
};

export const prepareChatSendMessagesRequest = ({
  body,
  messageId,
  messages,
  trigger,
}: ChatSendRequestInput): PreparedChatRequest | Promise<PreparedChatRequest> => {
  const requestBody = body ?? {};
  const preparedBody = {
    threadId: requestBody.threadId,
    messages,
    trigger,
    messageId,
    modelId: requestBody.modelId,
    webSearchEnabled:
      typeof requestBody.webSearchEnabled === "boolean" ? requestBody.webSearchEnabled : false,
  };

  return getAccessToken().then((token) => ({
    body: preparedBody,
    headers: { authorization: `Bearer ${token}` },
  }));
};

export function ChatRuntimeError({ message }: { message: string }): React.JSX.Element {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm"
    >
      <p className="font-medium">Chat request failed</p>
      <p className="mt-1 text-destructive/90">{message}</p>
    </div>
  );
}

function isNewThreadCreatedData(data: unknown): data is MyUIMessage["metadata"] & {
  threadId: string;
  title: string;
  resourceId: string;
  createdAt: string;
  updatedAt: string;
} {
  return (
    typeof data === "object" &&
    data !== null &&
    "threadId" in data &&
    "title" in data &&
    "resourceId" in data &&
    "createdAt" in data &&
    "updatedAt" in data
  );
}

function isConversationTitleData(data: unknown): data is { title: string } {
  return typeof data === "object" && data !== null && "title" in data;
}

function isAgentStatusData(data: unknown): data is AgentStatusData {
  return (
    typeof data === "object" &&
    data !== null &&
    "phase" in data &&
    "label" in data &&
    typeof data.phase === "string" &&
    typeof data.label === "string"
  );
}

export function AgentStatusProgress({ status }: { status: AgentStatusData }): React.JSX.Element {
  const elapsedSeconds =
    typeof status.elapsedMs === "number" && status.elapsedMs >= 1000
      ? Math.floor(status.elapsedMs / 1000)
      : null;

  return (
    <div
      className="not-prose rounded-md border bg-muted/40 px-3 py-2 text-muted-foreground text-sm"
      data-phase={status.phase}
      data-artifact-kind={status.artifactKind}
    >
      <Shimmer as="p">{status.label}</Shimmer>
      {status.detail || elapsedSeconds !== null ? (
        <p className="mt-1 text-xs">
          {status.detail}
          {elapsedSeconds !== null ? ` ${elapsedSeconds}s elapsed.` : ""}
        </p>
      ) : null}
    </div>
  );
}

type ReconciliationTrigger = "on_finish" | "error";

export function ChatInterface({
  initialMessages = [],
  threadId,
}: {
  initialMessages: MyUIMessage[];
  threadId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useDraftInput();
  const messagesRef = useRef(initialMessages);
  const [agentStatus, setAgentStatus] = useState<AgentStatusData | null>(null);
  const toolTelemetrySignatureRef = useRef("");
  const reconciliationRequestRef = useRef(0);
  const reconcileAfterStreamRef = useRef<(source: ReconciliationTrigger) => void>(() => undefined);

  const branchMutation = useMutation({
    mutationFn: (upToMessageId: string) => cloneThread({ sourceThreadId: threadId, upToMessageId }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      router.push(`/c/${result.thread.id}`);
    },
  });

  const { messages, setMessages, sendMessage, status, regenerate, stop, error, clearError } =
    useChat<MyUIMessage>({
      id: threadId,
      messages: initialMessages,
      onFinish: ({ messages: finishedMessages, isAbort, isDisconnect, isError, finishReason }) => {
        setAgentStatus(null);
        messagesRef.current = finishedMessages;
        console.info("[chat-ui] use_chat_finish", {
          event: "use_chat_finish",
          finishReason,
          isAbort,
          isDisconnect,
          isError,
          threadId,
          ...summarizeMessagesForTelemetry(finishedMessages),
        });
        reconcileAfterStreamRef.current("on_finish");
      },
      onData: (dataPart) => {
        if (dataPart.type === "data-agent-status" && isAgentStatusData(dataPart.data)) {
          console.info("[chat-ui] agent_status_data", {
            event: "agent_status_data",
            threadId,
            receivedAtMs: performance.now(),
            phase: dataPart.data.phase,
            artifactKind: dataPart.data.artifactKind,
            label: dataPart.data.label,
            elapsedMs: dataPart.data.elapsedMs,
          });
          setAgentStatus(dataPart.data);
          return;
        }
        if (dataPart.type === "data-new-thread-created" && isNewThreadCreatedData(dataPart.data)) {
          const newThread = dataPart.data;
          window.history.replaceState(window.history.state, "", `/c/${newThread.threadId}`);
          queryClient.setQueryData<{ threads: Thread[] }>(["threads"], (old) => {
            const thread: Thread = {
              id: newThread.threadId,
              title: newThread.title,
              resourceId: newThread.resourceId,
              createdAt: newThread.createdAt,
              updatedAt: newThread.updatedAt,
            };
            if (!old) return { threads: [thread] };
            if (old.threads.some((existingThread) => existingThread.id === thread.id)) {
              return old;
            }
            return { threads: [thread, ...old.threads] };
          });
          queryClient.invalidateQueries({ queryKey: ["threads"] });
        }
        if (dataPart.type === "data-conversation-title" && isConversationTitleData(dataPart.data)) {
          const title = dataPart.data.title;
          queryClient.setQueryData<{ threads: Thread[] }>(["threads"], (old) => {
            if (!old) return old;
            return {
              threads: old.threads.map((t) => (t.id === threadId ? { ...t, title } : t)),
            };
          });
        }
      },
      transport: new DefaultChatTransport({
        api: getChatTransportApi(),
        body: {
          threadId,
        },
        prepareSendMessagesRequest: prepareChatSendMessagesRequest,
      }),
    });

  const previousStatusRef = useRef(status);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const toolParts = summarizeToolPartsForTelemetry(messages);
    const signature = JSON.stringify(toolParts);
    if (signature === toolTelemetrySignatureRef.current) {
      return;
    }

    toolTelemetrySignatureRef.current = signature;
    console.info("[chat-ui] tool_part_state_changed", {
      event: "tool_part_state_changed",
      threadId,
      status,
      agentStatusPhase: agentStatus?.phase,
      agentStatusArtifactKind: agentStatus?.artifactKind,
      lastMessageId: messages.at(-1)?.id,
      lastMessageRole: messages.at(-1)?.role,
      toolParts,
    });
  }, [agentStatus?.artifactKind, agentStatus?.phase, messages, status, threadId]);

  useEffect(() => {
    if (previousStatusRef.current === status) {
      return;
    }

    console.info("[chat-ui] use_chat_status_changed", {
      event: "use_chat_status_changed",
      from: previousStatusRef.current,
      threadId,
      to: status,
      ...summarizeMessagesForTelemetry(messages),
    });
    previousStatusRef.current = status;
  }, [messages, status, threadId]);

  const reconcilePersistedMessages = useCallback(
    (source: ReconciliationTrigger) => {
      const requestId = reconciliationRequestRef.current + 1;
      reconciliationRequestRef.current = requestId;
      void reconcileThreadAfterStream({
        fetchMessages: getThreadMessages,
        getCurrentMessages: () => messagesRef.current,
        onError: (reconciliationError) => {
          console.warn("[chat-ui] reconciliation_error", {
            event: "reconciliation_error",
            message:
              reconciliationError instanceof Error
                ? reconciliationError.message
                : String(reconciliationError),
            source,
            threadId,
          });
        },
        onTelemetry: (telemetry) => {
          console.info("[chat-ui] reconciliation_decision", {
            event: "reconciliation_decision",
            source,
            ...telemetry,
          });
        },
        queryClient,
        ...LONG_STREAM_RECONCILIATION_OPTIONS,
        setMessages,
        shouldApply: () => reconciliationRequestRef.current === requestId,
        threadId,
        waitForTerminalArtifactTools: true,
      });
    },
    [queryClient, setMessages, threadId],
  );

  useEffect(() => {
    reconcileAfterStreamRef.current = reconcilePersistedMessages;
  }, [reconcilePersistedMessages]);

  useEffect(() => {
    if (error) {
      reconcilePersistedMessages("error");
    }
  }, [error, reconcilePersistedMessages]);

  const isEmptyState = messages.length === 0;

  const handleSubmitMessage = useCallback(
    async (message: PromptInputMessage): Promise<void> => {
      if (!canSubmitPromptMessage(message)) {
        return;
      }

      reconciliationRequestRef.current += 1;
      setAgentStatus(null);
      clearError();

      await sendMessage(message, {
        body: {
          modelId: message.modelId,
          webSearchEnabled: message.webSearchEnabled,
        },
      });
    },
    [clearError, sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (text: string) => {
      void handleSubmitMessage({
        text,
        files: [],
        modelId: draft.modelId,
        webSearchEnabled: draft.webSearchEnabled,
      });
    },
    [handleSubmitMessage, draft.modelId, draft.webSearchEnabled],
  );

  return (
    <div className="relative flex h-full flex-1 flex-col">
      <AnimatePresence mode="wait" initial={false}>
        {isEmptyState ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative mx-auto flex w-full max-w-[70ch] flex-1 flex-col items-center justify-center gap-10 px-6 pb-24"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60%] bg-[radial-gradient(60%_70%_at_50%_0%,color-mix(in_oklch,var(--primary)_12%,transparent)_0%,transparent_70%)]"
            />

            <div className="space-y-3 text-center">
              <h1 className="text-balance font-medium text-5xl text-foreground tracking-tight">
                Ask H2O Allegiant
              </h1>
              <p className="text-balance text-muted-foreground">
                Your water intelligence assistant.
              </p>
            </div>

            {error ? <ChatRuntimeError message={error.message} /> : null}

            <ChatPromptComposer
              className="w-full"
              errorMessage={error?.message ?? null}
              onInteract={() => {
                if (error) {
                  clearError();
                }
              }}
              onStop={stop}
              onSubmitMessage={handleSubmitMessage}
              placeholder="Ask anything about water"
              status={status}
              textareaClassName="min-h-16 text-lg"
            />

            <Suggestions className="w-full">
              {EMPTY_STATE_SUGGESTIONS.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onClick={handleSuggestionClick}
                  className="border-primary/15 text-muted-foreground hover:border-primary/35 hover:bg-primary/5 hover:text-foreground hover:shadow-[0_4px_24px_-12px_color-mix(in_oklch,var(--primary)_45%,transparent)]"
                />
              ))}
            </Suggestions>
          </motion.div>
        ) : (
          <motion.div
            key="conversation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Conversation className="min-h-0 flex-1">
              <ConversationContent className="mx-auto w-full max-w-[70ch] gap-8 px-6 py-6">
                {messages.map(
                  (message, index): React.JSX.Element => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: Math.min(index * 0.04, 0.2),
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <Message from={message.role}>
                        <MessageContent>
                          {shouldShowArtifactPackageHeartbeat(message) ? (
                            <ArtifactPackageHeartbeat />
                          ) : null}
                          {message.parts.map((part, i) => {
                            switch (part.type) {
                              case "file": {
                                const isImage = part.mediaType.startsWith("image/");

                                if (isImage) {
                                  return (
                                    <div key={`${message.id}-${i}`} className="mb-2">
                                      <Image
                                        alt={part.filename ?? "Uploaded image"}
                                        className="max-h-80 rounded-lg border object-contain"
                                        height={320}
                                        src={part.url}
                                        unoptimized
                                        width={640}
                                      />
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={`${message.id}-${i}`}
                                    className="mb-2 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm"
                                  >
                                    <span className="font-medium">Attachment:</span>
                                    <span>{part.filename ?? part.mediaType}</span>
                                  </div>
                                );
                              }
                              case "reasoning":
                                return (
                                  <Reasoning
                                    key={`${message.id}-${i}`}
                                    isStreaming={part.state === "streaming"}
                                  >
                                    <ReasoningTrigger />
                                    <ReasoningContent>{part.text}</ReasoningContent>
                                  </Reasoning>
                                );
                              case "text":
                                return (
                                  <MessageResponse key={`${message.id}-${i}`}>
                                    {part.text}
                                  </MessageResponse>
                                );
                              default: {
                                const toolMetadata = getToolRenderingMetadata(part);
                                if (!toolMetadata) {
                                  return null;
                                }

                                if (isArtifactToolPart(part)) {
                                  const config = ARTIFACT_TOOL_CONFIGS[part.type];
                                  return (
                                    <ArtifactToolCard
                                      key={toolRenderKey(message.id, i, toolMetadata.defaultOpen)}
                                      Icon={config.Icon}
                                      title={config.title}
                                      state={part.state}
                                      output={
                                        part.state === "output-available" ? part.output : undefined
                                      }
                                      errorText={
                                        part.state === "output-error" ? part.errorText : undefined
                                      }
                                    />
                                  );
                                }
                                return null;
                              }
                            }
                          })}
                        </MessageContent>
                        {message.role === "assistant" && (
                          <MessageActions className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(pointer:coarse)]:opacity-100">
                            <CopyButton
                              text={message.parts
                                .filter((p) => p.type === "text")
                                .map((p) => p.text)
                                .join("\n")}
                            />
                            <MessageAction
                              tooltip="Branch from here"
                              onClick={() => {
                                branchMutation.mutate(message.id);
                              }}
                            >
                              <GitBranchIcon className="size-3" />
                            </MessageAction>
                            <MessageAction
                              tooltip="Regenerate"
                              onClick={() => {
                                reconciliationRequestRef.current += 1;
                                regenerate({ messageId: message.id });
                              }}
                            >
                              <RefreshCcwIcon className="size-3" />
                            </MessageAction>
                          </MessageActions>
                        )}
                      </Message>
                    </motion.div>
                  ),
                )}

                {agentStatus && shouldShowAgentStatusProgress(status, messages, agentStatus) ? (
                  <AgentStatusProgress status={agentStatus} />
                ) : null}

                {shouldShowLoadingShimmer(status, messages) && !agentStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.15,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    <Message from="assistant">
                      <MessageContent>
                        <Shimmer as="p" className="text-sm">
                          Thinking…
                        </Shimmer>
                      </MessageContent>
                    </Message>
                  </motion.div>
                )}

                {error ? <ChatRuntimeError message={error.message} /> : null}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="mx-auto w-full max-w-[70ch] px-6 pb-8 pt-4">
              <ChatPromptComposer
                className="w-full"
                errorMessage={error?.message ?? null}
                onInteract={() => {
                  if (error) {
                    clearError();
                  }
                }}
                onStop={stop}
                onSubmitMessage={handleSubmitMessage}
                placeholder="Say something..."
                status={status}
                textareaClassName="min-h-14"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
