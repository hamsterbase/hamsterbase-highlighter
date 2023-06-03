import { minimatch } from "minimatch";

export type ParsedRule =
  | {
      type: "host";
      host: string;
      protocol: string;
    }
  | {
      type: "pathname";
      host: string;
      protocol: string;
      pathname: string;
    };

export function parseRule(rules: string) {
  const parsedRules = rules.split("\n").map((_rule) => {
    const rule = _rule.trim();
    if (rule.startsWith("host:")) {
      try {
        const { host, protocol } = new URL(rule.slice(5).trim());
        return {
          type: "host",
          host,
          protocol,
        };
      } catch (error) {
        return null;
      }
    }
    if (rule.startsWith("pathname:")) {
      try {
        const { host, protocol, pathname } = new URL(rule.slice(9).trim());
        return {
          type: "pathname",
          host,
          protocol,
          pathname,
        };
      } catch (error) {
        return null;
      }
    }
    return null;
  });
  return parsedRules.filter((o) => !!o) as ParsedRule[];
}

export function ruleMatchUrl(rules: ParsedRule[], url: string) {
  const parsedUrl = new URL(url);
  for (const rule of rules) {
    if (rule.type === "host") {
      if (parsedUrl.protocol == rule.protocol && parsedUrl.host == rule.host) {
        return true;
      }
    }
    if (rule.type === "pathname") {
      if (parsedUrl.protocol == rule.protocol && parsedUrl.host == rule.host) {
        if (minimatch(parsedUrl.pathname, rule.pathname)) return true;
      }
    }
  }
  return false;
}
