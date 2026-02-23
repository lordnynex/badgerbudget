#!/usr/bin/env bun
import plugin from "bun-plugin-tailwind";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import path from "path";

const outdir = path.join(process.cwd(), "dist");
if (existsSync(outdir)) {
  await rm(outdir, { recursive: true, force: true });
}

const entrypoints = [path.join(process.cwd(), "src", "index.html")];

const isDev = process.env.BUILD_DEV === "1";
const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [plugin],
  minify: !isDev,
  target: "browser",
  sourcemap: "linked",
  publicPath: "/admin/",
  define: {
    "process.env.NODE_ENV": JSON.stringify(isDev ? "development" : "production"),
  },
});

if (!result.success) {
  console.error("Build failed:", result.logs);
  process.exit(1);
}
