import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-bg-subtle text-muted",
        buy: "bg-buy/15 text-buy",
        sell: "bg-sell/15 text-sell",
        warn: "bg-warn/15 text-warn",
        accent: "bg-accent/15 text-accent",
        live: "bg-buy/15 text-buy",
        outline: "shadow-[var(--shadow-border)] text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
