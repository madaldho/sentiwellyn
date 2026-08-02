# Sentiwellyn

Evidence-backed data reliability agent for DataHub.

**Live demo:** https://6j4biq89.insforge.site  
**VPS live backend:** http://194.113.74.21:3000  
**Source:** https://github.com/madaldho/sentiwellyn  
**Challenge:** Agents That Do Real Work  
**License:** Apache-2.0

Sentiwellyn turns DataHub metadata into an investigation queue: which entities are risky, why they are risky, what a safe metadata change would look like, and which evidence supports that change. It never presents a mutation as successful until a read-back verifies it.

## Why it exists

Metadata reliability incidents rarely start as dramatic failures. They start as small gaps: a heavily used dataset loses its owner, a schema evolves faster than its description, a governance tag goes stale, or a critical downstream dashboard depends on an undocumented field.

Sentiwellyn makes those gaps operational. It combines metadata context, a transparent rule-based risk estimate, citation-backed proposals, human approval, generated runbooks, and a verification trail.

## What works today

The app supports two honest runtime modes:

- `DEMO · FIXTURES` for public, credential-free judging and deterministic UI review.
- `LIVE · DATAHUB OSS` for the hackathon VPS, reading a real self-hosted DataHub GMS and allowing approval-gated description mutations only after server-side opt-in.

Current live backend status:

- DataHub OSS quickstart runs on the VPS (`GMS :8080`, frontend `:9002`).
- The `showcase-ecommerce` DataHub datapack is loaded.
- `/api/health` and `/api/scan` use the DataHub GraphQL adapter in live mode.
- `/api/approve` executes a guarded mutation only when the request includes `approved: true`, `DATAHUB_ALLOW_MUTATIONS=true`, and read-back confirms the new description.

User-facing features:

- overview control room with health trend and risk distribution;
- search, severity filtering, status filtering, and live scans;
- evidence review with citation IDs and entity URNs;
- approval-gated proposal workflow;
- runbook drafts and citation ledger;
- operator chat drawer with connection status;
- workspace selector, account menu, and persistent dark/light themes;
- responsive layout and keyboard focus states;
- `/api/health`, `/api/scan`, and `/api/approve` server routes;
- tested DataHub Cloud/self-hosted configuration and GraphQL transport boundaries.

## DataHub integration

