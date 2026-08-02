import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/health/route";

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
            schemaMetadata: { fields: [] },
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

describe("health route", () => {
  it("reports demo readiness without exposing configuration", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      mode: "demo",
      cloud: {
        configured: false,
        adapter: "demo_fixtures",
        live: false,
      },
      mutationsAllowed: false,
    });
    expect(JSON.stringify(body)).not.toContain("TOKEN");
  });

  it("reports incomplete Cloud configuration as degraded", async () => {
    process.env.DATAHUB_MODE = "cloud";

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      status: "degraded",
      mode: "cloud",
      cloud: {
        configured: false,
        adapter: "datahub_graphql",
        live: false,
      },
    });
    expect(body.cloud.reason).toContain("DATAHUB_CLOUD_URL is required");
  });

  it("reports live when DataHub GraphQL read succeeds", async () => {
    process.env.DATAHUB_MODE = "cloud";
    process.env.DATAHUB_GMS_URL = "https://datahub.example";
    process.env.DATAHUB_ALLOW_MUTATIONS = "true";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(datasetSearchPayload), { status: 200 }));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      mode: "cloud",
      cloud: {
        configured: true,
        adapter: "datahub_graphql",
        live: true,
        scanned: 1,
      },
      mutationsAllowed: true,
    });
    expect(JSON.stringify(body)).not.toContain("token-for-test-only");
  });
});
