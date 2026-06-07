import {absoluteUrl, getRequestOrigin, jsonResponse} from "@/lib/agent-discovery";

export const dynamic = "force-dynamic";
export const revalidate = false;

export async function GET(request: Request) {
  const origin = getRequestOrigin(request);

  return jsonResponse({
    authorization_endpoint: absoluteUrl(origin, "/.well-known/oauth/not-supported/authorize"),
    blakeui_public_api_authentication:
      "blakeUI public documentation and MCP data APIs are currently unauthenticated and read-only; no OpenID Connect sign-in flow is advertised for public API access.",
    claims_supported: [],
    grant_types_supported: [],
    issuer: origin,
    jwks_uri: absoluteUrl(origin, "/.well-known/jwks.json"),
    response_types_supported: [],
    scopes_supported: [],
    subject_types_supported: [],
    token_endpoint: absoluteUrl(origin, "/.well-known/oauth/not-supported/token"),
  });
}
