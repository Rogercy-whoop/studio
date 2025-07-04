"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// The recharts library is incompatible with React 19 and has been removed.
// These components are placeholders to prevent breaking the build.

export type ChartConfig = Record<string, any>;

const ChartPlaceholder = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex aspect-video w-full items-center justify-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground",
      className
    )}
    {...props}
  >
    Chart functionality is temporarily disabled.
  </div>
);

export const ChartContainer = ({ children, ...props }: { children: React.ReactNode } & React.ComponentProps<typeof ChartPlaceholder>) => <ChartPlaceholder {...props} />;
export const ChartTooltip = () => null;
export const ChartTooltipContent = () => null;
export const ChartLegend = () => null;
export const ChartLegendContent = () => null;
export const ChartStyle = () => null;
