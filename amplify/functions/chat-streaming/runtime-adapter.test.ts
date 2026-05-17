import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import {
  buildCorsPreflightResponse,
  createLambdaRequest,
  type LambdaFunctionUrlEvent,
  type LambdaResponseStream,
  pipeResponseToStream,
  rejectUnsupportedMethod,
} from "./runtime-adapter";

const baseEvent = (overrides: Partial<LambdaFunctionUrlEvent> = {}): LambdaFunctionUrlEvent => ({
  version: "2.0",
  rawPath: "/",
  rawQueryString: "thread=abc",
  headers: {
    "content-type": "application/json",
    host: "chat.lambda-url.us-east-1.on.aws",
    authorization: "Bearer token",
  },
  requestContext: {
    domainName: "chat.lambda-url.us-east-1.on.aws",
    http: {
      method: "POST",
      path: "/",
      protocol: "HTTP/1.1",
      sourceIp: "127.0.0.1",
      userAgent: "vitest",
    },
    requestId: "request-1",
  },
  body: JSON.stringify({ threadId: "thread-1" }),
  isBase64Encoded: false,
  ...overrides,
});

type TestResponseStream = LambdaResponseStream & {
  chunks: Buffer[];
  ended: boolean;
  metadata?: { statusCode?: number; headers?: Record<string, string> };
};

type TestResponseStreamShape = {
  chunks: Buffer[];
  ended: boolean;
  metadata?: { statusCode?: number; headers?: Record<string, string> };
  write(chunk: Buffer | string): boolean;
  end(): void;
  setContentType(contentType: string): void;
};

const createResponseStream = (): TestResponseStream => {
  const stream: TestResponseStreamShape = {
    chunks: [] as Buffer[],
    ended: false,
    write(chunk: Buffer | string) {
      this.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    },
    end() {
      this.ended = true;
    },
    setContentType(contentType: string) {
      this.metadata = {
        ...(this.metadata ?? {}),
        headers: { ...(this.metadata?.headers ?? {}), "content-type": contentType },
      };
    },
  };

  return stream as TestResponseStream;
};

