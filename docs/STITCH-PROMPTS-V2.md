# DataHub Sentinel — Stitch Prompt Pack v2 (Redesign)

Versi ini menggantikan `STITCH-PROMPTS.md`. Perbedaan utama:

- Warna diselaraskan dengan `DESIGN.md` yang sudah lint-clean (0 error, 0 warning), bukan palet lama.
- Berisi instruksi eksplisit untuk memperbaiki 6 cacat visual yang ditemukan pada implementasi berjalan.
- Memakai data fixture yang benar-benar dipakai aplikasi, supaya desain dan kode tidak berbeda angka.

## Cara pakai

1. Buka Stitch.
2. Tempel `MASTER PROMPT` dulu, satu kali, di awal sesi.
3. Generate layar satu per satu memakai prompt bernomor di bawah. Jangan gabung semua jadi satu request.
4. Untuk tiap layar minta dua ukuran: desktop `1440x900` dan mobile `390x844`.
5. Export hasilnya ke folder ini:

```
/Users/madaldho/Proyek/Hackathon/datahub-sentinel/design/
```

6. Pakai nama file yang tertulis di setiap prompt (`design/01-overview.png`, dst).
7. Jangan pernah memasukkan token, URL workspace asli, atau data pribadi ke prompt Stitch.

Setelah file ada di folder `design/`, bilang ke saya "desain sudah di design/", dan saya akan baca gambarnya lalu implementasikan.

## MASTER PROMPT

```text
You are designing a premium, desktop-first web application called "DataHub Sentinel" — a proactive data reliability agent for the DataHub metadata platform. It scans metadata, estimates risk with evidence, proposes safe metadata fixes, requires human approval, then verifies the write-back.

Audience: data engineers and analytics engineers who live in dense tooling all day.

Design target: the calm precision of Linear, the information density of Sentry and Datadog, the typographic restraint of Vercel. It must read as a professional operations control room. It must NOT look like a generic admin template, a marketing landing page, or an AI chatbot wrapper.

VISUAL SYSTEM — use these exact values:
- Canvas background: #080B12
- Sidebar background: #0B0F18
- Card surface: #101722
- Raised surface (controls, chips, dialogs): #141D2A
- Primary text: #F3F6FB
- Muted text: #91A0B5
- Metadata text: #617086 (only for small metadata, never body copy)
- Primary action (blue): #73B8FF with near-black text #07121C on filled buttons
- Evidence accent (cyan): #52DFC0
- Success / verified: #55D6A5
- Warning / needs review: #F3BD62
- High risk: #FF9B6B
- Critical / danger: #FF7D87

TYPOGRAPHY:
- UI and headings: DM Sans. Display size 3.5rem, weight 600, tight tracking -0.055em, line-height 1.02.
- Body: DM Sans 14px, line-height 1.6.
- Numbers, scores, URNs, IDs, timestamps, section kickers: JetBrains Mono, 10px uppercase for labels with 0.035em tracking.
- Never use mono for paragraphs.

SHAPE AND DEPTH:
- Radius: 6px controls, 8px compact interactive surfaces, 11px cards, full pill ONLY for mode/severity/status indicators.
- Depth comes from border contrast and small luminance steps, not heavy shadows.
- Cards: soft ambient shadow only. Dialogs: stronger shadow plus dimmed backdrop.
- No glassmorphism. No large decorative gradients. No neon glow.

SPACING:
- 4 / 8 / 13 / 20 / 32 / 43px scale. Dense but never cramped. Data-heavy, calm, aligned to a strict grid.

PRODUCT RULES THAT MUST BE VISIBLE IN THE UI:
- A mode badge is always present: "DEMO · FIXTURES" (green-cyan) or "LIVE · DATAHUB CLOUD".
- Nothing is ever shown as written to DataHub until it has been verified by a read-back.
- Every recommendation shows its evidence source and a citation ID in mono type.
- Severity is never communicated by color alone — always pair color with a text label and a number.
- Destructive or write actions always have an explicit confirmation state.

NAVIGATION (left rail, in this order):
Overview, Scan & Risks, Proposed Fixes, Runbooks, Citation Trail, Settings.

SAMPLE DATA — use exactly these values so design matches the running app:
- Health score 78/100, up 12 from previous scan
- Entities scanned 128
- Pending approvals 3
- Health trend: Jul 23 = 62, Jul 25 = 67, Jul 27 = 73, Today = 78
- Risk distribution across 128 entities: Critical 8 (6%), High 19 (15%), Medium 42 (33%), Low 59 (46%)
- analytics.customer_orders — domain Commerce — health 61/100 — risk estimate 82 High — impact "3 downstream dashboards" — evidence lineage — status needs review — citation CIT-demo-001
- analytics.order_events — domain Commerce — health 69/100 — risk estimate 64 Medium — impact "1 dbt model, 2 reports" — evidence schema — status proposed — citation CIT-demo-002
- analytics.products — domain Catalog — health 84/100 — risk estimate 38 Low — impact "1 dashboard" — evidence freshness — status needs review — citation CIT-demo-003
- analytics.customer_profiles — domain Customer — health 73/100 — risk estimate 57 Medium — impact "2 ML features" — evidence ownership — status verified

Always call the number a "risk estimate", never a probability or a prediction from a trained model.
Use synthetic URNs in the form urn:li:dataset:(example,analytics.customer_orders,PROD).

SIX DEFECTS IN THE CURRENT BUILD — your redesign must fix all of them:
1. The sidebar background stops halfway down the page and floats. Make the left rail a true full-height rail, edge to edge, with its border running the entire viewport height.
2. KPI cards have decorative blobs that get hard-clipped at the card edge into visible squares. Either remove the decoration entirely or make it fade smoothly inside the card bounds.
3. Cards in a row are stretched to equal height, leaving 60px+ of dead space at the bottom of the shorter card. Balance content per card, or let cards size to content and align to the top of the row.
4. The result-count label sits flush against the filter dropdown. Give toolbar items consistent breathing room and a clear alignment rhythm.
5. "Clear filters" appears active even when no filter is applied, and it is not aligned with the filter toolbar. Show it disabled or hidden until a filter is active, and align it with the toolbar row.
6. Status dot colors are inconsistent between the approval queue and the table. Define one single status color mapping and apply it everywhere: needs review = #F3BD62, proposed = #73B8FF, verified = #55D6A5.
```

