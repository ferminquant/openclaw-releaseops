import assert from "node:assert/strict";
import test from "node:test";

import { extractRelevantLogLines } from "../src/logs.js";

test("extractRelevantLogLines returns nearby error context", () => {
  const excerpt = extractRelevantLogLines(
    [
      "setup",
      "install dependencies",
      "build project",
      "##[error]Command failed with exit code 1",
      "npm ERR! missing script: build",
      "cleanup",
    ].join("\n"),
    { maxLines: 10 },
  );

  assert.deepEqual(excerpt, [
    "install dependencies",
    "build project",
    "##[error]Command failed with exit code 1",
    "npm ERR! missing script: build",
    "cleanup",
  ]);
});

test("extractRelevantLogLines falls back to log tail when no error pattern matches", () => {
  const excerpt = extractRelevantLogLines(["one", "two", "three", "four"].join("\n"), { maxLines: 2 });

  assert.deepEqual(excerpt, ["three", "four"]);
});

test("extractRelevantLogLines strips ansi color sequences", () => {
  const excerpt = extractRelevantLogLines("\u001b[31mError: boom\u001b[0m", { maxLines: 10 });

  assert.deepEqual(excerpt, ["Error: boom"]);
});
