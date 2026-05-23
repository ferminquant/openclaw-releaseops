import assert from "node:assert/strict";
import test from "node:test";

import { summarizeFailedDeploy } from "../src/github-actions.js";

test("summarizeFailedDeploy finds the latest failed run and enriches failed jobs", async () => {
  const fetchImpl = createMockFetch({
    "/repos/octo/widget/actions/workflows/deploy.yml/runs?per_page=10&status=failure&branch=main": [
      jsonResponse({
        workflow_runs: [
          {
            id: 123,
            workflow_id: 456,
            name: "Deploy",
            html_url: "https://github.com/octo/widget/actions/runs/123",
            conclusion: "failure",
            head_branch: "main",
            run_started_at: "2026-05-21T12:00:00Z",
          },
        ],
      }),
    ],
    "/repos/octo/widget/actions/runs/123/jobs?per_page=100&page=1": [
      jsonResponse({
        jobs: [
          {
            id: 201,
            name: "deploy-production",
            status: "completed",
            conclusion: "failure",
            steps: [
              { number: 1, name: "Checkout", status: "completed", conclusion: "success" },
              {
                number: 2,
                name: "Deploy",
                status: "completed",
                conclusion: "failure",
                started_at: "2026-05-21T12:03:00Z",
                completed_at: "2026-05-21T12:04:00Z",
                raw_api_field: "ignored",
              },
            ],
          },
          {
            id: 202,
            name: "notify",
            status: "completed",
            conclusion: "success",
            steps: [{ number: 1, name: "Notify", status: "completed", conclusion: "success" }],
          },
        ],
      }),
    ],
    "/repos/octo/widget/actions/jobs/201/logs": [
      textResponse(
        [
          "Run deploy",
          "Authenticating",
          "Error: permission denied for production environment",
          "Deployment failed with exit code 1",
        ].join("\n"),
      ),
    ],
  });

  const summary = await summarizeFailedDeploy({
    params: {
      repo: " octo/widget ",
      workflow: "deploy.yml",
      branch: "main",
      logLines: 12,
    },
    config: {
      runbookPath: "./runbooks/rollback.md",
    },
    env: {
      GITHUB_TOKEN: "fake-token",
    },
    fetchImpl,
  });

  assert.equal(summary.repo, "octo/widget");
  assert.equal(summary.workflowId, 456);
  assert.equal(summary.workflowName, "Deploy");
  assert.equal(summary.runId, 123);
  assert.equal(summary.runHtmlUrl, "https://github.com/octo/widget/actions/runs/123");
  assert.equal(summary.conclusion, "failure");
  assert.equal(summary.branch, "main");
  assert.equal(summary.startedAt, "2026-05-21T12:00:00Z");
  assert.deepEqual(summary.failedJobs, [
    {
      id: 201,
      name: "deploy-production",
      status: "completed",
      conclusion: "failure",
      failedSteps: [
        {
          number: 2,
          name: "Deploy",
          status: "completed",
          conclusion: "failure",
          startedAt: "2026-05-21T12:03:00Z",
          completedAt: "2026-05-21T12:04:00Z",
        },
      ],
      logExcerpt: [
        "Run deploy",
        "Authenticating",
        "Error: permission denied for production environment",
        "Deployment failed with exit code 1",
      ],
    },
  ]);
  assert.match(summary.likelyCause, /Deploy/);
  assert.match(summary.likelyCause, /permission denied/);
  assert.ok(summary.nextChecks.some((check) => check.includes("permission or auth error")));
  assert.equal(summary.rollbackChecklist[0], "Review configured rollback runbook: ./runbooks/rollback.md");

  assert.deepEqual(
    fetchImpl.calls.map((call) => call.path),
    [
      "/repos/octo/widget/actions/workflows/deploy.yml/runs?per_page=10&status=failure&branch=main",
      "/repos/octo/widget/actions/runs/123/jobs?per_page=100&page=1",
      "/repos/octo/widget/actions/jobs/201/logs",
    ],
  );
  for (const call of fetchImpl.calls) {
    assert.equal(call.options.headers.Authorization, "Bearer fake-token");
  }
  assert.equal(fetchImpl.calls[2].options.headers.Accept, "text/plain, application/vnd.github+json");
  fetchImpl.assertConsumed();
});

