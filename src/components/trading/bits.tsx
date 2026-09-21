import { cn } from "@/lib/utils";
import { formatPrice, formatSignedUsd, pnlTone, signalTag, sideLabel } from "@/lib/trading/format";
import type { Side, SignalStatus, SymbolId } from "@/lib/trading/types";
import { Badge } from "@/components/ui/badge";

export function PnlText({ value, className }: { value: number; className?: string }) {
  const tone = pnlTone(value);
  return (
    <span
      className={cn(
        "tabular font-mono text-sm",
        tone === "buy" && "text-buy",
        tone === "sell" && "text-sell",
        tone === "muted" && "text-muted",
        className,
      )}
    >
      {formatSignedUsd(value)}
    </span>
  );
}

export function SideChip({ side }: { side: Side }) {
  return <Badge variant={side === "buy" ? "buy" : "sell"}>{sideLabel(side)}</Badge>;
}

export function SignalNo({ n, className }: { n: number | null; className?: string }) {
  if (!n) return <span className="text-subtle">—</span>;
  return <span className={cn("font-mono text-xs text-accent tabular", className)}>{signalTag(n)}</span>;
}

export function Price({ symbol, value }: { symbol: SymbolId; value: number }) {
  return <span className="font-mono text-sm tabular text-fg">{formatPrice(symbol, value)}</span>;
}

export function StatusDot({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className={cn("size-1.5 rounded-full", on ? "bg-buy" : "bg-subtle")} />
      {label}
    </span>
  );
}

export function SignalStatusChip({ status }: { status: SignalStatus }) {
  const variant =
    status === "live" || status === "managed"
      ? "live"
      : status === "failed"
        ? "sell"
        : status === "ignored"
          ? "outline"
          : status === "closed"
            ? "default"
            : "accent";
  return <Badge variant={variant}>{status}</Badge>;
}
