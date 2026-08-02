# DataHub Sentinel — Stitch Prompt Pack v3 (FINAL, siap salin)

File ini yang dipakai. `STITCH-PROMPTS.md` (v1) dan `STITCH-PROMPTS-V2.md` sudah usang.

Beda v3 dari v2:
- Menyerap kosakata visual nyata dari design system Linear dan Sentry (luminance layering, semi-transparent white border, weight 510, negative letter-spacing), bukan cuma daftar hex.
- Ada blok ANTI-SLOP eksplisit: daftar hal yang bikin desain terlihat AI-generated, ditulis sebagai larangan keras.
- Setiap prompt sudah mandiri. Kamu bisa salin satu blok tanpa perlu baca yang lain.

---

## CARA PAKAI (baca ini dulu, 1 menit)

1. Buka Stitch.
2. Salin **BLOK A (MASTER)** → kirim. Tunggu Stitch merespons.
3. Salin **BLOK B (ANTI-SLOP)** → kirim di pesan berikutnya. Ini yang bikin hasilnya tidak generik.
4. Baru generate layar satu per satu: **BLOK 1**, lalu **BLOK 2**, dst. Satu blok = satu request. Jangan digabung.
5. Tiap layar minta desktop `1440x900`. Kalau Stitch mau, minta juga mobile `390x844`.
6. Export PNG ke folder:

```
/Users/madaldho/Proyek/Hackathon/datahub-sentinel/design/
```

7. Nama file sudah ditulis di akhir tiap blok. Pakai nama itu persis.
8. Selesai? Bilang ke saya: **"desain sudah di design/"**. Saya baca gambarnya lalu implementasi ke kode.

**Kalau Stitch menolak karena prompt kepanjangan:** potong blok itu di batas paragraf, kirim bertahap, akhiri dengan `Now generate the screen.`

**Prioritas kalau waktumu terbatas:** BLOK 1, BLOK 3, BLOK 2. Tiga itu yang dinilai juri.

---

## BLOK A — MASTER PROMPT

