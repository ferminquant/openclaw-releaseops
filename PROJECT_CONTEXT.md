# Project Context

## What This Repo Is

`openclaw-releaseops` is a product-led experiment around an OpenClaw plugin for
release and incident workflows.

The first wedge is intentionally narrow:

> Summarize failed GitHub Actions deploys from chat.

This repo is separate from the OpenClaw fork so product work does not leak into
upstream OpenClaw PRs.

## Product Strategy

The preferred business path is not consulting-first.

The intended path is:

1. Free read-only OpenClaw plugin.
2. Technical content showing the workflow.
3. CTA for hosted beta interest.
4. Paid hosted product if people show real interest.

Hosted product ideas, only after validation:

- scheduled failed-deploy summaries
- saved release and rollback runbooks
- multiple repos per workspace
- team-visible release history
- Slack, Discord, or Telegram posting
- postmortem archive

Starting pricing hypothesis:

- Pro: `$49-$99/month`
- Team: `$149-$299/month`

Consulting or setup help can be used as learning, but it should not become the
main business model.

## Why This Fits Fermin

Fermin's public background at `https://ferminquant.com` emphasizes:

- 15+ years as a senior software engineer
- backend platforms
- AWS serverless systems
- CI/CD modernization
- GitHub Actions and AWS CodeBuild
- TypeScript/Node.js, C#/.NET, SQL
- consulting-facing delivery and architecture communication

This makes a ReleaseOps product more credible than a generic AI plugin because
the pain is production delivery, failed deploys, rollback confidence, and
operational clarity.

## Current State

Current scaffold:

- native OpenClaw plugin manifest: `openclaw.plugin.json`
- OpenClaw entrypoint: `index.js`
- read-only GitHub Actions summarizer: `src/github-actions.js`
- markdown formatter: `src/format.js`
- log excerpt helper: `src/logs.js`
- tests for log extraction: `test/logs.test.js`

Current tool:

`releaseops_failed_deploy_summary`

Tool behavior:

- finds a failed GitHub Actions run
- identifies failed jobs and failed steps
- extracts relevant log lines
- returns likely cause guidance
- returns next-check suggestions
- returns a rollback checklist stub

The tool must stay read-only:

- no deploys
- no reruns
- no rollback execution
- no GitHub state mutation
- no hosted backend requirement

## Adjacent Repos

- OpenClaw checkout: `/home/fermin/git/openclaw`
- Private notes repo: `/home/fermin/git/openclaw-notes`
- Product/plugin repo: `/home/fermin/git/openclaw-releaseops`

Relevant private notes:

- `/home/fermin/git/openclaw-notes/openclaw/releaseops-product-plan.md`
- `/home/fermin/git/openclaw-notes/openclaw/releaseops-validation-sprint.md`

## OpenClaw Plugin Facts

OpenClaw plugins can be installed from local path, git, npm, ClawHub, archives,
or compatible marketplaces. ClawHub is the likely public discovery surface
later, but this repo should first validate usefulness locally.

Native plugins need:

- `openclaw.plugin.json`
- an entrypoint listed in `package.json` under `openclaw.extensions`
- manifest contracts for runtime-registered tools
- explicit optional tool metadata when the tool should require opt-in

The local install path should be:

```bash
openclaw plugins install --link /home/fermin/git/openclaw-releaseops
openclaw plugins enable releaseops
openclaw plugins inspect releaseops --runtime --json
```

Then allow the optional tool in OpenClaw config:

```json5
{
  tools: {
    allow: ["releaseops_failed_deploy_summary"],
  },
}
```

Restart the Gateway after install/config changes.

## Next Recommended Work

1. Add focused tests for `src/github-actions.js` with mocked GitHub API
   responses.
2. Improve error handling and output shape before live install testing.
3. Link-install into the local OpenClaw checkout and verify runtime inspection.
4. Test against a safe public repo or a demo repo with a deliberately failing
   workflow.
5. Create demo content once the tool produces a credible summary.

## Quality Bar

Keep the plugin:

- read-only
- installable locally
- small enough to explain in under two minutes
- useful without hosted infrastructure
- clear about token permissions and GitHub rate limits
- safe about logs and secrets

Do not add broad hosted-product code yet. The next milestone is a credible demo,
not a platform.
