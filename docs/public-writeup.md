# A Read-Only OpenClaw Plugin For Failed GitHub Actions Deploy Triage

Failed deploys are noisy at exactly the wrong moment. A release owner usually
has to jump from chat to GitHub Actions, open the failed run, inspect jobs,
scroll logs, find the first useful signal, and then decide whether this is a
service issue, dependency issue, secret/config issue, or rollback situation.

`openclaw-releaseops` is a small OpenClaw plugin that tries to compress that
loop into one read-only chat request.

## What It Does

The first tool is:

`releaseops_failed_deploy_summary`

It reads GitHub Actions metadata and job logs, then returns:

- the failed workflow run
- failed jobs
- failed steps
- useful log excerpts
- a likely-cause line
- next checks
- a rollback checklist stub

The first version is intentionally narrow. It does not trigger deploys, rerun
workflows, create GitHub issues, mutate GitHub state, execute rollbacks, or
require a hosted backend.

## Demo

There is a public demo repo with a deliberately failing synthetic deploy:

<https://github.com/ferminquant/releaseops-demo-failing-actions>

Known failed run:

<https://github.com/ferminquant/releaseops-demo-failing-actions/actions/runs/26300685264>

Example prompt:

```text
Use releaseops_failed_deploy_summary to summarize failed GitHub Actions run 26300685264. Use repo ferminquant/releaseops-demo-failing-actions, workflow deploy.yml, branch main, and include the log excerpt.
```

Expected high-level result:

```text
# ReleaseOps Failed Deploy Triage

Status: failure
Likely cause: The run first failed in step "Deploy to demo environment". The clearest log signal is: "Simulated deploy endpoint returned HTTP 503".
First failed job: deploy-demo-service
First failed step: Deploy to demo environment
```

That is the whole wedge: make the first useful failed-deploy triage summary
available from chat without asking the tool to take production action.

## Why Read-Only First

Release and incident tooling should earn trust before it gets power. The safest
first version is a local plugin that reads deploy evidence and helps a human
decide what to check next.

That also makes validation cleaner. If the read-only summary is not useful,
automation would only make the wrong thing faster.

## What Might Become Hosted Later

Hosted features should come only if the local workflow creates real pull.
Possible paid features later:

- scheduled failed-deploy summaries
- Slack, Discord, or Telegram delivery
- saved rollback and verification runbooks
- multi-repo release visibility
- team-visible release history
- lightweight postmortem archive

The revenue hypothesis is product subscription revenue, not consulting hours or
manual setup projects.

## Low-Friction CTA

If this maps to a failed-deploy workflow you have seen:

- try the local plugin from the README
- star or watch the repo after it is public
- open an issue with the missing context your team would need
- join the hosted beta interest list when one exists

Before publishing this write-up, fill in:

- public plugin repo URL
- hosted beta interest link, if available
- preferred feedback surface: GitHub issue, blog comments, or email
