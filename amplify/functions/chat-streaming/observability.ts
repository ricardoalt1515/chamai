export type ChatStreamLogEvent =
  | "request_start"
  | "auth_result"
  | "handler_result"
  | "stream_event"
  | "stream_write";

export type ChatStreamLogger = {
  info(event: ChatStreamLogEvent, details?: Record<string, unknown>): void;
  error(event: ChatStreamLogEvent, details?: Record<string, unknown>): void;
};

const safeDetails = (details: Record<string, unknown> = {}): Record<string, unknown> => {
  const blocked = new Set(["authorization", "token", "jwt", "claims", "message", "messages"]);
  return Object.fromEntries(
    Object.entries(details).filter(([key]) => !blocked.has(key.toLowerCase())),
  );
};

export const createCorrelationId = (): string => crypto.randomUUID();

export const createChatStreamLogger = (correlationId: string): ChatStreamLogger => ({
  info(event, details) {
    console.info(JSON.stringify({ level: "info", event, correlationId, ...safeDetails(details) }));
  },
  error(event, details) {
    console.error(
      JSON.stringify({ level: "error", event, correlationId, ...safeDetails(details) }),
    );
  },
});
