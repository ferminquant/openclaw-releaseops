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

test("extractRelevantLogLines trims GitHub timestamps and command echo noise", () => {
  const excerpt = extractRelevantLogLines(
    [
      '2026-05-22T16:43:38.4358366Z ##[group]Run echo "Starting synthetic deploy"',
      '2026-05-22T16:43:38.4358981Z echo "Starting synthetic deploy"',
      '2026-05-22T16:43:38.4359801Z echo "::error title=ReleaseOps demo failure::Simulated deploy endpoint returned HTTP 503"',
      "2026-05-22T16:43:38.4393622Z ##[endgroup]",
      "2026-05-22T16:43:38.4445683Z Starting synthetic deploy",
      "2026-05-22T16:43:38.4462880Z ##[error]Simulated deploy endpoint returned HTTP 503",
      "2026-05-22T16:43:38.4469688Z Error: simulated deploy failed with exit code 1",
      "2026-05-22T16:43:38.4707233Z Post job cleanup.",
      "2026-05-22T16:43:38.5669640Z [command]/usr/bin/git version",
      "2026-05-22T16:43:38.5705758Z git version 2.54.0",
      "2026-05-22T16:43:38.5715758Z Temporarily overriding HOME='/home/runner/work/_temp/c9eb27c3-0dde-403f-af3c-0e9e77913804' before making global git config changes",
      "2026-05-22T16:43:38.5725758Z Adding repository directory to the temporary git global config as a safe directory",
      "2026-05-22T16:43:38.5735758Z http.https://github.com/.extraheader",
      "2026-05-22T16:43:38.5745758Z Cleaning up orphan processes",
      "2026-05-22T16:43:38.5755758Z ##[warning]Node.js 20 actions are deprecated. Update actions later.",
    ].join("\n"),
    { maxLines: 10 },
  );

  assert.deepEqual(excerpt, [
    "Starting synthetic deploy",
    "##[error]Simulated deploy endpoint returned HTTP 503",
    "Error: simulated deploy failed with exit code 1",
  ]);
});

test("extractRelevantLogLines redacts obvious token-shaped secrets", () => {
  const excerpt = extractRelevantLogLines(
    [
      "setup",
      "Error: deploy failed with token=github_pat_abcdefghijklmnopqrstuvwxyz1234567890",
      "Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456",
      "AWS key AKIAABCDEFGHIJKLMNOP should not leak",
    ].join("\n"),
    { maxLines: 10 },
  );

  assert.deepEqual(excerpt, [
    "setup",
    "Error: deploy failed with token=[REDACTED]",
    "Authorization: Bearer [REDACTED]",
    "AWS key [REDACTED_AWS_ACCESS_KEY] should not leak",
  ]);
});
