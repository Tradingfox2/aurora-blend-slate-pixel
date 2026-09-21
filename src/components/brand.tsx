import { cn } from "@/lib/utils";

export function VoltMark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex size-6 items-center justify-center rounded-sm bg-accent/12">
        <span className="h-3.5 w-[2px] bg-accent" />
      </span>
      {!compact ? (
        <span className="font-display text-[15px] font-semibold tracking-[-0.04em] text-fg">
          VOLT
        </span>
      ) : null}
    </span>
  );
}
