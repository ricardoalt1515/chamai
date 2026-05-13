export const dynamic = "force-dynamic";
export const maxDuration = 15;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let index = 1; index <= 5; index += 1) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ chunk: index, timestamp: new Date().toISOString() })}\n\n`,
          ),
        );
        await sleep(1000);
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "cache-control": "no-cache, no-store, must-revalidate",
      connection: "keep-alive",
      "content-type": "text/event-stream; charset=utf-8",
      pragma: "no-cache",
      "x-accel-buffering": "no",
      "x-content-type-options": "nosniff",
    },
  });
}
