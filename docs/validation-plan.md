# Validation Plan: Passive Product-Led Sprint

This plan validates whether the ReleaseOps OpenClaw plugin is worth extending
without turning the work into active selling.

## Constraint

Fermin does not want the next step to depend on active selling activities.
Avoid cold outreach, pitch-heavy calls, manual account-by-account selling, and
consulting-led discovery as the primary validation path.

This is not just a tone preference. It changes the business design: validation
must work through product-led artifacts and inbound signals, because the goal is
revenue from a product, not from converting Fermin's limited part-time capacity
into consulting hours.

Acceptable validation should be passive or low-friction:

- publish a clear demo artifact
- share in places where technical work is already being discussed
- invite async feedback
- use inbound interest as the signal
- ask existing trusted peers for product feedback without making it a sales ask

Do not make these the default plan:

- cold DM campaigns
- "book a call" as the main CTA
- consulting setup packages as the revenue engine
- bespoke incident-review services
- repeated manual follow-up to manufacture interest
- enterprise sales before there is clear self-serve pull

## Product-Led Workaround To Selling

The workaround is not "never talk to users." The workaround is to make talking
to users optional, async, and product-centered.

Use this loop:

1. Build a small useful read-only plugin.
2. Package a public demo that shows the failed-deploy pain clearly.
3. Publish a short technical artifact that explains the workflow.
4. Add a low-friction CTA.
5. Treat inbound replies, installs, stars, beta signups, and repeated feature
   asks as validation signals.
6. Build hosted subscription features only after those signals appear.

Good CTAs:

- "Try the local plugin."
- "Comment if this matches a real failed deploy you have seen."
- "Join the hosted beta interest list."
- "Open an issue with the context your team would need in this summary."

Avoid CTAs that make the business depend on active selling:

- "Book a sales call."
- "Hire me to set this up."
- "DM me for consulting."
- "Schedule a discovery session."

## Revenue Path Without Consulting

The product can still become paid without active selling if the free wedge
creates enough pull.

Likely buyers later:

- engineering managers responsible for deploy reliability
- staff/senior engineers who own CI/CD and release workflows
- small platform teams that want release visibility without buying a large
  incident-management suite
- founders or technical leads in teams where deploy failures interrupt customer
  work

Likely paid features later:

- scheduled failed-deploy summaries
- Slack, Discord, or Telegram delivery
- saved rollback and verification runbooks
- multi-repo release visibility
- team-visible history of failed deploys and fixes
- lightweight postmortem archive

Expected early revenue should be modest and signal-driven. Do not assume a large
revenue stream until there is evidence that teams repeatedly ask for hosted,
team, or scheduled capabilities.

## Validation Goal

Find out whether engineering leads and senior engineers understand the wedge in
under two minutes and believe it would shorten failed deploy triage.

The key question is:

> Would a read-only chat summary of failed GitHub Actions deploys save enough
> time or reduce enough release stress that someone would install it?

## One-Paragraph Pitch

ReleaseOps for OpenClaw is a read-only plugin that summarizes failed GitHub
Actions deploys from chat. It identifies the failed workflow run, failed job,
failed step, useful log signal, next checks, and rollback checklist without
rerunning workflows, changing GitHub state, or requiring hosted infrastructure.
The first version is local and safe by design; hosted features would come only
after there is clear demand for scheduled summaries, saved runbooks, and team
release history.

## Demo Packet

Use these assets together:

- README: `README.md`
- demo walkthrough: `docs/demo-walkthrough.md`
- public write-up draft: `docs/public-writeup.md`
- passive share kit: `docs/share-kit.md`
- public demo repo:
  `https://github.com/ferminquant/releaseops-demo-failing-actions`
- known failed run:
  `https://github.com/ferminquant/releaseops-demo-failing-actions/actions/runs/26300685264`

The demo should communicate three things quickly:

- the problem is failed deploy triage, not generic CI summarization
- the first tool is read-only and local
- the next paid product would be about team release visibility, not one-off
  consulting

## Passive Validation Channels

1. Publish the demo as a short technical artifact.
   - Format: blog post, README-led GitHub repo, short screen recording, or
     terminal transcript.
   - CTA: "Try the local plugin" or "Join the hosted beta interest list."

2. Add the plugin to relevant project surfaces.
   - Keep the README crisp.
   - Make the demo repo public and easy to inspect.
   - Add a lightweight CTA in any public write-up.

3. Share selectively in already-natural contexts.
   - Existing technical communities where OpenClaw, GitHub Actions, DevOps, or
     release engineering comes up.
   - Personal posts where the framing is "I built this local read-only tool,"
     not "book a sales call."

4. Ask trusted peers for async reaction.
   - Send the demo link with one question: "Does this solve a real failed
     deploy pain, or is it too shallow?"
   - Do not pitch paid work.

## Discovery Questions

Use these when someone reacts or tries the demo:

- What part of failed deploy triage usually costs you the most time?
- Is the likely-cause line specific enough to choose the next action?
- What context is missing: last successful run, changed files, owner, release
  notes, environment, or rollback runbook?
- Would you prefer this in chat, Slack, a GitHub comment, or a dashboard?
- Would you install a local plugin for this? What would block adoption?
- What would make a hosted version worth paying for?

## Signal Scorecard

Weak signal:

- people understand the demo but do not ask to try it
- feedback is mostly "nice idea" with no real deploy story
- users want broad incident automation before valuing the narrow wedge

Medium signal:

- 2-3 people say it maps to a real failed deploy workflow
- at least one person asks for installation steps or tries the demo
- repeated asks cluster around the same missing context

Strong signal:

- 3+ people want to install it on a real repo
- someone asks for Slack, scheduled summaries, or team history
- someone describes a recent incident where this would have saved meaningful
  time
- at least one person asks about pricing, hosted beta, or team use

## Decision Rules

Build summary depth next if feedback says the output is useful but missing
decision context.

Improve packaging/content next if people understand the value but hesitate to
install.

Explore hosted beta next only if users ask for recurring summaries, team
visibility, Slack delivery, or saved runbooks.

Do not add write behavior, deploy execution, reruns, rollback execution, or
GitHub mutation as part of validation.

## Next Asset To Publish

The next best asset to publish is the short public write-up:

- source draft: `docs/public-writeup.md`
- sharing copy: `docs/share-kit.md`
- CTA: try the plugin locally, open an issue with missing context, or express
  interest in hosted beta
