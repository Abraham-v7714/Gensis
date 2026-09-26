import * as React from "react";
import { GensisImage } from "@/components/shared/GensisImage";

export type EditorialImageProps = {
  src: string;
  alt: string;
  aspectRatio?: "portrait" | "landscape" | "square" | "auto";
  priority?: boolean;
  className?: string;
};

export const EditorialImage = ({
  src,
  alt,
  aspectRatio = "auto",
  priority = false,
  className = "",
}: EditorialImageProps) => {
  const gensisAspectRatio = 
    aspectRatio === "portrait" ? "4/5" :
    aspectRatio === "landscape" ? "16/9" :
    aspectRatio === "square" ? "square" :
    "auto";

  return (
    <figure className={className}>
      <GensisImage
        src={src}
        alt={alt}
        priority={priority}
        aspectRatio={gensisAspectRatio}
      />
    </figure>
  );
};
