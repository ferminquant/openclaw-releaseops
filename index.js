import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { summarizeFailedDeploy } from "./src/github-actions.js";
import { formatFailedDeploySummary } from "./src/format.js";

const parameters = {
  type: "object",
  additionalProperties: false,
  properties: {
    repo: {
      type: "string",
      description: "GitHub repository in owner/name form. Uses plugin config defaultRepo when omitted.",
    },
    workflow: {
      type: "string",
      description: "Workflow id or workflow file name. Uses plugin config defaultWorkflow when omitted.",
    },
    runId: {
      type: "number",
      description: "Specific GitHub Actions run id. When omitted, the latest failed matching run is used.",
    },
    branch: {
      type: "string",
      description: "Branch filter for latest failed run lookup. Uses plugin config defaultBranch when omitted.",
    },
    includeLogExcerpt: {
      type: "boolean",
      description: "Whether to fetch and include relevant log excerpts. Defaults to true.",
    },
    logLines: {
      type: "number",
      minimum: 10,
      maximum: 120,
      description: "Maximum relevant log lines to include. Defaults to 40.",
    },
  },
};

export default definePluginEntry({
  id: "releaseops",
  name: "ReleaseOps",
  description: "Read-only release and deploy triage tools.",
  register(api) {
    api.registerTool(
      {
        name: "releaseops_failed_deploy_summary",
        description:
          "Summarize the latest failed GitHub Actions deploy run, including failed jobs, failed steps, log excerpts, next checks, and rollback checklist hints.",
        parameters,
        async execute(_id, params) {
          const summary = await summarizeFailedDeploy({
            params,
            config: api.pluginConfig ?? {},
            env: process.env,
            fetchImpl: fetch,
          });

          return {
            content: [
              {
                type: "text",
                text: formatFailedDeploySummary(summary),
              },
            ],
          };
        },
      },
      { optional: true },
    );
  },
});
