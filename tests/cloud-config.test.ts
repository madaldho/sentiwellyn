import { describe, expect, it } from "vitest";
import { readCloudConfig } from "@/src/lib/cloud/config";

describe("DataHub Cloud configuration", () => {
  it("defaults to mutations disabled and accepts a valid HTTPS workspace", () => {
    const result = readCloudConfig({
      DATAHUB_CLOUD_URL: "https://workspace.example",
      DATAHUB_CLOUD_TOKEN: "token-for-test-only",
    });

    expect(result).toEqual({
      ok: true,
      config: {
        baseUrl: "https://workspace.example",
        token: "token-for-test-only",
        allowMutations: false,
      },
    });
  });

  it("accepts a self-hosted GMS URL without token for private OSS deployments", () => {
    const result = readCloudConfig({ DATAHUB_GMS_URL: "http://194.113.74.21:8080" });

    expect(result).toEqual({
      ok: true,
      config: {
        baseUrl: "http://194.113.74.21:8080",
        token: undefined,
        allowMutations: false,
      },
    });
  });

  it("rejects non-HTTP workspace values", () => {
    const result = readCloudConfig({
      DATAHUB_CLOUD_URL: "workspace.example",
      DATAHUB_CLOUD_TOKEN: "token-for-test-only",
    });

    expect(result).toEqual({
      ok: false,
      reason: "DATAHUB_CLOUD_URL must be an absolute http(s) URL.",
    });
  });

  it("parses the mutation flag explicitly", () => {
    const result = readCloudConfig({
      DATAHUB_CLOUD_URL: "https://workspace.example/",
      DATAHUB_CLOUD_TOKEN: "token-for-test-only",
      DATAHUB_ALLOW_MUTATIONS: "true",
    });

    expect(result).toMatchObject({
      ok: true,
      config: {
        baseUrl: "https://workspace.example",
        allowMutations: true,
      },
    });
  });
});