test("summarizeFailedDeploy summarizes multiple failed jobs in one run", async () => {
  const fetchImpl = createMockFetch({
    "/repos/octo/widget/actions/runs/4242": [
      jsonResponse({
        id: 4242,
        workflow_id: 456,
        name: "Deploy",
        html_url: "https://github.com/octo/widget/actions/runs/4242",
        conclusion: "failure",
        head_branch: "main",
        run_started_at: "2026-05-22T18:00:00Z",
      }),
    ],
    "/repos/octo/widget/actions/runs/4242/jobs?per_page=100&page=1": [
      jsonResponse({
        jobs: [
          {
            id: 401,
            name: "deploy (api)",
            status: "completed",
            conclusion: "failure",
            steps: [
              { number: 1, name: "Checkout", status: "completed", conclusion: "success" },
              { number: 2, name: "Deploy api", status: "completed", conclusion: "failure" },
            ],
          },
          {
            id: 402,
            name: "deploy (worker)",
            status: "completed",
            conclusion: "failure",
            steps: [
              { number: 1, name: "Build worker", status: "completed", conclusion: "success" },
              { number: 2, name: "Smoke test worker", status: "completed", conclusion: "failure" },
            ],
          },
          {
            id: 403,
            name: "notify",
            status: "completed",
            conclusion: "success",
            steps: [{ number: 1, name: "Notify", status: "completed", conclusion: "success" }],
          },
        ],
      }),
    ],
    "/repos/octo/widget/actions/jobs/401/logs": [
      textResponse(
        [
          "Preparing api deploy",
          "Deploying api image",
          "##[error]HTTP 503 service unavailable from demo target",
          "Error: deploy failed with exit code 1",
        ].join("\n"),
      ),
    ],
    "/repos/octo/widget/actions/jobs/402/logs": [
      textResponse(
        [
          "Preparing worker deploy",
          "Waiting for queue drain",
          "Error: timeout waiting for queue drain",
          "Run finished with failure",
        ].join("\n"),
      ),
    ],
  });

  const summary = await summarizeFailedDeploy({
    params: { repo: "octo/widget", runId: 4242, logLines: 20 },
    config: {},
    env: {},
    fetchImpl,
  });

  assert.equal(summary.failedJobs.length, 2);
  assert.deepEqual(
    summary.failedJobs.map((job) => job.name),
    ["deploy (api)", "deploy (worker)"],
  );
  assert.deepEqual(summary.failedJobs[0].failedSteps, [
    { number: 2, name: "Deploy api", status: "completed", conclusion: "failure" },
  ]);
  assert.deepEqual(summary.failedJobs[1].failedSteps, [
    { number: 2, name: "Smoke test worker", status: "completed", conclusion: "failure" },
  ]);
  assert.ok(summary.failedJobs[0].logExcerpt.includes("##[error]HTTP 503 service unavailable from demo target"));
  assert.ok(summary.failedJobs[1].logExcerpt.includes("Error: timeout waiting for queue drain"));
  assert.match(summary.likelyCause, /Deploy api/);
  assert.match(summary.likelyCause, /HTTP 503 service unavailable/);
  assert.ok(summary.nextChecks.some((check) => check.includes("5xx or service-unavailable")));
  assert.ok(summary.nextChecks.some((check) => check.includes("timeout appears")));
  assert.deepEqual(
    fetchImpl.calls.map((call) => call.path),
    [
      "/repos/octo/widget/actions/runs/4242",
      "/repos/octo/widget/actions/runs/4242/jobs?per_page=100&page=1",
      "/repos/octo/widget/actions/jobs/401/logs",
      "/repos/octo/widget/actions/jobs/402/logs",
    ],
  );
  fetchImpl.assertConsumed();
});

