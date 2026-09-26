import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPreviewCms } from "@/lib/cms";
import { LookbookPage } from "@/components/pages";
import { constructMetadata } from "@/lib/seo";

type LookbookRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LookbookRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const client = await getPreviewCms();
  const lookbook = await client.getLookbookBySlug(slug);

  if (!lookbook) {
    return constructMetadata({
      fallbackTitle: `Lookbook — ${slug}`,
      fallbackDescription: "GENSIS Lookbook visual imagery and editorial collection.",
    });
  }

  return constructMetadata({
    seo: lookbook.seo,
    fallbackTitle: lookbook.title,
    fallbackDescription: lookbook.description,
    canonical: `/lookbook/${slug}`,
    image: lookbook.coverMedia?.url,
  });
}

/**
 * Dynamic Lookbook Route — Stage 4.4
 *
 * Route Ownership:
 *   Route params (slug) → getPreviewCms() → client.getLookbookBySlug(slug) → Lookbook → <LookbookPage />
 *
 * Draft Mode OFF: published content only (production client)
 * Draft Mode ON:  draft-aware content (preview client via getPreviewCms)
 */
export default async function LookbookRoute({
  params,
}: LookbookRouteProps) {
  const { slug } = await params;
  const client = await getPreviewCms();
  const lookbook = await client.getLookbookBySlug(slug);

  if (!lookbook) {
    notFound();
  }

  return <LookbookPage lookbook={lookbook} />;
}
