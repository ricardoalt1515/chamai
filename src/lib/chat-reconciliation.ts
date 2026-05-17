import type { MyUIMessage } from "@/types/ui-message";

type ThreadReconciliationQueryClient = {
  invalidateQueries: (filters: { queryKey: string[] }) => unknown;
};

type ThreadMessagesFetcher = (input: { threadId: string }) => Promise<{ messages: MyUIMessage[] }>;

type ThreadMessagesSetter = (messages: MyUIMessage[]) => void;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const reconcileThreadAfterStream = async ({
  fetchMessages,
  onError,
  queryClient,
  setMessages,
  settleMs = 500,
  shouldApply = () => true,
  threadId,
}: {
  fetchMessages: ThreadMessagesFetcher;
  onError?: (error: unknown) => void;
  queryClient: ThreadReconciliationQueryClient;
  setMessages: ThreadMessagesSetter;
  settleMs?: number;
  shouldApply?: () => boolean;
  threadId: string;
}): Promise<void> => {
  void queryClient.invalidateQueries({ queryKey: ["threads"] });
  try {
    if (settleMs > 0) {
      await wait(settleMs);
    }
    const { messages: freshMessages } = await fetchMessages({ threadId });
    if (shouldApply()) {
      setMessages(freshMessages);
    }
  } catch (error) {
    try {
      onError?.(error);
    } catch {
      // Reconciliation should never surface as an unhandled chat runtime error.
    }
  }
};
