import { describe, expect, it } from "vitest";
import { createInMemoryS3BlobStore, createS3ObjectKey } from "@/lib/storage/s3-blob-store";

describe("s3-blob-store", () => {
  it("genera keys con prefijo configurado", () => {
    const key = createS3ObjectKey({
      prefix: "secondstream/attachments/",
      threadId: "thread-1",
      filename: "diagram.png",
    });

    expect(key).toMatch(/^secondstream\/attachments\/thread-1\//);
    expect(key.endsWith("diagram.png")).toBe(true);
  });

  it("put/get/delete funciona con metadata de tipo y tamaño", async () => {
    const store = createInMemoryS3BlobStore({
      bucket: "dsr-waste-platform-prod-storage",
      prefix: "secondstream/attachments/",
      region: "us-east-1",
    });

    const payload = Buffer.from("hola-adjunto", "utf8");

    const saved = await store.put({
      bytes: payload,
      filename: "notes.txt",
      mediaType: "text/plain",
      threadId: "thread-1",
    });

    expect(saved.key).toContain("secondstream/attachments/");
    expect(saved.url).toContain("dsr-waste-platform-prod-storage");
    expect(saved.sizeBytes).toBe(payload.length);

    const loaded = await store.get(saved.key);
    expect(loaded.toString("utf8")).toBe("hola-adjunto");

    await store.delete(saved.key);

    await expect(store.get(saved.key)).rejects.toThrowError(/not found/i);
  });
});
