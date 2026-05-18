import type { MyUIMessage } from "@/types/ui-message";

type ThreadReconciliationQueryClient = {
  invalidateQueries: (filters: { queryKey: string[] }) => unknown;
};

type ThreadMessagesFetcher = (input: { threadId: string }) => Promise<{ messages: MyUIMessage[] }>;

type ThreadMessagesSetter = (messages: MyUIMessage[]) => void;

type ThreadMessagesReader = () => MyUIMessage[];

type MessageTail = {
  id?: string;
  role?: MyUIMessage["role"];
};

export type ReconciliationTelemetryEvent = {
  type: "decision";
  reason:
    | "attempt"
    | "applied"
    | "persisted_behind"
    | "assistant_tail_missing"
    | "artifact_terminal_missing"
    | "superseded"
    | "exhausted"
    | "error";
  attempt: number;
  currentLength: number;
  freshLength: number;
  currentTail?: MessageTail;
  freshTail?: MessageTail;
  threadId: string;
  errorMessage?: string;
};

type ReconciliationTelemetryCallback = (event: ReconciliationTelemetryEvent) => void;

export const LONG_STREAM_RECONCILIATION_OPTIONS = {
  maxDurationMs: 300_000,
  maxRetryMs: 10_000,
  retryMs: 2_000,
  settleMs: 500,
} as const;

const ARTIFACT_TOOL_TYPES = new Set([
  "tool-generateFieldBrief",
  "tool-generatePlaybook",
  "tool-generateAnalyticalRead",
  "tool-generateProposalShell",
]);

const TERMINAL_TOOL_STATES = new Set(["output-available", "output-error"]);

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const messageTail = (message: MyUIMessage | undefined): MessageTail | undefined =>
  message ? { id: message.id, role: message.role } : undefined;

const isArtifactToolPart = (part: MyUIMessage["parts"][number]): boolean =>
  typeof part.type === "string" && ARTIFACT_TOOL_TYPES.has(part.type);

const isTerminalToolPart = (part: MyUIMessage["parts"][number]): boolean =>
  "state" in part && typeof part.state === "string" && TERMINAL_TOOL_STATES.has(part.state);

const hasArtifactTool = (messages: MyUIMessage[]): boolean =>
  messages.some((message) => message.parts.some((part) => isArtifactToolPart(part)));

const hasTerminalArtifactTool = (messages: MyUIMessage[]): boolean =>
  messages.some((message) =>
    message.parts.some((part) => isArtifactToolPart(part) && isTerminalToolPart(part)),
  );

const retryDelayForAttempt = ({
  attempt,
  maxRetryMs,
  retryMs,
}: {
  attempt: number;
  maxRetryMs: number;
  retryMs: number;
}): number => Math.min(maxRetryMs, Math.round(retryMs * 1.5 ** Math.max(0, attempt - 1)));

const safeEmitTelemetry = (
  onTelemetry: ReconciliationTelemetryCallback | undefined,
  event: ReconciliationTelemetryEvent,
): void => {
  try {
    onTelemetry?.(event);
  } catch {
    // Reconciliation telemetry must never affect chat state recovery.
  }
};

const persistedSnapshotDecisionReason = ({
  currentMessages,
  freshMessages,
}: {
  currentMessages: MyUIMessage[];
  freshMessages: MyUIMessage[];
}): Extract<
  ReconciliationTelemetryEvent["reason"],
  "applied" | "persisted_behind" | "assistant_tail_missing" | "artifact_terminal_missing"
> => {
  if (freshMessages.length < currentMessages.length) {
    return "persisted_behind";
  }

  const currentLastMessage = currentMessages.at(-1);
  const freshLastMessage = freshMessages.at(-1);

  if (currentLastMessage?.role === "assistant" && freshLastMessage?.role !== "assistant") {
    return "assistant_tail_missing";
  }

  return "applied";
};

