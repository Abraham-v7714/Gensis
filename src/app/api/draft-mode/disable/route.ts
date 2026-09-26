/**
 * Draft Mode Disable Route — Stage 4.4
 *
 * Safely exits Next.js Draft Mode and redirects the editor back to the storefront.
 *
 * How it works:
 *   1. Editor clicks "Exit Preview" in the preview banner or Presentation Tool.
 *   2. This route calls draftMode().disable() to clear the Draft Mode cookie.
 *   3. Redirects to `?redirect` param (if safe same-origin) or falls back to "/".
 *
 * Security:
 *   - Disabling Draft Mode is always safe for anyone — it only removes the preview
 *     cookie, never exposes secrets or activates privileged access.
 *   - The redirect parameter is validated to be a relative path (same-origin only)
 *     to prevent open redirect attacks.
 *   - No authentication required — exiting preview is a zero-risk operation.
 *
 * Usage:
 *   GET /api/draft-mode/disable
 *   GET /api/draft-mode/disable?redirect=/journal/article-slug
 */

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<never> {
  const draftModeStore = await draftMode();
  draftModeStore.disable();

  // Validate redirect param: must be a relative path (no protocol, no host).
  // This prevents open redirect attacks.
  const redirectParam = request.nextUrl.searchParams.get("redirect");
  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/";

  redirect(safeRedirect);
}
