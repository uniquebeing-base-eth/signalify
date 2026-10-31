import crypto from "node:crypto";

export type OAuthProvider = "google" | "microsoft";

export function buildOAuthAuthorizationUrl({
  provider,
  clientId,
  redirectUri,
  scopes,
  state,
}: {
  provider: OAuthProvider;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
}) {
  const baseUrl =
    provider === "google"
      ? "https://accounts.google.com/o/oauth2/v2/auth"
      : "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `${baseUrl}?${params.toString()}`;
}

export function createOAuthState() {
  return crypto.randomBytes(24).toString("hex");
}

export function validateOAuthState(expectedState: string, actualState: string) {
  if (!expectedState || !actualState || expectedState.length !== actualState.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedState),
    Buffer.from(actualState),
  );
}

export function getOAuthProviderConfig(provider: OAuthProvider) {
  return {
    provider,
    clientId: provider === "google" ? process.env.GOOGLE_CLIENT_ID ?? "" : process.env.MICROSOFT_CLIENT_ID ?? "",
    clientSecret:
      provider === "google" ? process.env.GOOGLE_CLIENT_SECRET ?? "" : process.env.MICROSOFT_CLIENT_SECRET ?? "",
    redirectUri: process.env.OAUTH_REDIRECT_URI ?? "http://localhost:3000/api/oauth/callback",
    scopes:
      provider === "google"
        ? ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/calendar.readonly"]
        : ["Mail.Read", "Calendars.Read"],
  };
}