```text
You are a senior product designer. We are designing a real production application, not a concept piece. Read this entire brief before generating anything.

PRODUCT
"DataHub Sentinel" — a proactive data reliability agent for the DataHub metadata platform. It continuously scans metadata, estimates risk with cited evidence, proposes safe metadata fixes, requires explicit human approval, applies the change, then verifies it with a read-back.

USER
Data engineers and analytics engineers. They spend all day in Linear, Sentry, Datadog, dbt, and a terminal. They are impatient with decoration and they distrust dashboards that look confident without showing evidence.

DESIGN TARGET
An operations control room. The reference standard is Linear's precision, Sentry's data density, and Vercel's typographic restraint. It must feel calm, engineered, and trustworthy.

It must NOT look like: a bootstrap admin template, a SaaS marketing landing page, an AI chatbot wrapper, a crypto dashboard, or a "futuristic" sci-fi HUD.

COLOR SYSTEM — use these exact values, no substitutions
Canvas (deepest, page background):     #080B12
Sidebar rail:                          #0B0F18
Card surface:                          #101722
Raised surface (chips, inputs, modals):#141D2A
Primary text:                          #F3F6FB
Muted text (supporting copy):          #91A0B5
Metadata text (tiny labels only):      #617086
Primary action blue:                   #73B8FF   (filled buttons use near-black text #07121C)
Evidence accent cyan:                  #52DFC0
Success / verified:                    #55D6A5
Warning / needs review:                #F3BD62
High risk:                             #FF9B6B
Critical / danger:                     #FF7D87

DEPTH MODEL — this is the most important visual rule
Do not use drop shadows to create hierarchy. On a near-black canvas, dark shadows are invisible and end up looking like blur.
Instead, build depth through two mechanisms only:
1. Luminance stepping. Each level up is a slightly lighter surface: #080B12 → #101722 → #141D2A. Nothing jumps two levels.
2. Hairline borders in semi-transparent white: rgba(255,255,255,0.06) as default, rgba(255,255,255,0.10) for emphasis or focus. Never use solid gray borders like #333 on dark surfaces.
Cards get a hairline border and at most a very soft ambient shadow. Only modals get a real shadow plus a dimmed backdrop.

TYPOGRAPHY
Interface font: DM Sans (or Inter if DM Sans is unavailable).
Monospace: JetBrains Mono.

Display / page headline: 3.5rem, weight 600, line-height 1.02, letter-spacing -0.055em.
Section heading: 1.4375rem, weight 600, line-height 1.2, letter-spacing -0.04em.
Body: 14px, weight 400, line-height 1.6.
Mono label / kicker: 10px, weight 600, uppercase, letter-spacing 0.035em.

Rules:
- Letter-spacing tightens as size grows and relaxes to normal below 16px. Large text must never have positive tracking.
- Monospace is reserved for numbers, scores, URNs, IDs, timestamps, and small uppercase section kickers. Never set a paragraph in monospace.
- Use at most three weights. Never go above 600.

SHAPE AND SPACING
Radius: 6px for controls, 8px for compact interactive surfaces, 11px for cards. Full pill radius ONLY for mode, severity, and status indicators.
Spacing scale: 4 / 8 / 13 / 20 / 32 / 43px. Dense but never cramped. Everything aligns to a strict grid; optical alignment matters more than equal pixel gaps.

PRODUCT RULES THAT MUST BE VISIBLE IN THE UI
1. A mode badge is always present and unambiguous: "DEMO · FIXTURES" or "LIVE · DATAHUB CLOUD".
2. Nothing is ever presented as written to DataHub until a read-back has verified it. "Applied" and "Verified" are two different states and must look different.
3. Every recommendation shows its evidence source and a citation ID in monospace, adjacent to the recommendation itself, not buried in a tooltip.
4. Severity is never communicated by color alone. Always pair color with a text label and a number.
5. Every write action has an explicit confirmation state, and cancel is the calm default.

NAVIGATION — left rail, this order
Overview, Scan & Risks, Proposed Fixes, Runbooks, Citation Trail, Settings.
Brand mark: a small shield formed from connected graph nodes. Keep it restrained, single color, no gradient badge.

SAMPLE DATA — use these exact values so the design matches the running application
Health score 78/100, up 12 from previous scan.
Entities scanned 128. Pending approvals 3.
Health trend: Jul 23 = 62, Jul 25 = 67, Jul 27 = 73, Today = 78.
Risk distribution across 128 entities: Critical 8 (6%), High 19 (15%), Medium 42 (33%), Low 59 (46%).

Entities:
- analytics.customer_orders | Commerce | health 61/100 | risk estimate 82 High | 3 downstream dashboards | evidence: lineage | needs review | CIT-demo-001
- analytics.order_events | Commerce | health 69/100 | risk estimate 64 Medium | 1 dbt model, 2 reports | evidence: schema | proposed | CIT-demo-002
- analytics.products | Catalog | health 84/100 | risk estimate 38 Low | 1 dashboard | evidence: freshness | needs review | CIT-demo-003
- analytics.customer_profiles | Customer | health 73/100 | risk estimate 57 Medium | 2 ML features | evidence: ownership | verified

URN format: urn:li:dataset:(example,analytics.customer_orders,PROD)

Always label the number as "risk estimate". Never call it a probability, a prediction, or a confidence from a trained model. It is a rule-and-evidence based estimate.

STATUS COLOR MAPPING — one mapping, applied identically everywhere in every screen
needs review = #F3BD62
proposed     = #73B8FF
verified     = #55D6A5

Acknowledge that you have read this brief, then wait for the next message before generating.
```

---

## BLOK B — ANTI-SLOP RULES

