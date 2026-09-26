import * as React from "react";
import { Grid } from "@/components/layout/Grid";

export type EditorialGridProps = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
};

export const EditorialGrid = ({
  children,
  columns = 2,
  className = "",
}: EditorialGridProps) => {
  const colsClass = 
    columns === 2 ? "md:grid-cols-2" :
    columns === 3 ? "md:grid-cols-2 lg:grid-cols-3" :
    "md:grid-cols-2 lg:grid-cols-4";

  return (
    <Grid className={`${colsClass} gap-[var(--spacing-6)] md:gap-[var(--spacing-8)] lg:gap-[var(--spacing-12)] ${className}`}>
      {children}
    </Grid>
  );
};
