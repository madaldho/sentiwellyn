export type CloudConfig = {
  baseUrl: string;
  token?: string;
  allowMutations: boolean;
};

type CloudConfigInput = {
  DATAHUB_CLOUD_URL?: string;
  DATAHUB_CLOUD_TOKEN?: string;
  DATAHUB_GMS_URL?: string;
  DATAHUB_GMS_TOKEN?: string;
  DATAHUB_ALLOW_MUTATIONS?: string;
};

type CloudConfigResult =
  | { ok: true; config: CloudConfig }
  | { ok: false; reason: string };

export function readCloudConfig(
  input: CloudConfigInput = {
    DATAHUB_CLOUD_URL: process.env.DATAHUB_CLOUD_URL,
    DATAHUB_CLOUD_TOKEN: process.env.DATAHUB_CLOUD_TOKEN,
    DATAHUB_GMS_URL: process.env.DATAHUB_GMS_URL,
    DATAHUB_GMS_TOKEN: process.env.DATAHUB_GMS_TOKEN,
    DATAHUB_ALLOW_MUTATIONS: process.env.DATAHUB_ALLOW_MUTATIONS,
  },
): CloudConfigResult {
  const rawUrl = input.DATAHUB_CLOUD_URL?.trim() || input.DATAHUB_GMS_URL?.trim();
  const token = input.DATAHUB_CLOUD_TOKEN?.trim() || input.DATAHUB_GMS_TOKEN?.trim();

  if (!rawUrl) {
    return { ok: false, reason: "DATAHUB_CLOUD_URL is required." };
  }

  if (token && token.length < 8) {
    return { ok: false, reason: "DATAHUB_CLOUD_TOKEN must be at least 8 characters when provided." };
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "DATAHUB_CLOUD_URL must be an absolute http(s) URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "DATAHUB_CLOUD_URL must be an absolute http(s) URL." };
  }

  return {
    ok: true,
    config: {
      baseUrl: url.toString().replace(/\/$/, ""),
      token,
      allowMutations: input.DATAHUB_ALLOW_MUTATIONS === "true",
    },
  };
}
