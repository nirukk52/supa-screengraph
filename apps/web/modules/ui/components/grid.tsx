import * as React from "react";
import { cn } from "../lib";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
}

const gapToClasses: Record<NonNullable<GridProps["gap"]>, string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

export function Grid({
  className,
  cols = 12,
  gap = "md",
  responsive = true,
  ...props
}: GridProps) {
  const baseCols = `grid-cols-${cols}`;
  const responsiveCols = responsive
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-12"
    : baseCols;

  return (
    <div className={cn("grid", responsiveCols, gapToClasses[gap], className)} {...props} />
  );
}


