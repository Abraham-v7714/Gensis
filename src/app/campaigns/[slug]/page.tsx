import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPreviewCms } from "@/lib/cms";
import { CampaignPage } from "@/components/pages";
import { constructMetadata } from "@/lib/seo";

type CampaignRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CampaignRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const client = await getPreviewCms();
  const campaign = await client.getCampaignBySlug(slug);

  if (!campaign) {
    return constructMetadata({
      fallbackTitle: `Campaign — ${slug}`,
      fallbackDescription: "GENSIS editorial campaign story narrative.",
    });
  }

  return constructMetadata({
    seo: campaign.seo,
    fallbackTitle: campaign.title,
    fallbackDescription: campaign.description,
    canonical: `/campaigns/${slug}`,
    image: campaign.heroMedia?.url,
  });
}

/**
 * Dynamic Campaign Story Route — Stage 4.4
 *
 * Route Ownership:
 *   Route params (slug) → getPreviewCms() → client.getCampaignBySlug(slug) → Campaign → <CampaignPage />
 *
 * Draft Mode OFF: published content only (production client)
 * Draft Mode ON:  draft-aware content (preview client via getPreviewCms)
 */
export default async function CampaignRoute({
  params,
}: CampaignRouteProps) {
  const { slug } = await params;
  const client = await getPreviewCms();
  const campaign = await client.getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  return <CampaignPage campaign={campaign} />;
}
