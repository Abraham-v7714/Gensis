import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { BagView } from "@/features/cart/components/BagView";
import { commerce, isCommerceConfigured } from "@/lib/commerce";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "Bag",
  fallbackDescription: "Your GENSIS shopping bag items and checkout review.",
  canonical: "/bag",
  noIndex: true,
});

export default async function BagPage() {
  if (!isCommerceConfigured()) {
    return (
      <PageContainer>
        <Section className="py-[var(--spacing-8)]">
          <SectionHeading title="Shopping Bag" eyebrow="Selected Garments & Order Review" as="h1" />
          <div className="mt-[var(--spacing-8)]">
            <BagView
              cart={null}
              error={{
                code: "UNAVAILABLE",
                message: "Storefront credentials are not configured.",
              }}
            />
          </div>
        </Section>
      </PageContainer>
    );
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get("gensis_cart_id")?.value;

  const result = cartId ? await commerce.getCart(cartId) : null;

  return (
    <PageContainer>
      <Section className="py-[var(--spacing-8)]">
        <SectionHeading title="Shopping Bag" eyebrow="Selected Garments & Order Review" as="h1" />
        <div className="mt-[var(--spacing-8)]">
          {result ? (
            result.ok ? (
              <BagView cart={result.data} />
            ) : (
              <BagView cart={null} error={result.error} />
            )
          ) : (
            <BagView cart={null} />
          )}
        </div>
      </Section>
    </PageContainer>
  );
}
