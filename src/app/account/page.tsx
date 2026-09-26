import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { constructMetadata } from "@/lib/seo";
import { getCustomerProfileAction } from "@/features/account/actions";
import { ProfileView } from "@/features/account/components/ProfileView";

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "Account Profile",
  fallbackDescription: "Manage your GENSIS profile, order history, and preferences.",
  noIndex: true,
});

export default async function AccountPage() {
  const profileResult = await getCustomerProfileAction();

  if (!profileResult.ok) {
    redirect("/account/login");
  }

  return (
    <PageContainer>
      <Section className="py-[var(--spacing-12)]">
        <SectionHeading title="Account" eyebrow="Customer Profile" as="h1" />
        <div className="mt-[var(--spacing-8)]">
          <ProfileView profile={profileResult.data} />
        </div>
      </Section>
    </PageContainer>
  );
}
