import { describe, expect, it } from "vitest";
import { canSubmitPromptMessage } from "@/lib/chat-utils";

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