## 1. Overview (Control Room)

```text
Using the DataHub Sentinel master system, design the Overview screen at 1440x900.

Left rail, full viewport height: Sentinel mark (small shield formed from connected graph nodes), workspace switcher card "Demo Workspace / Data platform", the six nav items with Overview active, then a divider and a "System posture" block reading "Protected — last scan 11:20 AM · read-only".

Top bar: breadcrumb "Workspace / Overview", the "DEMO · FIXTURES" pill, and a user avatar.

Content, in priority order top to bottom:

1. A compact header band, not a marketing hero. Mono kicker "DATA RELIABILITY CONTROL PLANE", headline "Protect your data before it breaks." with only the second line in a restrained blue-to-cyan gradient, one supporting sentence, and two actions on the same optical line: "Run scan" (filled blue) and "Open chat agent" (outlined). Keep total header height under 200px so the operational content stays above the fold.

2. Attention row, two cards of equal visual weight but content-balanced, no dead space:
   - "Attention required" card with an amber-tinted edge: counter 01/01, mono label "HIGHEST PREDICTED RISK", entity analytics.customer_orders, reason "Missing owner on a highly-used dataset", a large mono 82 labeled "risk estimate", a HIGH pill, then a metadata strip "lineage evidence · 84% confidence · 3 downstream dashboards" and an "Inspect evidence" link.
   - "Approval queue" card with a count chip of 3 and subtitle "Safe actions waiting for a human decision". Three rows, each with a status dot, entity name, mono citation ID and status text, and a chevron. Footer link "Open proposal queue".

3. Four KPI cards, no clipped decoration: Health score 78/100 with "+12 from previous scan" in success color; Entities scanned 128 with "Same engine in demo / cloud"; High-risk entities with "Review evidence first"; Pending approvals 3 with "No automatic mutation".

4. Two analysis cards side by side, aligned to top, sized to content:
   - "Health trend": four bars 62 / 67 / 73 / 78 labeled Jul 23, Jul 25, Jul 27, Today, with the current value called out as "78 CURRENT", even gutters on both sides of the plot area, and a legend "health score · 4 verified snapshots".
   - "Risk distribution": four rows with label, count, percent, and a proportional track. Critical 8 · 6%, High 19 · 15%, Medium 42 · 33%, Low 59 · 46%.

5. "Investigation queue" table card: mono kicker, heading "At-risk entities", helper line "Inspect evidence before creating a guarded proposal." A single aligned toolbar row containing search field, severity select, status select, result count "4 results", and a "Clear filters" control that is visibly disabled when no filter is active. Columns: ENTITY (with domain beneath), HEALTH, RISK ESTIMATE, IMPACT, EVIDENCE, STATUS, and a right-aligned "Review" action. Use the four sample entities exactly as given.

Also produce small adjacent artboards for: loading skeleton, empty state after filtering to zero results, and API error state.
Then produce the 390x844 mobile layout: icon-only rail or top bar, stacked cards, KPI in two columns, table converted to stacked rows where the Review action stays reachable and nothing overflows horizontally.

Export as design/01-overview.png
```

