import { describe, expect, it } from "vitest";
import { createInMemoryWorkingMemoryStore } from "@/lib/storage/working-memory-store";

describe("working-memory-store", () => {
  it("guarda y recupera working memory por resource", async () => {
    const store = createInMemoryWorkingMemoryStore();

    await store.set("user-id", {
      name: "Ricardo",
      traits: ["concise"],
      anythingElse: "prefiere respuestas directas",
    });

    const memory = await store.get("user-id");
    expect(memory?.name).toBe("Ricardo");
    expect(memory?.traits).toEqual(["concise"]);
  });

  it("retorna null cuando no existe registro", async () => {
    const store = createInMemoryWorkingMemoryStore();
    const memory = await store.get("missing");
    expect(memory).toBeNull();
  });
});
