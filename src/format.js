export function formatFailedDeploySummary(summary) {
  const lines = [
    "# Failed Deploy Summary",
    "",
    `Repository: ${summary.repo}`,
    `Workflow: ${summary.workflowName ?? summary.workflowId ?? "unknown"}`,
    `Run: ${summary.runHtmlUrl ?? summary.runId}`,
    `Conclusion: ${summary.conclusion ?? "unknown"}`,
    `Branch: ${summary.branch ?? "unknown"}`,
    `Started: ${summary.startedAt ?? "unknown"}`,
    "",
    "## Failed Jobs",
  ];

  if (summary.failedJobs.length === 0) {
    lines.push("", "No failed jobs were found on the selected run.");
  }

  for (const job of summary.failedJobs) {
    lines.push("", `### ${job.name}`, `Status: ${job.status ?? "unknown"}`, `Conclusion: ${job.conclusion ?? "unknown"}`);

    if (job.failedSteps.length > 0) {
      lines.push("", "Failed steps:");
      for (const step of job.failedSteps) {
        lines.push(`- ${step.name} (${step.conclusion ?? "unknown"})`);
      }
    }

    if (job.logExcerpt.length > 0) {
      lines.push("", "Relevant log excerpt:", "", "```text", ...job.logExcerpt, "```");
    }
  }

  lines.push(
    "",
    "## Likely Cause",
    summary.likelyCause,
    "",
    "## Next Checks",
    ...summary.nextChecks.map((item) => `- ${item}`),
    "",
    "## Rollback Checklist Stub",
    ...summary.rollbackChecklist.map((item) => `- ${item}`),
  );

  return lines.join("\n");
}
