import { t } from "./trpc";
import { websiteRouter } from "./routers/website";
import { adminRouter } from "./routers/admin";

export const appRouter = t.router({
  website: websiteRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
