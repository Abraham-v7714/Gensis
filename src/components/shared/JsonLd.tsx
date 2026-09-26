import * as React from "react";
import { safeJsonLd } from "@/lib/seo/jsonLd";

export interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Server Component: Renders an XSS-escaped JSON-LD structured data script.
 */
export function JsonLd({ data }: JsonLdProps) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLd(data),
      }}
    />
  );
}
