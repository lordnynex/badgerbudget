const path = require("path");
const { existsSync } = require("fs");
const rootDir = path.resolve(__dirname, "..");
const appAdminSrc = path.join(rootDir, "packages/app-admin/src");
const webSrc = path.join(rootDir, "packages/web/src");

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

function resolveWithExtensions(base, rel) {
  const full = path.join(base, rel);
  for (const ext of EXTENSIONS) {
    const withExt = full + ext;
    if (existsSync(withExt)) return withExt;
  }
  return null;
}

function aliasByImporterPlugin() {
  return {
    name: "alias-by-importer",
    resolveId(source, importer) {
      if (!source.startsWith("@/") || !importer) return null;
      const rel = source.slice(2);
      const normalizedImporter = path.normalize(importer).replace(/\\/g, "/");
      if (normalizedImporter.includes("packages/app-admin")) {
        return resolveWithExtensions(appAdminSrc, rel) ?? path.join(appAdminSrc, rel);
      }
      if (normalizedImporter.includes("packages/web")) {
        return resolveWithExtensions(webSrc, rel) ?? path.join(webSrc, rel);
      }
      return null;
    },
  };
}

async function viteFinal(config) {
  const tailwindcss = (await import("@tailwindcss/vite")).default;
  config.plugins = config.plugins || [];
  config.plugins.push(aliasByImporterPlugin(), tailwindcss());
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    "@app-admin": appAdminSrc,
    "@app-admin/": appAdminSrc + "/",
    "@web": webSrc,
    "@web/": webSrc + "/",
  };
  return config;
}

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  framework: "@storybook/react-vite",
  stories: [
    "../packages/app-admin/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../packages/web/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-essentials"],
  viteFinal,
};

module.exports = config;
