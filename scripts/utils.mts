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
  const { version } = JSON.parse(
    await fs.readFile(resolveFile("package.json"), "utf-8")
  );

  await fs.writeFile(
    join(DistRoot, "manifest.json"),
    JSON.stringify(
      {
        manifest_version: 3,
        name: "Hamsterbase Highlighter",
        version,
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
            js: [
              "./content-script/style.css.js",
              "./content-script/contentScript.js",
            ],
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
