import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { constructMetadata } from "@/lib/seo";
import { getCustomerProfileAction } from "@/features/account/actions";
import { AddressBookView } from "@/features/account/components/AddressBookView";

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "Address Book",
  fallbackDescription: "Manage your saved delivery locations and preferences.",
  noIndex: true,
});

export default async function AddressesPage() {
  const profileResult = await getCustomerProfileAction();

  if (!profileResult.ok) {
    redirect("/account/login");
  }

  return (
    <PageContainer>
      <Section className="py-[var(--spacing-12)]">
        <SectionHeading title="Address Book" eyebrow="Saved Delivery Locations" as="h1" />
        <div className="mt-[var(--spacing-8)]">
          <AddressBookView addresses={profileResult.data.addresses} />
        </div>
      </Section>
    </PageContainer>
  );
}
