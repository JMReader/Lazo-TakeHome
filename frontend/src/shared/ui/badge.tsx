import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-primary-text",
        pending: "border-muted/45 bg-muted/15 text-primary-text",
        inProgress: "border-in-progress/45 bg-in-progress/15 text-in-progress",
        submitted: "border-submitted/45 bg-submitted/15 text-submitted",
        done: "border-success/45 bg-success/15 text-success",
        overdue: "border-danger/50 bg-danger/15 text-danger",
        dueSoon: "border-warning/50 bg-warning/15 text-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
