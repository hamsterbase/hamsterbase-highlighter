import { expect, it } from "vitest";
import { parseRule, ruleMatchUrl } from "./url-match";

it("test parseRule", () => {
  const result = parseRule(`
  host:https://github.com/hamsterbase/hamsterbase
  pathname: https://github.com/hamsterbase/hamsterbase
  pathname:https://www.baidu.com/s?wd=hamsterbase
  `);

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "host": "github.com",
        "protocol": "https:",
        "type": "host",
      },
      {
        "host": "github.com",
        "pathname": "/hamsterbase/hamsterbase",
        "protocol": "https:",
        "type": "pathname",
      },
      {
        "host": "www.baidu.com",
        "pathname": "/s",
        "protocol": "https:",
        "type": "pathname",
      },
    ]
  `);
});

it("test ruleMatchUrl", () => {
  const template = `
  host:http://github.com
  pathname:https://hamsterbase.com/developer/*
  pathname:https://hamsterbase.com/docs/**
  `;

  const urlList = [
    `http://github.com`,
    "https://hamsterbase.com/developer/api/error.html",
    "https://hamsterbase.com/docs/install/install-with-docker.html",
  ];

  const res = urlList.map((o) => [o, ruleMatchUrl(parseRule(template), o)]);

  expect(res).toMatchInlineSnapshot(`
    [
      [
        "http://github.com",
        true,
      ],
      [
        "https://hamsterbase.com/developer/api/error.html",
        false,
      ],
      [
        "https://hamsterbase.com/docs/install/install-with-docker.html",
        true,
      ],
    ]
  `);
});
