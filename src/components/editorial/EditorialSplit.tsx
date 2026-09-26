import * as React from "react";
import { Grid } from "@/components/layout/Grid";

export type EditorialSplitProps = {
  image: React.ReactNode;
  content: React.ReactNode;
  imagePosition?: "left" | "right";
  verticalAlign?: "start" | "center" | "end";
  className?: string;
};

export const EditorialSplit = ({
  image,
  content,
  imagePosition = "left",
  verticalAlign = "center",
  className = "",
}: EditorialSplitProps) => {
  const alignClass = 
    verticalAlign === "start" ? "items-start" :
    verticalAlign === "end" ? "items-end" :
    "items-center";

  const orderClass = imagePosition === "right" ? "md:order-last" : "";

  return (
    <Grid className={`md:grid-cols-2 ${alignClass} gap-[var(--spacing-8)] lg:gap-[var(--spacing-16)] ${className}`}>
      <div className={`flex flex-col ${orderClass}`}>
        {image}
      </div>
      <div className="flex flex-col">
        {content}
      </div>
    </Grid>
  );
};
