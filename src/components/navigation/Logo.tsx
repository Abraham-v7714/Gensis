import Link from "next/link";
import * as React from "react";

export const Logo = () => {
  return (
    <Link 
      href="/" 
      className="font-serif text-[length:var(--text-title)] tracking-[var(--tracking-title)] text-[var(--color-fg-primary)] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
      aria-label="GENSIS Home"
    >
      GENSIS
    </Link>
  );
};