describe("Lambda Function URL runtime adapter", () => {
  it("creates a web Request from a plain POST Function URL event", async () => {
    const request = createLambdaRequest(baseEvent());

    expect(request.method).toBe("POST");
    expect(request.url).toBe("https://chat.lambda-url.us-east-1.on.aws/?thread=abc");
    expect(request.headers.get("content-type")).toBe("application/json");
    expect(request.headers.get("authorization")).toBe("Bearer token");
    await expect(request.json()).resolves.toEqual({ threadId: "thread-1" });
  });

  it("decodes base64 POST bodies before creating a web Request", async () => {
    const payload = { threadId: "thread-base64", messages: [{ role: "user" }] };
    const request = createLambdaRequest(
      baseEvent({
        body: Buffer.from(JSON.stringify(payload)).toString("base64"),
        isBase64Encoded: true,
      }),
    );

    await expect(request.json()).resolves.toEqual(payload);
  });

  it("rejects malformed JSON before chat execution", () => {
    expect(() => createLambdaRequest(baseEvent({ body: "{not-json" }))).toThrow(
      "Malformed JSON request body.",
    );
  });

  it("returns a method rejection response for unsupported methods", async () => {
    const response = rejectUnsupportedMethod("GET");

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST, OPTIONS");
    await expect(response.text()).resolves.toBe("Method not allowed.");
  });

  it("builds a CORS preflight response for approved origins", () => {
    const response = buildCorsPreflightResponse({
      origin: "https://main.d22icjbzj7x471.amplifyapp.com",
      allowedOrigins: ["https://main.d22icjbzj7x471.amplifyapp.com"],
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://main.d22icjbzj7x471.amplifyapp.com",
    );
    expect(response.headers.get("access-control-allow-methods")).toBe("POST, OPTIONS");
    expect(response.headers.get("access-control-allow-headers")).toContain("authorization");
  });

  it("does not echo unapproved CORS origins", () => {
    const response = buildCorsPreflightResponse({
      origin: "https://evil.example",
      allowedOrigins: ["https://main.d22icjbzj7x471.amplifyapp.com"],
    });

    expect(response.status).toBe(403);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("pipes a streaming web Response body progressively to Lambda responseStream", async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("first"));
        controller.enqueue(new TextEncoder().encode("second"));
        controller.close();
      },
    });
    const response = new Response(source, {
      status: 202,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
    const responseStream = createResponseStream();
    const decorate = vi.fn((stream, metadata) => {
      responseStream.metadata = metadata;
      return stream;
    });

    await pipeResponseToStream(response, responseStream, { decorateResponseStream: decorate });

    expect(decorate).toHaveBeenCalledWith(responseStream, {
      statusCode: 202,
      headers: expect.objectContaining({
        "cache-control": "no-cache, no-transform",
        "content-type": "text/plain; charset=utf-8",
      }),
    });
    expect(responseStream.chunks.map((chunk) => chunk.toString())).toEqual(["first", "second"]);
    expect(responseStream.metadata?.headers?.["content-type"]).toBe("text/plain; charset=utf-8");
    expect(responseStream.ended).toBe(true);
  });

  it("does not override the Lambda HTTP response stream metadata content type", async () => {
    const response = new Response("created", {
      status: 201,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
    const responseStream = createResponseStream();
    const decoratedStream = createResponseStream();
    const decorate = vi.fn((_stream, metadata) => {
      responseStream.metadata = metadata;
      return decoratedStream;
    });

    await pipeResponseToStream(response, responseStream, { decorateResponseStream: decorate });

    expect(responseStream.metadata?.headers?.["content-type"]).toBe("text/plain; charset=utf-8");
    expect(decoratedStream.metadata?.headers?.["content-type"]).toBeUndefined();
    expect(Buffer.concat(decoratedStream.chunks).toString()).toBe("created");
    expect(decoratedStream.ended).toBe(true);
  });

  it("falls back to arrayBuffer for null-body responses", async () => {
    const response = new Response("created", {
      status: 201,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
    const responseStream = createResponseStream();

    await pipeResponseToStream(response, responseStream, {
      decorateResponseStream: (stream, metadata) => {
        responseStream.metadata = metadata;
        return stream;
      },
    });

    expect(Buffer.concat(responseStream.chunks).toString()).toBe("created");
    expect(responseStream.ended).toBe(true);
  });

  it("emits SSE keepalive comments during idle gaps for text/event-stream responses", async () => {
    let releaseSecondChunk!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseSecondChunk = resolve;
    });
    const source = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode("data: first\n\n"));
        await gate;
        controller.enqueue(new TextEncoder().encode("data: second\n\n"));
        controller.close();
      },
    });
    const response = new Response(source, {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
    const responseStream = createResponseStream();

    const pipe = pipeResponseToStream(response, responseStream, {
      keepaliveIntervalMs: 5,
    });
    await new Promise((r) => setTimeout(r, 40));
    releaseSecondChunk();
    await pipe;

    const written = responseStream.chunks.map((c) => c.toString()).join("");
    expect(written).toContain("data: first\n\n");
    expect(written).toContain(": keepalive\n\n");
    expect(written).toContain("data: second\n\n");
    expect(responseStream.ended).toBe(true);
  });

  it("waits for Lambda responseStream drain before writing more body chunks", async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("first"));
        controller.enqueue(new TextEncoder().encode("second"));
        controller.close();
      },
    });
    const response = new Response(source, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
    const emitter = new EventEmitter();
    let writeCount = 0;
    const chunks: Buffer[] = [];
    const responseStream = Object.assign(emitter, {
      chunks,
      ended: false,
      write(chunk: Buffer | string) {
        writeCount += 1;
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return writeCount !== 1;
      },
      end() {
        this.ended = true;
      },
      setContentType() {},
    }) as unknown as LambdaResponseStream & { chunks: Buffer[]; ended: boolean };

    const pipe = pipeResponseToStream(response, responseStream);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(responseStream.chunks.map((chunk) => chunk.toString())).toEqual(["first"]);
    expect(responseStream.ended).toBe(false);

    emitter.emit("drain");
    await pipe;

    expect(responseStream.chunks.map((chunk) => chunk.toString())).toEqual(["first", "second"]);
    expect(responseStream.ended).toBe(true);
  });

  it("does not emit keepalive comments for non-SSE responses", async () => {
    const source = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode("first"));
        await new Promise((r) => setTimeout(r, 30));
        controller.enqueue(new TextEncoder().encode("second"));
        controller.close();
      },
    });
    const response = new Response(source, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
    const responseStream = createResponseStream();

    await pipeResponseToStream(response, responseStream, { keepaliveIntervalMs: 5 });

    const written = responseStream.chunks.map((c) => c.toString()).join("");
    expect(written).not.toContain(": keepalive");
    expect(written).toBe("firstsecond");
  });

  it("ends the Lambda responseStream when source stream reading fails", async () => {
    const response = new Response(
      new ReadableStream<Uint8Array>({
        pull() {
          throw new Error("reader failed");
        },
      }),
    );
    const responseStream = createResponseStream();

    await expect(pipeResponseToStream(response, responseStream)).rejects.toThrow("reader failed");
    expect(responseStream.ended).toBe(true);
  });
});
