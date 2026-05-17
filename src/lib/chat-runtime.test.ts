import { describe, expect, it } from "vitest";
import {
  ensureServerMessageId,
  extractLastUserMessage,
  isStableThreadTitle,
  sanitizeAbortedToolParts,
  toBedrockModelId,
} from "@/lib/chat-runtime";
import type { MyUIMessage } from "@/types/ui-message";

describe("chat-runtime", () => {
  it("convierte provider/model a model id de Bedrock", () => {
    expect(toBedrockModelId("amazon-bedrock/us.anthropic.claude-sonnet-4-6")).toBe(
      "us.anthropic.claude-sonnet-4-6",
    );
  });

  it("mantiene id existente del mensaje", () => {
    const message = ensureServerMessageId({
      id: "m-1",
      role: "user",
      parts: [{ type: "text", text: "hola" }],
    });

    expect(message.id).toBe("m-1");
  });

  it("genera id server-side cuando falta", () => {
    const message = ensureServerMessageId({
      role: "assistant",
      parts: [{ type: "text", text: "respuesta" }],
    });

    expect(message.id.length).toBeGreaterThan(0);
  });

  it("genera id server-side cuando AI SDK entrega id vacío", () => {
    const message = ensureServerMessageId({
      id: "",
      role: "assistant",
      parts: [{ type: "text", text: "respuesta" }],
    });

    expect(message.id.length).toBeGreaterThan(0);
  });

  it("encuentra el último mensaje de usuario", () => {
    const last = extractLastUserMessage([
      { id: "a-1", role: "assistant", parts: [{ type: "text", text: "x" }] },
      { id: "u-1", role: "user", parts: [{ type: "text", text: "y" }] },
    ]);

    expect(last?.id).toBe("u-1");
  });

  it("detecta título estable distinto de New Chat", () => {
    expect(isStableThreadTitle("New Chat")).toBe(false);
    expect(isStableThreadTitle("Resumen Q2")).toBe(true);
  });

  it("converts incomplete tool parts (input-streaming, input-available, approval-requested) to output-error when aborted", () => {
    const partial: MyUIMessage = {
      id: "abc",
      role: "assistant",
      parts: [
        { type: "text", text: "preamble" },
        {
          type: "tool-generateFieldBrief",
          state: "output-available",
          input: { kind: "field-brief" },
          output: {
            artifactId: "a-1",
            title: "FB",
            formats: [],
            status: "ready",
            createdAt: "x",
            artifactType: "field-brief",
          },
          toolCallId: "t1",
        } as MyUIMessage["parts"][number],
        {
          type: "tool-generatePlaybook",
          state: "input-available",
          input: { kind: "playbook" },
          toolCallId: "t2",
        } as MyUIMessage["parts"][number],
        {
          type: "tool-generateAnalyticalRead",
          state: "input-streaming",
          input: { title: "partial" },
          toolCallId: "t3",
        } as MyUIMessage["parts"][number],
        {
          type: "tool-generateProposalShell",
          state: "approval-requested",
          input: { title: "approval pending" },
          toolCallId: "t4",
        } as MyUIMessage["parts"][number],
      ],
    };

    const sanitized = sanitizeAbortedToolParts(partial);

    expect(sanitized.parts[0]).toEqual(partial.parts[0]);
    expect(sanitized.parts[1]).toEqual(partial.parts[1]);
    for (const idx of [2, 3, 4]) {
      const part = sanitized.parts[idx] as {
        state: string;
        errorText: string;
        output?: unknown;
      };
      expect(part.state).toBe("output-error");
      expect(part.errorText).toMatch(/aborted|interrupted/i);
      expect("output" in part).toBe(false);
    }
  });

  it("downgrades dynamic-tool parts left incomplete", () => {
    const partial: MyUIMessage = {
      id: "d",
      role: "assistant",
      parts: [
        {
          type: "dynamic-tool",
          toolName: "external-lookup",
          state: "input-streaming",
          input: { partial: true },
          toolCallId: "d1",
        } as unknown as MyUIMessage["parts"][number],
      ],
    };

    const sanitized = sanitizeAbortedToolParts(partial);
    const part = sanitized.parts[0] as { state: string; errorText: string };
    expect(part.state).toBe("output-error");
    expect(part.errorText).toMatch(/interrupted/i);
  });

  it("strips approval field when downgrading approval-requested (shape incompatible with output-error)", () => {
    const partial: MyUIMessage = {
      id: "ar",
      role: "assistant",
      parts: [
        {
          type: "tool-generateProposalShell",
          state: "approval-requested",
          input: { kind: "proposal" },
          approval: { id: "ap-1" },
          toolCallId: "t1",
        } as unknown as MyUIMessage["parts"][number],
      ],
    };

    const sanitized = sanitizeAbortedToolParts(partial);
    const part = sanitized.parts[0] as {
      state: string;
      approval?: unknown;
      errorText: string;
    };
    expect(part.state).toBe("output-error");
    expect("approval" in part).toBe(false);
  });

  it("strips stale output field when downgrading to output-error", () => {
    const partial: MyUIMessage = {
      id: "x",
      role: "assistant",
      parts: [
        {
          type: "tool-generateFieldBrief",
          state: "input-available",
          input: { kind: "field-brief" },
          output: { stale: true },
          toolCallId: "t1",
        } as unknown as MyUIMessage["parts"][number],
      ],
    };

    const sanitized = sanitizeAbortedToolParts(partial);
    const part = sanitized.parts[0] as { state: string; output?: unknown };
    expect(part.state).toBe("output-error");
    expect("output" in part).toBe(false);
  });

  it("leaves a fully resolved message untouched", () => {
    const finished: MyUIMessage = {
      id: "ok",
      role: "assistant",
      parts: [
        { type: "text", text: "done" },
        {
          type: "tool-generateFieldBrief",
          state: "output-available",
          input: { kind: "field-brief" },
          output: {
            artifactId: "a-1",
            title: "FB",
            formats: [],
            status: "ready",
            createdAt: "x",
            artifactType: "field-brief",
          },
          toolCallId: "t1",
        } as MyUIMessage["parts"][number],
      ],
    };

    expect(sanitizeAbortedToolParts(finished)).toEqual(finished);
  });
});