```text
Additional hard constraints. These exist because generated dashboard designs fail in predictable ways. Treat each as a rejection criterion.

BANNED OUTRIGHT
- Purple-to-pink or blue-to-purple background gradients. No gradient meshes, no blurred color orbs, no aurora blobs.
- Glassmorphism. No frosted translucent panels stacked over blurred shapes.
- Neon glow, outer glow, or bloom on text, borders, or cards.
- Decorative 3D renders, floating isometric illustrations, abstract spheres, generic network-globe graphics.
- Emoji used as interface iconography.
- Fake sparkle, star, or wand icons implying "AI magic".
- Rounded-everything. Pills are for status only. A card with a 24px radius reads as a consumer app, not an operations tool.
- Centered hero text with a giant headline and two centered buttons. This is an application, not a landing page.
- Oversized KPI numerals used to fill empty space.
- Placeholder lorem ipsum. Every string must be plausible product copy.
- Charts with no axis labels, no units, and no scale.
- More than one accent color competing for attention inside a single card.

REQUIRED INSTEAD
- Information density. A data engineer should be able to see the current risk posture and the next decision without scrolling. Fill the viewport with useful information, not padding.
- Left-aligned typography throughout. Center alignment only inside a small pill or a modal action row.
- Real numbers everywhere, taken from the sample data in the brief. No "1,234" placeholders.
- Every chart labeled: axis values, units, and what the series means.
- Text labels alongside every colored indicator.
- Visible interaction states. Show hover, focus-visible, selected, disabled, loading, empty, and error. A design without a focus ring is incomplete.
- Deliberate empty space that separates groups. Not decorative padding, not stretched cards.

CARD SIZING — a specific failure to avoid
Do not force cards in a row to equal height when their content differs. Equal-height stretching creates dead space at the bottom of the shorter card, which reads as unfinished. Either balance the content so the cards genuinely fill, or let each card size to its content and align them to the top of the row.

DECORATION INSIDE CARDS — another specific failure
If you add any decorative shape inside a card, it must be fully contained and fade out smoothly. A shape that is hard-clipped by the card edge produces a visible rectangular artifact. When in doubt, omit the decoration.

SELF-CHECK BEFORE YOU OUTPUT
Ask yourself these five questions and fix anything that fails:
1. Could this be mistaken for a generic admin dashboard template? If yes, increase density and remove decoration.
2. Is every colored element also labeled with text?
3. Is there any card with more than 40px of unexplained empty space at the bottom?
4. Does the highest-risk item and the next required human decision appear above the fold?
5. Is it visually obvious which items have actually changed DataHub versus which are only proposed?

Acknowledge, then wait for the screen request.
```

---

## BLOK 1 — Overview (Control Room)

