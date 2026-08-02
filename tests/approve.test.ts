import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/approve/route";

const entityUrn = "urn:li:dataset:(urn:li:dataPlatform:postgres,analytics.customer_orders,PROD)";
const readDescription = "Sentiwellyn verified 2026-08-01T00:00:00.000Z. Evidence: Read directly from DataHub entity";

const searchPayload = {
  data: {
    searchAcrossEntities: {
      count: 1,
      searchResults: [
        {
          entity: {
            urn: entityUrn,
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

const mutationPayload = { data: { updateDescription: true } };
const readBackPayload = {
  data: {
    entity: {
      urn: entityUrn,
      name: "customer_orders",
      properties: { name: "analytics.customer_orders", description: null, qualifiedName: "analytics.customer_orders" },
      editableProperties: { description: readDescription },
      ownership: { owners: [] },
      schemaMetadata: { fields: [] },
    },
  },
};

afterEach(() => {
  delete process.env.DATAHUB_MODE;
  delete process.env.DATAHUB_GMS_URL;
  delete process.env.DATAHUB_ALLOW_MUTATIONS;
  vi.restoreAllMocks();
});

describe("approval route", () => {
  it("refuses to mutate until a human approval flag is provided", async () => {
    process.env.DATAHUB_MODE = "cloud";
    const response = await POST(new Request("http://localhost/api/approve", { method: "POST", body: JSON.stringify({ approved: false }) }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("approved=true");
  });

  it("executes mutation and reports verified only after read-back matches", async () => {
    process.env.DATAHUB_MODE = "cloud";
    process.env.DATAHUB_GMS_URL = "https://datahub.example";
    process.env.DATAHUB_ALLOW_MUTATIONS = "true";

    let approvedDescription = "";
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(searchPayload), { status: 200 }))
      .mockImplementationOnce(async (_url, init) => {
        const requestBody = JSON.parse(String(init?.body));
        approvedDescription = requestBody.variables.input.description;
        return new Response(JSON.stringify(mutationPayload), { status: 200 });
      })
      .mockImplementationOnce(async () => {
        return new Response(JSON.stringify({
          data: {
            entity: {
              ...readBackPayload.data.entity,
              editableProperties: { description: approvedDescription },
            },
          },
        }), { status: 200 });
      });

    const response = await POST(new Request("http://localhost/api/approve", {
      method: "POST",
      body: JSON.stringify({ approved: true, entityUrn }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.executed).toBe(true);
    expect(body.verified).toBe(true);
    expect(body.proposal.entityUrn).toBe(entityUrn);
  });
});
