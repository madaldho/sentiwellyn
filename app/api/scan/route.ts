import { NextResponse } from "next/server";
import { demoReport } from "@/src/lib/fixtures";
import { readCloudConfig } from "@/src/lib/cloud/config";
import { scanDataHub } from "@/src/lib/datahub";

export async function GET() {
  const mode = process.env.DATAHUB_MODE === "cloud" ? "cloud" : "demo";

  if (mode === "cloud") {
    const config = readCloudConfig();

    if (!config.ok) {
      return NextResponse.json(
        { error: config.reason },
        { status: 503 },
      );
    }

    try {
      const report = await scanDataHub(config.config);
      return NextResponse.json(report);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "DataHub scan failed." },
        { status: 503 },
      );
    }
  }

  return NextResponse.json({ ...demoReport, scannedAt: new Date().toISOString() });
}