test("summarizeFailedDeploy uses an explicit run id and can skip log excerpts", async () => {
  const fetchImpl = createMockFetch({
    "/repos/octo/widget/actions/runs/789": [
      jsonResponse({
        id: 789,
        workflow_id: 456,
        name: "Deploy",
        html_url: "https://github.com/octo/widget/actions/runs/789",
        conclusion: "timed_out",
        head_branch: "release",
        created_at: "2026-05-21T13:00:00Z",
      }),
    ],
    "/repos/octo/widget/actions/runs/789/jobs?per_page=100&page=1": [
      jsonResponse({
        jobs: [
          {
            id: 301,
            name: "deploy-production",
            status: "completed",
            conclusion: "timed_out",
            steps: [{ number: 4, name: "Smoke test", status: "completed", conclusion: "timed_out" }],
          },
        ],
      }),
    ],
  });

  const summary = await summarizeFailedDeploy({
    params: {
      repo: "octo/widget",
      runId: "789",
      includeLogExcerpt: false,
    },
    config: {},
    env: {},
    fetchImpl,
  });

  assert.equal(summary.runId, 789);
  assert.equal(summary.startedAt, "2026-05-21T13:00:00Z");
  assert.deepEqual(summary.failedJobs, [
    {
      id: 301,
      name: "deploy-production",
      status: "completed",
      conclusion: "timed_out",
      failedSteps: [{ number: 4, name: "Smoke test", status: "completed", conclusion: "timed_out" }],
      logExcerpt: [],
    },
  ]);
  assert.deepEqual(
    fetchImpl.calls.map((call) => call.path),
    [
      "/repos/octo/widget/actions/runs/789",
      "/repos/octo/widget/actions/runs/789/jobs?per_page=100&page=1",
    ],
  );
  fetchImpl.assertConsumed();
});

test("summarizeFailedDeploy paginates jobs and tolerates missing steps", async () => {
  const firstPageJobs = Array.from({ length: 100 }, (_, index) => ({
    id: 1000 + index,
    name: `successful-job-${index}`,
    status: "completed",
    conclusion: "success",
  }));

  const fetchImpl = createMockFetch({
    "/repos/octo/widget/actions/runs/123": [
      jsonResponse({
        id: 123,
        workflow_id: 456,
        name: "Deploy",
        html_url: "https://github.com/octo/widget/actions/runs/123",
        conclusion: "failure",
        head_branch: "main",
      }),
    ],
    "/repos/octo/widget/actions/runs/123/jobs?per_page=100&page=1": [jsonResponse({ jobs: firstPageJobs })],
    "/repos/octo/widget/actions/runs/123/jobs?per_page=100&page=2": [
      jsonResponse({
        jobs: [
          {
            id: 5000,
            name: "late-failing-job",
            status: "completed",
            conclusion: "failure",
          },
        ],
      }),
    ],
    "/repos/octo/widget/actions/jobs/5000/logs": [textResponse("runner setup\nprocess failed\ncleanup")],
  });

  const summary = await summarizeFailedDeploy({
    params: { repo: "octo/widget", runId: 123 },
    config: {},
    env: {},
    fetchImpl,
  });

  assert.equal(summary.failedJobs.length, 1);
  assert.deepEqual(summary.failedJobs[0].failedSteps, []);
  assert.deepEqual(summary.failedJobs[0].logExcerpt, ["runner setup", "process failed", "cleanup"]);
  assert.match(summary.likelyCause, /late-failing-job/);
  assert.deepEqual(
    fetchImpl.calls.map((call) => call.path),
    [
      "/repos/octo/widget/actions/runs/123",
      "/repos/octo/widget/actions/runs/123/jobs?per_page=100&page=1",
      "/repos/octo/widget/actions/runs/123/jobs?per_page=100&page=2",
      "/repos/octo/widget/actions/jobs/5000/logs",
    ],
  );
  fetchImpl.assertConsumed();
});

