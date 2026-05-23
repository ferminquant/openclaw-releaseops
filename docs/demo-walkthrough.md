# Demo Walkthrough: Failed Deploy Triage

Use this walkthrough to show the ReleaseOps wedge in under two minutes: a
release owner asks OpenClaw what failed, and the plugin turns a failed GitHub
Actions deploy into a concise, read-only triage summary.

## Demo Asset

Public repo:

<https://github.com/ferminquant/releaseops-demo-failing-actions>

Known failed run:

<https://github.com/ferminquant/releaseops-demo-failing-actions/actions/runs/26300685264>

The demo workflow intentionally fails in a synthetic deploy step. It does not
touch real infrastructure, use secrets, or include private incident logs.

## Setup

Install and enable the plugin from this repo:

```bash
openclaw plugins install --link /home/fermin/git/openclaw-releaseops
openclaw plugins enable releaseops
openclaw plugins inspect releaseops --runtime --json
```

Expose the optional tool through a dedicated ReleaseOps agent so the default
agent does not inherit release/incident tools:

```json5
{
  agents: {
    list: [
      {
        id: "releaseops",
        name: "ReleaseOps",
        skills: [],
        tools: {
          profile: "minimal",
          alsoAllow: ["releaseops_failed_deploy_summary"],
        },
      },
    ],
  },
  plugins: {
    entries: {
      releaseops: {
        enabled: true,
        config: {
          githubTokenEnv: "GITHUB_TOKEN",
          defaultRepo: "ferminquant/releaseops-demo-failing-actions",
          defaultWorkflow: "deploy.yml",
          defaultBranch: "main",
          runbookPath: "./runbooks/rollback.md",
        },
      },
    },
  },
}
```

Restart the Gateway after install or config changes:

```bash
openclaw gateway restart
```

## Chat Prompt

```text
Use releaseops_failed_deploy_summary to summarize failed GitHub Actions run 26300685264. Use repo ferminquant/releaseops-demo-failing-actions, workflow deploy.yml, branch main, and include the log excerpt.
```

## Expected Output

The summary should identify:

- workflow: `ReleaseOps Demo Deploy`
- run status: `failure`
- failed job: `deploy-demo-service`
- failed step: `Deploy to demo environment`
- clearest signal: `Simulated deploy endpoint returned HTTP 503`
- next checks for the failed deploy target and rollback readiness

The output should stay read-only. It should not rerun the workflow, trigger a
deploy, create GitHub issues, mutate GitHub state, or execute a rollback.

## Demo Talk Track

1. "This starts with the smallest useful ReleaseOps loop: explain a failed
   deploy from chat."
2. "The plugin reads GitHub Actions metadata and job logs, then returns the
   failed job, failed step, likely cause, next checks, and rollback checklist."
3. "The first version is intentionally local and read-only, so teams can test
   value before trusting any hosted service or automation."
4. "If this is useful, the hosted product would add scheduled summaries, saved
   runbooks, team history, and chat notifications."

## Validation Questions

- Would this have saved time in a real failed deploy?
- Is the likely-cause line specific enough to decide the next check?
- Which destination matters most for the next iteration: Slack, GitHub comment,
  release dashboard, or scheduled digest?
- What would need to be visible before a team would pay for this?
