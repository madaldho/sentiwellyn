import { NextResponse } from "next/server";
import { readCloudConfig } from "@/src/lib/cloud/config";
import { scanDataHub } from "@/src/lib/datahub";

export async function GET() {
  const mode = process.env.DATAHUB_MODE === "cloud" ? "cloud" : "demo";

  if (mode === "demo") {
    return NextResponse.json({
      status: "ok",
      mode,
      cloud: {
        configured: false,
        adapter: "demo_fixtures",
        live: false,
      },
      mutationsAllowed: false,
    });
  }

  const config = readCloudConfig();
  if (!config.ok) {
    return NextResponse.json(
      {
        status: "degraded",
        mode,
        cloud: {
          configured: false,
          adapter: "datahub_graphql",
          live: false,
          reason: config.reason,
        },
        mutationsAllowed: false,
      },
      { status: 503 },
    );
  }

  try {
    const report = await scanDataHub(config.config);
    return NextResponse.json({
      status: "ok",
      mode,
      cloud: {
        configured: true,
        adapter: "datahub_graphql",
        live: true,
        scanned: report.scanned,
        lastReadAt: report.scannedAt,
      },
      mutationsAllowed: config.config.allowMutations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        mode,
        cloud: {
          configured: true,
          adapter: "datahub_graphql",
          live: false,
          reason: error instanceof Error ? error.message : "DataHub read failed.",
        },
        mutationsAllowed: config.config.allowMutations,
      },
      { status: 503 },
    );
  }
}
