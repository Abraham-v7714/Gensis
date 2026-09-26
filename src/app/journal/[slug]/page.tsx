import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPreviewCms } from "@/lib/cms";
import { JournalArticlePage } from "@/components/pages";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/shared/JsonLd";
import { getArticleJsonLd, getBreadcrumbJsonLd } from "@/lib/seo/jsonLd";

type JournalArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: JournalArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const client = await getPreviewCms();
  const article = await client.getJournalArticleBySlug(slug);

  if (!article) {
    return constructMetadata({
      fallbackTitle: `Journal Article — ${slug}`,
      fallbackDescription: "GENSIS Journal article editorial content.",
    });
  }

  return constructMetadata({
    seo: article.seo,
    fallbackTitle: article.title,
    fallbackDescription: article.excerpt || article.description,
    canonical: `/journal/${slug}`,
    image: article.featuredMedia?.url,
    type: "article",
    publishedTime: article.publishedAt || undefined,
  });
}

/**
 * Dynamic Journal Article Content Route — Stage 4.4 & 4.17
 *
 * Route Ownership:
 *   Route params (slug) → getPreviewCms() → cms.getJournalArticleBySlug(slug)
 *   → JournalArticle → <JournalArticlePage />
 *
 * Draft Mode OFF: published content only (production client)
 * Draft Mode ON:  draft-aware content (preview client via getPreviewCms)
 */
export default async function JournalArticleRoute({
  params,
}: JournalArticleRouteProps) {
  const { slug } = await params;
  const client = await getPreviewCms();
  const article = await client.getJournalArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          getArticleJsonLd(article, `/journal/${slug}`),
          getBreadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Journal", url: "/journal" },
            { name: article.title, url: `/journal/${slug}` },
          ]),
        ]}
      />
      <JournalArticlePage article={article} />
    </>
  );
}
