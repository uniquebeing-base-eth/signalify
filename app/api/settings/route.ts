import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    environment: {
      antseedBaseUrl: process.env.ANTSEED_BASE_URL ?? "not-set",
      antseedConfigured: Boolean(process.env.ANTSEED_API_KEY),
      defaultModel: process.env.ANTSEED_DEFAULT_MODEL ?? "not-set",
    },
  });
}
