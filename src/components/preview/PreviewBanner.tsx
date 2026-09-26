"use client";

/**
 * PreviewBanner — Stage 4.4
 *
 * A minimal "You are in preview mode" indicator shown only when
 * Next.js Draft Mode is active. Provides a clear exit path for editors.
 *
 * Design principles:
 *   - Non-intrusive: positioned at the top of the viewport, dismissible via exit link
 *   - Does not expose any secrets or credentials
 *   - Uses GENSIS Charcoal/Ivory palette for clear visual distinction from live site
 *   - The exit link calls /api/draft-mode/disable which safely clears Draft Mode
 *
 * Rendered by: src/app/layout.tsx (conditionally, server-side draftMode check)
 * Never rendered in production builds where draftMode is OFF.
 */

import { usePathname } from "next/navigation";

export function PreviewBanner() {
  const pathname = usePathname();

  // Build the disable URL with the current path as redirect target,
  // so exiting preview returns the editor to the page they were on.
  const disableUrl = `/api/draft-mode/disable?redirect=${encodeURIComponent(pathname)}`;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "0.625rem 1.25rem",
        backgroundColor: "#202020",
        color: "#F2F0EA",
        fontSize: "0.8125rem",
        fontFamily: "var(--font-manrope, system-ui, sans-serif)",
        letterSpacing: "0.05em",
        borderTop: "1px solid rgba(242,240,234,0.12)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          opacity: 0.9,
        }}
      >
        {/* Pulsing dot — visual indicator of preview mode */}
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#D4A853",
            animation: "gensis-preview-pulse 2s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes gensis-preview-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
        <span>Preview Mode</span>
        <span style={{ color: "rgba(242,240,234,0.5)" }}>—</span>
        <span style={{ color: "rgba(242,240,234,0.65)", textTransform: "uppercase" }}>
          Unpublished content visible
        </span>
      </span>

      <a
        href={disableUrl}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.25rem 0.75rem",
          border: "1px solid rgba(242,240,234,0.25)",
          borderRadius: "2px",
          color: "#F2F0EA",
          textDecoration: "none",
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          transition: "background-color 150ms ease, border-color 150ms ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.backgroundColor = "rgba(242,240,234,0.1)";
          el.style.borderColor = "rgba(242,240,234,0.5)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.backgroundColor = "transparent";
          el.style.borderColor = "rgba(242,240,234,0.25)";
        }}
      >
        Exit Preview
      </a>
    </div>
  );
}
