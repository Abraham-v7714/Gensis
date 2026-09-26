"use client";

/**
 * ProductGallery — Stage 4.15 polish
 *
 * Changes from 4.8:
 * - `aria-live="polite"` region announces the active image to screen readers
 *   when the user navigates via keyboard or thumbnail click.
 * - Keyboard left/right arrow hint added as visually-hidden copy so keyboard
 *   users discover the shortcut.
 * - Thumbnail bar has an explicit `aria-label` on the scrollable container.
 * - Single-image path unchanged.
 * - Empty-image path unchanged.
 * - No new dependencies or image architecture changes.
 */

import * as React from "react";
import type { ProductImage } from "@/types/product";
import { GensisImage } from "@/components/shared/GensisImage";

export interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  className?: string;
}

export const ProductGallery = ({
  images,
  title,
  className = "",
}: ProductGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const activeImage = images[selectedIndex] || null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (images.length <= 1) return;
    if (e.key === "ArrowRight") {
      setSelectedIndex((prev) => (prev + 1) % images.length);
    } else if (e.key === "ArrowLeft") {
      setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (images.length === 0) {
    return (
      <figure
        aria-label={`${title} image placeholder`}
        className={`aspect-[4/5] bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-fg-muted)] ${className}`}
      >
        <span className="font-sans text-[length:var(--text-small)] uppercase tracking-[var(--tracking-label)]">
          No image available
        </span>
      </figure>
    );
  }

  if (images.length === 1 && activeImage) {
    return (
      <figure aria-label={title} className={`overflow-hidden ${className}`}>
        <GensisImage
          src={activeImage.url}
          alt={activeImage.alt || title}
          aspectRatio="4/5"
          className="w-full h-auto object-cover"
          priority
        />
      </figure>
    );
  }

  return (
    <section
      role="region"
      aria-label={`${title} image gallery`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`flex flex-col gap-[var(--spacing-4)] focus-visible:outline-none ${className}`}
    >
      {/* Keyboard navigation hint — screen readers and keyboard users */}
      <p className="sr-only">
        Use left and right arrow keys to navigate gallery images.
      </p>

      {/* Main Image */}
      <div
        role="group"
        aria-roledescription="image gallery"
        className="overflow-hidden"
      >
        <figure
          aria-label={`${title} — image ${selectedIndex + 1} of ${images.length}`}
        >
          {activeImage && (
            <GensisImage
              src={activeImage.url}
              alt={activeImage.alt || `${title} — image ${selectedIndex + 1}`}
              aspectRatio="4/5"
              className="w-full h-auto object-cover transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-default)] motion-reduce:transition-none"
              priority={selectedIndex === 0}
            />
          )}
        </figure>
      </div>

      {/* Accessible live announcement for screen readers */}
      <p
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {activeImage
          ? `Image ${selectedIndex + 1} of ${images.length}: ${activeImage.alt || title}`
          : ""}
      </p>

      {/* Thumbnail Bar */}
      <div
        role="tablist"
        aria-label="Gallery thumbnails"
        className="flex flex-wrap gap-[var(--spacing-2)]"
      >
        {images.map((img, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={img.id || idx}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={`View image ${idx + 1} of ${images.length}${img.alt ? `: ${img.alt}` : ""}`}
              onClick={() => setSelectedIndex(idx)}
              className={[
                "relative w-[var(--spacing-16)] aspect-[4/5] overflow-hidden",
                "border transition-all duration-[var(--duration-fast)] motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]",
                isSelected
                  ? "border-[var(--color-gensis-black)] opacity-100"
                  : "border-[var(--color-border-subtle)] opacity-60 hover:opacity-100",
              ].join(" ")}
            >
              <GensisImage
                src={img.url}
                alt=""
                aria-hidden={true}
                aspectRatio="4/5"
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};
