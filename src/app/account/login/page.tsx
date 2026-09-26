import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { constructMetadata } from "@/lib/seo";
import { getCustomerSession } from "@/lib/auth/session";
import { SignInButton } from "@/features/account/components/SignInButton";

export const metadata: Metadata = constructMetadata({
  fallbackTitle: "Sign In",
  fallbackDescription: "Sign in to your GENSIS account to view orders and profile.",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const session = await getCustomerSession();
  const { redirectTo } = await searchParams;

  if (session) {
    redirect(redirectTo || "/account");
  }

  return (
    <PageContainer>
      <Section className="max-w-md mx-auto py-[var(--spacing-16)]">
        <SectionHeading
          title="Sign In"
          eyebrow="GENSIS Account"
          as="h1"
          align="center"
        />
        <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-muted)] text-center mt-[var(--spacing-4)] mb-[var(--spacing-8)]">
          Sign in securely using Shopify Customer Account authentication. Passkeys, email single-use codes, and Shop Pay supported.
        </p>

        <SignInButton redirectTo={redirectTo} />
      </Section>
    </PageContainer>
  );
}
