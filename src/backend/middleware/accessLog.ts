import { Elysia } from "elysia";
import type { Logger } from "../logger";

// Bun already provides performance, but for Node fallback:
import { performance } from "node:perf_hooks";

export function accessLog(log: Logger) {
  log.info("Access log middleware");

  // No name needed – let Elysia generate a unique one
  return (
    new Elysia()
      // Store start time on the request object itself (mutable)
      .onRequest(({ request }) => {
        // @ts-ignore – we add a custom property
        (request as any)._start = performance.now();
      })
      // Runs **after** the handler has produced the final Response
      .onAfterHandle(({ request, response, server }) => {
        const method = request.method;
        const path = new URL(request.url).pathname;
        const status = response instanceof Response ? response.status : 200;
        const start = (request as any)._start as number | undefined;
        const durationMs = start ? Math.round(performance.now() - start) : 0;
        const ip = server?.requestIP?.(request)?.address ?? "unknown";

        log.info(
          {
            method,
            path,
            status,
            durationMs,
            ip,
          },
          "http request",
        );
      })
  );
}
