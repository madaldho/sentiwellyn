import { describe, expect, it, vi } from "vitest";
import { createCloudClient } from "@/src/lib/cloud/client";

describe("DataHub Cloud client", () => {
  it("sends a read-only GraphQL request with server-side auth", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: { search: { searchResults: [] } } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const client = createCloudClient(
      {
        baseUrl: "https://workspace.example/",
        token: "token-for-test-only",
        allowMutations: false,
      },
      fetcher,
    );

    const result = await client.search("customer_orders");

    expect(result).toEqual([]);
    expect(fetcher).toHaveBeenCalledWith(
      "https://workspace.example/api/graphql",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token-for-test-only",
        },
      }),
    );
    const request = fetcher.mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      variables: { query: "customer_orders" },
    });
  });

  it("rejects non-success responses without exposing the token", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("upstream failure", { status: 502 }),
    );
    const client = createCloudClient(
      {
        baseUrl: "https://workspace.example",
        token: "token-for-test-only",
        allowMutations: false,
      },
      fetcher,
    );

    await expect(client.search("customer_orders")).rejects.toThrow(
      "DataHub Cloud request failed with HTTP 502.",
    );
  });

  it("does not expose mutation methods when mutations are disabled", () => {
    const client = createCloudClient({
      baseUrl: "https://workspace.example",
      token: "token-for-test-only",
      allowMutations: false,
    });

    expect(client.applyFix).toBeUndefined();
  });
});
