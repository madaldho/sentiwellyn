# DataHub Sentinel — Prompt Stitch Final

## Cara memakai

1. Buka Stitch.
2. Tempel `MASTER PROMPT` terlebih dahulu.
3. Generate layar satu per satu memakai prompt di bawah.
4. Untuk setiap layar, minta desktop 1440×900 dan responsive mobile 390×844.
5. Export hasil desain ke folder:

`/Users/madaldho/Proyek/Hackathon/datahub-sentinel/design/`

6. Gunakan nama file yang sudah ditentukan. Jangan masukkan token, URL workspace nyata, atau data pribadi ke prompt/design.

## MASTER PROMPT

```text
Design a polished desktop-first web application called “DataHub Sentinel”, a proactive data reliability agent for DataHub. The product helps data teams scan metadata, understand evidence-backed risk, review proposed fixes, approve safe write-back, and read generated runbooks.

Audience: data engineers and analytics engineers. The visual quality should feel like Linear + Vercel + Datadog: calm, precise, premium, technical, and trustworthy — not a generic AI chat app.

Visual system:
- Dark theme as default.
- Background: #080D18 and #0F172A.
- Surface: #111C2E and #172338.
- Border: #24344D.
- Primary: electric blue #60A5FA.
- Success: emerald #34D399.
- Warning: amber #FBBF24.
- Critical: red #F87171.
- Text: #F8FAFC; muted text #94A3B8.
- Use Inter for UI and JetBrains Mono for URNs, IDs, code, and evidence snippets.
- 8px spacing system, 14px base text, generous but dense data layout.
- Rounded corners 12px, subtle borders, no glassmorphism overload, no huge gradients.
- Use a small shield + connected graph-node mark for Sentinel.

Product rules visible in the interface:
- Always show a mode badge: “LIVE DATAHUB CLOUD” or “DEMO MODE”.
- Never present a mutation as successful before verification.
- Show evidence and citation IDs near every recommendation.
- Every dangerous action requires a clear confirmation state.

Navigation:
- Overview
- Scan & Risks
- Proposed Fixes
- Runbooks
- Citation Trail
- Settings

Use realistic but clearly synthetic example names such as `analytics.customer_orders` and URNs containing `example`. Do not use real credentials or personal data.
```

## 1. Overview dashboard

```text
Using the DataHub Sentinel master visual system, design the Overview dashboard at 1440x900.

Top navigation: Sentinel logo, workspace selector “Demo Workspace”, LIVE/DEMO badge, last scan timestamp, user menu.

Hero title: “Data reliability, before it becomes an incident.” Subtitle: “Evidence-backed risk detection and safe metadata remediation.” Primary action “Run scan”; secondary action “Open chat agent”.

Show four metric cards:
- Health score 78/100, +12 from previous scan.
- Entities scanned 128.
- High-risk entities 7.
- Pending approvals 3.

Main content:
- Large line chart “Health trend” with three scan points and an explicit “Fixture history” note in DEMO MODE.
- Risk distribution bar: Critical, High, Medium, Low.
- At-risk entities table with entity, health, risk, impact, top reason, status, and “View evidence”.
- Right rail “Agent activity” showing scan, proposal, approval, and verification events.

Include loading, empty, and error variants as small adjacent artboards. Include a compact mobile layout at 390x844.
Export reference as `design/dashboard-main.png`.
```

## 2. Scan and risks

```text
Design the Scan & Risks page at 1440x900 for DataHub Sentinel.

Header: breadcrumb, scan selector, mode badge, “Run new scan” button.
Toolbar: search entity, domain filter, severity filter, “Only with downstream impact”, sort by risk.

Main table/list columns:
- Severity
- Entity
- Health
- Risk estimate
- Downstream impact
- Primary evidence
- Recommendation
- Status

Use three visible cards/rows:
1. High: analytics.customer_orders, missing owner, 3 downstream dashboards, risk estimate 82.
2. Medium: analytics.order_events, incomplete description, schema evidence, risk estimate 64.
3. Low: analytics.products, stale tag, risk estimate 38.

Each item has “View details” and “Create proposal”. Add a right-side detail drawer state for the selected entity showing schema, lineage mini-graph, owners, tags, and evidence citations.

Clearly label the number as “risk estimate”, not scientific probability. Include loading, no-results, API-error, and DEMO MODE states.
Export reference as `design/scan-results.png`.
```

## 3. Proposal review and approval

