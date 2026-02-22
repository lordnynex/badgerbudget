import { Elysia } from "elysia";
import type { Logger } from "../logger";

// Bun already provides performance, but for Node fallback:
import { performance } from "node:perf_hooks";

export function accessLog(log: Logger) {
  log.info("Access log middleware");

  // Use { as: 'global' } so hooks run for ALL routes including those from
  // child plugins (apiRoutes). By default, hooks are local to the plugin
  // instance, which has no routes, so they never ran.
  // Use onAfterResponse - it runs after the response is sent and is the
  // recommended hook for access logging.
  return (
    new Elysia()
      // Store start time on the request object itself (mutable)
      .on({ as: "global" }, "request", ({ request }) => {
        // @ts-ignore – we add a custom property
        (request as any)._start = performance.now();
      })
      // Runs after handler produces response
      .on({ as: "global" }, "afterHandle", ({ request, response, server }) => {
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
