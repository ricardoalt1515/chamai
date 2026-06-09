import type { ArtifactRequestContext } from "@/ai/tools/h2o-artifacts";
import { createInMemoryArtifactStore } from "@/lib/artifacts/artifact-store";
import { InMemoryArtifactPdfStorage } from "@/lib/artifacts/pdf-storage";
import type { OwnerContext } from "@/lib/auth/owner-context";

// Fake owner mirroring the OwnerContext shape used across existing tests
// (e.g. src/ai/tools/h2o-artifacts.test.ts).
export const fakeOwner: OwnerContext = {
  identityId: "eval-identity-1",
  userId: "eval-user-1",
};

// Builds a fresh in-memory artifact context for a single scenario run. PDF
// rendering inside the artifact tools stays REAL (renderArtifactPdf runs
// unmodified) — only persistence (DB row + PDF bytes) is faked, so a render
// failure still surfaces as a tool error during eval runs.
export const createFakeArtifactContext = (threadId: string): ArtifactRequestContext => ({
  owner: fakeOwner,
  threadId,
  artifactStore: createInMemoryArtifactStore(),
  pdfStorage: new InMemoryArtifactPdfStorage(),
});
