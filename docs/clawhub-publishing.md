# ClawHub Publishing

ClawHub is the preferred OpenClaw ecosystem discovery surface for community
plugins. Keep GitHub as the canonical source repo, then publish the plugin to
ClawHub so users can install it through OpenClaw's normal plugin flow.

## Current Package

- package: `@ferminquant/openclaw-releaseops`
- source repo: `https://github.com/ferminquant/openclaw-releaseops`
- plugin id: `releaseops`
- first tool: `releaseops_failed_deploy_summary`
- install command after publishing:

```bash
openclaw plugins install clawhub:@ferminquant/openclaw-releaseops
```

## Dry Run

Use the latest ClawHub CLI for package commands:

```bash
npx -y clawhub@latest package publish ferminquant/openclaw-releaseops --dry-run --json
```

## Publish

After the dry-run is clean and ClawHub auth is configured:

```bash
npx -y clawhub@latest package publish ferminquant/openclaw-releaseops
```

## Safety Check

Before publishing a new version:

```bash
npm test
node --check index.js
node --check src/github-actions.js
node --check src/format.js
node --check src/logs.js
git diff --check
```

Keep the plugin read-only. Do not add deploys, reruns, rollback execution,
GitHub writes, private logs, or secrets as part of packaging.
