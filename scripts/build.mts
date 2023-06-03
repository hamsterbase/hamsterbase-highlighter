import { build } from "vite";
import {
  copyAssets,
  generateManifest,
  resolveDist,
  resolveFile,
} from "./utils.mts";
import { getRollUpConfig } from "./vite-config.mjs";

build(
  getRollUpConfig(
    resolveFile("src/hamsterbase-highlighter/content-script/main.tsx"),
    resolveDist("content-script"),
    false,
    "contentScript"
  )
);

build(
  getRollUpConfig(
    resolveFile("src/hamsterbase-highlighter/background/main.ts"),
    resolveDist("background"),
    false,
    "content"
  )
);

await copyAssets();
await generateManifest();
