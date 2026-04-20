import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { type WorkingMemory, workingMemorySchema } from "@/config/working-memory";
import { getWorkingMemoryStore } from "@/lib/storage/working-memory-store";

const RESOURCE_ID = "user-id";

export const getWorkingMemory = createServerFn({ method: "GET" }).handler(async () => {
  const store = await getWorkingMemoryStore();
  const raw = await store.get(RESOURCE_ID);

  if (!raw) {
    return { workingMemory: null as WorkingMemory | null };
  }

  try {
    const parsed = workingMemorySchema.parse(raw);
    return { workingMemory: parsed };
  } catch {
    return { workingMemory: null as WorkingMemory | null };
  }
});

export const updateWorkingMemory = createServerFn({ method: "POST" })
  .inputValidator(workingMemorySchema)
  .handler(async ({ data }) => {
    const store = await getWorkingMemoryStore();
    await store.set(RESOURCE_ID, data);

    return { success: true };
  });

export const workingMemoryQueryOptions = queryOptions({
  queryKey: ["working-memory"],
  queryFn: () => getWorkingMemory(),
});
