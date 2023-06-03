import fs from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RootDir = join(__dirname, "..");

export function resolveFile(...args: string[]) {
  return resolve(RootDir, ...args);
}

const DistRoot = join(RootDir, "dist");

export function resolveDist(...args: string[]) {
  return resolve(DistRoot, ...args);
}

export async function copyAssets() {
  await fs.mkdir(resolveDist("assets"), { recursive: true });
  await fs.cp(resolveFile("src/assets"), resolveDist("assets"), {
    recursive: true,
  });
}

export async function generateManifest() {
  await fs.writeFile(
    join(DistRoot, "manifest.json"),
    JSON.stringify(
      {
        manifest_version: 3,
        name: "hamsterbase",
        version: "0.1.0",
        action: {},
        background: {
          service_worker: "./background/content.js",
          type: "module",
        },
        icons: {
          "16": "assets/hamsterbase.png",
          "32": "assets/hamsterbase.png",
          "48": "assets/hamsterbase.png",
          "128": "assets/hamsterbase.png",
        },
        content_scripts: [
          {
            type: "module",
            matches: ["<all_urls>"],
            js: ["./content-script/contentScript.js"],
            css: ["./content-script/style.css"],
          },
        ],
        permissions: ["activeTab", "pageCapture", "storage", "contextMenus"],
        optional_host_permissions: ["https://*/*", "http://*/*"],
      },
      null,
      2
    )
  );
}
