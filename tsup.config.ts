import { defineConfig } from "tsup";
import { solidPlugin } from "esbuild-plugin-solid";

export default defineConfig({
  entry: ["src/tui.tsx"],
  format: "esm",
  outDir: "dist",
  clean: true,
  external: [
    "@opentui/core",
    "@opentui/solid",
    "@opencode-ai/plugin",
    "solid-js",
  ],
  esbuildPlugins: [solidPlugin()],
});