```text
Design the "Overview" screen for DataHub Sentinel at 1440x900, following the master brief and the anti-slop rules.

LEFT RAIL — 248px wide, full viewport height, background #0B0F18, hairline right border rgba(255,255,255,0.06). The rail must run edge to edge from the top of the viewport to the bottom. It must not stop partway down the page and float.

Rail contents, top to bottom:
- Sentinel mark plus wordmark, small and restrained.
- Workspace switcher card on #141D2A: "Demo Workspace" with "Data platform" beneath and a chevron.
- Six nav items with Overview active. The active item gets a low-opacity blue tint plus a 2px left indicator, not a full bright fill.
- Divider, then a "System posture" block: label in 10px mono uppercase, value "Protected" in success color, and "Last scan 11:20 AM · read-only" in metadata color.

TOP BAR — 56px, hairline bottom border. Breadcrumb "Workspace / Overview" on the left. On the right: the "DEMO · FIXTURES" pill in cyan-on-dark, then a 28px circular avatar reading AR.

CONTENT COLUMN — max width 1100px, 32px page padding.

1. HEADER BAND. Keep the total height under 180px. This is an operational header, not a hero.
   - 10px mono uppercase kicker: DATA RELIABILITY CONTROL PLANE, followed by a short 40px rule.
   - Headline on two lines, left aligned: "Protect your data" in #F3F6FB, then "before it breaks." Only the second line may carry a restrained blue-to-cyan gradient. No glow.
   - One supporting sentence in muted color, max 70 characters per line.
   - Two actions on the same optical line as the supporting sentence, right aligned: "Run scan" filled #73B8FF with #07121C text, and "Open chat agent" outlined with a hairline border.

2. ATTENTION ROW — two cards, aligned to the top of the row, each sized to its content. No equal-height stretching.
   Left card, "Attention required", with a 2px amber left edge:
   - Top row: amber dot plus "Attention required", and a mono counter "01 / 01" right aligned.
   - 10px mono uppercase label: HIGHEST PREDICTED RISK.
   - Entity name analytics.customer_orders at section-heading size.
   - Reason: "Missing owner on a highly-used dataset".
   - A large mono 82 with the small caption "risk estimate" beneath it, and a HIGH pill in #FF9B6B beside it.
   - Hairline divider, then a metadata strip: "lineage evidence · 84% confidence · 3 downstream dashboards".
   - Text link "Inspect evidence" with a trailing arrow.
   Right card, "Approval queue":
   - Header with title, subtitle "Safe actions waiting for a human decision", and a count chip showing 3.
   - Three rows. Each row: status dot using the mandated status mapping, entity name in #F3F6FB, then mono citation ID plus status text in metadata color, then a chevron. Rows are separated by hairlines and have a visible hover state.
   - Footer text link "Open proposal queue".

3. KPI ROW — four cards, equal width, no decorative shapes inside them.
   - Health score: large mono 78 with a smaller /100, and "+12 from previous scan" in success color.
   - Entities scanned: 128, caption "Same engine in demo / cloud".
   - High-risk entities: 1, caption "Review evidence first" in warning color.
   - Pending approvals: 3, caption "No automatic mutation" in blue.

4. ANALYSIS ROW — two cards side by side, aligned to top, each sized to content.
   Left, "Health trend":
   - Subtitle "Read-only scan history · scores out of 100", with "78 CURRENT" right aligned in mono.
   - Four vertical bars: 62, 67, 73, 78 with the value above each bar and the labels Jul 23, Jul 25, Jul 27, Today beneath. Equal gutters on the left and right of the plot area so the series is optically centered.
   - Legend: a small blue dot with "health score", and "4 verified snapshots" in metadata color.
   Right, "Risk distribution":
   - Subtitle "Across 128 scanned entities".
   - Four rows, each with label, then "count · percent" in mono, then a proportional horizontal track: Critical 8 · 6% in #FF7D87, High 19 · 15% in #FF9B6B, Medium 42 · 33% in #F3BD62, Low 59 · 46% in #55D6A5.
   - This card must not be stretched to match the trend card. If it is shorter, it stays shorter.

5. INVESTIGATION QUEUE — a table card.
   - 10px mono uppercase kicker INVESTIGATION QUEUE, heading "At-risk entities", helper line "Inspect evidence before creating a guarded proposal."
   - One single toolbar row, evenly spaced, vertically centered: a search input with a leading icon and placeholder "Search entity, domain, or reason", a severity select, a status select, then pushed to the right the result count "4 results" in mono with clear separation from the select, and a "Clear filters" control rendered in a visibly disabled state because no filter is currently applied.
   - Table header row in 10px mono uppercase, metadata color: ENTITY, HEALTH, RISK ESTIMATE, IMPACT, EVIDENCE, STATUS, and a final unlabeled action column.
   - Four rows from the sample data. Entity cell shows the name on the first line and the domain beneath in metadata color. Health as "61/100" with a thin inline meter. Risk estimate as a large mono number plus a severity label. Evidence as a small chip with a hollow circle icon. Status as a dot plus text using the mandated mapping. Action column: a right-aligned "Review" button, ghost style.
   - Row hover raises the surface one luminance step. Show one row in hover state.

ADDITIONAL ARTBOARDS, smaller, placed beside the main screen:
a) Loading skeleton for the whole page: shimmer blocks matching the real layout, never a centered spinner.
b) Empty state after filtering to zero results, with the active filter chips visible and a single "Clear filters" action now enabled.
c) API error state: an inline error card with the failure reason and a retry action. Do not blank the page.

Then produce the 390x844 mobile layout: the rail becomes a top bar with a menu trigger, the header band compresses, attention cards stack, KPI cards go to two columns, and the table becomes stacked entity rows where the Review action stays reachable. Nothing may overflow horizontally.

Export as design/01-overview.png
```

---

## BLOK 2 — Scan & Risks

