export type Severity = "critical" | "high" | "medium" | "low";
export type IssueStatus = "needs_review" | "proposed" | "verified";

export type Citation = {
  id: string;
  source: "schema" | "lineage" | "ownership" | "freshness";
  fact: string;
  confidence: number;
};

export type EntityRisk = {
  urn: string;
  name: string;
  domain: string;
  health: number;
  risk: number;
  severity: Severity;
  impact: string;
  reason: string;
  status: IssueStatus;
  citation: Citation;
};

export type ScanReport = {
  mode: "demo" | "cloud";
  scanned: number;
  health: number;
  fixed: number;
  pending: number;
  risks: EntityRisk[];
  scannedAt: string;
};
