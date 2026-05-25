# OpenClaw ReleaseOps

Read-only OpenClaw plugin for summarizing failed GitHub Actions deploys from
chat.

## At A Glance

\- **Tool:** `releaseops_failed_deploy_summary`<br>
\- **Purpose:** failed deploy triage from chat<br>
\- **Source:** GitHub Actions workflow runs, jobs, steps, and logs<br>
\- **Mode:** read-only local plugin<br>
\- **Install:** `openclaw plugins install clawhub:@ferminquant/openclaw-releaseops`<br>
\- **Demo repo:** <https://github.com/ferminquant/releaseops-demo-failing-actions><br>
\- **Public repo:** <https://github.com/ferminquant/openclaw-releaseops>

## What It Returns

\- failed workflow run<br>
\- failed jobs<br>
\- failed steps<br>
\- useful log excerpts<br>
\- likely-cause summary<br>
\- next-check suggestions<br>
\- rollback checklist stub

## What It Will Not Do

\- trigger deploys<br>
\- rerun workflows<br>
\- execute rollbacks<br>
\- create or mutate GitHub issues<br>
\- modify GitHub state<br>
\- require a hosted backend

## Install From ClawHub

```bash
openclaw plugins install clawhub:@ferminquant/openclaw-releaseops
openclaw plugins enable releaseops
openclaw plugins inspect releaseops --runtime --json
```

Expected inspect signal:

\- plugin id: `releaseops`<br>
\- optional tool: `releaseops_failed_deploy_summary`

## Try The Demo

Public demo:

\- repo: `ferminquant/releaseops-demo-failing-actions`<br>
\- workflow: `deploy.yml`<br>
\- branch: `main`<br>
\- known failed run:
<https://github.com/ferminquant/releaseops-demo-failing-actions/actions/runs/26300685264>

Prompt:

```text
Use releaseops_failed_deploy_summary to summarize failed GitHub Actions run 26300685264. Use repo ferminquant/releaseops-demo-failing-actions, workflow deploy.yml, branch main, and include the log excerpt.
```

Expected summary signals:

\- failed job: `deploy-demo-service`<br>
\- failed step: `Deploy to demo environment`<br>
\- clearest log signal: `Simulated deploy endpoint returned HTTP 503`

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

\- `tools.alsoAllow` adds the optional plugin tool to the selected profile.<br>
\- `skills: []` keeps generic GitHub skills from competing with the ReleaseOps
tool.<br>
\- OpenClaw currently rejects `tools.allow` and `tools.alsoAllow` in the same
scope.

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

\- public repos can work without a token, but rate limits are lower<br>
\- private repos need read-only GitHub access

Recommended minimum GitHub permissions:

\- Actions: read<br>
\- Contents: read<br>
\- Metadata: read

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

\- [Demo feedback](https://github.com/ferminquant/openclaw-releaseops/issues/new?template=demo-feedback.yml)<br>
\- [Missing failed-deploy context](https://github.com/ferminquant/openclaw-releaseops/issues/new?template=missing-context.yml)<br>
\- [Hosted beta interest](https://github.com/ferminquant/openclaw-releaseops/issues/new?template=hosted-beta-interest.yml)

## Product Posture

\- product-led, not consulting-led<br>
\- passive validation through useful demo/content and async feedback<br>
\- hosted backend only after validation

Possible hosted features later:

\- scheduled failed-deploy summaries<br>
\- saved runbooks<br>
\- team release history<br>
\- Slack, Discord, or Telegram delivery

## More Docs

\- [Project context](PROJECT_CONTEXT.md)<br>
\- [Demo walkthrough](docs/demo-walkthrough.md)<br>
\- [Validation plan](docs/validation-plan.md)<br>
\- [ClawHub publishing](docs/clawhub-publishing.md)<br>
\- [Public write-up draft](docs/public-writeup.md)<br>
\- [Passive share kit](docs/share-kit.md)
