import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { attachmentRefToFilePart, filePartToAttachmentRef } from "@/lib/storage/attachment-metadata";
import { getChatStore } from "@/lib/storage/chat-store";
import { MyUIMessage } from "@/types/ui-message";

const getThreadMessagesSchema = z.object({
  threadId: z.string().min(1, "threadId is required"),
});

export const getThreadMessages = createServerFn({ method: "GET" })
  .inputValidator(getThreadMessagesSchema)
  .handler(async ({ data }) => {
    const chatStore = await getChatStore();
    const messages = await chatStore.getThreadMessages(data.threadId);

    const hydrated = messages.map((message) => ({
      ...message,
      parts: Array.isArray(message.parts)
        ? message.parts.map((part) => {
        if (part.type !== "file") {
          return part;
        }

        const metadata = filePartToAttachmentRef({
          type: "file",
          mediaType: part.mediaType,
          filename: part.filename,
          url: part.url,
          metadata: (part as { metadata?: unknown }).metadata,
        });

        if (!metadata) {
          return part;
        }

        return {
          ...attachmentRefToFilePart(metadata),
          metadata,
        } as MyUIMessage["parts"][number];
          })
        : [],
    }));

    return { messages: hydrated };
  });
