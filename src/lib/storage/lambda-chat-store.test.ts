import { describe, expect, it } from "vitest";
import type { MyUIMessage } from "@/types/ui-message";
import { createLambdaDynamoDbChatStore, type LambdaDynamoDbClient } from "./lambda-chat-store";

type SentCommand = {
  input: Record<string, unknown>;
  constructor: { name: string };
};

class FakeDynamoDbClient implements LambdaDynamoDbClient {
  readonly sessions = new Map<string, Record<string, unknown>>();
  readonly messages = new Map<string, Record<string, unknown>>();
  readonly sent: SentCommand[] = [];

  async send(command: SentCommand): Promise<Record<string, unknown>> {
    this.sent.push(command);
    const name = command.constructor.name;
    const input = command.input;

    if (name === "PutItemCommand") {
      const table = String(input.TableName);
      const item = unmarshallRecord(input.Item as Record<string, { S?: string; N?: string }>);
      if (table === "sessions") this.sessions.set(String(item.id), item);
      if (table === "messages") this.messages.set(String(item.id), item);
      return {};
    }

    if (name === "GetItemCommand") {
      const table = String(input.TableName);
      const key = unmarshallRecord(input.Key as Record<string, { S?: string; N?: string }>);
      const item =
        table === "sessions"
          ? this.sessions.get(String(key.id))
          : this.messages.get(String(key.id));
      return item ? { Item: marshallRecord(item) } : {};
    }

    if (name === "DeleteItemCommand") {
      const table = String(input.TableName);
      const key = unmarshallRecord(input.Key as Record<string, { S?: string; N?: string }>);
      if (table === "sessions") this.sessions.delete(String(key.id));
      if (table === "messages") this.messages.delete(String(key.id));
      return {};
    }

    if (name === "UpdateItemCommand") {
      const key = unmarshallRecord(input.Key as Record<string, { S?: string; N?: string }>);
      const session = this.sessions.get(String(key.id));
      if (session) {
        const values = unmarshallRecord(
          input.ExpressionAttributeValues as Record<string, { S?: string; N?: string }>,
        );
        session.title = values[":title"] ?? null;
        session.updatedAt = values[":updatedAt"];
        this.sessions.set(String(key.id), session);
      }
      return {};
    }

    if (name === "QueryCommand") {
      const table = String(input.TableName);
      const values = unmarshallRecord(
        input.ExpressionAttributeValues as Record<string, { S?: string; N?: string }>,
      );
      if (table === "sessions") {
        const userId = String(values[":userId"]);
        return {
          Items: [...this.sessions.values()]
            .filter((item) => item.userId === userId)
            .map(marshallRecord),
        };
      }

      const sessionId = String(values[":sessionId"]);
      return {
        Items: [...this.messages.values()]
          .filter((item) => item.sessionId === sessionId)
          .map(marshallRecord),
      };
    }

    if (name === "BatchWriteItemCommand") {
      const requestItems = input.RequestItems as Record<
        string,
        Array<{
          DeleteRequest?: { Key: Record<string, { S?: string; N?: string }> };
          PutRequest?: { Item: Record<string, { S?: string; N?: string }> };
        }>
      >;
      for (const [table, writes] of Object.entries(requestItems)) {
        for (const write of writes) {
          if (write.DeleteRequest) {
            const key = unmarshallRecord(write.DeleteRequest.Key);
            if (table === "messages") this.messages.delete(String(key.id));
          }
          if (write.PutRequest) {
            const item = unmarshallRecord(write.PutRequest.Item);
            if (table === "messages") this.messages.set(String(item.id), item);
          }
        }
      }
      return {};
    }

    throw new Error(`Unhandled command ${name}`);
  }
}

const marshallRecord = (
  record: Record<string, unknown>,
): Record<string, { S?: string; N?: string; NULL?: boolean }> =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (value === null || value === undefined) return [key, { NULL: true }];
      if (typeof value === "number") return [key, { N: String(value) }];
      return [key, { S: String(value) }];
    }),
  );

const unmarshallRecord = (
  record: Record<string, { S?: string; N?: string; NULL?: boolean }>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (value.NULL) return [key, null];
      if (value.N !== undefined) return [key, Number(value.N)];
      return [key, value.S];
    }),
  );

const createStore = (client = new FakeDynamoDbClient()) => ({
  client,
  store: createLambdaDynamoDbChatStore({
    client,
    messageSessionIdIndexName: "messagesBySessionId",
    messageTableName: "messages",
    sessionUserIdIndexName: "gsi-User.sessions",
    sessionTableName: "sessions",
  }),
});

