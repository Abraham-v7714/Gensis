import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { draftMode } from "next/headers";
import "./globals.css";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { constructMetadata } from "@/lib/seo";

/**
 * Stage 4.4: Visual Editing + Preview Banner
 *
 * VisualEditing (from next-sanity/visual-editing) is a Server Component that
 * conditionally injects click-to-edit overlay JS. It renders nothing when
 * Draft Mode is OFF — no Sanity overhead on production storefront pages.
 *
 * PreviewBanner is rendered only in Draft Mode, giving editors a clear
 * visual indicator and an exit mechanism.
 */
// These imports are tree-shakeable in production — when draftMode isEnabled
// is false, the VisualEditing component renders null/nothing.
import { VisualEditing } from "next-sanity/visual-editing";
import { PreviewBanner } from "@/components/preview/PreviewBanner";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-instrument-serif",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {/*
          Skip-to-main-content link.
          Visually hidden until focused by a keyboard user.
          Allows screen-reader and keyboard users to bypass the site header.
        */}
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-[var(--spacing-4)] focus-visible:left-[var(--spacing-4)] focus-visible:z-[9999] focus-visible:bg-[var(--color-bg-inverse)] focus-visible:text-[var(--color-fg-inverse)] focus-visible:px-[var(--spacing-4)] focus-visible:py-[var(--spacing-2)] focus-visible:font-sans focus-visible:text-[length:var(--text-small)] focus-visible:tracking-[var(--tracking-small)] focus-visible:uppercase"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {/*
          Visual Editing overlay — Stage 4.4
          Only active during Draft Mode (Next.js draftMode().isEnabled).
          Renders nothing on normal production pages.
          Connects to Sanity Studio's Presentation Tool for click-to-edit.
        */}
        {isDraftMode && <VisualEditing />}
        {/*
          Preview banner — Stage 4.4
          Shown to editors during Draft Mode with an "Exit Preview" link.
          Never visible to normal visitors.
        */}
        {isDraftMode && <PreviewBanner />}
      </body>
    </html>
  );
}
