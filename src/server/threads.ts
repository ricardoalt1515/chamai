import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getChatStore } from "@/lib/storage/chat-store";

const RESOURCE_ID = "user-id";

const cloneThreadSchema = z.object({
  sourceThreadId: z.string().min(1, "sourceThreadId is required"),
  upToMessageId: z.string().optional(),
});

export const cloneThread = createServerFn({ method: "POST" })
  .inputValidator(cloneThreadSchema)
  .handler(async ({ data }) => {
    const chatStore = await getChatStore();
    const result = await chatStore.cloneThread(data.sourceThreadId, RESOURCE_ID, data.upToMessageId);

    return {
      thread: {
        id: result.id,
        title: result.title ?? null,
        resourceId: result.resourceId,
        createdAt: new Date(result.createdAt).toISOString(),
        updatedAt: new Date(result.updatedAt).toISOString(),
      } satisfies Thread,
    };
  });

export type Thread = {
  id: string;
  title: string | null;
  resourceId: string;
  createdAt: string;
  updatedAt: string;
};

export const getThreads = createServerFn({ method: "GET" }).handler(async () => {
  const chatStore = await getChatStore();
  const rawThreads = await chatStore.listThreads(RESOURCE_ID);

  // Map to a plain serializable shape and sort by most recent first
  const threads: Thread[] = rawThreads
    .map((t) => ({
      id: t.id,
      title: t.title ?? null,
      resourceId: t.resourceId,
      createdAt: new Date(t.createdAt).toISOString(),
      updatedAt: new Date(t.updatedAt).toISOString(),
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return { threads };
});

const deleteThreadSchema = z.object({
  threadId: z.string().min(1, "threadId is required"),
});

export const deleteThread = createServerFn({ method: "POST" })
  .inputValidator(deleteThreadSchema)
  .handler(async ({ data }) => {
    const chatStore = await getChatStore();
    await chatStore.deleteThread(data.threadId);

    return { success: true };
  });

export const createThread = createServerFn({ method: "POST" }).handler(async () => {
  const chatStore = await getChatStore();
  const thread = await chatStore.createThread(nanoid(), RESOURCE_ID, "New Chat");

  return {
    thread: {
      id: thread.id,
      title: thread.title,
      resourceId: thread.resourceId,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    } satisfies Thread,
  };
});

export const threadsQueryOptions = queryOptions({
  queryKey: ["threads"],
  queryFn: () => getThreads(),
});
