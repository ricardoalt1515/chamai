import type { ArtifactStore } from "@/lib/artifacts/artifact-store";
import { isArtifactKind } from "@/lib/artifacts/artifact-store";
import { pdfFilename } from "@/lib/artifacts/payloads";
import type { ArtifactPdfStorage, PdfPresignDisposition } from "@/lib/artifacts/pdf-storage";
import type { OwnerContext } from "@/lib/auth/owner-context";
import type { ChatStore } from "@/lib/storage/chat-store-types";

const PRESIGN_EXPIRES_IN_SECONDS = 300;

export type ArtifactPresignDeps = {
  artifactStore: ArtifactStore;
  pdfStorage: ArtifactPdfStorage;
  chatStore: ChatStore;
  getOwner: () => Promise<OwnerContext>;
};

const textResponse = (body: string, status: number, code: string): Response =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-error-code": code,
    },
  });

const parseDisposition = (value: string | null): PdfPresignDisposition =>
  value === "inline" ? "inline" : "attachment";

export const handleArtifactPresign = async (
  request: Request,
  deps: ArtifactPresignDeps,
): Promise<Response> => {
  const owner = await deps.getOwner();

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");
  const kind = searchParams.get("kind");
  if (!threadId || !kind || !isArtifactKind(kind)) {
    return textResponse("Invalid artifact request.", 400, "ARTIFACT_REQUEST_INVALID");
  }

  const thread = await deps.chatStore.getThreadById(threadId);
  if (!thread || thread.resourceId !== owner.userId) {
    return textResponse("Artifact not found.", 404, "ARTIFACT_NOT_FOUND");
  }

  const artifact = await deps.artifactStore.getActiveArtifact(threadId, kind, owner);
  if (!artifact || artifact.status !== "ready") {
    return textResponse("Artifact not found.", 404, "ARTIFACT_NOT_FOUND");
  }

  const filename = pdfFilename(artifact.customerSlug, artifact.kind);
  const url = await deps.pdfStorage.presign({
    userId: owner.userId,
    threadId,
    kind: artifact.kind,
    disposition: parseDisposition(searchParams.get("disposition")),
    filename,
    expiresInSeconds: PRESIGN_EXPIRES_IN_SECONDS,
  });

  return new Response(JSON.stringify({ url, expiresInSeconds: PRESIGN_EXPIRES_IN_SECONDS }), {
    status: 200,
    headers: {
      "cache-control": "private, no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
};
