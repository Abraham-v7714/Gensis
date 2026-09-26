import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductInfo } from "@/components/commerce/ProductInfo";
import { CommerceState } from "@/components/commerce/CommerceState";
import { commerce, isCommerceConfigured } from "@/lib/commerce";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/shared/JsonLd";
import { getProductJsonLd, getBreadcrumbJsonLd } from "@/lib/seo/jsonLd";

type ProductRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductRouteProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isCommerceConfigured()) {
    return constructMetadata({
      fallbackTitle: `Product — ${slug}`,
      fallbackDescription: "GENSIS architectural garment details.",
    });
  }

  const product = await commerce.getProductBySlug(slug);
  if (!product) {
    return constructMetadata({
      fallbackTitle: "Product Not Found",
      fallbackDescription: "The requested GENSIS product could not be found.",
    });
  }

  const primaryImage = product.images[0]?.url;

  return constructMetadata({
    fallbackTitle: product.title,
    fallbackDescription: product.description || "GENSIS architectural garment details.",
    canonical: `/products/${slug}`,
    image: primaryImage,
  });
}

export default async function ProductDetailRoute({
  params,
}: ProductRouteProps) {
  const { slug } = await params;

  if (!isCommerceConfigured()) {
    return (
      <PageContainer>
        <Section>
          <CommerceState type="unavailable" />
        </Section>
      </PageContainer>
    );
  }

  const product = await commerce.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <PageContainer>
      <JsonLd
        data={[
          getProductJsonLd(product, `/products/${slug}`),
          getBreadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Shop", url: "/shop" },
            { name: product.title, url: `/products/${slug}` },
          ]),
        ]}
      />
      <Section className="pt-[var(--spacing-8)] pb-[var(--spacing-16)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--spacing-10)] items-start">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} title={product.title} />
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-[var(--spacing-12)]">
            <ProductInfo product={product} />
          </div>
        </div>
      </Section>
    </PageContainer>
  );
}
