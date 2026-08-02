import type { EntityRisk, ScanReport } from "./types";
import type { CloudConfig } from "./cloud/config";
import { severityForRisk } from "./scoring";

type GraphQLError = { message?: string };
type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] };

type DatasetSearchResult = {
  searchAcrossEntities: {
    count: number;
    searchResults: Array<{
      entity: {
        urn: string;
        type?: string;
        name?: string;
        properties?: { name?: string; description?: string | null; qualifiedName?: string | null } | null;
        editableProperties?: { description?: string | null } | null;
        ownership?: { owners?: Array<unknown> | null } | null;
        schemaMetadata?: { fields?: Array<{ fieldPath?: string; description?: string | null }> | null } | null;
      };
    }>;
  };
};

type DatasetReadResult = {
  entity: {
    urn: string;
    name?: string;
    properties?: { name?: string; description?: string | null; qualifiedName?: string | null } | null;
    editableProperties?: { description?: string | null } | null;
    ownership?: { owners?: Array<unknown> | null } | null;
    schemaMetadata?: { fields?: Array<{ fieldPath?: string; description?: string | null }> | null } | null;
  } | null;
};

type UpdateDescriptionResult = { updateDescription?: boolean };

export type LiveProposal = {
  id: string;
  entityUrn: string;
  entityName: string;
  status: "awaiting_approval";
  before: string;
  after: string;
  citationId: string;
  evidence: string;
};

export type MutationVerification = {
  proposal: LiveProposal;
  mutation: "updateDescription";
  executed: boolean;
  verified: boolean;
  readBackDescription: string;
};

function authHeaders(config: CloudConfig): Record<string, string> {
  if (!config.token) return {};
  const token = config.token.trim();
  const value = /^(Bearer|Basic)\s+/i.test(token) ? token : `Bearer ${token}`;
  return { Authorization: value };
}

async function datahubGraphql<T>(config: CloudConfig, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`${config.baseUrl}/api/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...authHeaders(config),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DataHub GraphQL HTTP ${response.status}: ${text.slice(0, 160)}`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message ?? "Unknown DataHub GraphQL error").join("; "));
  }
  if (!payload.data) {
    throw new Error("DataHub GraphQL returned no data.");
  }
  return payload.data;
}

const datasetFragment = `
  urn
  type
  ... on Dataset {
    name
    properties { name description qualifiedName }
    editableProperties { description }
    ownership { owners { type } }
    schemaMetadata { fields { fieldPath description } }
  }
`;

function entityName(entity: DatasetSearchResult["searchAcrossEntities"]["searchResults"][number]["entity"]): string {
  return entity.properties?.qualifiedName ?? entity.properties?.name ?? entity.name ?? entity.urn.split(",")[1] ?? entity.urn;
}

function riskFromDataset(entity: DatasetSearchResult["searchAcrossEntities"]["searchResults"][number]["entity"]): EntityRisk {
  const missingOwner = (entity.ownership?.owners?.length ?? 0) === 0;
  const fields = entity.schemaMetadata?.fields ?? [];
  const missingFieldDescriptions = fields.filter((field) => !field.description?.trim()).length;
  const hasDescription = Boolean(entity.editableProperties?.description?.trim() || entity.properties?.description?.trim());
  const risk = Math.min(95, 28 + (missingOwner ? 35 : 0) + Math.min(22, missingFieldDescriptions * 4) + (hasDescription ? 0 : 10));
  const name = entityName(entity);

  return {
    urn: entity.urn,
    name,
    domain: "DataHub OSS",
    health: Math.max(0, 100 - risk),
    risk,
    severity: severityForRisk(risk),
    impact: `${fields.length || 1} schema fields inspected`,
    reason: missingOwner
      ? "Missing owner on a DataHub dataset"
      : missingFieldDescriptions > 0
        ? `${missingFieldDescriptions} schema fields lack descriptions`
        : "Governance metadata is readable and ready for enrichment",
    status: missingOwner || missingFieldDescriptions > 0 || !hasDescription ? "proposed" : "verified",
    citation: {
      id: `LIVE-${Buffer.from(entity.urn).toString("base64url").slice(0, 10)}`,
      source: missingOwner ? "ownership" : missingFieldDescriptions > 0 ? "schema" : "freshness",
      fact: `Read directly from DataHub entity ${entity.urn}`,
      confidence: 0.93,
    },
  };
}

export async function scanDataHub(config: CloudConfig): Promise<ScanReport> {
  const data = await datahubGraphql<DatasetSearchResult>(
    config,
    `query SentiwellynDatasetSearch($query: String!, $start: Int!, $count: Int!) {
      searchAcrossEntities(input: { types: [DATASET], query: $query, start: $start, count: $count }) {
        count
        searchResults { entity { ${datasetFragment} } }
      }
    }`,
    { query: "*", start: 0, count: 12 },
  );

  const risks = data.searchAcrossEntities.searchResults.map((result) => riskFromDataset(result.entity));
  const health = risks.length ? Math.round(risks.reduce((sum, risk) => sum + risk.health, 0) / risks.length) : 100;

  return {
    mode: "cloud",
    scanned: data.searchAcrossEntities.count,
    health,
    fixed: risks.filter((risk) => risk.status === "verified").length,
    pending: risks.filter((risk) => risk.status !== "verified").length,
    risks,
    scannedAt: new Date().toISOString(),
  };
}

export function createLiveProposal(entity: EntityRisk): LiveProposal {
  const marker = `Sentiwellyn verified ${new Date().toISOString()}`;
  return {
    id: `LIVE-P-${Buffer.from(entity.urn).toString("base64url").slice(0, 12)}`,
    entityUrn: entity.urn,
    entityName: entity.name,
    status: "awaiting_approval",
    before: entity.reason,
    after: `${marker}. Evidence: ${entity.citation.fact}`,
    citationId: entity.citation.id,
    evidence: entity.citation.fact,
  };
}

export async function approveDescriptionMutation(config: CloudConfig, entityUrn?: string): Promise<MutationVerification> {
  if (!config.allowMutations) {
    throw new Error("DATAHUB_ALLOW_MUTATIONS must be true before approval can execute a mutation.");
  }

  const report = await scanDataHub(config);
  const entity = report.risks.find((risk) => risk.urn === entityUrn) ?? report.risks[0];
  if (!entity) {
    throw new Error("No DataHub dataset was available for approval.");
  }

  const proposal = createLiveProposal(entity);
  const mutationResult = await datahubGraphql<UpdateDescriptionResult>(
    config,
    `mutation SentiwellynUpdateDescription($input: DescriptionUpdateInput!) {
      updateDescription(input: $input)
    }`,
    {
      input: {
        resourceUrn: proposal.entityUrn,
        description: proposal.after,
      },
    },
  );

  if (!mutationResult.updateDescription) {
    throw new Error("DataHub mutation returned false.");
  }

  const readBack = await datahubGraphql<DatasetReadResult>(
    config,
    `query SentiwellynReadBack($urn: String!) {
      entity(urn: $urn) { ${datasetFragment} }
    }`,
    { urn: proposal.entityUrn },
  );

  const readBackDescription = readBack.entity?.editableProperties?.description ?? readBack.entity?.properties?.description ?? "";
  const verified = readBackDescription.includes(proposal.after);

  return {
    proposal,
    mutation: "updateDescription",
    executed: true,
    verified,
    readBackDescription,
  };
}
