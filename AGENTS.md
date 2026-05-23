# AGENTS.md

Rules for work in this repo.

## Purpose

This repo contains the ReleaseOps OpenClaw plugin experiment. Keep it separate
from upstream OpenClaw contribution work.

## Product Direction

- Product-led path, not consulting-led.
- Revenue should come from the product, not from selling Fermin's time.
- Do not make active selling the default plan. Avoid cold outreach, pitch-heavy
  calls, manual account-by-account sales, or consulting-led discovery unless
  Fermin explicitly asks for that motion.
- Preferred validation motion: useful demo/content, async feedback, a clear CTA,
  inbound interest, and trusted-peer product reactions.
- First wedge: summarize failed GitHub Actions deploys from chat.
- First tool stays read-only.
- Hosted backend comes only after validation.

## Safety

- Do not commit secrets, tokens, real customer logs, or private incident data.
- Do not add deploy, rerun, rollback, issue mutation, or GitHub write behavior
  without explicit approval.
- Treat GitHub Actions logs as potentially sensitive. Redact obvious tokens if
  adding log processing.
- Keep token examples fake.

## OpenClaw Boundaries

- Do not edit `/home/fermin/git/openclaw` unless explicitly asked.
- Do not mutate OpenClaw upstream PR branches from this repo.
- Local integration may link-install this plugin into OpenClaw, but call out
  config mutations before making them.

## Coding

- JavaScript ESM for now.
- Prefer small pure helpers with tests.
- Keep runtime dependencies minimal.
- Use native `node --test` unless a stronger test framework is intentionally
  introduced.
- Keep the plugin installable from local path.

## Validation

Run before handoff:

```bash
npm test
node --check index.js
node --check src/github-actions.js
node --check src/format.js
node --check src/logs.js
```

For integration proof:

```bash
openclaw plugins install --link /home/fermin/git/openclaw-releaseops
openclaw plugins enable releaseops
openclaw plugins inspect releaseops --runtime --json
```

Only run integration commands when the user has approved local OpenClaw config
mutation or when the task explicitly asks for it.

## Docs

- Keep `README.md` user-facing.
- Keep `PROJECT_CONTEXT.md` as the handoff/context doc for future threads.
- Update both when product scope or setup changes.