The repository includes official DataHub Skills under `.agents/skills/`, installed from [`datahub-project/datahub-skills`](https://github.com/datahub-project/datahub-skills). This supports Codex-compatible agents and documents catalog search, lineage, enrichment, quality, setup, and connector workflows.

Sentiwellyn uses a server-side DataHub GraphQL adapter for live reads and guarded write-back. The same repo also includes MCP and Agent Context Kit templates so agents can connect through official DataHub tooling when available. Mutation tools remain disabled by default in templates and require explicit opt-in.

### Add DataHub MCP to an agent

Claude Code, self-hosted DataHub:

```bash
claude mcp add datahub \
  -e DATAHUB_GMS_URL="<your-datahub-url>" \
  -e DATAHUB_GMS_TOKEN="<your-datahub-token>" \
  -- uvx mcp-server-datahub@latest
```

Claude Code, managed OAuth endpoint:

```bash
claude mcp add --transport http datahub https://mcp.datahub.com/mcp
```

Install DataHub Skills for a supported coding agent:

```bash
npx skills add datahub-project/datahub-skills -a codex
# Other supported values include cursor, github-copilot, gemini-cli, and windsurf.
```

Agent Context Kit:

```bash
pip install datahub-agent-context
```

```python
from datahub.sdk.main_client import DataHubClient
from datahub_agent_context.langchain_tools import build_langchain_tools

client = DataHubClient.from_env()
tools = build_langchain_tools(client, include_mutations=False)
```

See [`docs/AGENT-INTEGRATION.md`](docs/AGENT-INTEGRATION.md) for client configurations and the safety contract.

## Architecture

```text
Browser
  └─ Next.js UI
      ├─ GET /api/health
      ├─ GET /api/scan
      ├─ POST /api/approve
      └─ DataHubAdapter boundary
          ├─ Demo fixtures (safe fallback)
          └─ DataHub OSS / Cloud GraphQL
              ├─ metadata reads
              ├─ evidence + citation log
              ├─ proposal
              ├─ human approval
              ├─ guarded updateDescription mutation
              └─ read-back verification

VPS
  ├─ Next.js production app (GitHub-synced)
  └─ DataHub OSS quickstart
      ├─ GMS :8080
      ├─ frontend :9002
      └─ showcase-ecommerce datapack

InsForge
  └─ linked project + Vercel-backed frontend deployment
```

Risk scoring and proposal generation are shared application logic. Demo mode is not a separate UI with invented success states.

## Local setup

Requirements:

- Node.js 24 (CI uses Node 24)
- npm
- no Docker required for demo mode

```bash
git clone <public-repository-url>
cd sentiwellyn
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

Safe default:

```dotenv
DATAHUB_MODE=demo
DATAHUB_ALLOW_MUTATIONS=false
```

For live DataHub OSS on the hackathon VPS, keep values in `.env.local` and never commit secrets:

```dotenv
DATAHUB_MODE=cloud
DATAHUB_GMS_URL=http://194.113.74.21:8080
DATAHUB_ALLOW_MUTATIONS=true
```

For DataHub Cloud, use:

```dotenv
DATAHUB_MODE=cloud
DATAHUB_CLOUD_URL=https://your-workspace.example
DATAHUB_CLOUD_TOKEN=your-local-token
DATAHUB_ALLOW_MUTATIONS=false
```

Restart the server after changing environment variables. A live claim requires a successful entity read. A write-back claim additionally requires an approved mutation and a successful read-back.

## Verify the build

```bash
npm test
npm run typecheck
npm run build
```

Current verified baseline:

- 5 test files;
- 18 tests;
- TypeScript no-emit check;
- production Next.js build;
- DESIGN.md lint: 0 errors, 0 warnings;
- `/api/approve` is included in the production route set;
- DataHub OSS is running on the VPS and the `showcase-ecommerce` datapack has been loaded.

## Sample outputs

The [`examples/`](examples/) directory contains a risk report, proposal, citation, and runbook generated from synthetic demo metadata. These let reviewers evaluate the output contract without running the application.

## Safety model

- mutations disabled by default;
- credentials stay server-side;
- no arbitrary URL execution;
- every proposal names the entity, old value, proposed value, evidence, impact, and citation;
- approval and mutation are separate states;
- applied and verified are separate states;
- demo approval records a local decision and explicitly writes nothing to DataHub;
- live approval calls the guarded mutation route and is only marked verified after read-back;
- tokens are never returned by health or scan endpoints.

## Deployment

The source of truth is the public GitHub repository. The VPS deployment should pull from GitHub, install dependencies, build, and run with server-side live DataHub environment variables:

```bash
git clone https://github.com/madaldho/sentiwellyn.git
cd sentiwellyn
npm ci
DATAHUB_MODE=cloud \
DATAHUB_GMS_URL=http://127.0.0.1:8080 \
DATAHUB_ALLOW_MUTATIONS=true \
npm run build
```

The project is also linked to InsForge project `sentiwellyn` and can be deployed through the InsForge CLI:

```bash
npx @insforge/cli deployments deploy .
```

Production URLs:

- InsForge: https://6j4biq89.insforge.site
- VPS app: http://194.113.74.21:3000
- VPS DataHub frontend: http://194.113.74.21:9002

## Hackathon submission checklist

- [x] Working public URL
- [x] Apache-2.0 `LICENSE`
- [x] English project description and setup instructions
- [x] Sample outputs
- [x] Official DataHub Skills included
- [x] DataHub MCP / Agent Context setup documented
- [x] Public demo works without credentials
- [x] Public source repository URL added to this README and Devpost
- [x] Live DataHub read path implemented against the VPS DataHub OSS graph
- [x] One approved metadata mutation route implemented with read-back verification
- [ ] Public demo video under three minutes
- [ ] Devpost submission completed before August 10, 2026 at 5:00 PM EDT

The public demo must remain free and available through the end of judging on August 31, 2026 at 5:00 PM ET.

## Design

The visual system follows a terminal control-room model: Geist typography, monochrome surfaces, one functional orange signal, one positive green signal, and a single inverted focal card. Icons are one SVG set using `currentColor` and a uniform 1.5px stroke. Dark and light themes preserve the same figure/ground hierarchy.

## License

Apache License 2.0. See [`LICENSE`](LICENSE).

## Acknowledgements

Built with DataHub, Next.js, React, TypeScript, Vitest, InsForge, and the official DataHub Skills. Interface-polish guidance came from the open-source `make-interfaces-feel-better` skill; the implementation and product composition are original to this project.

Pre-existing third-party frameworks, libraries, and open-source skills are used under their respective licenses. Project application code and submission materials were created during the hackathon submission period.
