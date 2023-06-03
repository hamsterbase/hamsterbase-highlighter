import fs from "fs/promises";
import { globby } from "globby";
import path from "path";
import * as parser from "@babel/parser";
import * as babelTraverse from "@babel/traverse";
import * as types from "@babel/types";
import { resolveFile } from "./utils.mjs";

async function getMessages(filePath: string) {
  const content = await fs.readFile(filePath, "utf8");
  const plugins: parser.ParserPlugin[] = ["typescript", "decorators-legacy"];
  if (filePath.endsWith("tsx")) {
    plugins.push("jsx");
  }
  const ast = parser.parse(content, {
    plugins: plugins,
    sourceType: "module",
  });
  const result: [string, string][] = [];
  (babelTraverse.default as any).default(ast, {
    enter(path: any) {
      const node = path.node;
      if (types.isCallExpression(node)) {
        const callee = node.callee;
        if (types.isIdentifier(callee) && callee.name === "localize") {
          const args = node.arguments.map((o) => {
            if (types.isStringLiteral(o)) {
              return o.value;
            }
          });
          const [key, message] = args as [string, string];
          result.push([key, message]);
        }
      }
    },
  });
  return result;
}

async function format() {
  const codeRoot = resolveFile("src/hamsterbase-highlighter");
  const sourceCode = await globby(["**/**.ts", "**/**.tsx"], {
    absolute: true,
    cwd: codeRoot,
  });
  const localsPath = resolveFile("src/hamsterbase-highlighter/locales");
  const files = (await fs.readdir(localsPath)).filter(
    (p) => p !== "reference.json"
  );
  const enUSMessages: Record<string, string> = {};
  for (const iterator of sourceCode) {
    const messages = await getMessages(iterator);
    messages.forEach(([key, message]) => {
      if (enUSMessages[key]) {
        if (enUSMessages[key] !== message) {
          throw new Error(key);
        }
      } else {
        enUSMessages[key] = message;
      }
    });
  }

  const sortedKeys = Object.keys(enUSMessages).sort((a, b) =>
    a.localeCompare(b)
  );

  const unTranslatedKeys: Record<string, string[]> = {};
  const reference: Record<string, string> = {};

  const referenceJSON = JSON.parse(
    await fs.readFile(path.resolve(localsPath, "reference.json"), "utf-8")
  );

  let counter = 0;

  files
    .filter((file) => path.extname(file) === ".json")
    .filter((file) => file !== "en-US.json")
    .map((file) => path.resolve(localsPath, file))
    .forEach(async (file) => {
      const messages = JSON.parse(await fs.readFile(file, "utf-8"));
      const result: Record<string, string> = {};
      sortedKeys.forEach((key) => {
        if (!messages[key] && counter < 100) {
          counter++;
          const keyList = unTranslatedKeys[path.basename(file)] ?? [];
          keyList.push(key);
          unTranslatedKeys[path.basename(file)] = keyList;
          reference[key] = enUSMessages[key];
        }
        result[key] =
          referenceJSON[path.basename(file)]?.[key] ?? (messages[key] || "");
      });
      await fs.writeFile(file, JSON.stringify(result, null, 2));
    });

  const sortedData: Record<string, string> = {};
  sortedKeys.forEach((key) => {
    sortedData[key] = enUSMessages[key];
  });

  await fs.writeFile(
    path.resolve(localsPath, "en-US.json"),
    JSON.stringify(sortedData, null, 2)
  );
  await fs.writeFile(
    path.resolve(localsPath, "reference.json"),
    JSON.stringify({}, null, 2)
  );
  console.log("帮我把下面的 key 翻译一下吧");
  console.log(unTranslatedKeys);
  console.log("可以参考下面的英文");
  console.log(reference);
  console.log('返回格式为: { "language.json": { "key": "message" }}');
}

format();
