import { build } from "vite";
import {
  copyAssets,
  generateManifest,
  resolveDist,
  resolveFile,
} from "./utils.mts";
import { getRollUpConfig } from "./vite-config.mts";

build(
  getRollUpConfig(
    resolveFile("src/hamsterbase-highlighter/content-script/main.tsx"),
    resolveDist("content-script"),
    true,
    "contentScript"
  )
);

build(
  getRollUpConfig(
    resolveFile("src/hamsterbase-highlighter/background/main.ts"),
    resolveDist("background"),
    true,
    "content"
  )
);

await copyAssets();
await generateManifest();
