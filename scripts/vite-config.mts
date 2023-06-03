import react from "@vitejs/plugin-react";
import { dirname, join, resolve } from "path";
import postcssNesting from "postcss-nesting";
import { fileURLToPath } from "url";
import { UserConfigExport } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RootDir = join(__dirname, "..");

export function getRollUpConfig(
  entry: string,
  outputDir: string,
  watch: boolean,
  name: string
) {
  process.env.EXTENSION_MODE = watch ? "development" : "production";
  const commonConfig: UserConfigExport = {
    //@ts-ignore
    plugins: [react()],
    define: {
      "process.env": process.env,
    },

    css: {
      modules: {
        localsConvention: "dashes",
      },
      postcss: {
        plugins: [postcssNesting],
      },
    },
    resolve: {
      alias: {
        "@": resolve(RootDir, "src/hamsterbase-highlighter"),
        "@hamsterbase-third-party-internal": resolve(
          RootDir,
          "node_modules",
          "@hamsterbase/third-party/dist"
        ),
        vscf: resolve(RootDir, "src/vscf"),
        vs: resolve(RootDir, "src/vscf/internal"),
      },
    },
    build: {
      minify: false,
      rollupOptions: {
        output: {
          dir: outputDir,
        },
      },
      lib: {
        name,
        entry: {
          [name]: entry,
        },
        formats: ["cjs"],
      },
    },
  };
  if (watch) {
    commonConfig.build!.watch = {};
  }
  return commonConfig;
}
