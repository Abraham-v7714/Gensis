import * as React from "react";
import Image, { ImageProps } from "next/image";

export interface GensisImageProps extends Omit<ImageProps, "alt"> {
  /**
   * Meaningful alt text is required for accessibility.
   * Do not use generic terms like "image" or "photo".
   */
  alt: string;
  /**
   * Optional controlled aspect ratio.
   * Uses Tailwind arbitrary aspect ratio values, e.g., "square", "video", "4/5".
   */
  aspectRatio?: "square" | "video" | "4/5" | "2/3" | "16/9" | "auto";
  /**
   * Container class name for the aspect ratio wrapper.
   */
  containerClassName?: string;
}

export const GensisImage = React.forwardRef<HTMLImageElement, GensisImageProps>(
  ({ alt, aspectRatio = "auto", containerClassName = "", className = "", fill, width, height, ...props }, ref) => {
    
    // If fill is used, we often want an aspect ratio container
    const isFill = fill || (!width && !height);
    
    const aspectRatioClass = 
      aspectRatio === "auto" ? "" :
      aspectRatio === "square" ? "aspect-square" :
      aspectRatio === "video" ? "aspect-video" :
      aspectRatio === "4/5" ? "aspect-[4/5]" :
      aspectRatio === "2/3" ? "aspect-[2/3]" :
      aspectRatio === "16/9" ? "aspect-[16/9]" : "";

    if (isFill) {
      return (
        <div className={`relative overflow-hidden ${aspectRatioClass} ${containerClassName}`}>
          <Image
            ref={ref}
            alt={alt}
            fill
            sizes={props.sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            className={`object-cover ${className}`}
            {...props}
          />
        </div>
      );
    }

    return (
      <Image
        ref={ref}
        alt={alt}
        width={width}
        height={height}
        className={`${aspectRatioClass} ${className}`}
        {...props}
      />
    );
  }
);

GensisImage.displayName = "GensisImage";
