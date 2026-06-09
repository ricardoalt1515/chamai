import { describe, expect, it, vi } from "vitest";
import type { ArtifactRecord, ArtifactStore } from "@/lib/artifacts/artifact-store";
import type { ArtifactPdfStorage } from "@/lib/artifacts/pdf-storage";
import { AuthRequiredError } from "@/lib/auth/errors";
import type { OwnerContext } from "@/lib/auth/owner-context";
import type { ChatStore, StoredThread } from "@/lib/storage/chat-store-types";
import { handleArtifactPresign } from "./artifact-presign";

const owner: OwnerContext = { identityId: "id-1", userId: "user-1" };

const thread: StoredThread = {
  id: "thread-1",
  resourceId: owner.userId,
  title: "Title",
  createdAt: "2026-05-19T00:00:00.000Z",
  updatedAt: "2026-05-19T00:00:00.000Z",
};

const artifact: ArtifactRecord = {
  id: "artifact-1",
  ownerUserId: owner.userId,
  ownerIdentityId: owner.identityId,
  threadId: "thread-1",
  kind: "field-brief",
  status: "ready",
  customerSlug: "acme-water",
  title: "Acme Water Field Brief",
  payload: {},
  payloadVersion: 1,
  createdAtIso: "2026-05-19T00:00:00.000Z",
  updatedAtIso: "2026-05-19T00:00:00.000Z",
};

const buildDeps = (
  overrides: Partial<{
    getOwner: () => Promise<OwnerContext>;
    thread: StoredThread | null;
    artifact: ArtifactRecord | null;
    presignedUrl: string;
  }> = {},
) => {
  const chatStore: ChatStore = {
    getThreadById: vi.fn(async () => overrides.thread ?? thread),
  } as unknown as ChatStore;
  const artifactStore: ArtifactStore = {
    getActiveArtifact: vi.fn(async () => ("artifact" in overrides ? overrides.artifact : artifact)),
  } as unknown as ArtifactStore;
  const pdfStorage = {
    presign: vi.fn(async () => overrides.presignedUrl ?? "https://signed.example/pdf"),
  } as unknown as ArtifactPdfStorage;
  return {
    artifactStore,
    chatStore,
    getOwner: overrides.getOwner ?? (async () => owner),
    pdfStorage,
  };
};

const buildRequest = (search: string): Request =>
  new Request(`https://lambda.example/${search}`, { method: "GET" });

describe("handleArtifactPresign", () => {
  it("returns a presigned URL when auth, ownership, and artifact existence pass", async () => {
    const deps = buildDeps();
    const response = await handleArtifactPresign(
      buildRequest("?threadId=thread-1&kind=field-brief&disposition=inline"),
      deps,
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { url: string; expiresInSeconds: number };
    expect(body.url).toBe("https://signed.example/pdf");
    expect(body.expiresInSeconds).toBe(300);
    expect(deps.pdfStorage.presign).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: owner.userId,
        threadId: "thread-1",
        kind: "field-brief",
        disposition: "inline",
      }),
    );
  });

  it("defaults disposition to attachment when omitted", async () => {
    const deps = buildDeps();
    await handleArtifactPresign(buildRequest("?threadId=thread-1&kind=field-brief"), deps);
    expect(deps.pdfStorage.presign).toHaveBeenCalledWith(
      expect.objectContaining({ disposition: "attachment" }),
    );
  });

  it("returns 400 when threadId or kind is missing or invalid", async () => {
    const deps = buildDeps();
    const noThread = await handleArtifactPresign(buildRequest("?kind=field-brief"), deps);
    expect(noThread.status).toBe(400);
    const badKind = await handleArtifactPresign(
      buildRequest("?threadId=thread-1&kind=invalid"),
      deps,
    );
    expect(badKind.status).toBe(400);
  });

  it("returns 404 when the thread does not belong to the caller", async () => {
    const deps = buildDeps({
      thread: { ...thread, resourceId: "someone-else" },
    });
    const response = await handleArtifactPresign(
      buildRequest("?threadId=thread-1&kind=field-brief"),
      deps,
    );
    expect(response.status).toBe(404);
    expect(deps.pdfStorage.presign).not.toHaveBeenCalled();
  });

  it("returns 404 when the artifact is not ready", async () => {
    const deps = buildDeps({ artifact: null });
    const response = await handleArtifactPresign(
      buildRequest("?threadId=thread-1&kind=field-brief"),
      deps,
    );
    expect(response.status).toBe(404);
  });

  it("propagates AuthRequiredError so the caller can map to 401", async () => {
    const deps = buildDeps({
      getOwner: async () => {
        throw new AuthRequiredError("Sign in to continue.");
      },
    });
    await expect(
      handleArtifactPresign(buildRequest("?threadId=thread-1&kind=field-brief"), deps),
    ).rejects.toBeInstanceOf(AuthRequiredError);
  });
});
