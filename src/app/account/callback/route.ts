import { NextRequest, NextResponse } from "next/server";
import { handleOAuthCallbackAction } from "@/features/account/actions";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const destination = searchParams.get("destination") || undefined;
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam) {
    console.error("[GENSIS Auth Callback] Shopify returned OAuth error:", errorParam, errorDescription);
    const loginUrl = new URL("/account/login", request.nextUrl.origin);
    loginUrl.searchParams.set("error", errorDescription || "Authentication cancelled or denied.");
    return NextResponse.redirect(loginUrl);
  }

  if (!code || !state) {
    const loginUrl = new URL("/account/login", request.nextUrl.origin);
    loginUrl.searchParams.set("error", "Missing OAuth callback parameters.");
    return NextResponse.redirect(loginUrl);
  }

  const result = await handleOAuthCallbackAction(code, state, destination);

  if (!result.ok) {
    console.error("[GENSIS Auth Callback] OAuth callback processing failed:", result.error.message);
    const loginUrl = new URL("/account/login", request.nextUrl.origin);
    loginUrl.searchParams.set("error", result.error.message);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect user to destination page (e.g. /account)
  const targetUrl = new URL(result.data, request.nextUrl.origin);
  return NextResponse.redirect(targetUrl);
}
