const DEFAULT_ERROR_PATTERNS = [
  /\berror\b/i,
  /\bfail(?:ed|ure)?\b/i,
  /\bexception\b/i,
  /\btimeout\b/i,
  /\btimed out\b/i,
  /\bunauthorized\b/i,
  /\bforbidden\b/i,
  /\bpermission\b/i,
  /\bnot found\b/i,
  /\bexit code\b/i,
  /^##\[error\]/i,
];

export function extractRelevantLogLines(logText, { maxLines = 40 } = {}) {
  const lines = String(logText ?? "")
    .split(/\r?\n/)
    .map((line) => sanitizeLogLine(line).trimEnd())
    .filter((line) => line.trim().length > 0);

  const filteredLines = removeGithubRunCommandBlocks(lines)
    .filter((line) => !isGithubLogNoise(line))
    .filter((line) => line.trim().length > 0);

  if (filteredLines.length === 0) {
    return [];
  }

  const matches = [];
  for (let index = 0; index < filteredLines.length; index += 1) {
    if (DEFAULT_ERROR_PATTERNS.some((pattern) => pattern.test(filteredLines[index]))) {
      matches.push(index);
    }
  }

  if (matches.length === 0) {
    return tail(filteredLines, maxLines);
  }

  const selected = new Set();
  for (const index of matches) {
    for (let offset = -2; offset <= 2; offset += 1) {
      const selectedIndex = index + offset;
      if (selectedIndex >= 0 && selectedIndex < filteredLines.length) {
        selected.add(selectedIndex);
      }
    }
  }

  return [...selected]
    .sort((a, b) => a - b)
    .map((index) => filteredLines[index])
    .slice(-maxLines);
}

function tail(values, count) {
  return values.slice(Math.max(0, values.length - count));
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

function sanitizeLogLine(value) {
  return redactSecrets(stripGithubTimestamp(stripAnsi(value)));
}

function stripGithubTimestamp(value) {
  return value.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\s+/, "");
}

function removeGithubRunCommandBlocks(lines) {
  const filtered = [];
  let inRunCommandBlock = false;

  for (const line of lines) {
    if (/^##\[group\]Run\b/.test(line)) {
      inRunCommandBlock = true;
      continue;
    }

    if (inRunCommandBlock) {
      if (/^##\[endgroup\]$/.test(line)) {
        inRunCommandBlock = false;
      }
      continue;
    }

    filtered.push(line);
  }

  return filtered;
}

function isGithubLogNoise(line) {
  return (
    /^##\[endgroup\]$/.test(line) ||
    /^shell:\s+/i.test(line) ||
    /^\[command\]/.test(line) ||
    /^Post job cleanup\.$/.test(line) ||
    /^git version \d+\./.test(line) ||
    /^Temporarily overriding HOME=/.test(line) ||
    /^Adding repository directory to the temporary git global config/.test(line) ||
    /^http\.https:\/\/github\.com\/\.extraheader/.test(line) ||
    /^Cleaning up orphan processes$/.test(line) ||
    /^##\[warning\]Node\.js \d+ actions are deprecated\./.test(line)
  );
}

function redactSecrets(value) {
  return value
    .replace(/\bgh[psoru]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, "[REDACTED_AWS_ACCESS_KEY]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}\b/gi, "Bearer [REDACTED]")
    .replace(
      /\b(token|secret|password|api[_-]?key)\s*=\s*([^\s"'`]+|"[^"]*"|'[^']*')/gi,
      "$1=[REDACTED]",
    );
}
