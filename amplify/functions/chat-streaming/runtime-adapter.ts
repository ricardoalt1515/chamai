import { once } from "node:events";

export type LambdaFunctionUrlEvent = {
  version?: string;
  rawPath?: string;
  rawQueryString?: string;
  headers?: Record<string, string | undefined>;
  requestContext?: {
    domainName?: string;
    http?: {
      method?: string;
      path?: string;
      protocol?: string;
      sourceIp?: string;
      userAgent?: string;
    };
    requestId?: string;
  };
  body?: string | null;
  isBase64Encoded?: boolean;
};

export type LambdaResponseStream = NodeJS.WritableStream & {
  setContentType?: (contentType: string) => void;
};

type ResponseStreamMetadata = {
  statusCode?: number;
  headers?: Record<string, string>;
};

type StreamWriteTelemetry = {
  chunkIndex: number;
  byteLength: number;
  totalBytes: number;
  waitedForDrain: boolean;
};

type PipeOptions = {
  decorateResponseStream?: (
    responseStream: LambdaResponseStream,
    metadata: ResponseStreamMetadata,
  ) => LambdaResponseStream;
  onChunkWritten?: (telemetry: StreamWriteTelemetry) => void;
  // Lambda Function URL response streaming has a ~20s idle timeout: if no
  // bytes flow for that window, AWS severs the TCP connection client-side.
  // The AI SDK tool execute() (PDF render + S3 + DDB) can block the SSE
  // stream for 20-30s between events, which trips the cut. We write an SSE
  // comment line ":" every keepaliveIntervalMs to keep the pipe warm.
  // Comments are part of the SSE spec and silently ignored by EventSource
  // / @ai-sdk/react. Only applied to text/event-stream responses — other
  // content types (text/plain errors, CORS preflight) are short and don't
  // need it. Pass 0 to disable.
  keepaliveIntervalMs?: number;
};

const DEFAULT_SSE_KEEPALIVE_MS = 10_000;
const SSE_KEEPALIVE_BYTES = Buffer.from(": keepalive\n\n");

const DEFAULT_ALLOWED_HEADERS = ["authorization", "content-type", "x-request-id"];

type DrainableWritable = LambdaResponseStream & NodeJS.EventEmitter;

const writeResponseChunk = async (
  stream: LambdaResponseStream,
  chunk: Buffer | string,
): Promise<boolean> => {
  const canContinue = stream.write(chunk);
  if (canContinue === false) {
    await once(stream as DrainableWritable, "drain");
    return true;
  }
  return false;
};
const DEFAULT_ALLOWED_METHODS = ["POST", "OPTIONS"];
const DEFAULT_EXPOSED_HEADERS = ["x-error-code", "x-request-id"];

const normalizeHeaders = (headers: LambdaFunctionUrlEvent["headers"]): Headers => {
  const next = new Headers();

  for (const [name, value] of Object.entries(headers ?? {})) {
    if (value !== undefined) {
      next.set(name, value);
    }
  }

  return next;
};

const bodyBytes = (event: LambdaFunctionUrlEvent): Buffer => {
  if (!event.body) {
    return Buffer.from("");
  }

  return event.isBase64Encoded ? Buffer.from(event.body, "base64") : Buffer.from(event.body);
};

const validateJsonBody = (headers: Headers, bytes: Buffer): void => {
  const contentType = headers.get("content-type") ?? "";
  if (!contentType.includes("application/json") || bytes.length === 0) {
    return;
  }

  try {
    JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("Malformed JSON request body.");
  }
};

export const createLambdaRequest = (event: LambdaFunctionUrlEvent): Request => {
  const method = event.requestContext?.http?.method ?? "GET";
  const headers = normalizeHeaders(event.headers);
  const bytes = bodyBytes(event);
  validateJsonBody(headers, bytes);

  const host = headers.get("host") ?? event.requestContext?.domainName;
  if (!host) {
    throw new Error("Missing Function URL host.");
  }

  const path = event.rawPath ?? event.requestContext?.http?.path ?? "/";
  const query = event.rawQueryString ? `?${event.rawQueryString}` : "";
  const url = `https://${host}${path}${query}`;

  return new Request(url, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : new Uint8Array(bytes),
  });
};

