import { expect, test } from "bun:test";

import { parseInvocationRegistry } from "./invocation-registry";

const skills = ["tailrocks-one", "tailrocks-two"];

test("parses one exhaustive sorted owner per skill across both classes", () => {
  const result = parseInvocationRegistry(
    {
      $schema: "tailrocks.skill-invocation/v1",
      owners: [
        { skill: "tailrocks-one", class: "MANUAL_ONLY" },
        { skill: "tailrocks-two", class: "MODEL_POLICY" },
      ],
    },
    skills,
  );
  expect(result.errors).toEqual([]);
  expect(Object.fromEntries(result.classes)).toEqual({
    "tailrocks-one": "MANUAL_ONLY",
    "tailrocks-two": "MODEL_POLICY",
  });
});

test("rejects malformed, crossed, duplicate, unknown, missing, and unsorted owners", () => {
  const result = parseInvocationRegistry(
    {
      $schema: "wrong",
      extra: true,
      owners: [
        { skill: "tailrocks-two", class: "INVALID" },
        { skill: "tailrocks-one", class: "MANUAL_ONLY" },
        { skill: "tailrocks-one", class: "MODEL_POLICY" },
        { skill: "tailrocks-unknown", class: "MANUAL_ONLY" },
      ],
    },
    skills,
  );
  expect(result.errors).toContain("invocation-registry.json: top-level keys must be $schema and owners");
  expect(result.errors).toContain("invocation-registry.json: schema must be tailrocks.skill-invocation/v1");
  expect(result.errors).toContain("invocation-registry.json: owners must be sorted by skill");
  expect(result.errors).toContain("invocation-registry.json: duplicate owner tailrocks-one");
  expect(result.errors).toContain("invocation-registry.json: unknown owner tailrocks-unknown");
  expect(result.errors).toContain("invocation-registry.json: missing owner tailrocks-two");
});
