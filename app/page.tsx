"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { demoReport } from "@/src/lib/fixtures";
import { createProposal } from "@/src/lib/scoring";
import { useTheme } from "@/src/lib/theme";
import type { EntityRisk, ScanReport, Severity } from "@/src/lib/types";
import {
  IconAlert, IconArrowLeft, IconArrowRight, IconArrowUpRight, IconChat, IconCheck,
  IconChevronDown, IconChevronRight, IconCitation, IconClose, IconEvidence, IconExternal,
  IconFixes, IconMoon, IconOverview, IconRunbook, IconScan, IconSearch, IconSettings,
  IconShield, IconSun,
} from "@/src/components/icons";

type ViewName = "Overview" | "Scan & Risks" | "Proposed Fixes" | "Runbooks" | "Citation Trail" | "Settings";

const navItems: { name: ViewName; Icon: typeof IconOverview }[] = [
  { name: "Overview", Icon: IconOverview },
  { name: "Scan & Risks", Icon: IconScan },
  { name: "Proposed Fixes", Icon: IconFixes },
  { name: "Runbooks", Icon: IconRunbook },
  { name: "Citation Trail", Icon: IconCitation },
  { name: "Settings", Icon: IconSettings },
];

const workspaces = [
  { id: "demo", mark: "DW", name: "Demo Workspace", detail: "Data platform · fixtures" },
  { id: "commerce", mark: "CM", name: "Commerce Analytics", detail: "Requires Cloud credentials" },
  { id: "platform", mark: "PL", name: "Platform Core", detail: "Requires Cloud credentials" },
];

const severityLabels: Record<Severity, string> = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };
function severityColor(severity: Severity) { return `var(--${severity})`; }

// One canonical status mapping, shared by every surface.
const statusColors: Record<EntityRisk["status"], string> = {
  needs_review: "var(--orange)", proposed: "var(--stone)", verified: "var(--green)",
};
function statusColor(status: EntityRisk["status"]) { return statusColors[status]; }
function statusLabel(status: EntityRisk["status"]) { return status.replace("_", " "); }
function formatScanTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

/** Closes a popover on outside click and on Escape. */
function useDismiss<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    }
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") close(); }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open, close]);
  return ref;
}

