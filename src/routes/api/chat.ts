import { createFileRoute } from "@tanstack/react-router";
import { chatPost } from "@/lib/chat-handler";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: chatPost,
    },
  },
});