const userMessage = (id: string, text = id): MyUIMessage => ({
  id,
  role: "user",
  parts: [{ type: "text", text }],
});

const assistantMessage = (id: string, text = id): MyUIMessage => ({
  id,
  role: "assistant",
  parts: [{ type: "text", text }],
});

describe("Lambda DynamoDB ChatStore", () => {
  it("creates and reads a thread with resourceId equal to the owner userId", async () => {
    const { client, store } = createStore();

    const created = await store.createThread("thread-1", "user-1", "My thread");

    expect(created).toMatchObject({ id: "thread-1", resourceId: "user-1", title: "My thread" });
    expect(client.sessions.get("thread-1")).toMatchObject({
      __typename: "Session",
      owner: "user-1::user-1",
    });
    await expect(store.getThreadById("thread-1")).resolves.toMatchObject({
      id: "thread-1",
      resourceId: "user-1",
      title: "My thread",
    });
  });

  it("appends messages and reads them in position order", async () => {
    const { client, store } = createStore();
    await store.createThread("thread-1", "user-1");

    await store.saveMessage("thread-1", userMessage("msg-1"));
    await store.saveMessage("thread-1", assistantMessage("msg-2"));

    expect(client.messages.get("msg-1")).toMatchObject({
      __typename: "Message",
      owner: "user-1::user-1",
    });
    expect(client.messages.get("msg-2")).toMatchObject({
      __typename: "Message",
      owner: "user-1::user-1",
    });
    await expect(store.getThreadMessages("thread-1")).resolves.toEqual([
      userMessage("msg-1"),
      assistantMessage("msg-2"),
    ]);
  });

  it("lists only threads for the requested user", async () => {
    const { store } = createStore();
    await store.createThread("thread-1", "user-1");
    await store.createThread("thread-2", "user-2");

    const listed = await store.listThreads("user-1");

    expect(listed.map((thread) => thread.id)).toEqual(["thread-1"]);
  });

  it("deletes a thread and its messages", async () => {
    const { store } = createStore();
    await store.createThread("thread-1", "user-1");
    await store.saveMessage("thread-1", userMessage("msg-1"));

    await store.deleteThread("thread-1");

    await expect(store.getThreadById("thread-1")).resolves.toBeNull();
    await expect(store.getThreadMessages("thread-1")).resolves.toEqual([]);
  });

  it("replaces assistant message after a target message and truncates later messages", async () => {
    const { client, store } = createStore();
    await store.createThread("thread-1", "user-1");
    await store.saveMessage("thread-1", userMessage("user-1"));
    await store.saveMessage("thread-1", assistantMessage("assistant-old"));
    await store.saveMessage("thread-1", userMessage("user-later"));

    await store.replaceAssistantMessageAfter(
      "thread-1",
      "assistant-old",
      assistantMessage("assistant-new"),
    );

    expect(client.messages.get("assistant-new")).toMatchObject({
      __typename: "Message",
      owner: "user-1::user-1",
    });
    await expect(store.getThreadMessages("thread-1")).resolves.toEqual([
      userMessage("user-1"),
      assistantMessage("assistant-new"),
    ]);
  });

  it("clones a thread up to the requested message id", async () => {
    const { store } = createStore();
    await store.createThread("source", "user-1", "Source title");
    await store.saveMessage("source", userMessage("msg-1"));
    await store.saveMessage("source", assistantMessage("msg-2"));
    await store.saveMessage("source", userMessage("msg-3"));

    const cloned = await store.cloneThread("source", "user-1", "msg-2");

    expect(cloned.id).not.toBe("source");
    expect(cloned.resourceId).toBe("user-1");
    await expect(store.getThreadMessages(cloned.id)).resolves.toEqual([
      userMessage("msg-1"),
      assistantMessage("msg-2"),
    ]);
  });

  it("uses the configured DynamoDB indexes for user and session queries", async () => {
    const { client, store } = createStore();
    await store.createThread("thread-1", "user-1");
    await store.listThreads("user-1");
    await store.getThreadMessages("thread-1");

    const queryInputs = client.sent
      .filter((command) => command.constructor.name === "QueryCommand")
      .map((command) => command.input);

    expect(queryInputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ IndexName: "gsi-User.sessions", TableName: "sessions" }),
        expect.objectContaining({ IndexName: "messagesBySessionId", TableName: "messages" }),
      ]),
    );
  });
});
