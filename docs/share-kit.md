# Passive Share Kit

Use this to share the ReleaseOps demo lightly without turning validation into
active selling.

## Before Sharing

- Make the plugin repo public:
  `https://github.com/ferminquant/openclaw-releaseops`
- Confirm the demo repo and known failed run are still public.
- Run the local validation suite from the README.
- Do not include secrets, private customer logs, or real incident data.

Primary CTA destinations:

- demo feedback:
  `https://github.com/ferminquant/openclaw-releaseops/issues/new?template=demo-feedback.yml`
- missing context:
  `https://github.com/ferminquant/openclaw-releaseops/issues/new?template=missing-context.yml`
- hosted beta interest:
  `https://github.com/ferminquant/openclaw-releaseops/issues/new?template=hosted-beta-interest.yml`

## Where To Publish First

1. GitHub repo README
   - This is the canonical surface for the plugin, quickstart, demo, and issue
     templates.

2. ClawHub package listing
   - This is the OpenClaw-native discovery surface once the package dry-run is
     clean and publishing is approved.

3. One light social/community share
   - Use the short post or technical community post below.
   - Share only where OpenClaw plugin or release-engineering work is already
     being discussed.

## Good Places To Share

- a personal technical blog post
- the plugin repo README once public
- a short personal social post
- an existing community thread about OpenClaw, GitHub Actions, CI/CD, or release
  engineering
- async messages to trusted peers who already discuss engineering/product ideas

Avoid cold DM campaigns, pitch calls, consulting offers, repeated manual
follow-up, or "book a call" as the main CTA.

## Short Post

```text
I built a small read-only OpenClaw plugin for failed GitHub Actions deploy triage.

It summarizes the failed run, failed job, failed step, useful log signal, next checks, and rollback checklist from chat. It does not rerun workflows, deploy, roll back, or mutate GitHub state.

Demo repo and write-up: https://github.com/ferminquant/openclaw-releaseops/blob/main/docs/public-writeup.md

If this matches a real deploy failure workflow you have seen, I would be curious what context the summary is still missing.
```

## Technical Community Post

```text
I am validating a narrow ReleaseOps idea: a local, read-only OpenClaw plugin that summarizes failed GitHub Actions deploys from chat.

The demo intentionally fails a synthetic deploy step, then the plugin identifies:
- workflow/run status
- failed job
- failed step
- clearest log signal
- next checks
- rollback checklist stub

The important constraint: no deploys, reruns, rollback execution, GitHub writes, or hosted backend in the first version.

Write-up and demo: https://github.com/ferminquant/openclaw-releaseops/blob/main/docs/public-writeup.md

Useful feedback would be: is this enough context to choose your next action during a failed deploy, or would you need last-good-run comparison, changed files, ownership, environment metadata, or runbook context?
```

## Trusted-Peer Async Note

```text
I am testing a product idea, not pitching consulting: a read-only OpenClaw plugin that summarizes failed GitHub Actions deploys from chat.

The demo is here: https://github.com/ferminquant/openclaw-releaseops/blob/main/docs/public-writeup.md

One question: does this solve a real failed-deploy pain, or is the summary too shallow to matter?
```

## Lightweight CTA Options

- "Try the local plugin."
- "Open an issue with the context your team would need."
- "Comment with a real failed-deploy scenario this would or would not help."
- "Join the hosted beta interest list."

Avoid:

- "Book a sales call."
- "Hire me to set this up."
- "DM me for consulting."
- "Schedule a discovery session."

## Observe Signals

Track signals manually for now:

- repo stars/watchers
- install questions
- issues or comments asking for specific missing context
- hosted beta signups
- repeated asks for Slack, scheduled summaries, or team history
- real failed-deploy stories where this would have helped
