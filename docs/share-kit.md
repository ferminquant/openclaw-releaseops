# Passive Share Kit

Use this to share the ReleaseOps demo lightly without turning validation into
active selling.

## Before Sharing

- Make the plugin repo public or choose the exact public page to link.
- Confirm the demo repo and known failed run are still public.
- Run the local validation suite from the README.
- Fill in the CTA destination: GitHub issue, hosted beta interest form, email,
  or comments.
- Do not include secrets, private customer logs, or real incident data.

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

Demo repo and write-up: <link>

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

Write-up and demo: <link>

Useful feedback would be: is this enough context to choose your next action during a failed deploy, or would you need last-good-run comparison, changed files, ownership, environment metadata, or runbook context?
```

## Trusted-Peer Async Note

```text
I am testing a product idea, not pitching consulting: a read-only OpenClaw plugin that summarizes failed GitHub Actions deploys from chat.

The demo is here: <link>

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
