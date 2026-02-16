import { Elysia } from "elysia";
import type { Logger } from "../logger";

const requestStartTimes = new WeakMap<Request, number>();

/**
 * HTTP access logging middleware.
 * Logs method, path, status code, duration (ms), and client IP after each response.
 * Uses onRequest for start time so logs are emitted for every request (including static).
 */
export function accessLog(log: Logger) {
  return new Elysia({ name: "access-log" })
    .onRequest(({ request }) => {
      requestStartTimes.set(request, performance.now());
    })
    .onAfterResponse(({ request, set, server }) => {
      const method = request.method;
      const path = new URL(request.url).pathname;
      const status = typeof set.status === "number" ? set.status : 200;
      const start = requestStartTimes.get(request);
      const durationMs =
        start !== undefined ? Math.round(performance.now() - start) : 0;
      const ip = server?.requestIP?.(request)?.address ?? "unknown";

      log.info(
        {
          method,
          path,
          status,
          durationMs,
          ip,
        },
        "http request"
      );
    });
}
