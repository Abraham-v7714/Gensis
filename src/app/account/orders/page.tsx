import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { constructMetadata } from "@/lib/seo";
import { getCustomerOrdersAction } from "@/features/account/actions";
import { OrderHistoryView } from "@/features/account/components/OrderHistoryView";

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "Order History",
  fallbackDescription: "View your past GENSIS garment orders and shipping details.",
  noIndex: true,
});

export interface OrdersPageProps {
  searchParams?: Promise<{
    after?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const after = resolvedParams.after;

  const ordersResult = await getCustomerOrdersAction({ first: 10, after });

  if (ordersResult.error && !after) {
    // Check if redirect to login is needed for unauthenticated state vs provider failure
    redirect("/account/login");
  }

  return (
    <PageContainer>
      <Section className="py-[var(--spacing-12)]">
        <SectionHeading title="Order History" eyebrow="Purchases" as="h1" />
        <div className="mt-[var(--spacing-8)]">
          <OrderHistoryView
            orders={ordersResult.items}
            pageInfo={ordersResult.pageInfo}
            error={Boolean(ordersResult.error)}
          />
        </div>
      </Section>
    </PageContainer>
  );
}
