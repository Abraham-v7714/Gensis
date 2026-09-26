/**
 * Sanity Content Revalidation Webhook Endpoint — Stage 4.5
 *
 * Receives webhook events from Sanity Content Lake and invalidates specific Next.js
 * production cache tags on-demand when content is published, updated, or archived.
 *
 * Rules:
 * - Requires server-side `SANITY_REVALIDATE_SECRET` authentication via header.
 * - Draft mutations (`drafts.*` IDs or draft status) MUST NOT invalidate production tags.
 * - Published and archived/unpublished mutations trigger precise `revalidateTag(tag)`.
 * - Slug changes invalidate both old and new slug tags.
 * - Unknown document types fail closed without invalidating unrelated content.
 * - Fails safely without leaking secrets or stack traces.
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "crypto";
import { getTagsForDocument } from "@/lib/cms";

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/**
 * Extracts a string slug value from a raw payload field (string or Sanity slug object { current: string }).
 */
function parseSlug(rawSlug: unknown): string | null {
  if (typeof rawSlug === "string" && rawSlug.trim() !== "") {
    return rawSlug.trim();
  }
  if (
    typeof rawSlug === "object" &&
    rawSlug !== null &&
    "current" in rawSlug &&
    typeof (rawSlug as { current?: unknown }).current === "string"
  ) {
    return (rawSlug as { current: string }).current.trim();
  }
  return null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    console.error("[GENSIS CMS Revalidate] Server missing SANITY_REVALIDATE_SECRET");
    return NextResponse.json(
      { error: "Revalidation secret not configured" },
      { status: 500 }
    );
  }

  // Header authentication: x-sanity-secret or Bearer token
  const reqSecret =
    req.headers.get("x-sanity-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!reqSecret || !safeCompare(reqSecret, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
  }

  // 1. Check for draft mutation filtering
  const id = typeof body._id === "string" ? body._id : "";
  const isDraftId = id.startsWith("drafts.");

  // Check explicit status or action if provided
  const status = typeof body.status === "string" ? body.status : null;
  const isDraftStatus = status === "draft";

  if (isDraftId || isDraftStatus) {
    return NextResponse.json(
      { revalidated: false, reason: "Draft mutation ignored" },
      { status: 200 }
    );
  }

  // 2. Extract document type
  const docType =
    (typeof body._type === "string" && body._type) ||
    (typeof body.type === "string" && body.type) ||
    (typeof body.documentType === "string" && body.documentType) ||
    "";

  if (!docType) {
    return NextResponse.json({ error: "Missing document type" }, { status: 400 });
  }

  // 3. Extract current and previous slugs
  const slug = parseSlug(body.slug) ?? parseSlug(body.currentSlug);
  const slugPrevious = parseSlug(body.slugPrevious) ?? parseSlug(body.previousSlug);

  // 4. Map document type and slugs to cache tags
  const tags = getTagsForDocument(docType, slug, slugPrevious);

  if (tags.length === 0) {
    return NextResponse.json(
      { revalidated: false, reason: `No cache tags for document type '${docType}'` },
      { status: 200 }
    );
  }

  // 5. Invalidate target tags
  try {
    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }
  } catch (err) {
    console.error("[GENSIS CMS Revalidate] Error calling revalidateTag:", err);
    return NextResponse.json(
      { error: "Failed to revalidate cache tags" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    revalidated: true,
    type: docType,
    tags,
  });
}