export default function Home() {
  const [report, setReport] = useState<ScanReport>(demoReport);
  const [active, setActive] = useState<ViewName>("Overview");
  const [selected, setSelected] = useState<EntityRisk | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | EntityRisk["status"]>("all");
  const [workspace, setWorkspace] = useState(workspaces[0]);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [approved, setApproved] = useState<string[]>([]);
  const [approving, setApproving] = useState(false);
  const { theme, toggle } = useTheme();

  const closeWorkspace = useCallback(() => setWorkspaceOpen(false), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const workspaceRef = useDismiss<HTMLDivElement>(workspaceOpen, closeWorkspace);
  const profileRef = useDismiss<HTMLDivElement>(profileOpen, closeProfile);

  const highRisk = useMemo(() => report.risks.filter((risk) => risk.risk >= 70).length, [report]);
  const urgentEntity = useMemo(() => [...report.risks].sort((a, b) => b.risk - a.risk)[0], [report.risks]);
  const hasFilters = Boolean(query) || severityFilter !== "all" || statusFilter !== "all";

  const filteredRisks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return report.risks.filter((risk) => {
      const matches = !q || `${risk.name} ${risk.domain} ${risk.reason}`.toLowerCase().includes(q);
      return matches && (severityFilter === "all" || risk.severity === severityFilter)
        && (statusFilter === "all" || risk.status === statusFilter);
    });
  }, [query, report.risks, severityFilter, statusFilter]);

  // Escape closes the proposal dialog.
  useEffect(() => {
    if (!selected) return;
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") setSelected(null); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  // Toasts dismiss themselves; the message stays long enough to read.
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function runScan() {
    setLoading(true);
    try {
      const response = await fetch("/api/scan");
      const body = await response.json();
      if (!response.ok) {
        setToast(body?.error ?? "Scan failed. Check the server logs.");
        return;
      }
      setReport(body as ScanReport);
      setWorkspace(body.mode === "cloud"
        ? { id: "live", mark: "DH", name: "DataHub OSS Live", detail: "VPS · verified GraphQL read" }
        : workspaces[0]);
      setToast(body.mode === "cloud"
        ? `Live scan complete — ${body.scanned} DataHub entities read from VPS. No mutation was written.`
        : `Scan complete — ${body.scanned} entities read from demo fixtures. Nothing was written to DataHub.`);
    } catch {
      setToast("Scan failed. The local server did not respond.");
    } finally {
      setLoading(false);
    }
  }

  function propose(entity: EntityRisk) {
    const proposal = createProposal(entity);
    setSelected(entity);
    setToast(`Proposal ${proposal.id} is ready for review. No change has been written to DataHub.`);
  }

  async function approveProposal(entity: EntityRisk) {
    setApproving(true);
    try {
      const response = await fetch("/api/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ approved: true, entityUrn: entity.urn }),
      });
      const body = await response.json();
      if (!response.ok) {
        setToast(body?.error ?? "Approval mutation failed. Nothing was verified.");
        return;
      }
      setApproved((prev) => prev.includes(entity.citation.id) ? prev : [...prev, entity.citation.id]);
      setReport((current) => ({
        ...current,
        fixed: current.fixed + 1,
        pending: Math.max(0, current.pending - 1),
        risks: current.risks.map((risk) => risk.urn === entity.urn ? { ...risk, status: "verified" } : risk),
      }));
      setSelected(null);
      setToast(body.verified
        ? `Live mutation verified for ${entity.name}. Read-back matched DataHub description.`
        : `Mutation executed for ${entity.name}, but read-back did not match yet.`);
    } catch {
      setToast("Approval mutation failed. The server did not respond.");
    } finally {
      setApproving(false);
    }
  }

  function selectWorkspace(next: typeof workspaces[number]) {
    setWorkspace(next);
    setWorkspaceOpen(false);
    setToast(next.id === "demo"
      ? "Switched to Demo Workspace. Fixture data, no credentials needed."
      : `${next.name} needs DataHub Cloud credentials. Configure them in Settings; the view stays on fixtures until a live read is verified.`);
  }

  function goto(view: ViewName) {
    setActive(view);
    setProfileOpen(false);
    if (view === "Scan & Risks") {
      window.setTimeout(() => document.getElementById("risk-queue")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const isOverview = active === "Overview" || active === "Scan & Risks";

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="shield"><IconShield size={18} /></span>
          <span>SENTIWELLYN</span>
        </div>

        <div className="workspace-wrap" ref={workspaceRef}>
          <button
            className="workspace-switcher"
            onClick={() => setWorkspaceOpen((open) => !open)}
            aria-expanded={workspaceOpen}
            aria-haspopup="listbox"
          >
            <span className="workspace-mark">{workspace.mark}</span>
            <span className="workspace-label"><strong>{workspace.name}</strong><small>{workspace.detail}</small></span>
            <span className={`chevron ${workspaceOpen ? "chevron-open" : ""}`}><IconChevronDown size={16} /></span>
          </button>
          {workspaceOpen && (
            <div className="popover" role="listbox" aria-label="Select workspace">
              {workspaces.map((item) => (
                <button
                  key={item.id}
                  className={`popover-item ${item.id === workspace.id ? "popover-item-active" : ""}`}
                  role="option"
                  aria-selected={item.id === workspace.id}
                  onClick={() => selectWorkspace(item)}
                >
                  <span className="workspace-mark">{item.mark}</span>
                  <span className="workspace-label"><strong>{item.name}</strong><small>{item.detail}</small></span>
                  {item.id === workspace.id && <span className="popover-check"><IconCheck size={16} /></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="nav" aria-label="Primary navigation">
          {navItems.map(({ name, Icon }) => (
            <button key={name} className={active === name ? "active" : ""} onClick={() => goto(name)} aria-current={active === name}>
              <span className="nav-icon"><Icon size={18} filled={active === name} /></span>
              {name}
              <span className="nav-arrow"><IconChevronRight size={14} /></span>
            </button>
          ))}
        </nav>

        <div className="sidebar-status">
          <div className="status-label"><i className="pulse" />System posture</div>
          <strong>Protected</strong>
          <span>Last scan {formatScanTime(report.scannedAt)} · read-only</span>
        </div>

        <div className="sidebar-note">
          Evidence-backed reliability for the DataHub graph<br /><br />
          <strong>No mutation without approval</strong>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb"><span>{workspace.name}</span><b>/</b>{active}</div>
          <div className="top-actions">
            <span className="mode"><i className="pulse" />{report.mode === "cloud" ? "LIVE · DATAHUB OSS" : "DEMO · FIXTURES"}</span>
            <button className="icon-button" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
              {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
            <div className="profile-wrap" ref={profileRef}>
              <button className="avatar" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="menu" aria-label="Open account menu">AR</button>
              {profileOpen && (
                <div className="popover popover-right" role="menu">
                  <div className="popover-head"><strong>Ali Ridho</strong><small>Signed in · demo session</small></div>
                  <button className="popover-item" role="menuitem" onClick={() => goto("Settings")}>
                    <IconSettings size={16} />Connection settings
                  </button>
                  <button className="popover-item" role="menuitem" onClick={() => { setProfileOpen(false); toggle(); }}>
                    {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}Use {theme === "dark" ? "light" : "dark"} theme
                  </button>
                  <a className="popover-item" role="menuitem" href="https://docs.datahub.com/docs/features" target="_blank" rel="noreferrer noopener">
                    <IconExternal size={16} />DataHub documentation
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content">
          {isOverview ? (
            <OverviewView
              report={report} urgentEntity={urgentEntity} highRisk={highRisk} filteredRisks={filteredRisks}
              query={query} setQuery={setQuery} severityFilter={severityFilter} setSeverityFilter={setSeverityFilter}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter} hasFilters={hasFilters}
              runScan={runScan} loading={loading} propose={propose} goto={goto} openChat={() => setChatOpen(true)}
            />
          ) : active === "Proposed Fixes" ? (
            <ProposalsView report={report} propose={propose} goto={goto} approved={approved} />
          ) : active === "Runbooks" ? (
            <RunbooksView report={report} goto={goto} setToast={setToast} />
          ) : active === "Citation Trail" ? (
            <CitationsView report={report} goto={goto} />
          ) : (
            <SettingsView goto={goto} setToast={setToast} theme={theme} toggle={toggle} />
          )}
        </div>
      </main>

      {selected && (
        <ProposalModal
          selected={selected}
          onClose={() => setSelected(null)}
          onApprove={approveProposal}
          onReject={() => { setSelected(null); setToast("Proposal rejected. Nothing was changed."); }}
          approving={approving}
        />
      )}

      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} entity={urgentEntity} goto={goto} />}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span>{toast}</span>
          <button aria-label="Dismiss notification" onClick={() => setToast("")} className="toast-close"><IconClose size={16} /></button>
        </div>
      )}
    </div>
  );
}

type OverviewProps = {
  report: ScanReport; urgentEntity: EntityRisk; highRisk: number; filteredRisks: EntityRisk[];
  query: string; setQuery: (v: string) => void;
  severityFilter: "all" | Severity; setSeverityFilter: (v: "all" | Severity) => void;
  statusFilter: "all" | EntityRisk["status"]; setStatusFilter: (v: "all" | EntityRisk["status"]) => void;
  hasFilters: boolean; runScan: () => void; loading: boolean;
  propose: (e: EntityRisk) => void; goto: (v: ViewName) => void; openChat: () => void;
};

function OverviewView({
  report, urgentEntity, highRisk, filteredRisks, query, setQuery, severityFilter, setSeverityFilter,
  statusFilter, setStatusFilter, hasFilters, runScan, loading, propose, goto, openChat,
}: OverviewProps) {
  return <>
    <section className="hero">
      <div>
        <div className="eyebrow">Data reliability control plane <span className="eyebrow-line" /></div>
        <h1>Protect your data<br /><em>before it breaks.</em></h1>
        <p className="subtitle">Sentiwellyn turns DataHub metadata into evidence-backed risk signals, safe proposals, and verifiable remediation.</p>
      </div>
      <div className="actions">
        <button className="secondary" onClick={openChat}>Open chat agent <IconChat size={16} /></button>
        <button className="primary" onClick={runScan} disabled={loading}>
          {loading ? "Scanning…" : "Run scan"}<IconScan size={16} />
        </button>
      </div>
    </section>

    <section className="attention-grid" aria-label="Attention required">
      <div className="attention-card card">
        <div className="attention-top">
          <span className="signal-badge"><i className="signal-dot" />Attention required</span>
          <span className="mono">01 / {String(highRisk).padStart(2, "0")}</span>
        </div>
        <div className="attention-content">
          <div>
            <div className="panel-kicker">Highest predicted risk</div>
            <h2>{urgentEntity.name}</h2>
            <p>{urgentEntity.reason}</p>
          </div>
          <div className="risk-score">
            <strong>{urgentEntity.risk}</strong>
            <span>risk estimate</span>
            <b style={{ color: severityColor(urgentEntity.severity) }}>{severityLabels[urgentEntity.severity]}</b>
          </div>
        </div>
        <div className="evidence-row">
          <span className="evidence-tag">{urgentEntity.citation.source} evidence</span>
          <span>{Math.round(urgentEntity.citation.confidence * 100)}% confidence</span>
          <span>{urgentEntity.impact}</span>
          <button className="link-button" onClick={() => propose(urgentEntity)}>Inspect evidence <IconArrowRight size={14} /></button>
        </div>
      </div>

      <div className="queue-card card">
        <div className="panel-heading">
          <div>
            <div className="panel-title">Approval queue</div>
            <div className="panel-note">Safe actions waiting for a human decision</div>
          </div>
          <span className="queue-count">{report.pending}</span>
        </div>
        <div className="queue-list">
          {report.risks.filter((r) => r.status !== "verified").slice(0, 3).map((risk) => (
            <button className="queue-item" key={risk.urn} onClick={() => propose(risk)}>
              <span className="queue-status" style={{ background: statusColor(risk.status) }} />
              <span className="queue-label"><strong>{risk.name}</strong><small>{risk.citation.id} · {statusLabel(risk.status)}</small></span>
              <span className="queue-arrow"><IconChevronRight size={14} /></span>
            </button>
          ))}
        </div>
        <button className="text-button" onClick={() => goto("Proposed Fixes")}>Open proposal queue <IconArrowRight size={14} /></button>
      </div>
    </section>

    <section className="metrics">
      <Metric label="Health score" value={<>{report.health}<small>/100</small></>} detail="+12 from previous scan" tone="green" />
      <Metric label="Entities scanned" value={report.scanned} detail="Same engine in demo / cloud" />
      <Metric label="High-risk entities" value={highRisk} detail="Review evidence first" tone="amber" />
      <Metric label="Pending approvals" value={report.pending} detail="No automatic mutation" tone="blue" />
    </section>

    <section className="grid-two">
      <div className="card panel">
        <div className="panel-heading">
          <div>
            <div className="panel-title">Health trend</div>
            <div className="panel-note">Read-only scan history · indexed from 55 to keep the climb legible</div>
          </div>
          <span className="mini-value">{report.health} <small>current</small></span>
        </div>
        <div className="chart">
          {[[62, "Jul 23"], [67, "Jul 25"], [73, "Jul 27"], [78, "Today"]].map(([value, label]) => (
            <div className="bar-wrap" key={String(label)}>
              <div className="bar-value">{value}</div>
              <div className="bar" style={{ height: `${20 + ((Number(value) - 55) / 23) * 52}%` }} />
              <div className="bar-label">{label}</div>
            </div>
          ))}
        </div>
        <div className="legend">
          <span><i className="dot" style={{ background: "var(--orange)" }} />health score</span>
          <span>4 verified snapshots</span>
        </div>
      </div>

      <div className="card panel">
        <div className="panel-heading">
          <div>
            <div className="panel-title">Risk distribution</div>
            <div className="panel-note">Across {report.scanned} scanned entities</div>
          </div>
        </div>
        <div className="risk-list">
          {([["critical", 8], ["high", 19], ["medium", 42], ["low", 59]] as [Severity, number][]).map(([severity, value]) => (
            <button className="risk-row" key={severity} onClick={() => {
              setSeverityFilter(severity);
              document.getElementById("risk-queue")?.scrollIntoView({ behavior: "smooth" });
            }}>
              <div className="risk-label">
                <span className="risk-name">{severityLabels[severity]}</span>
                <span className="risk-meta">{value} · {Math.round(value / report.scanned * 100)}%</span>
              </div>
              <div className="progress"><span style={{ width: `${value / 64 * 100}%`, background: severityColor(severity) }} /></div>
            </button>
          ))}
        </div>
      </div>
    </section>

    <section className="card table-panel" id="risk-queue">
      <div className="panel table-heading">
        <div>
          <div className="section-kicker">Investigation queue</div>
          <div className="panel-title">At-risk entities</div>
          <div className="panel-note">Inspect evidence before creating a guarded proposal</div>
        </div>
      </div>
      <div className="table-toolbar">
        <label className="search">
          <span className="search-icon"><IconSearch size={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entity, domain, or reason" aria-label="Search entities" />
        </label>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as "all" | Severity)} aria-label="Filter by severity">
          <option value="all">All severities</option>
          <option value="critical">Critical</option><option value="high">High</option>
          <option value="medium">Medium</option><option value="low">Low</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | EntityRisk["status"])} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="needs_review">Needs review</option>
          <option value="proposed">Proposed</option><option value="verified">Verified</option>
        </select>
        <span className="result-count">{filteredRisks.length} {filteredRisks.length === 1 ? "result" : "results"}</span>
        <button className="secondary compact clear-filters" disabled={!hasFilters}
          onClick={() => { setQuery(""); setSeverityFilter("all"); setStatusFilter("all"); }}>Clear filters</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Entity</th><th>Health</th><th>Risk estimate</th><th>Impact</th>
              <th>Evidence</th><th>Status</th><th><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredRisks.map((entity) => (
              <tr key={entity.urn}>
                <td><div className="entity">{entity.name}</div><div className="subtle">{entity.domain}</div></td>
                <td className="score">{entity.health}<span>/100</span></td>
                <td>
                  <span className="score" style={{ color: severityColor(entity.severity) }}>{entity.risk}</span>
                  <div className="subtle">{severityLabels[entity.severity]}</div>
                </td>
                <td>{entity.impact}</td>
                <td className="evidence"><span className="evidence-icon"><IconEvidence size={14} /></span>{entity.citation.source}</td>
                <td><span className={`status status-${entity.status}`}><i className="pulse" />{statusLabel(entity.status)}</span></td>
                <td><button className="review-button" onClick={() => propose(entity)}>Review <IconArrowRight size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRisks.length === 0 && (
          <div className="empty-state">
            <strong>No matching entities</strong>
            <span>Clear the filters or search a different term.</span>
          </div>
        )}
      </div>
    </section>
  </>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <section className="page-header">
      <div>
        <div className="eyebrow">{eyebrow} <span className="eyebrow-line" /></div>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      {action}
    </section>
  );
}

function ProposalsView({ report, propose, goto, approved }: { report: ScanReport; propose: (e: EntityRisk) => void; goto: (v: ViewName) => void; approved: string[] }) {
  const proposals = report.risks.filter((r) => r.status !== "verified");
  return <>
    <PageHeader eyebrow="Human in the loop" title="Proposed fixes"
      description="Every remediation is evidence-backed, reviewable, and blocked from mutation until a human approves it."
      action={<span className="view-count">{proposals.length} awaiting review</span>} />
    <div className="view-grid">
      {proposals.map((entity) => {
        const isApproved = approved.includes(entity.citation.id);
        return (
          <article className="proposal-card card" key={entity.urn}>
            <div className="proposal-card-top">
              <span className="signal-badge"><i className="signal-dot" />{isApproved ? "approved in demo" : statusLabel(entity.status)}</span>
              <span className="mono">{entity.citation.id}</span>
            </div>
            <h2>{entity.name}</h2>
            <p>{entity.reason}</p>
            <div className="proposal-diff">
              <span>Missing metadata</span><b><IconArrowRight size={14} /></b><strong>Owner from lineage</strong>
            </div>
            <div className="proposal-meta">
              <span>{entity.citation.source} evidence</span>
              <span>{Math.round(entity.citation.confidence * 100)}% confidence</span>
              <span>{entity.impact}</span>
            </div>
            <button className="primary full" onClick={() => propose(entity)}>
              {isApproved ? "View evidence" : "Review evidence"} <IconArrowRight size={16} />
            </button>
          </article>
        );
      })}
    </div>
    <BackLink onClick={() => goto("Overview")} />
  </>;
}

function RunbooksView({ report, goto, setToast }: { report: ScanReport; goto: (v: ViewName) => void; setToast: (v: string) => void }) {
  return <>
    <PageHeader eyebrow="Operational memory" title="Runbooks"
      description="Repeatable response plans generated from the same evidence that produced each risk signal."
      action={<span className="view-count">{report.risks.length} draft runbooks</span>} />
    <div className="runbook-list">
      {report.risks.map((entity, index) => (
        <article className="runbook-row card" key={entity.urn}>
          <div className="runbook-index">{String(index + 1).padStart(2, "0")}</div>
          <div className="runbook-main">
            <div className="runbook-heading">
              <div>
                <h2>{entity.name}</h2>
                <span>{entity.domain} · generated from {entity.citation.source} evidence</span>
              </div>
              <span className={`status status-${entity.status}`}><i className="pulse" />{statusLabel(entity.status)}</span>
            </div>
            <p>{entity.reason}</p>
            <div className="steps">
              <span className="step-done">01 Detect</span><span className="step-done">02 Explain</span>
              <span className="step-next">03 Approve</span><span>04 Verify</span>
            </div>
          </div>
          <button className="icon-action" aria-label={`Open runbook for ${entity.name}`}
            onClick={() => setToast(`Runbook for ${entity.name} is a local draft. Saving to DataHub requires a verified Cloud connection.`)}>
            <IconArrowUpRight size={16} />
          </button>
        </article>
      ))}
    </div>
    <BackLink onClick={() => goto("Overview")} />
  </>;
}

function CitationsView({ report, goto }: { report: ScanReport; goto: (v: ViewName) => void }) {
  return <>
    <PageHeader eyebrow="Evidence ledger" title="Citation trail"
      description="A transparent record of the facts, sources, and confidence behind every Sentiwellyn recommendation."
      action={<span className="view-count">{report.risks.length} citations</span>} />
    <section className="card citation-panel">
      <div className="citation-intro">
        <span className="signal-badge"><i className="signal-dot" />Evidence-backed</span>
        <p>Nothing is proposed without a source. Nothing is marked verified without a read-back.</p>
      </div>
      {report.risks.map((entity) => (
        <article className="citation-row" key={entity.citation.id}>
          <div className="citation-mark"><IconCitation size={16} /></div>
          <div className="citation-main">
            <div className="citation-top">
              <strong>{entity.citation.id}</strong>
              <span>{Math.round(entity.citation.confidence * 100)}% confidence</span>
            </div>
            <h2>{entity.citation.fact}</h2>
            <p><b>{entity.name}</b> · {entity.impact}</p>
            <div className="citation-source">
              <span>Source</span><strong>{entity.citation.source}</strong>
              <span>URN</span><code>{entity.urn}</code>
            </div>
          </div>
        </article>
      ))}
    </section>
    <BackLink onClick={() => goto("Overview")} />
  </>;
}

function SettingsView({ goto, setToast, theme, toggle }: { goto: (v: ViewName) => void; setToast: (v: string) => void; theme: string; toggle: () => void }) {
  const [testing, setTesting] = useState(false);
  const [health, setHealth] = useState<{ status: string; mode: string; cloud: { configured: boolean; adapter: string; live: boolean; scanned?: number; lastReadAt?: string; reason?: string }; mutationsAllowed: boolean } | null>(null);

  async function testConnection() {
    setTesting(true);
    try {
      const response = await fetch("/api/health");
      const body = await response.json();
      setHealth(body);
      setToast(body.mode === "demo"
        ? "Demo mode is healthy. Fixture data only — no DataHub connection is used."
        : body.cloud?.live
          ? `Live DataHub read verified — ${body.cloud.scanned ?? 0} entities visible, mutations ${body.mutationsAllowed ? "enabled" : "disabled"}.`
          : `DataHub live read is not verified yet: ${body.cloud?.reason ?? "unknown reason"}`);
    } catch {
      setToast("Could not reach the local health endpoint.");
    } finally {
      setTesting(false);
    }
  }

  return <>
    <PageHeader eyebrow="Connection and safety" title="Settings"
      description="Sentiwellyn defaults to fixtures and refuses to claim a live DataHub result until a real read has been verified."
      action={<button className="secondary" onClick={testConnection} disabled={testing}>{testing ? "Testing…" : "Test connection"}</button>} />

    <div className="settings-list">
      <section className="card panel settings-card">
        <div className="panel-title">DataHub connection</div>
        <div className="panel-note">Credentials are read server-side only and are never returned to the browser.</div>
        <div className="setting-row"><span>Workspace URL</span><code>{health?.mode === "cloud" ? "configured server-side" : "not configured"}</code></div>
        <div className="setting-row"><span>API token</span><code>{health?.mode === "cloud" ? "server-side only / optional for OSS" : "••••••••••••"}</code></div>
        <div className="setting-row"><span>Read permission</span><span className={`status ${health?.cloud.live ? "status-verified" : ""}`}><i className="pulse" />{health?.cloud.live ? "verified" : "unverified"}</span></div>
        <div className="setting-row"><span>Write permission</span><span className={`status ${health?.mutationsAllowed ? "status-verified" : ""}`}><i className="pulse" />{health?.mutationsAllowed ? "enabled with approval" : "disabled"}</span></div>
        {health && (
          <div className="setting-readout">
            <div className="panel-kicker">Last health read</div>
            <code>status={health.status} · mode={health.mode} · cloud.configured={String(health.cloud.configured)} · cloud.live={String(health.cloud.live)} · mutationsAllowed={String(health.mutationsAllowed)}</code>
          </div>
        )}
      </section>

      <section className="card panel settings-card">
        <div className="panel-title">Mode</div>
        <div className="panel-note">Demo reads deterministic fixtures. Live mode reads DataHub OSS on the VPS and refuses write-back until approval plus read-back verification.</div>
        <div className="segmented">
          <button className={`segmented-item ${health?.mode !== "cloud" ? "segmented-active" : ""}`}>Demo — fixture data</button>
          <button className={`segmented-item ${health?.mode === "cloud" ? "segmented-active" : ""}`} onClick={() => setToast("Live mode is controlled by server env: DATAHUB_MODE=cloud, DATAHUB_GMS_URL, and DATAHUB_ALLOW_MUTATIONS=true for approved write-back.")}>DataHub OSS — live metadata</button>
        </div>
      </section>

      <section className="card panel settings-card">
        <div className="panel-title">Safety</div>
        <div className="panel-note">These defaults are deliberate and are enforced server-side.</div>
        <div className="setting-row"><span>Mutations enabled</span><span className="status"><i className="pulse" />disabled by default</span></div>
        <div className="setting-row"><span>Human approval</span><span className="status status-verified"><i className="pulse" />required, locked on</span></div>
        <div className="setting-row"><span>Allowed operations</span><span>update description · add owner · add tag · add glossary term</span></div>
      </section>

      <section className="card panel settings-card">
        <div className="panel-title">Appearance</div>
        <div className="panel-note">The choice is stored locally and applied before first paint.</div>
        <div className="setting-row">
          <span>Theme</span>
          <button className="secondary compact" onClick={toggle}>
            {theme === "dark" ? <IconSun size={14} /> : <IconMoon size={14} />} Use {theme === "dark" ? "light" : "dark"} theme
          </button>
        </div>
      </section>
    </div>
    <BackLink onClick={() => goto("Overview")} />
  </>;
}

function ChatPanel({ onClose, entity, goto }: { onClose: () => void; entity: EntityRisk; goto: (v: ViewName) => void }) {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ role: "user" | "agent"; text: string }[]>([
    { role: "user", text: "Scan customer_orders and find risk for this week." },
    { role: "agent", text: `${entity.name} — health ${entity.health}/100, risk estimate ${entity.risk} (${severityLabels[entity.severity]}). Impact: ${entity.impact}. Evidence: ${entity.citation.source}, ${Math.round(entity.citation.confidence * 100)}% confidence, ${entity.citation.id}.` },
  ]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setLog((prev) => [...prev, { role: "user", text }, {
      role: "agent",
      text: "This demo build answers from fixtures and never writes to DataHub. Wire the MCP bridge and a verified Cloud read to make this a live agent turn.",
    }]);
    setInput("");
  }

  return (
    <div className="drawer-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className="drawer card" role="dialog" aria-modal="true" aria-label="Sentiwellyn chat agent">
        <div className="drawer-head">
          <div>
            <div className="panel-kicker">Operator console</div>
            <div className="panel-title">Chat agent</div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close chat agent"><IconClose size={16} /></button>
        </div>

        <div className="chat-log">
          {log.map((line, i) => (
            <div key={i} className={`chat-line chat-${line.role}`}>
              <div className="panel-kicker">{line.role === "user" ? "You" : "Sentiwellyn"}</div>
              <p>{line.text}</p>
            </div>
          ))}
        </div>

        <div className="chat-connections">
          <div className="panel-kicker">Connections</div>
          <div className="conn-row"><span className="status status-verified"><i className="pulse" />Sentiwellyn API</span><small>local</small></div>
          <div className="conn-row"><span className="status"><i className="pulse" />DataHub Cloud</span><small>not configured</small></div>
          <div className="conn-row"><span className="status"><i className="pulse" />MCP bridge</span><small>not configured</small></div>
        </div>

        <div className="chat-composer">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Ask about an entity" aria-label="Message the agent" />
          <button className="primary" onClick={send}>Send</button>
        </div>
        <p className="chat-safety">The agent can propose changes. Nothing is written without approval.</p>
        <button className="text-button" onClick={() => { onClose(); goto("Proposed Fixes"); }}>Open proposal queue <IconArrowRight size={14} /></button>
      </aside>
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return <button className="back-link" onClick={onClick}><IconArrowLeft size={16} /> Back to overview</button>;
}

function ProposalModal({ selected, onClose, onApprove, onReject, approving }: {
  selected: EntityRisk; onClose: () => void;
  onApprove: (e: EntityRisk) => void; onReject: () => void; approving: boolean;
}) {
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="proposal-title">
        <div className="modal-header">
          <span className="signal-badge"><i className="signal-dot" />Proposal review</span>
          <button className="icon-button" onClick={onClose} aria-label="Close proposal review"><IconClose size={16} /></button>
        </div>

        <div className="notice-bar"><IconAlert size={16} /><span>Approval calls the guarded server mutation route; verification requires DataHub read-back.</span></div>

        <div className="eyebrow">Guarded change · {selected.citation.id}</div>
        <h2 id="proposal-title">{selected.name}</h2>
        <p className="subtitle">Review the evidence and approve the exact mutation. In live mode, the server writes to DataHub only after this click and reports verified only after read-back matches.</p>

        <div className="diff">
          <div><span>current</span><strong>Missing owner</strong></div>
          <div className="arrow"><IconArrowRight size={18} /></div>
          <div><span>proposed</span><strong>Owner from lineage</strong></div>
        </div>

        <div className="evidence-box">
          <div className="evidence-heading">
            <span>Evidence trail</span>
            <b>{Math.round(selected.citation.confidence * 100)}% confidence</b>
          </div>
          <strong>{selected.citation.fact}</strong>
          <p>Source: {selected.citation.source} · Impact: {selected.impact}</p>
          <code className="urn-line">{selected.urn}</code>
        </div>

        <div className="modal-actions">
          <button className="secondary" onClick={onReject} disabled={approving}>Reject</button>
          <button className="primary" onClick={() => onApprove(selected)} disabled={approving}>{approving ? "Verifying…" : "Approve live mutation"} <IconCheck size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, detail, tone }: { label: string; value: React.ReactNode; detail: string; tone?: "green" | "amber" | "blue" }) {
  return (
    <div className={`card metric ${tone ? `metric-${tone}` : ""}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}
