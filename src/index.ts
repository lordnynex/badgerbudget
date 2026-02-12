import { serve } from "bun";
import { join } from "path";
import { handleApiRequest } from "./server/handler";

const projectRoot = join(import.meta.dir, "..");
const distDir = join(projectRoot, "dist");

async function serveStatic(pathname: string): Promise<Response | null> {
  if (pathname === "/") pathname = "/index.html";
  const filePath = join(distDir, pathname.replace(/^\//, ""));
  const file = Bun.file(filePath);
  if (!(await file.exists())) return null;

  const ext = pathname.split(".").pop() ?? "";
  const types: Record<string, string> = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    json: "application/json",
    svg: "image/svg+xml",
    ico: "image/x-icon",
  };

  return new Response(file, {
    headers: { "Content-Type": types[ext] ?? "application/octet-stream" },
  });
}

const server = serve({
  async fetch(req) {
    const apiResponse = await handleApiRequest(req);
    if (apiResponse) return apiResponse;

    const url = new URL(req.url);
    if (url.pathname === "/data/export.json") {
      const file = Bun.file(join(projectRoot, "data/export.json"));
      return new Response(file, {
        headers: { "Content-Type": "application/json" },
      });
    }

    const staticResponse = await serveStatic(url.pathname);
    if (staticResponse) return staticResponse;

    // SPA fallback: serve index.html for client-side routes
    const index = Bun.file(join(distDir, "index.html"));
    if (await index.exists()) {
      return new Response(index, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Build required. Run: bun run build", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  },
});

console.log(`🚀 Server running at ${server.url}`);
