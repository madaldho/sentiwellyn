---
version: alpha
name: Sentinel Control Room
description: Evidence-first dark control room for proactive DataHub reliability operations.
colors:
  canvas: "#080B12"
  sidebar: "#0B0F18"
  surface: "#101722"
  surfaceRaised: "#141D2A"
  text: "#F3F6FB"
  muted: "#91A0B5"
  subtle: "#617086"
  primary: "#73B8FF"
  cyan: "#52DFC0"
  success: "#55D6A5"
  warning: "#F3BD62"
  danger: "#FF7D87"
  highRisk: "#FF9B6B"
typography:
  display:
    fontFamily: DM Sans
    fontSize: 3.5rem
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.055em"
  heading:
    fontFamily: DM Sans
    fontSize: 1.4375rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.04em"
  body:
    fontFamily: DM Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: JetBrains Mono
    fontSize: 0.625rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.035em"
rounded:
  sm: 6px
  md: 8px
  lg: 11px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 13px
  lg: 20px
  xl: 32px
  section: 43px
elevation:
  card: "0 16px 40px rgba(0, 0, 0, 0.09)"
  dialog: "0 24px 80px rgba(0, 0, 0, 0.55)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#07121C"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "#A9D5FF"
    textColor: "#07121C"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  button-secondary:
    backgroundColor: "{colors.surfaceRaised}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
  status-success:
    backgroundColor: "{colors.success}"
    textColor: "#07121C"
    rounded: "{rounded.pill}"
  status-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#22080B"
    rounded: "{rounded.pill}"
  canvas-surface:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
  sidebar-surface:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
  metadata-label:
    backgroundColor: "{colors.surfaceRaised}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
  evidence-highlight:
    backgroundColor: "{colors.surfaceRaised}"
    textColor: "{colors.cyan}"
    rounded: "{rounded.sm}"
  status-warning:
    backgroundColor: "{colors.warning}"
    textColor: "#201407"
    rounded: "{rounded.pill}"
  status-high-risk:
    backgroundColor: "{colors.highRisk}"
    textColor: "#241007"
    rounded: "{rounded.pill}"
  secondary-caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
  subtle-surface:
    backgroundColor: "{colors.subtle}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
---

## Overview

Sentinel is a Monitor surface with a secondary Operate flow. Users first scan system posture, then inspect the highest-risk entity and decide whether an evidence-backed proposal is safe to approve. The interface should feel like a calm technical control room, not a generic analytics dashboard.

The visual language combines Linear-inspired luminance layering and precise technical typography with Sentinel-specific risk colors. It uses an original composition and vocabulary rather than copying another product's branded UI.

## Colors

- **Canvas and sidebar:** `canvas` and `sidebar` create a near-black foundation without pure black.
- **Surfaces:** `surface` and `surfaceRaised` separate cards, controls, and dialogs through restrained luminance steps.
- **Primary action:** `primary` is reserved for scan, review, and other high-intent actions.
- **Evidence and health:** `cyan` and `success` communicate trustworthy or verified states.
- **Risk:** `warning`, `highRisk`, and `danger` are semantic severity colors; never use them decoratively.
- **Text:** `text` is for decisions, `muted` for supporting context, and `subtle` for metadata only.

All important text and controls must remain readable against their surface. Do not rely on color alone: pair severity colors with labels, scores, or status text.

## Typography

DM Sans is the primary interface face because it stays friendly and legible at dense dashboard sizes. JetBrains Mono is reserved for scores, IDs, timestamps, and system labels. Display text is compact and left-aligned; body copy is relaxed enough for evidence review.

Use uppercase mono labels sparingly for scan state, evidence IDs, and section kickers. Do not use mono for paragraphs or long explanations.

## Layout

The primary composition is a left navigation rail plus a responsive content column. The top of the content area is an attention queue, not a decorative hero: highest predicted risk and approval queue appear before supporting metrics and charts.

The investigation queue must provide search, severity filtering, status filtering, visible result count, and an explicit Review action. Tables may scroll internally on narrow screens, but the page itself must not gain accidental horizontal overflow.

Responsive rules:

- Above 1080px: full sidebar, attention queue in two columns, data table at full width.
- 680–1080px: compact icon rail, attention and analysis panels stack.
- Below 680px: stacked actions, two-column metrics, wrapped filters, vertical proposal diff.
- Interactive targets should remain at least 44px on touch layouts, even when visual labels are compact.

## Elevation & Depth

Use border contrast and small luminance differences as the main depth system. Avoid heavy shadows and avoid glassmorphism unless a real overlay needs backdrop separation. Cards use a subtle ambient shadow; dialogs use a stronger shadow and a darkened backdrop.

## Shapes

Use 6px for controls, 8px for compact interactive surfaces, 11px for cards, and full pills only for mode/severity/status indicators. Rounded corners should support grouping and scanability, not make every element look inflated.

## Components

- **Attention queue:** highlights the single most urgent entity, risk score, evidence confidence, impact, and Inspect evidence action.
- **Approval queue:** lists proposed actions with their citation IDs and status; it never implies that a mutation has already happened.
- **Metric cards:** show only decision-relevant values: health, scanned entities, high-risk entities, and pending approvals.
- **Investigation table:** keeps entity, health, risk, impact, evidence, status, and Review action in one scannable row.
- **Proposal dialog:** always shows before/proposed state, citation fact, confidence, source, impact, and explicit no-write language before approval.
- **Demo mode badge:** must remain visible whenever fixture data is shown. Cloud mode must display verified live status only after a real read succeeds.

## Do's and Don'ts

- Do prioritize the next decision over decorative visualization.
- Do attach evidence and confidence to every proposed fix.
- Do use labels and text alongside semantic colors.
- Do provide loading, empty, error, reject, and success states.
- Do preserve reduced-motion behavior.
- Don't imply that demo fixtures are live DataHub data.
- Don't approve or write mutations silently.
- Don't use oversized KPI numerals to fill empty space.
- Don't hide row actions behind accidental page overflow.
- Don't add gradients, icons, or cards unless they improve comprehension.
