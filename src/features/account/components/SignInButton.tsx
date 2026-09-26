"use client";

/**
 * SignInButton — Stage 4.11
 *
 * Initiates Shopify-hosted Customer Account authentication via OAuth 2.0 PKCE.
 * Does not render any local email or password fields.
 */

import * as React from "react";
import { initiateLoginAction } from "../actions";

export interface SignInButtonProps {
  redirectTo?: string;
  className?: string;
}

export const SignInButton = ({ redirectTo, className = "" }: SignInButtonProps) => {
  const [isPending, startTransition] = React.useTransition();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSignIn = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await initiateLoginAction(redirectTo);

      if (result.ok) {
        // Redirect browser to Shopify-hosted OAuth authorization endpoint
        window.location.assign(result.data);
        return;
      }

      setErrorMsg(result.error.message || "Failed to initiate sign in.");
    });
  };

  return (
    <div className={`flex flex-col gap-[var(--spacing-2)] ${className}`}>
      <button
        type="button"
        disabled={isPending}
        aria-busy={isPending ? "true" : undefined}
        onClick={handleSignIn}
        className={[
          "w-full h-[var(--spacing-12)] px-[var(--spacing-6)]",
          "flex items-center justify-center gap-[var(--spacing-2)]",
          "font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase font-semibold",
          "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] focus-visible:ring-offset-2",
          isPending
            ? "bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)] cursor-not-allowed"
            : "bg-[var(--color-gensis-black)] text-[var(--color-fg-inverse)] hover:bg-[var(--color-gensis-charcoal)] active:scale-[0.99]",
        ].join(" ")}
      >
        {isPending ? "Connecting to Shopify\u2026" : "Sign In with Shopify \u2192"}
      </button>

      <div aria-live="polite" className="min-h-[var(--spacing-4)]">
        {errorMsg && (
          <p role="alert" className="font-sans text-[length:var(--text-caption)] text-red-700">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};