## 2. Scan & Risks

```text
Design the "Scan & Risks" screen at 1440x900 in the DataHub Sentinel system.

Header: breadcrumb "Workspace / Scan & Risks", scan selector showing "Scan 2026-07-29 11:20", mode badge, and "Run new scan" as the filled primary action.

Toolbar, one aligned row with even spacing: search entity or domain, domain filter, severity filter, a toggle "Only with downstream impact", and sort by risk estimate. Show the active-filter state properly: when a filter is applied, display a removable filter chip and enable "Clear filters".

Main list: dense rows, one per entity, each row showing a severity indicator with both color and text, entity name plus URN in mono, health as a small ring or bar with the numeric value, risk estimate as a large mono number, downstream impact, primary evidence type, a one-line recommendation, and status. Row actions: "View details" and "Create proposal".

Use the four sample entities from the master prompt, ordered by risk estimate descending.

Then design the right-side detail drawer at 520px wide, opened for analytics.customer_orders, overlaying a dimmed canvas. Drawer contains: entity title and mono URN, tabs or sections for Schema, Lineage, Ownership, Evidence. Show a small lineage mini-graph with the entity in the center and 3 downstream dashboard nodes. Show evidence cards each with source type, the facts used, confidence, and a mono citation ID. Footer of the drawer: "Create proposal" primary and "Open in DataHub" secondary.

Include states: loading, no results, API error, and a "read-only token" notice.
Then the 390x844 mobile version where the drawer becomes a full-screen sheet.

Export as design/02-scan-risks.png
```

## 3. Proposal review and approval

