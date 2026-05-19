import { describe, expect, it } from "vitest";
import { artifactViewUrl } from "./artifact-tool-card";

describe("artifactViewUrl", () => {
  it.each([
    ["https://example.com/file.pdf", "https://example.com/file.pdf?disposition=inline"],
    ["https://example.com/file.pdf?x=1", "https://example.com/file.pdf?x=1&disposition=inline"],
    [
      "/api/threads/thread-1/artifacts/field-brief/pdf#page=2",
      "/api/threads/thread-1/artifacts/field-brief/pdf?disposition=inline#page=2",
    ],
    [
      "/api/threads/thread-1/artifacts/field-brief/pdf?x=1#page=2",
      "/api/threads/thread-1/artifacts/field-brief/pdf?x=1&disposition=inline#page=2",
    ],
    [
      "/api/threads/thread-1/artifacts/field-brief/pdf?disposition=attachment",
      "/api/threads/thread-1/artifacts/field-brief/pdf?disposition=inline",
    ],
  ])("converts %s to %s", (downloadUrl, expected) => {
    expect(artifactViewUrl(downloadUrl)).toBe(expected);
  });
});
