import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

function createDest(): pino.DestinationStream {
  if (!isDev) return pino.destination(1);
  try {
    const pretty = require("pino-pretty");
    return pretty({ colorize: true, sync: true });
  } catch {
    return pino.destination({ dest: 1, minLength: 0 });
  }
}

/**
 * Shared Pino logger. In development uses pino-pretty for readable output;
 * in production logs JSON to stdout.
 */
const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  },
  createDest()
);

export type Logger = pino.Logger;
export { logger };