export const reconcileThreadAfterStream = async ({
  fetchMessages,
  getCurrentMessages,
  maxAttempts,
  maxDurationMs = LONG_STREAM_RECONCILIATION_OPTIONS.maxDurationMs,
  maxRetryMs = LONG_STREAM_RECONCILIATION_OPTIONS.maxRetryMs,
  onError,
  onTelemetry,
  queryClient,
  retryMs = LONG_STREAM_RECONCILIATION_OPTIONS.retryMs,
  setMessages,
  settleMs = LONG_STREAM_RECONCILIATION_OPTIONS.settleMs,
  shouldApply = () => true,
  threadId,
  waitForTerminalArtifactTools = false,
}: {
  fetchMessages: ThreadMessagesFetcher;
  getCurrentMessages: ThreadMessagesReader;
  maxAttempts?: number;
  maxDurationMs?: number;
  maxRetryMs?: number;
  onError?: (error: unknown) => void;
  onTelemetry?: ReconciliationTelemetryCallback;
  queryClient: ThreadReconciliationQueryClient;
  retryMs?: number;
  setMessages: ThreadMessagesSetter;
  settleMs?: number;
  shouldApply?: () => boolean;
  threadId: string;
  waitForTerminalArtifactTools?: boolean;
}): Promise<void> => {
  void queryClient.invalidateQueries({ queryKey: ["threads"] });
  try {
    if (settleMs > 0) {
      await wait(settleMs);
    }

    const startedAt = Date.now();
    let attempt = 1;

    while (maxAttempts ? attempt <= maxAttempts : Date.now() - startedAt <= maxDurationMs) {
      if (!shouldApply()) {
        safeEmitTelemetry(onTelemetry, {
          type: "decision",
          reason: "superseded",
          attempt,
          currentLength: getCurrentMessages().length,
          freshLength: 0,
          threadId,
        });
        return;
      }

      const currentMessages = getCurrentMessages();
      const { messages: freshMessages } = await fetchMessages({ threadId });
      const currentTail = messageTail(currentMessages.at(-1));
      const freshTail = messageTail(freshMessages.at(-1));
      const baseTelemetry = {
        attempt,
        currentLength: currentMessages.length,
        currentTail,
        freshLength: freshMessages.length,
        freshTail,
        threadId,
        type: "decision" as const,
      };
      safeEmitTelemetry(onTelemetry, { ...baseTelemetry, reason: "attempt" });

      let reason = persistedSnapshotDecisionReason({ currentMessages, freshMessages });
      if (
        reason === "applied" &&
        waitForTerminalArtifactTools &&
        hasArtifactTool(currentMessages) &&
        !hasTerminalArtifactTool(freshMessages)
      ) {
        reason = "artifact_terminal_missing";
      }

      if (reason === "applied") {
        if (shouldApply()) {
          setMessages(freshMessages);
          safeEmitTelemetry(onTelemetry, { ...baseTelemetry, reason: "applied" });
        } else {
          safeEmitTelemetry(onTelemetry, { ...baseTelemetry, reason: "superseded" });
        }
        return;
      }

      safeEmitTelemetry(onTelemetry, { ...baseTelemetry, reason });

      const nextAttempt = attempt + 1;
      const shouldRetry = maxAttempts
        ? nextAttempt <= maxAttempts
        : retryMs > 0 && Date.now() - startedAt < maxDurationMs;
      if (shouldRetry && retryMs > 0) {
        await wait(retryDelayForAttempt({ attempt, maxRetryMs, retryMs }));
      }
      attempt = nextAttempt;
    }

    const currentMessages = getCurrentMessages();
    safeEmitTelemetry(onTelemetry, {
      type: "decision",
      reason: "exhausted",
      attempt: maxAttempts ?? attempt - 1,
      currentLength: currentMessages.length,
      currentTail: messageTail(currentMessages.at(-1)),
      freshLength: 0,
      threadId,
    });
  } catch (error) {
    safeEmitTelemetry(onTelemetry, {
      type: "decision",
      reason: "error",
      attempt: 0,
      currentLength: getCurrentMessages().length,
      errorMessage: error instanceof Error ? error.message : String(error),
      freshLength: 0,
      threadId,
    });
    try {
      onError?.(error);
    } catch {
      // Reconciliation should never surface as an unhandled chat runtime error.
    }
  }
};