```text
Design the most safety-critical screen: "Review proposed fix" at 1440x900.

At the very top of the content area, a prominent amber notice bar: "No change has been written to DataHub." It must be impossible to miss and must not look decorative.

Two-column body.

Left column:
- Entity analytics.customer_orders with mono URN urn:li:dataset:(example,analytics.customer_orders,PROD).
- Issue: "Missing owner".
- A metadata diff showing current state and proposed state clearly labeled "current" and "proposed", with the changed field highlighted. Removed value in danger tint, added value in success tint, both with text labels not just color.
- Downstream impact summary: 3 dashboards, listed by name.

Right column:
- Recommendation: "Assign owner based on lineage evidence".
- Confidence 84% shown as an honest bar with a one-sentence explanation of what drives it. No fake precision, no pie chart.
- Citation cards, each with source type, facts used, timestamp, and mono citation ID CIT-demo-001.
- Collapsed runbook preview with an expand affordance.
- Action row: "Reject" (secondary), "Approve and apply" (filled primary).

Then design these states as adjacent artboards:
a) Confirmation modal for "Approve and apply", listing exactly what will change, requiring an explicit confirm, with cancel as the calm default.
b) Applying / in-progress state.
c) Success state that reads "Applied, then verified in DataHub" showing mutation ID, verification timestamp, and a "View citation" link.
d) Failed mutation state with the API error surfaced and a retry path.
e) Rejected state with reason captured.
f) Demo-mode variant where the approve action is clearly labeled as a simulated demo action that writes nothing.

Then the 390x844 mobile layout with the diff stacked vertically and the notice bar pinned.

Export as design/03-proposal-review.png
```

## 4. Runbook viewer

```text
Design the "Runbooks" screen at 1440x900.

Three-zone layout: the app rail, a 300px runbook list, and a document reading pane.

Runbook list: search field, status filter chips, and list items each showing a severity dot, runbook title, entity, and last-updated time in mono. Four items, with the first selected.

Document pane, styled like Linear or Notion docs but in the Sentinel dark system, max reading width around 720px:
- Title "Runbook: analytics.customer_orders — Missing owner"
- A status strip showing either "Saved to DataHub" or "Local demo only", plus generated timestamp
- Sections: Condition detected, Why this is risky, Evidence (each fact with a clickable mono citation ID), Recommended action, Approval and application history, Verification result, Revert guidance
- Right-side sticky table of contents
- Header actions: "Open entity in DataHub", "Export", "Copy link"

Typography must be genuinely readable for long-form: comfortable line height, clear section rhythm, mono only for IDs, code, and URNs.

Include an empty state for "no runbooks yet" and a generating/streaming state.
Then the 390x844 mobile layout where the list collapses into a dropdown and the table of contents becomes a collapsible bar.

Export as design/04-runbook-viewer.png
```

## 5. Citation trail

```text
Design the "Citation Trail" audit screen at 1440x900.

Header: heading "Every recommendation has evidence." with a supporting line about auditability. Filters for entity, source type, action, and outcome, in one aligned toolbar.

Body: a vertical timeline with a clear spine. Six entries, newest first, each entry a card containing an event-type badge, mono timestamp, entity URN, the facts read or written, evidence quality or confidence, a mono request ID, and links:
1. Scan read schema fields
2. Lineage returned 3 downstream assets
3. Proposal inferred missing owner from upstream ownership pattern
4. Human approved proposal
5. Mutation applied
6. Read-back verification passed

Visually distinguish three lifecycle stages with distinct treatment plus text labels: proposed (blue), applied (amber until verified), verified (green). A reader must be able to tell at a glance which events actually changed DataHub and which only proposed something.

Add a compact right rail summarizing counts: reads, proposals, approvals, mutations, verifications.

Include empty, loading, and error states.
Then the 390x844 mobile layout with a condensed single-column timeline.

Export as design/05-citation-trail.png
```

## 6. Chat agent panel

```text
Design the Sentinel chat agent at 1440x900. It must feel like an operator console embedded in the product, not a standalone chatbot page.

Layout: app rail, conversation column, and a 380px context rail on the right.

Conversation, with structured agent replies rather than plain chat bubbles:
- User: "Scan customer_orders and find risk for this week."
- Agent: a structured result block with entity, health 61/100, risk estimate 82 High, impact 3 downstream dashboards, and inline mono citation chips.
- User: "Create the proposal, do not apply it."
- Agent: a proposal card showing the intended change, confidence, citation ID, and a "Review proposal" button.

Composer: input field, command suggestions such as /scan /risk /propose /runbook, attachment of an entity URN, and a persistent safety line: "Agent can propose changes. Nothing is written without approval."

Context rail: current entity, lineage mini-graph, active citations, pending approval count, and a connection status list for "Sentinel API", "DataHub Cloud", and "Hermes / OpenClaw bridge". Each connection shows one of: connected, not configured, error. Never render "connected" as the default state.

Include a streaming/thinking state and a tool-call trace that can be expanded to show which DataHub reads were performed.
Then the 390x844 mobile layout where the context rail becomes a bottom sheet.

Export as design/06-chat-agent.png
```