```text
Design the "Scan & Risks" screen for DataHub Sentinel at 1440x900, following the master brief and the anti-slop rules.

HEADER
Breadcrumb "Workspace / Scan & Risks". A scan selector showing "Scan 2026-07-29 11:20" with a chevron, so it is clear the user is viewing one specific scan. The mode badge. Primary action "Run new scan" filled in #73B8FF.

TOOLBAR — one aligned row, evenly spaced, all items vertically centered:
search entity or domain, domain filter, severity filter, a toggle labeled "Only with downstream impact", and a sort control "Sort by risk estimate".
Beneath the toolbar, show the active filter state properly: two removable filter chips reading "Severity: High" and "Domain: Commerce", a result count in mono, and "Clear filters" now in its enabled state. This screen demonstrates the enabled variant, unlike the Overview screen.

MAIN LIST — dense rows, one per entity, not oversized cards. Each row contains:
- A severity indicator that combines a color bar, a text label, and the numeric risk estimate.
- Entity name in #F3F6FB with the full URN beneath in JetBrains Mono at 11px, metadata color, truncated with an ellipsis if needed.
- Health as a compact inline meter plus the numeric value.
- Risk estimate as a large mono number, right aligned in its column.
- Downstream impact as plain text.
- Primary evidence as a chip: lineage, schema, freshness, or ownership.
- A one-line recommendation in muted color.
- Status using the mandated mapping.
- Two row actions: "View details" ghost, and "Create proposal" outlined.

Use all four sample entities, ordered by risk estimate descending: 82, 64, 57, 38.

DETAIL DRAWER — design this open, 520px wide, anchored right, over a dimmed canvas at 60 percent black, opened for analytics.customer_orders. The drawer surface is #101722 with a hairline left border.
Drawer contents:
- Header: entity name, the full URN in mono with a copy affordance, and a close control.
- A segmented control: Schema, Lineage, Ownership, Evidence — with Evidence active.
- Lineage mini-graph: the entity node in the center, one upstream source on the left, three downstream dashboard nodes on the right, connected by thin lines. Nodes are small rounded rectangles with labels. This is a schematic, not decorative art.
- Evidence list: three cards, each with source type, the specific facts used, a confidence value, a timestamp, and the citation ID in mono.
- Sticky drawer footer: "Create proposal" filled primary, "Open in DataHub" outlined.

STATES as smaller adjacent artboards:
a) Loading: row-shaped skeletons.
b) No results after filtering, with the filter chips still visible.
c) API error with the reason surfaced and a retry action.
d) A read-only token notice: an informational inline bar explaining that proposals can be created but no write will be possible, in warning color, with a text label not just a color.

Then the 390x844 mobile layout where the drawer becomes a full-screen sheet with the footer actions pinned to the bottom.

Export as design/02-scan-risks.png
```

---

## BLOK 3 — Proposal review and approval (paling penting)

```text
Design the most safety-critical screen for DataHub Sentinel: "Review proposed fix" at 1440x900. Follow the master brief and the anti-slop rules. This screen decides whether the product is trustworthy, so clarity beats visual flourish everywhere.

TOP OF CONTENT — a prominent notice bar, full content width, amber-tinted surface with a 2px amber left edge, reading: "No change has been written to DataHub." It must be impossible to miss and must not look decorative or dismissible.

TITLE ROW — "Review proposed fix" as the page heading, with the mode badge and the proposal ID in mono beside it.

TWO-COLUMN BODY, roughly 60/40.

LEFT COLUMN
- Entity analytics.customer_orders as a section heading, with urn:li:dataset:(example,analytics.customer_orders,PROD) beneath in JetBrains Mono, metadata color, with a copy affordance.
- Issue block: label "Issue", value "Missing owner", plus one sentence explaining why this matters for this dataset.
- METADATA DIFF — the centerpiece. Two clearly labeled states, "current" and "proposed", shown as a vertical stack of field rows so the change is unmistakable. The changed field row is emphasized with a raised surface. The removed value carries a danger tint plus a minus marker and the literal text label "removed"; the added value carries a success tint plus a plus marker and the text label "added". Unchanged fields are dimmed to muted color. Never rely on red and green alone.
- Downstream impact: the count 3, then the three dashboards listed by name with their platform, so the blast radius is concrete rather than abstract.

RIGHT COLUMN
- Recommendation card: "Assign owner based on lineage evidence", with two sentences of reasoning in muted color.
- Confidence: 84% shown as a single honest horizontal bar with the numeral in mono, plus one sentence naming exactly what drives the number. No pie chart, no gauge, no fake decimal precision.
- Citation cards, two of them, each with the source type, the specific facts used, a timestamp, and the citation ID CIT-demo-001 in mono. Each card has an "Open evidence" text link.
- Runbook preview: collapsed by default, showing the runbook title and the first two lines, with an expand affordance.
- Action row, pinned at the bottom of the column: "Reject" as a secondary button on the left, "Approve and apply" as the filled primary on the right. The primary must not be the visually loudest element on the page — the diff is.

DESIGN THESE STATES as adjacent artboards, each clearly captioned:
a) CONFIRMATION MODAL for "Approve and apply". Surface #141D2A, real shadow, dimmed backdrop. It lists exactly what will change as a short bulleted diff summary, names the target entity and field, and states that the change will be verified by a read-back. Cancel is the calm default and is focused; the confirm button is deliberate, not pre-focused.
b) APPLYING state: the action row replaced by an in-progress indicator with the step being performed, for example "Writing metadata to DataHub".
c) VERIFYING state: a distinct step reading "Reading back to verify". Applied and Verified must be visually distinguishable, because that distinction is the product's core honesty claim.
d) SUCCESS state: a success banner reading "Applied, then verified in DataHub", showing the mutation ID in mono, the verification timestamp, and a "View citation" link. Only this state may show a success checkmark.
e) FAILED MUTATION state: a danger-tinted banner with the actual API failure reason surfaced verbatim, the entity left unchanged, and a retry path. Do not soften or hide the error.
f) REJECTED state: the proposal marked rejected with the captured reason and who rejected it.
g) DEMO-MODE variant: the same screen where the approve action is explicitly labeled as a simulated demo action that writes nothing, with the demo badge adjacent to the button, not only in the top bar.

Then the 390x844 mobile layout: the notice bar pinned at the top, the diff stacked vertically with current above proposed, and the action row pinned to the bottom of the viewport.

Export as design/03-proposal-review.png
```

