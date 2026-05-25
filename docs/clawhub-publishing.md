# ClawHub Publishing

ClawHub is the preferred OpenClaw ecosystem discovery surface for community
plugins. Keep GitHub as the canonical source repo, then publish the plugin to
ClawHub so users can install it through OpenClaw's normal plugin flow.

## Current Package

- package: `@ferminquant/openclaw-releaseops`
- source repo: `https://github.com/ferminquant/openclaw-releaseops`
- plugin id: `releaseops`
- first tool: `releaseops_failed_deploy_summary`
- current version: `0.1.1`
- channel: `community`
- source commit: `1401891a3ead69898d933cf7ff3ffeda165e5d51`
- latest release id: `rd7062dnctjn3jpxdna7z3vzxn87dnq1`
- scan status at publish time: `pending`
- install command:

```bash
openclaw plugins install clawhub:@ferminquant/openclaw-releaseops
```

## Dry Run

Use the latest ClawHub CLI for package commands:

```bash
npx -y clawhub@latest package publish ferminquant/openclaw-releaseops --dry-run --json
```

Current status:

- GitHub-source dry-run passed at commit
  `1401891a3ead69898d933cf7ff3ffeda165e5d51`
- package family: `code-plugin`
- package name: `@ferminquant/openclaw-releaseops`
- version: `0.1.1`

## Publish

The package was published successfully. For a future version, after the dry-run
is clean and ClawHub auth is configured:

```bash
npx -y clawhub@latest package publish ferminquant/openclaw-releaseops
```

If the CLI reports `Not logged in`, run:

```bash
npx -y clawhub@latest login
```

Then rerun the publish command.

## Verify

```bash
npx -y clawhub@latest package inspect @ferminquant/openclaw-releaseops --json
openclaw plugins search releaseops
```

Expected search result:

```text
@ferminquant/openclaw-releaseops  code-plugin | community | v0.1.1
Install: openclaw plugins install clawhub:@ferminquant/openclaw-releaseops
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
