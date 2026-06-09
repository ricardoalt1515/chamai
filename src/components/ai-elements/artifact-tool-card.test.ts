import { fetchAuthSession } from "aws-amplify/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveArtifactPresignedUrl } from "./artifact-tool-card";

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

const fetchAuthSessionMock = vi.mocked(fetchAuthSession);

describe("resolveArtifactPresignedUrl", () => {
  beforeEach(() => {
    fetchAuthSessionMock.mockResolvedValue({
      tokens: { accessToken: { toString: () => "access-token" } },
    } as Awaited<ReturnType<typeof fetchAuthSession>>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the Lambda with the bearer token and disposition, returns the presigned URL", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ url: "https://signed.s3.example/file.pdf?Signature=abc" }), {
          status: 200,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const url = await resolveArtifactPresignedUrl(
      "https://lambda.example/?threadId=t1&kind=field-brief",
      "inline",
    );

    expect(url).toBe("https://signed.s3.example/file.pdf?Signature=abc");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(new URL(calledUrl).searchParams.get("disposition")).toBe("inline");
    expect(new URL(calledUrl).searchParams.get("threadId")).toBe("t1");
    expect((calledInit.headers as Record<string, string>).authorization).toBe(
      "Bearer access-token",
    );
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Artifact not found.", { status: 404 })),
    );

    await expect(
      resolveArtifactPresignedUrl("https://lambda.example/?threadId=t&kind=playbook", "attachment"),
    ).rejects.toThrow(/404/);
  });

  it("throws when the session has no access token", async () => {
    fetchAuthSessionMock.mockResolvedValueOnce({} as Awaited<ReturnType<typeof fetchAuthSession>>);

    await expect(
      resolveArtifactPresignedUrl("https://lambda.example/?threadId=t&kind=playbook", "inline"),
    ).rejects.toThrow(/sign in/i);
  });
});