```text
Design the most important safety screen: Proposed Fix detail at 1440x900.

Title: “Review proposed fix”. Show a prominent amber notice: “No change has been written to DataHub.”

Left column:
- Entity name and URN.
- Issue: Missing owner.
- Before/after metadata diff.
- Downstream impact summary.

Right column:
- Recommendation: “Assign owner based on lineage evidence”.
- Confidence indicator 72% with explanation, not a fake precision chart.
- Citation cards: source type, facts used, link to entity/lineage.
- Generated runbook preview.
- Buttons: “Reject”, “Approve and apply”, “Open in DataHub”. The apply button must include a confirmation modal state.

After-apply success state must say:
“Applied, then verified in DataHub Cloud”
and show mutation ID, verification timestamp, and “View citation”.
Also design failed mutation and rejected states.
Export reference as `design/proposal-review.png`.
```

## 4. Runbook viewer

```text
Design a Runbooks page at 1440x900 with a 260px left sidebar and document viewer.

Sidebar: search runbooks, status filters, list of runbooks with severity dots and last updated time.

Main document:
- “Runbook: analytics.customer_orders — Missing owner”
- Condition
- Why this is risky
- Evidence with clickable citation IDs
- Recommended action
- Approval and application history
- Verification result
- Revert guidance

Use a documentation style similar to Notion/Linear docs but with the Sentinel dark system. Add “Saved to DataHub” or “Local demo only” status explicitly. Include print/export and “Open entity in DataHub” actions.
Export reference as `design/runbook-viewer.png`.
```

## 5. Citation trail

```text
Design a Citation Trail audit page at 1440x900.

Header: “Every recommendation has evidence.” Include filters for entity, source type, action, and outcome.

Use a vertical timeline with entries:
- Scan read schema fields.
- Lineage returned 3 downstream assets.
- Proposal inferred missing owner from upstream ownership pattern.
- Human approved proposal.
- Mutation applied.
- Read-back verification passed.

Each entry displays timestamp, event type, entity URN, source facts, confidence/evidence quality, request ID, and links. Use monospaced IDs and a clear distinction between “proposed”, “applied”, and “verified”.
Include empty, loading, and error states.
Export reference as `design/citation-trail.png`.
```

## 6. Chat agent panel

```text
Design a Chat Agent panel/page for DataHub Sentinel at 1440x900, integrated with the dashboard rather than looking like a standalone chatbot.

Left side: conversation with messages:
User: “Scan customer_orders dan cari risiko minggu ini.”
Agent: concise risk summary with entity, health, risk estimate, downstream impact, and citation links.
User: “Buat proposalnya, jangan terapkan.”
Agent: proposal card with “Review proposal” action.

Right side: context panel showing current entity, lineage mini-graph, citations, and pending approval state.

Add input composer, command suggestions, mode badge, and a prominent safety rule: “Agent can propose changes. Nothing is written without approval.”
Include connection status for “Sentinel API”, “DataHub Cloud”, and optional “Hermes/OpenClaw”. Do not imply a gateway is connected unless the status is explicitly configured.
Export reference as `design/chat-agent.png`.
```

## 7. Settings and connection states

```text
Design a Settings page at 1440x900 for DataHub Sentinel.

Sections:
- DataHub connection: URL masked, token masked, Test connection button, read/write permission indicators.
- Mode: Demo or DataHub Cloud, with explanation of each.
- Safety: mutations disabled by default, require approval toggle, allowed mutation types.
- Agent: model name, fallback/template mode, max tool steps.
- Integrations: Hermes/OpenClaw MCP status, local endpoint, test button.
- Audit: citation retention and export.

Never show actual secrets. Include states for connected, missing credentials, permission denied, timeout, and successful read/write/read-back verification.
Export reference as `design/settings.png`.
```

## 8. Design tokens and implementation handoff

```text
Create a final design-system board for DataHub Sentinel containing color tokens, typography, spacing, button variants, badges, severity indicators, table rows, citation cards, modal confirmation, loading skeletons, empty states, and error states.

Include component names that map directly to a TypeScript implementation:
AppShell, ModeBadge, MetricCard, RiskBadge, EntityTable, EvidenceCard, CitationChip, LineageMiniGraph, ProposalDiff, ApprovalModal, VerificationBanner, RunbookViewer, ChatPanel, ConnectionStatus.

Export reference as `design/design-system.png`.
```

## Daftar output Stitch

```text
design/
├── README.md
├── dashboard-main.png
├── scan-results.png
├── proposal-review.png
├── runbook-viewer.png
├── citation-trail.png
├── chat-agent.png
├── settings.png
└── design-system.png
```

PNG hanya referensi visual. Implementasi final tetap harus diuji di browser dan tidak dianggap selesai hanya karena asset desain sudah ada.
