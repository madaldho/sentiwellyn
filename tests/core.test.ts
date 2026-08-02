import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/scan/route";
import { demoReport } from "@/src/lib/fixtures";
import { createProposal, recalculateHealth, severityForRisk } from "@/src/lib/scoring";

const datasetSearchPayload = {
  data: {
    searchAcrossEntities: {
      count: 1,
      searchResults: [
        {
          entity: {
            urn: "urn:li:dataset:(urn:li:dataPlatform:postgres,analytics.customer_orders,PROD)",
            type: "DATASET",
            name: "customer_orders",
            properties: { name: "analytics.customer_orders", description: null, qualifiedName: "analytics.customer_orders" },
            editableProperties: { description: null },
            ownership: { owners: [] },
            schemaMetadata: { fields: [{ fieldPath: "id", description: null }, { fieldPath: "amount", description: "Order amount" }] },
          },
        },
      ],
    },
  },
};

afterEach(() => {
  delete process.env.DATAHUB_MODE;
  delete process.env.DATAHUB_CLOUD_URL;
  delete process.env.DATAHUB_CLOUD_TOKEN;
  delete process.env.DATAHUB_GMS_URL;
  delete process.env.DATAHUB_GMS_TOKEN;
  delete process.env.DATAHUB_ALLOW_MUTATIONS;
  vi.restoreAllMocks();
});

describe("risk scoring", () => {
  it("maps risk thresholds to the expected severity", () => {
    expect(severityForRisk(0)).toBe("low");
    expect(severityForRisk(49)).toBe("low");
    expect(severityForRisk(50)).toBe("medium");
    expect(severityForRisk(70)).toBe("high");
    expect(severityForRisk(85)).toBe("critical");
  });

  it("clamps recalculated health to the 0–100 range", () => {
    expect(recalculateHealth(-10)).toBe(100);
    expect(recalculateHealth(35)).toBe(65);
    expect(recalculateHealth(140)).toBe(0);
  });

  it("creates an approval-gated proposal with its citation", () => {
    const entity = demoReport.risks[0];
    const proposal = createProposal(entity);

    expect(proposal).toMatchObject({
      id: "P-analytics-customer_orders",
      entityUrn: entity.urn,
      status: "awaiting_approval",
      citationId: entity.citation.id,
      evidence: entity.citation.fact,
    });
  });
});

describe("scan route mode guard", () => {
  it("returns a fresh demo report when Cloud mode is not enabled", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe("demo");
    expect(body.risks).toHaveLength(demoReport.risks.length);
    expect(body.scannedAt).not.toBe(demoReport.scannedAt);
  });

  it("returns a configuration error when Cloud mode lacks required settings", async () => {
    process.env.DATAHUB_MODE = "cloud";
    delete process.env.DATAHUB_CLOUD_URL;
    delete process.env.DATAHUB_CLOUD_TOKEN;

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toContain("DATAHUB_CLOUD_URL is required");
  });

  it("returns a live DataHub scan when the adapter can read entities", async () => {
    process.env.DATAHUB_MODE = "cloud";
    process.env.DATAHUB_GMS_URL = "https://datahub.example";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(datasetSearchPayload), { status: 200 }));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe("cloud");
    expect(body.scanned).toBe(1);
    expect(body.risks[0]).toMatchObject({
      name: "analytics.customer_orders",
      status: "proposed",
      citation: { source: "ownership" },
    });
  });
});
