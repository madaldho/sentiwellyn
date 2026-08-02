# Agent integration

Sentiwellyn supports two agent-facing paths:

1. official DataHub Skills for catalog workflows;
2. the official DataHub MCP server for metadata tools.

The public web deployment currently runs on deterministic fixtures. These instructions configure a real DataHub connection locally or in an agent client; they do not imply that the public deployment has Cloud credentials.

## DataHub Skills

The official skills are vendored under `.agents/skills/` for Codex-compatible agents. They were installed with:

```bash
npx skills add datahub-project/datahub-skills -a codex
```

Other supported agent targets documented by the installer include:

```bash
npx skills add datahub-project/datahub-skills -a cursor
npx skills add datahub-project/datahub-skills -a github-copilot
npx skills add datahub-project/datahub-skills -a gemini-cli
npx skills add datahub-project/datahub-skills -a windsurf
```

Installed capabilities include setup, catalog search, lineage, enrichment, quality, connector planning, and connector review.

## DataHub MCP server

### Claude Code — local/self-hosted connection

```bash
claude mcp add datahub \
  -e DATAHUB_GMS_URL="<your-datahub-url>" \
  -e DATAHUB_GMS_TOKEN="<your-datahub-token>" \
  -- uvx mcp-server-datahub@latest
```

### Claude Code — managed OAuth endpoint

```bash
claude mcp add --transport http datahub https://mcp.datahub.com/mcp
```

### Generic stdio MCP client

Use this shape and substitute environment variables locally:

```json
{
  "mcpServers": {
    "datahub": {
      "command": "uvx",
      "args": ["mcp-server-datahub@latest"],
      "env": {
        "DATAHUB_GMS_URL": "<your-datahub-url>",
        "DATAHUB_GMS_TOKEN": "<your-datahub-token>",
        "TOOLS_IS_MUTATION_ENABLED": "false"
      }
    }
  }
}
```

Never commit a populated version of this object. The repository contains `config/mcp.datahub.example.json` with placeholders only.

### Remote HTTP endpoints

Official documented endpoints:

- universal managed endpoint: `https://mcp.datahub.com/mcp`
- tenant endpoint: `https://<tenant>.acryl.io/integrations/ai/mcp/`
- self-hosted GMS endpoint: `http://<gms-host>:8080/mcp`

## Tools used by Sentiwellyn

Read path:

- `search`
- `get_entities`
- `list_schema_fields`
- `get_lineage`
- `get_lineage_paths_between`
- `search_documents`
- `grep_documents`
- `get_dataset_queries`

Candidate write path, only after approval:

- `add_owners` / `remove_owners`
- `add_tags` / `remove_tags`
- `update_description`
- `set_domains` / `remove_domains`
- `add_structured_properties` / `remove_structured_properties`
- `save_document`

The full tool parameter schemas are discovered from the connected MCP server at runtime. This project does not hardcode undocumented schemas.

## Mutation policy

The official MCP server disables mutations by default. Sentiwellyn keeps that default:

```dotenv
TOOLS_IS_MUTATION_ENABLED=false
DATAHUB_ALLOW_MUTATIONS=false
```

A live write requires all of these conditions:

1. a real DataHub workspace read succeeds;
2. an entity and current field value are captured;
3. evidence and downstream impact are recorded;
4. a human explicitly approves the exact change;
5. mutation tooling is enabled for the service account;
6. Sentiwellyn reads the entity back;
7. only a matching read-back produces `verified` status.

## Agent Context Kit

Python installation:

```bash
pip install datahub-agent-context
```

Read-only LangChain setup:

```python
from datahub.sdk.main_client import DataHubClient
from datahub_agent_context.langchain_tools import build_langchain_tools

client = DataHubClient.from_env()
tools = build_langchain_tools(client, include_mutations=False)
```

Cloud chat tools can be added with `build_langchain_cloud_tools` where supported by the connected DataHub environment.

## Any agent can use the HTTP contract

Agents without an MCP client can call the deployed Next.js API:

```bash
curl -sS https://6j4biq89.insforge.site/api/health
curl -sS https://6j4biq89.insforge.site/api/scan
```

Today this returns demo fixture data. Future agent endpoints will expose proposal and approval operations without exposing DataHub credentials to the caller.

## Connection verification

Do not infer readiness from a token existing in an environment file. Verify:

```bash
curl -sS http://localhost:3000/api/health
```

Expected states:

- demo: HTTP 200, `status=ok`, `cloud.live=false`;
- Cloud config missing: HTTP 503;
- Cloud config valid but adapter unverified: HTTP 503 health and HTTP 501 scan;
- Cloud live: only after a real entity read is shown with its URN and source.
