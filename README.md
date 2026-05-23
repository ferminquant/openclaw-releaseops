# OpenClaw ReleaseOps

Read-only OpenClaw plugin for summarizing failed GitHub Actions deploys from
chat.

This is the first product-led validation wedge for a ReleaseOps assistant:

- free local plugin
- content/demo artifact
- later hosted beta for scheduled summaries, saved runbooks, and team history

Business posture: this should not become a consulting or active-sales project.
The intended validation loop is a useful free plugin, clear demo content,
low-friction CTAs, async feedback, and inbound hosted-beta interest. Revenue, if
validated, should come from the product rather than from selling setup hours.

For full project context, see [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

For a short reusable demo script, see
[docs/demo-walkthrough.md](docs/demo-walkthrough.md).

For passive product-led validation, see
[docs/validation-plan.md](docs/validation-plan.md).

For OpenClaw ecosystem packaging, see
[docs/clawhub-publishing.md](docs/clawhub-publishing.md).

For a public write-up draft and passive sharing copy, see
[docs/public-writeup.md](docs/public-writeup.md) and
[docs/share-kit.md](docs/share-kit.md).

Public repo:
<https://github.com/ferminquant/openclaw-releaseops>

## First Tool

`releaseops_failed_deploy_summary`

What it does:

- finds a failed GitHub Actions run
- identifies failed jobs and failed steps
- extracts useful log lines
- redacts obvious token-shaped secrets from excerpts
- returns next-check suggestions
- adds a rollback checklist stub

What it does not do:

- trigger deploys
- trigger reruns
- modify GitHub state
- require a hosted backend

## Self-Serve Quickstart

From a local checkout of this repo, verify the plugin and install it into
OpenClaw:

```bash
npm test
openclaw plugins install --link .
openclaw plugins enable releaseops
openclaw plugins inspect releaseops --runtime --json
```

After ClawHub publishing, install with:

```bash
openclaw plugins install clawhub:@ferminquant/openclaw-releaseops
openclaw plugins enable releaseops
openclaw plugins inspect releaseops --runtime --json
```

The runtime inspect output should show optional tool
`releaseops_failed_deploy_summary`.

Add a dedicated ReleaseOps agent to OpenClaw config so the default `main` agent
does not inherit release/incident tools:

```json5
{
  agents: {
    list: [
      // Keep your existing agents here, then add:
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

For the richest demo, make sure the Gateway can see `GITHUB_TOKEN` before
asking for log excerpts. If you want to avoid token setup for a first smoke
test, change the prompt to `includeLogExcerpt false`.

Try the public demo:

```bash
openclaw agent --agent releaseops --message 'Use releaseops_failed_deploy_summary to summarize failed GitHub Actions run 26300685264. Use repo ferminquant/releaseops-demo-failing-actions, workflow deploy.yml, branch main, and include the log excerpt.'
```

Expected signal:

- failed job: `deploy-demo-service`
- failed step: `Deploy to demo environment`
- clearest log signal: `Simulated deploy endpoint returned HTTP 503`

OpenClaw currently rejects `tools.allow` and `tools.alsoAllow` in the same
scope. Use agent-level `tools.alsoAllow` when the tool should be added to a
profile. `skills: []` keeps the ReleaseOps agent from loading generic GitHub
skills and nudges GitHub Actions triage through the product tool.

## Configure For Your Repo

Replace the demo defaults with your repo, workflow, branch, and rollback
runbook path:

```json5
{
  plugins: {
    entries: {
      releaseops: {
        enabled: true,
        config: {
          githubTokenEnv: "GITHUB_TOKEN",
          defaultRepo: "owner/repo",
          defaultWorkflow: "deploy.yml",
          defaultBranch: "main",
          runbookPath: "./runbooks/rollback.md",
        },
      },
    },
  },
}
```

If the Gateway runs as a systemd user service, make sure the service environment
contains the token before restarting when you want job log excerpts:

```bash
systemctl --user set-environment GITHUB_TOKEN="$(gh auth token)"
openclaw gateway restart
```

Public repos can work without a token, but rate limits are lower. Private repos
need a token with read-only access.

## Validated Demo

Public demo repo:

<https://github.com/ferminquant/releaseops-demo-failing-actions>

The demo workflow intentionally fails in a synthetic deploy step. It does not
use secrets, real infrastructure, customer data, or private incident logs.

Known validated run:

<https://github.com/ferminquant/releaseops-demo-failing-actions/actions/runs/26300685264>

The expected summary starts with:

```text
# ReleaseOps Failed Deploy Triage

Status: failure
Likely cause: The run first failed in step "Deploy to demo environment". The clearest log signal is: "Simulated deploy endpoint returned HTTP 503".
First failed job: deploy-demo-service
First failed step: Deploy to demo environment
```

Example prompt:

```text
Use releaseops_failed_deploy_summary for ferminquant/releaseops-demo-failing-actions on workflow deploy.yml and branch main. Include the log excerpt.
```

Validated Gateway tool invocation:

```text
POST http://127.0.0.1:18789/tools/invoke
tool: releaseops_failed_deploy_summary
args: { repo, workflow, branch, includeLogExcerpt, logLines }
```

Validated chat-level tool invocation:

```text
openclaw agent --agent releaseops --session-id releaseops-dedicated-clean-proof --json --timeout 600 --message 'Use releaseops_failed_deploy_summary to summarize failed GitHub Actions run 26300685264. Use repo ferminquant/releaseops-demo-failing-actions, workflow deploy.yml, branch main, includeLogExcerpt false. Do not use bash or shell.'
```

The trace reported one tool call, the tool was
`releaseops_failed_deploy_summary`, and there were zero tool failures.

For a product demo talk track and validation questions, use
[docs/demo-walkthrough.md](docs/demo-walkthrough.md).

## GitHub Token

Set a token in the Gateway environment:

```bash
export GITHUB_TOKEN=github_pat_...
```

Recommended minimum permission for private repos:

- Actions: read
- Contents: read
- Metadata: read

Public repos can work without a token, but rate limits are lower.

## Example Prompt

```text
Use releaseops_failed_deploy_summary for ferminquant/example-service and tell me what failed in the latest deploy.
```

## Feedback

Feedback is async and public-safe. Please do not paste secrets, private logs,
customer data, or private incident details.

- [Demo feedback](https://github.com/ferminquant/openclaw-releaseops/issues/new?template=demo-feedback.yml)
- [Missing failed-deploy context](https://github.com/ferminquant/openclaw-releaseops/issues/new?template=missing-context.yml)
- [Hosted beta interest](https://github.com/ferminquant/openclaw-releaseops/issues/new?template=hosted-beta-interest.yml)

## Development

```bash
npm test
node --check index.js
node --check src/github-actions.js
node --check src/format.js
node --check src/logs.js
```
