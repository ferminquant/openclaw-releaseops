# OpenClaw ReleaseOps

Read-only OpenClaw plugin for summarizing failed GitHub Actions deploys from
chat.

This is the first product-led validation wedge for a ReleaseOps assistant:

- free local plugin
- content/demo artifact
- later hosted beta for scheduled summaries, saved runbooks, and team history

For full project context, see [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

## First Tool

`releaseops_failed_deploy_summary`

What it does:

- finds a failed GitHub Actions run
- identifies failed jobs and failed steps
- extracts useful log lines
- returns next-check suggestions
- adds a rollback checklist stub

What it does not do:

- trigger deploys
- trigger reruns
- modify GitHub state
- require a hosted backend

## Local Install

From this repo:

```bash
openclaw plugins install --link .
openclaw plugins enable releaseops
openclaw plugins inspect releaseops --runtime --json
```

Enable the optional tool in OpenClaw config:

```json5
{
  tools: {
    allow: ["releaseops_failed_deploy_summary"],
  },
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

Restart the Gateway after install or config changes:

```bash
openclaw gateway restart
```

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

## Development

```bash
npm test
```