---

## BLOK 4 — Runbook viewer

```text
Design the "Runbooks" screen for DataHub Sentinel at 1440x900, following the master brief and the anti-slop rules.

Three zones: the 248px app rail, a 300px runbook list, and a document reading pane.

RUNBOOK LIST — surface #0B0F18 with a hairline right border.
- A search input at the top.
- Status filter chips: All, Draft, Saved to DataHub.
- Four list items. Each item shows a severity dot, the runbook title on two lines maximum, the entity name in metadata color, and the last-updated time in mono. The first item is selected, indicated by a raised surface plus a 2px left indicator.

DOCUMENT PANE — reading width capped at 720px, generous left padding, not centered in the viewport.
- Title: "Runbook: analytics.customer_orders — Missing owner".
- A status strip directly under the title: either "Saved to DataHub" in success color or "Local demo only" in warning color, plus the generated timestamp in mono, plus the author as "Sentinel agent".
- Sections in this order, each with a 10px mono uppercase heading: Condition detected, Why this is risky, Evidence, Recommended action, Approval and application history, Verification result, Revert guidance.
- Evidence section: each fact is its own line with the citation ID in mono rendered as a clickable chip.
- Approval and application history: a compact vertical list with timestamp, actor, and action, making it obvious which entries were human decisions.
- Verification result: a distinct block showing the read-back outcome, not merely the word "success".
- Revert guidance: numbered steps in plain language.
- A sticky table of contents on the right, 200px wide, listing the sections with the active one highlighted.
- Header actions, top right of the pane: "Open entity in DataHub", "Export", "Copy link".

Long-form typography must genuinely read well: 14px body at 1.6 line-height, clear vertical rhythm between sections, no monospace paragraphs, no justified text.

STATES as adjacent artboards:
a) Empty state: no runbooks yet, with one sentence explaining that runbooks are generated from evidence after a scan, and a "Run scan" action.
b) Generating state: the document skeleton with a "Generating from evidence" indicator.

Then the 390x844 mobile layout where the list collapses into a dropdown selector and the table of contents becomes a collapsible bar under the title.

Export as design/04-runbook-viewer.png
```

---

## BLOK 5 — Citation trail

```text
Design the "Citation Trail" audit screen for DataHub Sentinel at 1440x900, following the master brief and the anti-slop rules.

HEADER
Heading "Every recommendation has evidence." One supporting sentence about auditability. A single aligned toolbar with four filters: entity, source type, action, and outcome. Include a date range control showing "Last 7 days".

BODY — a vertical timeline with a clear 1px spine in rgba(255,255,255,0.06), entries newest first. Each entry is a card on #101722 with a hairline border, connected to the spine by a small node whose color reflects the lifecycle stage.

Six entries, in this order from newest to oldest:
1. Read-back verification passed — verified
2. Mutation applied — applied
3. Human approved proposal — approved, and the actor must be shown as a person, not the agent
4. Proposal inferred missing owner from upstream ownership pattern — proposed
5. Lineage returned 3 downstream assets — read
6. Scan read schema fields — read

Each card contains: an event-type badge, the timestamp in mono, the entity URN in mono and truncated gracefully, the specific facts read or written, an evidence-quality or confidence value where applicable, a request ID in mono, and a text link to the related proposal or entity.

LIFECYCLE CLARITY — the single most important requirement here. A reader must tell at a glance which events actually changed DataHub and which only proposed something. Use three distinct treatments, each with a text label, never color alone:
read and proposed = blue #73B8FF
applied but not yet verified = amber #F3BD62
verified = green #55D6A5
Entries that changed DataHub also carry a small "write" marker so scanning for mutations is trivial.

RIGHT RAIL — 280px summary card with counts in mono: reads 42, proposals 3, approvals 1, mutations 1, verifications 1. Beneath it, a short note explaining that every mutation has exactly one verification entry or it is treated as unverified.

STATES as adjacent artboards: empty, loading with timeline-shaped skeletons, and error.

Then the 390x844 mobile layout with a condensed single-column timeline and the summary moved to the top as a compact horizontal strip.

Export as design/05-citation-trail.png
```

