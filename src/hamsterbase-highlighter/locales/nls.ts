import { localize as _localize } from "vscf/nls";
import zhCN from "./zh-CN.json";

const local = navigator.language;

const locals: Record<string, string[]> = {
  "en-US": ["en-US", "en"],
  "zh-CN": ["zh-CN", "zh"],
};

type Locals = keyof typeof locals;

let finalLocal: Locals = "en-US";

Object.keys(locals).forEach((key: Locals) => {
  const alias = locals[key];
  if (alias.includes(local)) {
    finalLocal = key;
  }
});

if (finalLocal === "zh-CN") {
  (globalThis as any).i18nMessages = zhCN;
}

const messages = (globalThis as any).i18nMessages || {};

export function localize(key: string, message: string, ...args: any[]) {
  return _localize(key, messages[key] || message, ...args);
}
