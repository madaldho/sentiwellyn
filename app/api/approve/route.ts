import { NextResponse } from "next/server";
import { readCloudConfig } from "@/src/lib/cloud/config";
import { approveDescriptionMutation } from "@/src/lib/datahub";

type ApproveBody = {
  entityUrn?: string;
  approved?: boolean;
};

export async function POST(request: Request) {
  const mode = process.env.DATAHUB_MODE === "cloud" ? "cloud" : "demo";
  if (mode !== "cloud") {
    return NextResponse.json(
      { error: "Approval mutations require DATAHUB_MODE=cloud." },
      { status: 409 },
    );
  }

  let body: ApproveBody = {};
  try {
    body = (await request.json()) as ApproveBody;
  } catch {
    body = {};
  }

  if (body.approved !== true) {
    return NextResponse.json(
      { error: "Mutation refused until approved=true is provided." },
      { status: 409 },
    );
  }

  const config = readCloudConfig();
  if (!config.ok) {
    return NextResponse.json({ error: config.reason }, { status: 503 });
  }

  try {
    const verification = await approveDescriptionMutation(config.config, body.entityUrn);
    return NextResponse.json(verification, { status: verification.verified ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "DataHub approval mutation failed." },
      { status: 503 },
    );
  }
}