---

## BLOK 6 — Chat agent console

```text
Design the Sentinel chat agent for DataHub Sentinel at 1440x900, following the master brief and the anti-slop rules.

This must read as an operator console embedded in the product. It must not look like a consumer chatbot: no centered chat bubbles, no avatar cartoons, no sparkle icons, no "Ask me anything" empty state.

LAYOUT — the 248px app rail, a conversation column, and a 380px context rail on the right.

CONVERSATION — agent replies are structured result blocks, not prose bubbles.
- User message: right-aligned, compact, on a raised surface, "Scan customer_orders and find risk for this week."
- Agent reply: a full-width structured block containing the entity name, health 61/100, risk estimate 82 with a High label, downstream impact "3 downstream dashboards", and two inline citation chips in mono. Below it, a collapsed "Tool calls" disclosure that expands to show the specific DataHub reads performed, each with a duration in mono. This trace is what makes the agent auditable.
- User message: "Create the proposal, do not apply it."
- Agent reply: a proposal card showing the intended change as a compact before-and-after, the confidence, the citation ID, the explicit line "Nothing has been written", and a "Review proposal" button.

COMPOSER — pinned to the bottom of the conversation column.
- Input with placeholder "Ask about an entity, or type / for commands".
- A command suggestion row: /scan, /risk, /propose, /runbook, /verify — each as a small chip with a one-word hint.
- An attached-context chip showing the current entity URN, removable.
- A persistent safety line directly beneath the input in muted color: "Agent can propose changes. Nothing is written without approval."

CONTEXT RAIL
- Current entity with its URN in mono.
- Lineage mini-graph, schematic, matching the Scan screen's treatment.
- Active citations list with mono IDs.
- Pending approvals count.
- Connection status list with three rows: "Sentinel API", "DataHub Cloud", "Hermes / OpenClaw bridge". Each row shows exactly one state: connected, not configured, or error — each with a dot plus a text label. Design the realistic default where Sentinel API is connected, DataHub Cloud is not configured, and the bridge is not configured. Never render "connected" as a default decoration.

STATES as adjacent artboards:
a) Streaming state: the agent block partially rendered with a subtle in-progress indicator on the current step. No bouncing dots.
b) Tool-call trace expanded, showing the sequence of DataHub reads with durations.
c) Error state where a DataHub read failed, with the reason surfaced and the conversation still usable.

Then the 390x844 mobile layout where the context rail becomes a bottom sheet with a drag handle.

Export as design/06-chat-agent.png
```

---

## BLOK 7 — Settings and connection states

