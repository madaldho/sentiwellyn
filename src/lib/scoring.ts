import type { EntityRisk, Severity } from "./types";

export function severityForRisk(risk: number): Severity {
  if (risk >= 85) return "critical";
  if (risk >= 70) return "high";
  if (risk >= 50) return "medium";
  return "low";
}

export function recalculateHealth(risk: number): number {
  return Math.max(0, Math.min(100, 100 - risk));
}

export function createProposal(entity: EntityRisk) {
  return {
    id: `P-${entity.name.replace(/\./g, "-")}`,
    entityUrn: entity.urn,
    entityName: entity.name,
    status: "awaiting_approval" as const,
    before: "No assigned owner",
    after: "Proposed owner from lineage evidence",
    citationId: entity.citation.id,
    evidence: entity.citation.fact,
  };
}
