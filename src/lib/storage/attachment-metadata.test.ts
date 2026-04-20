import { describe, expect, it } from "vitest";
import {
  ATTACHMENT_METADATA_VERSION,
  attachmentRefToFilePart,
  attachmentRefToPersistedPart,
  buildAttachmentRef,
  filePartToAttachmentRef,
  isPersistedAttachmentUrl,
  isSupportedAttachmentMediaType,
} from "@/lib/storage/attachment-metadata";

describe("attachment-metadata", () => {
  it("acepta tipos MVP soportados", () => {
    expect(isSupportedAttachmentMediaType("image/png")).toBe(true);
    expect(isSupportedAttachmentMediaType("text/plain")).toBe(true);
    expect(isSupportedAttachmentMediaType("text/markdown")).toBe(true);
    expect(isSupportedAttachmentMediaType("application/pdf")).toBe(true);
  });

  it("rechaza tipos fuera del MVP", () => {
    expect(isSupportedAttachmentMediaType("application/zip")).toBe(false);
    expect(isSupportedAttachmentMediaType("audio/mpeg")).toBe(false);
  });

  it("serializa metadata de adjunto con versión", () => {
    const ref = buildAttachmentRef({
      filename: "manual.pdf",
      mediaType: "application/pdf",
      s3Key: "secondstream/attachments/thread-1/file-1.pdf",
      sizeBytes: 2048,
      url: "https://example-bucket.s3.us-east-1.amazonaws.com/secondstream/attachments/thread-1/file-1.pdf",
    });

    expect(ref.version).toBe(ATTACHMENT_METADATA_VERSION);
    expect(ref.mediaType).toBe("application/pdf");
    expect(ref.s3Key).toContain("secondstream/attachments/");
  });

  it("reconstruye un file part desde la referencia persistida", () => {
    const part = attachmentRefToFilePart({
      version: ATTACHMENT_METADATA_VERSION,
      filename: "photo.png",
      mediaType: "image/png",
      s3Key: "secondstream/attachments/thread-1/photo.png",
      sizeBytes: 123,
      url: "https://example-bucket.s3.us-east-1.amazonaws.com/secondstream/attachments/thread-1/photo.png",
    });

    expect(part.type).toBe("file");
    expect(part.mediaType).toBe("image/png");
    expect(part.url).toContain("secondstream/attachments/");
  });

  it("convierte a part persistible en DB y recupera metadata", () => {
    const ref = buildAttachmentRef({
      filename: "doc.md",
      mediaType: "text/markdown",
      s3Key: "secondstream/attachments/thread-1/doc.md",
      sizeBytes: 88,
      url: "https://example-bucket.s3.us-east-1.amazonaws.com/secondstream/attachments/thread-1/doc.md",
    });

    const part = attachmentRefToPersistedPart(ref);
    expect(isPersistedAttachmentUrl(part.url)).toBe(true);

    const recovered = filePartToAttachmentRef(part);
    expect(recovered?.s3Key).toBe(ref.s3Key);
    expect(recovered?.mediaType).toBe("text/markdown");
  });
});