test("summarizeFailedDeploy reports when no failed runs match", async () => {
  const fetchImpl = createMockFetch({
    "/repos/octo/widget/actions/runs?per_page=10&status=failure": [jsonResponse({ workflow_runs: [] })],
  });

  await assert.rejects(
    summarizeFailedDeploy({
      params: { repo: "octo/widget" },
      config: {},
      env: {},
      fetchImpl,
    }),
    /No failed GitHub Actions runs found/,
  );
  fetchImpl.assertConsumed();
});

test("summarizeFailedDeploy includes GitHub response details on API failures", async () => {
  const fetchImpl = createMockFetch({
    "/repos/octo/widget/actions/runs/123": [
      textResponse('{"message":"Bad credentials","documentation_url":"https://docs.github.com/rest"}', {
        status: 401,
        statusText: "Unauthorized",
      }),
    ],
  });

  await assert.rejects(
    summarizeFailedDeploy({
      params: { repo: "octo/widget", runId: 123 },
      config: {},
      env: {},
      fetchImpl,
    }),
    /GitHub API request failed \(401 Unauthorized\): .*Bad credentials/,
  );
  fetchImpl.assertConsumed();
});

test("summarizeFailedDeploy does not treat embedded 403 substrings as auth errors", async () => {
  const fetchImpl = createMockFetch({
    "/repos/octo/widget/actions/runs/123": [
      jsonResponse({
        id: 123,
        workflow_id: 456,
        name: "Deploy",
        html_url: "https://github.com/octo/widget/actions/runs/123",
        conclusion: "failure",
        head_branch: "main",
      }),
    ],
    "/repos/octo/widget/actions/runs/123/jobs?per_page=100&page=1": [
      jsonResponse({
        jobs: [
          {
            id: 201,
            name: "deploy",
            status: "completed",
            conclusion: "failure",
            steps: [{ number: 1, name: "Deploy", status: "completed", conclusion: "failure" }],
          },
        ],
      }),
    ],
    "/repos/octo/widget/actions/jobs/201/logs": [
      textResponse(
        [
          "Starting deploy",
          "Error: deploy endpoint returned HTTP 503",
          "Temp path c9eb27c3-0dde-403f-af3c-0e9e77913804",
        ].join("\n"),
      ),
    ],
  });

  const summary = await summarizeFailedDeploy({
    params: { repo: "octo/widget", runId: 123 },
    config: {},
    env: {},
    fetchImpl,
  });

  assert.ok(!summary.nextChecks.some((check) => check.includes("permission or auth error")));
  assert.ok(summary.nextChecks.some((check) => check.includes("5xx or service-unavailable")));
});

test("summarizeFailedDeploy defaults missing config and env to empty objects", async () => {
  await assert.rejects(
    summarizeFailedDeploy({
      params: {},
      fetchImpl: async () => {
        throw new Error("fetch should not be called without a repo");
      },
    }),
    /Missing repo/,
  );
});

function createMockFetch(routes) {
  const queues = new Map(Object.entries(routes));

  async function fetchImpl(url, options = {}) {
    const parsedUrl = new URL(url);
    const path = `${parsedUrl.pathname}${parsedUrl.search}`;
    const queue = queues.get(path);
    if (!queue || queue.length === 0) {
      throw new Error(`Unexpected GitHub API request: ${path}`);
    }

    fetchImpl.calls.push({ path, options });
    return queue.shift();
  }

  fetchImpl.calls = [];
  fetchImpl.assertConsumed = () => {
    const unused = [...queues.entries()].flatMap(([path, queue]) => queue.map(() => path));
    assert.deepEqual(unused, []);
  };

  return fetchImpl;
}

function jsonResponse(body, options = {}) {
  return new MockResponse({ body, ...options });
}

function textResponse(body, options = {}) {
  return new MockResponse({ body, ...options });
}

class MockResponse {
  constructor({ body, status = 200, statusText = "OK" }) {
    this.body = body;
    this.status = status;
    this.statusText = statusText;
    this.ok = status >= 200 && status < 300;
  }

  async json() {
    if (typeof this.body === "string") {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  async text() {
    if (typeof this.body === "string") {
      return this.body;
    }
    return JSON.stringify(this.body);
  }
}
