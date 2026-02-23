import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Api } from "../services/api";

export type ContextOptions = {
  api: Api;
};

/**
 * Creates a per-request context for tRPC procedures.
 * Pass api (and later session) from the server entry so procedures can use ctx.api.
 * Auth: session is a placeholder; protected procedures will later check ctx.session.
 */
export function createContextFn(options: ContextOptions) {
  const { api } = options;
  return function createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
    return {
      req,
      resHeaders,
      api,
      /** Placeholder for auth; protected procedures will later check this. */
      session: null as { userId: string } | null,
    };
  };
}

export type Context = {
  req: Request;
  resHeaders: Headers;
  api: Api;
  session: { userId: string } | null;
};
