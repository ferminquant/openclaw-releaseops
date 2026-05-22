import assert from "node:assert/strict";
import test from "node:test";

import { formatFailedDeploySummary } from "../src/format.js";

test("formatFailedDeploySummary leads with a concise triage summary", () => {
  const output = formatFailedDeploySummary({
    repo: "ferminquant/releaseops-demo-failing-actions",
    workflowName: "ReleaseOps Demo Deploy",
    runHtmlUrl: "https://github.com/ferminquant/releaseops-demo-failing-actions/actions/runs/1",
    conclusion: "failure",
    branch: "main",
    startedAt: "2026-05-22T16:43:32Z",
    failedJobs: [
      {
        name: "deploy-demo-service",
        status: "completed",
        conclusion: "failure",
        failedSteps: [{ name: "Deploy to demo environment", conclusion: "failure" }],
        logExcerpt: ["##[error]Simulated deploy endpoint returned HTTP 503"],
      },
    ],
    likelyCause:
      'The run first failed in step "Deploy to demo environment". The clearest log signal is: "Simulated deploy endpoint returned HTTP 503".',
    nextChecks: ["Check deploy target health."],
    rollbackChecklist: ["Confirm the last known good release."],
  });

  assert.match(output, /^# ReleaseOps Failed Deploy Triage/);
  assert.match(output, /Likely cause: The run first failed/);
  assert.match(output, /First failed job: deploy-demo-service/);
  assert.match(output, /First failed step: Deploy to demo environment/);
  assert.match(output, /## Run Details/);
});
