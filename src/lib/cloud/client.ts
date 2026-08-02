import type { CloudConfig } from "./config";

type Fetcher = typeof fetch;

type SearchResult = {
  urn?: string;
  name?: string;
  type?: string;
};

type CloudClient = {
  search(query: string): Promise<SearchResult[]>;
  applyFix?: never;
};

const SEARCH_QUERY = `
  query SearchEntities($query: String!) {
    search(input: { type: ENTITY, query: $query, start: 0, count: 20 }) {
      searchResults {
        entity {
          urn
          type
        }
      }
    }
  }
`;

export function createCloudClient(
  config: CloudConfig,
  fetcher: Fetcher = fetch,
): CloudClient {
  const endpoint = `${config.baseUrl.replace(/\/$/, "")}/api/graphql`;

  return {
    async search(query: string) {
      const response = await fetcher(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: { query },
        }),
      });

      if (!response.ok) {
        throw new Error(`DataHub Cloud request failed with HTTP ${response.status}.`);
      }

      const payload = (await response.json()) as {
        data?: { search?: { searchResults?: SearchResult[] } };
        errors?: unknown[];
      };

      if (payload.errors?.length) {
        throw new Error("DataHub Cloud returned a GraphQL error.");
      }

      return payload.data?.search?.searchResults ?? [];
    },
  };
}
