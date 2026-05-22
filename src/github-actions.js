import { extractRelevantLogLines } from "./logs.js";

const GITHUB_API = "https://api.github.com";

export async function summarizeFailedDeploy({ params = {}, config = {}, env = {}, fetchImpl = fetch } = {}) {
  const input = params ?? {};
  const pluginConfig = config ?? {};
  const runtimeEnv = env ?? {};
  const repo = normalizeRepo(input.repo ?? pluginConfig.defaultRepo);
  const workflow = normalizeOptionalString(input.workflow ?? pluginConfig.defaultWorkflow);
  const branch = normalizeOptionalString(input.branch ?? pluginConfig.defaultBranch);
  const runId = normalizeRunId(input.runId);
  const includeLogExcerpt = input.includeLogExcerpt !== false;
  const logLines = clampLogLines(input.logLines);
  const token = resolveToken({ config: pluginConfig, env: runtimeEnv });

  if (!repo) {
    throw new Error("Missing repo. Pass repo as owner/name or set plugins.entries.releaseops.config.defaultRepo.");
  }

  const [owner, name] = repo.split("/");
  const run = runId
    ? await getWorkflowRun({ fetchImpl, token, owner, repo: name, runId })
    : await findLatestFailedRun({ fetchImpl, token, owner, repo: name, workflow, branch });

  const jobs = await listRunJobs({ fetchImpl, token, owner, repo: name, runId: run.id });
  const failedJobs = jobs.filter((job) => isFailureConclusion(job.conclusion));

  const enrichedJobs = [];
  for (const job of failedJobs) {
    const failedSteps = Array.isArray(job.steps)
      ? job.steps.filter((step) => isFailureConclusion(step.conclusion)).map(normalizeStep)
      : [];

    const logExcerpt = includeLogExcerpt
      ? await getJobLogExcerpt({ fetchImpl, token, owner, repo: name, jobId: job.id, logLines })
      : [];

    enrichedJobs.push({
      id: job.id,
      name: job.name,
      status: job.status,
      conclusion: job.conclusion,
      failedSteps,
      logExcerpt,
    });
  }

  return {
    repo,
    workflowId: run.workflow_id,
    workflowName: run.name,
    runId: run.id,
    runHtmlUrl: run.html_url,
    conclusion: run.conclusion,
    branch: run.head_branch,
    startedAt: run.run_started_at ?? run.created_at,
    failedJobs: enrichedJobs,
    likelyCause: inferLikelyCause(enrichedJobs),
    nextChecks: buildNextChecks(enrichedJobs),
    rollbackChecklist: buildRollbackChecklist(pluginConfig.runbookPath),
  };
}

function normalizeRepo(repo) {
  const value = normalizeOptionalString(repo);
  if (!value) {
    return undefined;
  }

  const match = value.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!match) {
    throw new Error(`Invalid repo "${value}". Expected owner/name.`);
  }

  return `${match[1]}/${match[2]}`;
}

function normalizeOptionalString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeRunId(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const numeric = Number(value);
  if (!Number.isSafeInteger(numeric) || numeric <= 0) {
    throw new Error(`Invalid runId "${value}". Expected a positive integer.`);
  }

  return numeric;
}

function normalizeStep(step) {
  return omitUndefined({
    number: step.number,
    name: step.name,
    status: step.status,
    conclusion: step.conclusion,
    startedAt: step.started_at,
    completedAt: step.completed_at,
  });
}

function omitUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

function clampLogLines(value) {
  if (value === undefined || value === null) {
    return 40;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 40;
  }

  return Math.max(10, Math.min(120, Math.trunc(numeric)));
}

function resolveToken({ config, env }) {
  const envName = normalizeOptionalString(config.githubTokenEnv) ?? "GITHUB_TOKEN";
  return normalizeOptionalString(env[envName]);
}

async function findLatestFailedRun({ fetchImpl, token, owner, repo, workflow, branch }) {
  const path = workflow
    ? `/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflow)}/runs`
    : `/repos/${owner}/${repo}/actions/runs`;

  const query = new URLSearchParams({
    per_page: "10",
    status: "failure",
  });

  if (branch) {
    query.set("branch", branch);
  }

  const response = await githubJson(fetchImpl, token, `${path}?${query.toString()}`);
  const runs = Array.isArray(response.workflow_runs) ? response.workflow_runs : [];
  const run = runs.find((candidate) => candidate.conclusion === "failure") ?? runs[0];

  if (!run) {
    throw new Error("No failed GitHub Actions runs found for the selected repo/workflow.");
  }

  return run;
}

async function getWorkflowRun({ fetchImpl, token, owner, repo, runId }) {
  return githubJson(fetchImpl, token, `/repos/${owner}/${repo}/actions/runs/${runId}`);
}

