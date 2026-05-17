import { nanoid } from "nanoid";
import type { MyUIMessage } from "@/types/ui-message";

type MessageLike = Omit<MyUIMessage, "id"> & { id?: string };

export const toBedrockModelId = (runtimeModelId: string): string => {
  if (runtimeModelId.includes("/")) {
    return runtimeModelId.split("/").slice(1).join("/");
  }

  return runtimeModelId;
};

export const ensureServerMessageId = (message: MessageLike): MyUIMessage => {
  return {
    ...message,
    id: message.id || nanoid(),
  };
};

export const extractLastUserMessage = (messages: MessageLike[]): MyUIMessage | null => {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (message.role === "user") {
      return ensureServerMessageId(message);
    }
  }

  return null;
};

export const isStableThreadTitle = (title: string | null | undefined): boolean => {
  if (!title) {
    return false;
  }

  return title.trim().toLowerCase() !== "new chat";
};

export type ToolPartLike = {
  type: string;
  state?: string;
  output?: unknown;
  errorText?: string;
  input?: unknown;
  approval?: unknown;
};

// Tool states left non-terminal when a stream aborts. AI SDK v6's
// `convertToModelMessages({ ignoreIncompleteToolCalls: true })` only filters
// `input-streaming` and `input-available` from model history — it does NOT
// touch `approval-requested`. We sanitize the wider set so the UI never
// hydrates a stuck "Pending"/"Running"/"Awaiting Approval" card.
const INCOMPLETE_TOOL_STATES = new Set<string>([
  "input-streaming",
  "input-available",
  "approval-requested",
]);

// Matches both static (`tool-<name>`) and dynamic (`dynamic-tool`) UI parts.
// Equivalent to AI SDK v6's `isToolUIPart(part) = isStaticToolUIPart(part) || isDynamicToolUIPart(part)`.
const isToolPart = (part: unknown): part is ToolPartLike => {
  const candidate = part as ToolPartLike | null;
  return (
    typeof candidate?.type === "string" &&
    (candidate.type.startsWith("tool-") || candidate.type === "dynamic-tool")
  );
};

// Downgrades incomplete tool parts to output-error. AI SDK v6 contract:
// output-error requires `output?: never` and the only allowed `approval`
// shape is `{ id, approved: true, reason? }`. We strip `output` and
// `approval` from the source part because:
//   - input-streaming / input-available carry no output, but spreading
//     verbatim risks bleeding a stale field if the part was hand-built.
//   - approval-requested carries `approval: { id, approved?: never }` which
//     violates the output-error approval shape.
export const sanitizeAbortedToolParts = (message: MyUIMessage): MyUIMessage => {
  const parts = message.parts.map((part) => {
    if (!isToolPart(part)) {
      return part;
    }

    if (!INCOMPLETE_TOOL_STATES.has(part.state ?? "")) {
      return part;
    }

    const { output: _output, approval: _approval, ...rest } = part;
    return {
      ...rest,
      state: "output-error",
      errorText: "Response interrupted before this tool finished. Ask the agent to retry.",
    } as MyUIMessage["parts"][number];
  });

  return { ...message, parts };
};
