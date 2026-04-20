import { describe, expect, it } from "vitest";
import { createInMemoryChatStore } from "@/lib/storage/chat-store";

describe("chat-store", () => {
  it("crea thread y guarda/lista mensajes UI", async () => {
    const store = createInMemoryChatStore();

    await store.createThread("thread-1", "user-id");
    await store.saveMessage("thread-1", {
      id: "u-1",
      role: "user",
      parts: [{ type: "text", text: "hola" }],
    });

    const messages = await store.getThreadMessages("thread-1");
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe("u-1");
    expect(messages[0].parts[0]).toMatchObject({ type: "text", text: "hola" });
  });

  it("replaceAssistantMessageAfter reemplaza respuesta regenerada sin duplicar", async () => {
    const store = createInMemoryChatStore();

    await store.createThread("thread-1", "user-id");
    await store.saveMessage("thread-1", {
      id: "u-1",
      role: "user",
      parts: [{ type: "text", text: "pregunta" }],
    });
    await store.saveMessage("thread-1", {
      id: "a-1",
      role: "assistant",
      parts: [{ type: "text", text: "respuesta vieja" }],
    });
    await store.saveMessage("thread-1", {
      id: "u-2",
      role: "user",
      parts: [{ type: "text", text: "siguiente" }],
    });

    await store.replaceAssistantMessageAfter("thread-1", "a-1", {
      id: "a-2",
      role: "assistant",
      parts: [{ type: "text", text: "respuesta nueva" }],
    });

    const messages = await store.getThreadMessages("thread-1");
    expect(messages.map((m) => m.id)).toEqual(["u-1", "a-2"]);
  });

  it("cloneThread copia historial completo si upToMessageId no existe", async () => {
    const store = createInMemoryChatStore();

    await store.createThread("thread-1", "user-id");
    await store.saveMessage("thread-1", {
      id: "u-1",
      role: "user",
      parts: [{ type: "text", text: "uno" }],
    });
    await store.saveMessage("thread-1", {
      id: "a-1",
      role: "assistant",
      parts: [{ type: "text", text: "dos" }],
    });

    const cloned = await store.cloneThread("thread-1", "user-id", "missing-id");
    const clonedMessages = await store.getThreadMessages(cloned.id);

    expect(clonedMessages.map((m) => m.id)).toEqual(["u-1", "a-1"]);
  });
});