async function listRunJobs({ fetchImpl, token, owner, repo, runId }) {
  const jobs = [];
  let page = 1;

  while (page <= 3) {
    const response = await githubJson(
      fetchImpl,
      token,
      `/repos/${owner}/${repo}/actions/runs/${runId}/jobs?per_page=100&page=${page}`,
    );
    const batch = Array.isArray(response.jobs) ? response.jobs : [];
    jobs.push(...batch);

    if (batch.length < 100) {
      break;
    }
    page += 1;
  }

  return jobs;
}

async function getJobLogExcerpt({ fetchImpl, token, owner, repo, jobId, logLines }) {
  const response = await githubFetch(fetchImpl, token, `/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`, {
    accept: "text/plain, application/vnd.github+json",
  });

  const body = await response.text();
  return extractRelevantLogLines(body, { maxLines: logLines });
}

async function githubJson(fetchImpl, token, path) {
  const response = await githubFetch(fetchImpl, token, path, {
    accept: "application/vnd.github+json",
  });
  return response.json();
}

async function githubFetch(fetchImpl, token, path, { accept }) {
  const response = await fetchImpl(`${GITHUB_API}${path}`, {
    headers: {
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const body = await safeResponseText(response);
    throw new Error(`GitHub API request failed (${response.status} ${response.statusText}): ${body}`);
  }

  return response;
}

async function safeResponseText(response) {
  try {
    const text = await response.text();
    return text.slice(0, 500);
  } catch {
    return "no response body";
  }
}

function isFailureConclusion(conclusion) {
  return ["failure", "timed_out", "startup_failure", "cancelled", "action_required"].includes(conclusion);
}

function inferLikelyCause(failedJobs) {
  const firstStep = failedJobs.flatMap((job) => job.failedSteps)[0];
  const firstSignal = findFirstErrorSignal(failedJobs);
  if (firstStep?.name) {
    if (firstSignal) {
      return `The run first failed in step "${firstStep.name}". The clearest log signal is: "${firstSignal}".`;
    }

    return `The first failed step is "${firstStep.name}". Review that step's logs first, then check adjacent setup or dependency changes.`;
  }

  const firstJob = failedJobs[0];
  if (firstJob?.name) {
    if (firstSignal) {
      return `The run failed in job "${firstJob.name}". The clearest log signal is: "${firstSignal}".`;
    }

    return `The run failed in job "${firstJob.name}", but GitHub did not report a failed step. Inspect the job log excerpt and runner/setup phase.`;
  }

  return "The run is marked failed, but no failed jobs were returned by the GitHub Jobs API.";
}

function buildNextChecks(failedJobs) {
  const checks = [
    "Open the failed job in GitHub and confirm whether the first failing step matches the summary.",
    "Compare the failing commit with the last successful run on the same workflow and branch.",
    "Check whether secrets, environment variables, or package/dependency resolution changed.",
  ];

  if (failedJobs.some((job) => job.logExcerpt.some((line) => /timeout|timed out/i.test(line)))) {
    checks.push("A timeout appears in the log excerpt; check external service health and runner resource limits.");
  }

  if (failedJobs.some((job) => job.logExcerpt.some((line) => /permission|unauthorized|forbidden|\b(?:401|403)\b/i.test(line)))) {
    checks.push("A permission or auth error appears in the log excerpt; check token scopes and environment protection rules.");
  }

  if (failedJobs.some((job) => job.logExcerpt.some((line) => /\b(?:500|502|503|504)\b|HTTP 5\d\d|service unavailable/i.test(line)))) {
    checks.push("A 5xx or service-unavailable signal appears in the log excerpt; check deploy target health and provider status.");
  }

  return checks;
}

function findFirstErrorSignal(failedJobs) {
  const line = failedJobs.flatMap((job) => job.logExcerpt).find((entry) => DEFAULT_SIGNAL_PATTERNS.some((pattern) => pattern.test(entry)));
  return line ? cleanSignalLine(line) : undefined;
}

const DEFAULT_SIGNAL_PATTERNS = [
  /^##\[error\]/i,
  /\berror\b/i,
  /\bfail(?:ed|ure)?\b/i,
  /\bexception\b/i,
  /\btimeout\b/i,
  /\btimed out\b/i,
  /\bunauthorized\b/i,
  /\bforbidden\b/i,
  /\bpermission\b/i,
  /\bnot found\b/i,
  /\bexit code\b/i,
  /\bHTTP 5\d\d\b/i,
];

function cleanSignalLine(line) {
  return line
    .replace(/^##\[error\]/i, "")
    .replace(/^Error:\s*/i, "")
    .trim();
}

function buildRollbackChecklist(runbookPath) {
  const checklist = [
    "Identify whether the failed run deployed anything before failing.",
    "Confirm the last known good release, image, artifact, or commit.",
    "Check database migrations and irreversible side effects before rolling back.",
    "Announce rollback intent in the team incident/release channel.",
    "After rollback, verify health checks and customer-facing smoke tests.",
  ];

  if (normalizeOptionalString(runbookPath)) {
    checklist.unshift(`Review configured rollback runbook: ${runbookPath}`);
  }

  return checklist;
}