## 7. Settings and connection states

```text
Design the "Settings" screen at 1440x900 for DataHub Sentinel.

Sections as separate cards in a single scrollable column with a sticky section nav on the left of the content area:

1. DataHub connection: workspace URL shown masked, token shown masked as a fixed number of dots with a "Reveal" action that requires confirmation, a "Test connection" button, and separate read and write permission indicators.
2. Mode: a segmented control between "Demo — fixture data" and "DataHub Cloud — live metadata", each with one honest sentence about what it does and does not do.
3. Safety: mutations disabled by default, "require human approval" locked on, and a list of allowed mutation types with checkboxes.
4. Agent: model name, deterministic template fallback toggle, max tool steps.
5. Integrations: Hermes / OpenClaw MCP status, local endpoint, and a test button.
6. Audit: citation retention window and an export action.

Never display an actual secret value. Design these connection states as adjacent chips or inline banners: connected and verified, missing credentials, permission denied, network timeout, and read-only token detected.

Then the 390x844 mobile layout.

Export as design/07-settings.png
```

## 8. Design system board

```text
Create the DataHub Sentinel design-system board at 1600x1200.

Include, laid out as a reference sheet:
- Color tokens with hex values and their semantic role, including the required contrast note that metadata color #617086 must never be used for body text on #141D2A.
- Type scale specimens for display, heading, body, and mono label.
- Spacing and radius scale.
- Button variants: primary, primary hover, secondary, ghost, destructive, disabled.
- Mode badges: DEMO · FIXTURES and LIVE · DATAHUB CLOUD.
- Severity indicators: Critical, High, Medium, Low — each with color plus text plus number.
- One single status mapping applied consistently: needs review #F3BD62, proposed #73B8FF, verified #55D6A5.
- Table row anatomy, including hover and selected states.
- Evidence card and citation chip.
- Lineage mini-graph.
- Proposal diff block.
- Approval confirmation modal.
- Verification banner.
- Loading skeletons, empty states, error states.
- Focus-visible treatment for keyboard navigation on every interactive component.

Name each component exactly so it maps to the TypeScript implementation:
AppShell, SideRail, ModeBadge, MetricCard, AttentionCard, ApprovalQueue, RiskBadge, StatusDot, EntityTable, FilterToolbar, EvidenceCard, CitationChip, LineageMiniGraph, ProposalDiff, ApprovalModal, VerificationBanner, RunbookViewer, ChatPanel, ConnectionStatus.

Export as design/08-design-system.png
```

## Output yang diharapkan

```
design/
├── README.md
├── 01-overview.png
├── 02-scan-risks.png
├── 03-proposal-review.png
├── 04-runbook-viewer.png
├── 05-citation-trail.png
├── 06-chat-agent.png
├── 07-settings.png
└── 08-design-system.png
```

## Catatan penting

- Kalau Stitch membatasi panjang prompt, potong per bagian bernomor. Master prompt tetap harus dikirim lebih dulu.
- Kalau hasil Stitch terlihat seperti template admin generik, tambahkan satu baris di akhir prompt: `Increase information density and reduce decoration. This is an operations console, not a landing page.`
- PNG dari Stitch hanya referensi visual. Implementasi tetap harus lulus `npm test`, `npm run typecheck`, `npm run build`, dan verifikasi browser sebelum dianggap selesai.
- Prioritaskan layar 1, 2, dan 3. Tiga layar itu yang paling menentukan penilaian juri karena memuat evidence, approval, dan verifikasi.
