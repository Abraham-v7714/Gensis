import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { constructMetadata } from "@/lib/seo";
import { getOrderDetailAction } from "@/features/account/actions";
import { OrderDetailView } from "@/features/account/components/OrderDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return constructMetadata({
    fallbackTitle: `Order Detail`,
    fallbackDescription: `View details for GENSIS order ${id}.`,
    noIndex: true,
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const orderResult = await getOrderDetailAction(decodedId);

  if (!orderResult.ok) {
    if (orderResult.error.code === "NOT_FOUND") {
      notFound();
    }
    redirect("/account/login");
  }

  return (
    <PageContainer>
      <Section className="py-[var(--spacing-12)]">
        <OrderDetailView order={orderResult.data} />
      </Section>
    </PageContainer>
  );
}
