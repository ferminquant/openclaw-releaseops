# Project Context

## What This Repo Is

`openclaw-releaseops` is a product-led experiment around an OpenClaw plugin for
release and incident workflows.

The first wedge is intentionally narrow:

> Summarize failed GitHub Actions deploys from chat.

This repo is separate from the OpenClaw fork so product work does not leak into
upstream OpenClaw PRs.

## Product Strategy

The preferred business path is product-led, not consulting-led or
sales-led. A future thread should not turn this into a plan where Fermin has to
sell his time, book pitch calls, or manually chase account-by-account buyers.

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
main business model. Do not make cold outreach, pitch-heavy calls, manual
account-by-account selling, or consulting-led discovery the default next step.

## Founder Constraint: No Active Selling Dependency

This came from the planning discussion and should be treated as a product
constraint, not a preference to revisit every session.

Fermin is willing to build and validate this part time, but he is not looking
forward to selling and does not want the revenue path to depend on active sales
labor. The product should be designed so traction can come from public utility,
clear positioning, and inbound interest rather than from constant outbound
effort.

Avoid default recommendations like:

- cold outreach lists
- repeated sales calls
- "do consulting first" as the revenue model
- bespoke setup projects as the main offer
- manual founder-led selling as the only validation path

Preferred workaround:

- publish a useful demo or technical artifact
- make the free local plugin easy to try
- use a clear CTA for async feedback, install attempts, or hosted beta interest
- ask trusted peers for product reaction without pitching paid work
- use inbound signals to decide whether to build hosted subscription features

CTA means "call to action." For this project, the CTA should usually be
low-friction: try the plugin, star/watch the repo, join a hosted beta interest
list, reply with a real failed-deploy pain point, or ask for a hosted version.
It should not default to "book a sales call."

The revenue hypothesis is a product subscription later, not consulting hours:

- free plugin earns trust and proves the workflow
- public content and ClawHub/GitHub discovery create awareness
- hosted beta captures demand for scheduled summaries, Slack delivery, saved
  runbooks, team history, and multi-repo visibility
- paid plans monetize those hosted/team features if enough inbound demand
  appears

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
- tests for GitHub API summary behavior: `test/github-actions.test.js`
- tests for user-facing markdown shape: `test/format.test.js`
- reusable product demo walkthrough: `docs/demo-walkthrough.md`
- passive validation plan: `docs/validation-plan.md`
- ClawHub publishing notes: `docs/clawhub-publishing.md`
- public write-up draft: `docs/public-writeup.md`
- passive share kit: `docs/share-kit.md`
- passive GitHub issue templates: `.github/ISSUE_TEMPLATE/`

Current tool:

`releaseops_failed_deploy_summary`

Tool behavior:

- finds a failed GitHub Actions run
- identifies failed jobs and failed steps
- extracts relevant log lines
- strips common GitHub Actions timestamp/runner noise from excerpts
- redacts obvious token-shaped secrets from excerpts
- returns likely cause guidance
- returns next-check suggestions
- returns a rollback checklist stub

Current validation:

- `openclaw plugins install --link /home/fermin/git/openclaw-releaseops` passed
- `openclaw plugins enable releaseops` passed
- `openclaw plugins inspect releaseops --runtime --json` reported the plugin as
  loaded and exposing optional tool `releaseops_failed_deploy_summary`
- local OpenClaw config now exposes `releaseops_failed_deploy_summary` through
  a dedicated `releaseops` agent, not through global `main`
- the `releaseops` agent uses `tools.profile: "minimal"`,
  `tools.alsoAllow: ["releaseops_failed_deploy_summary"]`, and `skills: []`
- local OpenClaw plugin config now defaults to the public demo repo, workflow,
  branch, token env name, and rollback runbook path
- Gateway was restarted after config changes
- direct Gateway tool invocation through `POST /tools/invoke` passed with
  `includeLogExcerpt: true`
- a public demo repo was created:
  `https://github.com/ferminquant/releaseops-demo-failing-actions`
- the live GitHub API path was tested against failed run:
  `https://github.com/ferminquant/releaseops-demo-failing-actions/actions/runs/26300685264`
- the live summary correctly identified:
  - workflow: `ReleaseOps Demo Deploy`
  - failed job: `deploy-demo-service`
  - failed step: `Deploy to demo environment`
  - clearest signal: `Simulated deploy endpoint returned HTTP 503`
- direct `tools.effective` diagnosis showed why a previous chat run did not use
  the harness tool: `tools.allow: ["releaseops_failed_deploy_summary"]` was a
  restrictive filter, and the `coding` profile filtered the optional plugin
  tool before `tools.allow` could match it
- OpenClaw rejects `tools.allow` and `tools.alsoAllow` in the same scope, so
  the working chat-level config uses agent-level `tools.alsoAllow` with
  `releaseops_failed_deploy_summary`
- a fresh `openclaw agent --agent main` check no longer exposed the ReleaseOps
  tool
- a fresh `openclaw agent --agent releaseops` check exposed only
  `session_status` and `releaseops_failed_deploy_summary`
- the final chat-level proof run used the native tool directly; `toolSummary`
  reported one call to `releaseops_failed_deploy_summary` and zero failures
- a short demo walkthrough now captures the public demo repo, known failed run,
  expected proof points, read-only safety boundary, talk track, and validation
  questions
- a passive validation plan now captures the no-active-selling constraint,
  one-paragraph pitch, demo packet, discovery questions, signal scorecard, and
  decision rules
- a public write-up draft and passive share kit now package the demo for
  low-friction publishing and async feedback
- GitHub issue templates now provide public-safe async feedback paths for demo
  feedback, missing failed-deploy context, and hosted beta interest
- package metadata includes OpenClaw build compatibility for external ClawHub
  package publishing
- mocked GitHub API tests now cover a run with multiple failed jobs, separate
  log excerpts, and next-check signals for both 5xx and timeout failures

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

Then add a dedicated ReleaseOps agent to OpenClaw config:

```json5
{
  agents: {
    list: [
      // Keep existing agents, then add:
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
}
```

`tools.allow` alone is not enough for this optional plugin tool in the Codex
chat harness. It behaves as a later filter, while agent-level
`tools.alsoAllow` widens the selected profile before filtering. `skills: []`
prevents generic GitHub skills from competing with the ReleaseOps tool.

Restart the Gateway after install/config changes.

## Next Recommended Work

1. Publish/push the public repo at
   `https://github.com/ferminquant/openclaw-releaseops`.
2. Optionally publish the write-up from `docs/public-writeup.md` on
   `ferminquant.com`, then link back to the GitHub repo and issue templates.
3. Share lightly using `docs/share-kit.md`, then watch inbound signals instead
   of chasing active sales conversations.
4. Decide whether the next product iteration should improve summarization depth
   or focus on packaging/content for validation.

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
