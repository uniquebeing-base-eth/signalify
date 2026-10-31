import { NextResponse } from "next/server";

import { AntseedProvider } from "@/lib/model-gateway";

export async function GET() {
  const provider = new AntseedProvider();
  const health = await provider.healthCheck();
  const models = await provider.listModels();

  return NextResponse.json({ health, models });
}
