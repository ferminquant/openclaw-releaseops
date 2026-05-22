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
    .map((line) => stripAnsi(line).trimEnd())
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  const matches = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (DEFAULT_ERROR_PATTERNS.some((pattern) => pattern.test(lines[index]))) {
      matches.push(index);
    }
  }

  if (matches.length === 0) {
    return tail(lines, maxLines);
  }

  const selected = new Set();
  for (const index of matches) {
    for (let offset = -2; offset <= 3; offset += 1) {
      const selectedIndex = index + offset;
      if (selectedIndex >= 0 && selectedIndex < lines.length) {
        selected.add(selectedIndex);
      }
    }
  }

  return [...selected]
    .sort((a, b) => a - b)
    .map((index) => lines[index])
    .slice(-maxLines);
}

function tail(values, count) {
  return values.slice(Math.max(0, values.length - count));
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}
