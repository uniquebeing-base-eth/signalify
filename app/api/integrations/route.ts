import { NextResponse } from "next/server";

import { getOAuthProviderConfig } from "@/lib/oauth";

export async function GET() {
  return NextResponse.json({
    providers: [
      { name: "google", ...getOAuthProviderConfig("google") },
      { name: "microsoft", ...getOAuthProviderConfig("microsoft") },
    ],
  });
}
