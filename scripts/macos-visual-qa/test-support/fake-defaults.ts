#!/usr/bin/env bun
import { rename } from "node:fs/promises";

const file = process.env.TAILROCKS_FAKE_DEFAULTS;
if (!file) process.exit(2);
const values = JSON.parse(await Bun.file(file).text()) as Record<string, string>;
const [command, rawDomain, key, type, rawValue] = Bun.argv.slice(2);
const domain = rawDomain === "-g" ? "NSGlobalDomain" : rawDomain;
const identity = `${domain}|${key}`;
if (command === "read") {
  if (!(identity in values)) process.exit(1);
  console.log(values[identity]);
} else if (command === "write" && ["-bool", "-string"].includes(type ?? "")) {
  const next =
    type === "-bool" ? (rawValue === "true" ? "1" : rawValue === "false" ? "0" : "invalid") : rawValue!;
  if (next === "invalid") process.exit(2);
  const failOnce = process.env.TAILROCKS_FAKE_FAIL_ONCE;
  const failureMarker = `${file}.failed-once`;
  if (failOnce === `${identity}|${next}` && !(await Bun.file(failureMarker).exists())) {
    await Bun.write(failureMarker, "failed");
    process.exit(1);
  }
  values[identity] = next;
  const temporary = `${file}.${process.pid}`;
  await Bun.write(temporary, JSON.stringify(values));
  await rename(temporary, file);
} else if (command === "delete") {
  if (!(identity in values)) process.exit(1);
  delete values[identity];
  const temporary = `${file}.${process.pid}`;
  await Bun.write(temporary, JSON.stringify(values));
  await rename(temporary, file);
} else process.exit(2);