```text
Design the "Settings" screen for DataHub Sentinel at 1440x900, following the master brief and the anti-slop rules.

Layout: the app rail, a 200px sticky section navigation inside the content area, and a single scrollable column of section cards.

SECTIONS
1. DataHub connection. Workspace URL shown partially masked. The token shown as a fixed number of dots with a "Reveal" action that requires confirmation. A "Test connection" button. Two separate permission indicators, read and write, each with a text label. Never display a real secret value, and never let the field width hint at the token length.
2. Mode. A segmented control between "Demo — fixture data" and "DataHub Cloud — live metadata". Each option carries one honest sentence stating what it does and what it does not do. Make clear that demo writes nothing.
3. Safety. "Mutations disabled by default" as a toggle that is off. "Require human approval" shown locked on, with a small lock icon and an explanation that it cannot be disabled. A checklist of allowed mutation types: update description, add owner, add tag, add glossary term — with only the safe ones enabled.
4. Agent. Model name, a "deterministic template fallback" toggle, and a "max tool steps" numeric input.
5. Integrations. Hermes / OpenClaw MCP status, a local endpoint field, and a test button. Status must default to not configured.
6. Audit. Citation retention window as a select, and an export action.

CONNECTION STATES — design all five as inline banners or chips, each with a dot, a text label, and a next action:
connected and verified, missing credentials, permission denied, network timeout, and read-only token detected.

Each section card is on #101722 with a hairline border, an 11px radius, a section heading, and a one-line description in muted color. Form rows use a label-left, control-right arrangement with consistent column alignment across all sections.

Then the 390x844 mobile layout where the section navigation becomes a horizontal scrollable tab strip.

Export as design/07-settings.png
```

---

## BLOK 8 — Design system board

```text
Create the DataHub Sentinel design-system reference board at 1600x1200, following the master brief and the anti-slop rules. This is a working handoff sheet for engineers, so label everything with its exact value.

Include, in a clear grid:

COLOR TOKENS — swatches with hex values and semantic role: canvas #080B12, sidebar #0B0F18, surface #101722, raised #141D2A, text #F3F6FB, muted #91A0B5, metadata #617086, primary #73B8FF, cyan #52DFC0, success #55D6A5, warning #F3BD62, highRisk #FF9B6B, danger #FF7D87.
Include an explicit contrast warning: metadata color #617086 must never be used for body text on #141D2A because it fails WCAG AA at 3.37:1. Show the compliant alternative.

TYPE SPECIMENS — display, section heading, body, and mono label, each annotated with size, weight, line-height, and letter-spacing.

SCALES — the spacing scale 4/8/13/20/32/43 and the radius scale 6/8/11/pill, each shown visually.

DEPTH — the three surface levels demonstrated side by side with their hairline borders, plus the modal treatment, annotated to make clear that depth comes from luminance stepping and borders rather than shadows.

BUTTONS — primary, primary hover, secondary, ghost, destructive, disabled, and loading. Show the focus-visible ring on each.

BADGES — "DEMO · FIXTURES" and "LIVE · DATAHUB CLOUD".

SEVERITY — Critical, High, Medium, Low, each with color, text label, and a numeric example.

STATUS — the single mandated mapping shown once and labeled as canonical: needs review #F3BD62, proposed #73B8FF, verified #55D6A5.

COMPONENTS — table row anatomy with default, hover, and selected states; filter toolbar including the disabled and enabled "Clear filters" variants; evidence card; citation chip; lineage mini-graph; proposal diff block; approval confirmation modal; verification banner in both applied and verified variants; loading skeleton; empty state; error state.

ACCESSIBILITY — show the focus-visible treatment on every interactive component, and state the minimum touch target of 44px for touch layouts.

Name each component exactly so it maps to the TypeScript implementation:
AppShell, SideRail, TopBar, ModeBadge, MetricCard, AttentionCard, ApprovalQueue, RiskBadge, StatusDot, EntityTable, FilterToolbar, EvidenceCard, CitationChip, LineageMiniGraph, ProposalDiff, ApprovalModal, VerificationBanner, RunbookViewer, ChatPanel, ConnectionStatus.

Export as design/08-design-system.png
```

---

## Target output

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

## Kalau hasilnya masih terasa generik

Kirim satu pesan tambahan ini ke Stitch dan minta regenerate:

```text
This still reads as a generic admin template. Increase information density: reduce padding, remove decorative shapes, and let real data fill the viewport. Tighten the display letter-spacing. Replace any gradient or glow with flat surfaces separated by hairline borders in rgba(255,255,255,0.06). Ensure the highest-risk entity and the next required human decision are both visible without scrolling.
```

## Catatan

- PNG dari Stitch adalah referensi visual, bukan bukti aplikasi berjalan. Implementasi tetap harus lulus `npm test`, `npm run typecheck`, `npm run build`, dan verifikasi browser.
- Jangan pernah menaruh token, URL workspace asli, atau data pribadi ke prompt Stitch maupun ke folder `design/`.
- Palet di file ini identik dengan `DESIGN.md` yang sudah lint-clean, jadi hasil Stitch bisa langsung dipetakan ke token yang ada tanpa konversi.