export const rejectUnsupportedMethod = (_method: string): Response =>
  new Response("Method not allowed.", {
    status: 405,
    headers: {
      allow: DEFAULT_ALLOWED_METHODS.join(", "),
      "content-type": "text/plain; charset=utf-8",
    },
  });

export const isAllowedCorsOrigin = ({
  origin,
  allowedOrigins,
}: {
  origin?: string;
  allowedOrigins: string[];
}): boolean => origin === undefined || allowedOrigins.includes(origin);

export const corsResponseHeaders = (origin: string): Record<string, string> => ({
  "access-control-allow-origin": origin,
  "access-control-expose-headers": DEFAULT_EXPOSED_HEADERS.join(", "),
  vary: "origin",
});

export const buildCorsPreflightResponse = ({
  origin,
  allowedOrigins,
}: {
  origin?: string;
  allowedOrigins: string[];
}): Response => {
  const isAllowed = origin !== undefined && allowedOrigins.includes(origin);
  if (!isAllowed) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-headers": DEFAULT_ALLOWED_HEADERS.join(", "),
      "access-control-allow-methods": DEFAULT_ALLOWED_METHODS.join(", "),
      "access-control-max-age": "600",
      ...corsResponseHeaders(origin),
    },
  });
};

const responseHeaders = (response: Response): Record<string, string> => {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  if (!headers["cache-control"]) {
    headers["cache-control"] = "no-cache, no-transform";
  }

  return headers;
};

export const pipeResponseToStream = async (
  response: Response,
  responseStream: LambdaResponseStream,
  options: PipeOptions = {},
): Promise<void> => {
  const headers = responseHeaders(response);
  const stream = options.decorateResponseStream
    ? options.decorateResponseStream(responseStream, { statusCode: response.status, headers })
    : responseStream;

  if (!options.decorateResponseStream && headers["content-type"]) {
    stream.setContentType?.(headers["content-type"]);
  }

  const isSse = (headers["content-type"] ?? "").startsWith("text/event-stream");
  const keepaliveMs = isSse ? (options.keepaliveIntervalMs ?? DEFAULT_SSE_KEEPALIVE_MS) : 0;
  let keepaliveTimer: NodeJS.Timeout | undefined;
  let keepaliveWriteInFlight = false;
  if (keepaliveMs > 0) {
    keepaliveTimer = setInterval(() => {
      if (keepaliveWriteInFlight) {
        return;
      }
      keepaliveWriteInFlight = true;
      void writeResponseChunk(stream, SSE_KEEPALIVE_BYTES)
        .catch(() => {
          // stream may already be closing; nothing we can do here
        })
        .finally(() => {
          keepaliveWriteInFlight = false;
        });
    }, keepaliveMs);
  }

  let chunkIndex = 0;
  let totalBytes = 0;

  const writeBodyChunk = async (chunk: Buffer): Promise<void> => {
    const waitedForDrain = await writeResponseChunk(stream, chunk);
    chunkIndex += 1;
    totalBytes += chunk.byteLength;
    options.onChunkWritten?.({
      chunkIndex,
      byteLength: chunk.byteLength,
      totalBytes,
      waitedForDrain,
    });
  };

  try {
    const reader = response.body?.getReader();
    if (!reader) {
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > 0) {
        await writeBodyChunk(Buffer.from(bytes));
      }
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }

      if (value) {
        await writeBodyChunk(Buffer.from(value));
      }
    }
  } finally {
    if (keepaliveTimer) {
      clearInterval(keepaliveTimer);
    }
    stream.end();
  }
};
