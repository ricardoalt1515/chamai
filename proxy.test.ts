import { fetchAuthSession } from "aws-amplify/auth/server";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { isAuthBypassPath, isProtectedAppPath, proxy } from "./proxy";

const runWithAmplifyServerContextMock = vi.hoisted(() =>
  vi.fn(({ operation }) => operation({ mockedContext: true })),
);

vi.mock("@/lib/auth/amplify-server", () => ({
  runWithAmplifyServerContext: runWithAmplifyServerContextMock,
}));

vi.mock("aws-amplify/auth/server", () => ({
  fetchAuthSession: vi.fn(),
}));

const fetchAuthSessionMock = vi.mocked(fetchAuthSession);

function requestFor(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, "https://secondstream.test"));
}

describe("auth route protection", () => {
  it("protects private chat workspace routes", () => {
    expect(isProtectedAppPath("/chat")).toBe(true);
    expect(isProtectedAppPath("/c/thread-123")).toBe(true);
  });

  it("bypasses public landing, auth, API, and static asset routes", () => {
    expect(isAuthBypassPath("/")).toBe(true);
    expect(isAuthBypassPath("/login")).toBe(true);
    expect(isAuthBypassPath("/api/chat")).toBe(true);
    expect(isAuthBypassPath("/api/stream-canary")).toBe(true);
    expect(isAuthBypassPath("/_next/static/chunk.js")).toBe(true);
    expect(isAuthBypassPath("/assets/prairie-field-brief.pdf")).toBe(true);
    expect(isAuthBypassPath("/logo-dark.svg")).toBe(true);
    expect(isAuthBypassPath("/amplify_outputs.json")).toBe(true);
  });

  it("lets the public root render without server auth checks", async () => {
    fetchAuthSessionMock.mockResolvedValue({ tokens: undefined });
    runWithAmplifyServerContextMock.mockClear();

    const response = await proxy(requestFor("/"));

    expect(fetchAuthSessionMock).not.toHaveBeenCalled();
    expect(runWithAmplifyServerContextMock).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBeNull();
  });

  it("lets /login bypass server auth checks and server-side redirects", async () => {
    fetchAuthSessionMock.mockResolvedValue({ tokens: undefined });
    runWithAmplifyServerContextMock.mockClear();

    const response = await proxy(requestFor("/login"));

    expect(fetchAuthSessionMock).not.toHaveBeenCalled();
    expect(runWithAmplifyServerContextMock).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects unauthenticated protected routes to login with next path", async () => {
    fetchAuthSessionMock.mockResolvedValue({ tokens: undefined });
    runWithAmplifyServerContextMock.mockClear();

    const response = await proxy(requestFor("/c/thread-123"));

    expect(fetchAuthSessionMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://secondstream.test/login?next=%2Fc%2Fthread-123");
  });
});
