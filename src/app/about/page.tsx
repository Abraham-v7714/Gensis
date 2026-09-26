import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPreviewCms } from "@/lib/cms";
import { AboutPage as AboutPageComponent } from "@/components/pages";
import { constructMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const client = await getPreviewCms();
  const about = await client.getAbout();

  if (!about) {
    return constructMetadata({
      fallbackTitle: "About",
      fallbackDescription: "About GENSIS: Architectural garment laboratory and brand philosophy.",
    });
  }

  return constructMetadata({
    seo: about.seo,
    fallbackTitle: about.title,
    fallbackDescription: about.intro || about.description,
    canonical: "/about",
  });
}

/**
 * About Page Content Route — Stage 4.4
 *
 * Route Ownership:
 *   getPreviewCms() → client.getAbout() → AboutPage model → <AboutPage />
 *
 * Draft Mode OFF: published About content only (production client)
 * Draft Mode ON:  draft-aware About content (preview client via getPreviewCms)
 */
export default async function AboutRoute() {
  const client = await getPreviewCms();
  const about = await client.getAbout();

  if (!about) {
    notFound();
  }

  return <AboutPageComponent page={about} />;
}
