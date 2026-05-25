# OpenClaw ReleaseOps

Read-only OpenClaw plugin for summarizing failed GitHub Actions deploys from
chat.

## At A Glance

| Field | Value |
| --- | --- |
| Tool | `releaseops_failed_deploy_summary` |
| Purpose | Failed deploy triage from chat |
| Source | GitHub Actions workflow runs, jobs, steps, and logs |
| Mode | Read-only local plugin |
| Install | `openclaw plugins install clawhub:@ferminquant/openclaw-releaseops` |
| Demo repo | <https://github.com/ferminquant/releaseops-demo-failing-actions> |
| Public repo | <https://github.com/ferminquant/openclaw-releaseops> |

## What It Returns

| Output | Description |
| --- | --- |
| Failed run | Workflow run metadata and status |
| Failed jobs | Jobs whose conclusion indicates failure or interruption |
| Failed steps | Failed step names when GitHub reports them |
| Log excerpts | Relevant, redacted log lines |
| Likely cause | First useful failure signal from steps and logs |
| Next checks | Follow-up checks for deploy triage |
| Rollback checklist | Read-only checklist stub for rollback readiness |

## What It Will Not Do

| Boundary | Status |
| --- | --- |
| Trigger deploys | No |
| Rerun workflows | No |
| Execute rollbacks | No |
| Create or mutate GitHub issues | No |
| Modify GitHub state | No |
| Require a hosted backend | No |

## Install From ClawHub

```bash
openclaw plugins install clawhub:@ferminquant/openclaw-releaseops
openclaw plugins enable releaseops
openclaw plugins inspect releaseops --runtime --json
```

Expected inspect signal:

| Field | Expected value |
| --- | --- |
| Plugin id | `releaseops` |
| Optional tool | `releaseops_failed_deploy_summary` |

## Try The Demo

Public demo:

| Field | Value |
| --- | --- |
| Repo | `ferminquant/releaseops-demo-failing-actions` |
| Workflow | `deploy.yml` |
| Branch | `main` |
| Failed run | <https://github.com/ferminquant/releaseops-demo-failing-actions/actions/runs/26300685264> |

Prompt:

```text
Use releaseops_failed_deploy_summary to summarize failed GitHub Actions run 26300685264. Use repo ferminquant/releaseops-demo-failing-actions, workflow deploy.yml, branch main, and include the log excerpt.
```

Expected summary signals:

| Signal | Expected value |
| --- | --- |
| Failed job | `deploy-demo-service` |
| Failed step | `Deploy to demo environment` |
| Clearest log signal | `Simulated deploy endpoint returned HTTP 503` |

For the richest demo, make sure the Gateway can see `GITHUB_TOKEN` before
asking for log excerpts. For a no-token smoke test, change the prompt to
`includeLogExcerpt false`.

## Dedicated Agent Setup

Expose the optional tool through a dedicated ReleaseOps agent so the default
`main` agent does not inherit release/incident tools.

Add this shape to OpenClaw config:

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

Then restart the Gateway:

```bash
openclaw gateway restart
```

Notes:

| Setting | Why it matters |
| --- | --- |
| `tools.alsoAllow` | Adds the optional plugin tool to the selected profile |
| `skills: []` | Keeps generic GitHub skills from competing with the ReleaseOps tool |
| `tools.allow` plus `tools.alsoAllow` | Currently rejected by OpenClaw in the same scope |

## Configure Your Repo

Replace the demo defaults:

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

GitHub token guidance:

| Repo type | Token guidance |
| --- | --- |
| Public repos | Can work without a token, but rate limits are lower |
| Private repos | Need read-only GitHub access |

Recommended minimum GitHub permissions:

| Permission | Level |
| --- | --- |
| Actions | read |
| Contents | read |
| Metadata | read |

If the Gateway runs as a systemd user service:

```bash
systemctl --user set-environment GITHUB_TOKEN="$(gh auth token)"
openclaw gateway restart
```

## Local Development

```bash
npm test
node --check index.js
node --check src/github-actions.js
node --check src/format.js
node --check src/logs.js
```

Local link install:

```bash
openclaw plugins install --link .
openclaw plugins enable releaseops
openclaw plugins inspect releaseops --runtime --json
```

## Feedback

Feedback is async and public-safe. Please do not paste secrets, private logs,
customer data, or private incident details.

| Feedback path | Link |
| --- | --- |
| Demo feedback | [Open issue](https://github.com/ferminquant/openclaw-releaseops/issues/new?template=demo-feedback.yml) |
| Missing failed-deploy context | [Open issue](https://github.com/ferminquant/openclaw-releaseops/issues/new?template=missing-context.yml) |
| Hosted beta interest | [Open issue](https://github.com/ferminquant/openclaw-releaseops/issues/new?template=hosted-beta-interest.yml) |

## Product Posture

| Principle | Direction |
| --- | --- |
| Business path | Product-led, not consulting-led |
| Validation | Useful demo/content and async feedback |
| Hosted backend | Only after validation |

Possible hosted features later:

| Possible feature | Timing |
| --- | --- |
| Scheduled failed-deploy summaries | Later, if validated |
| Saved runbooks | Later, if validated |
| Team release history | Later, if validated |
| Slack, Discord, or Telegram delivery | Later, if validated |

## More Docs

| Document | Purpose |
| --- | --- |
| [Project context](PROJECT_CONTEXT.md) | Handoff and product context |
| [Demo walkthrough](docs/demo-walkthrough.md) | Short demo script |
| [Validation plan](docs/validation-plan.md) | Passive product-led validation |
| [ClawHub publishing](docs/clawhub-publishing.md) | Publish and verification notes |
| [Public write-up draft](docs/public-writeup.md) | Shareable article draft |
| [Passive share kit](docs/share-kit.md) | Lightweight sharing copy |
