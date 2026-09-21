import { formatPrice, formatPct } from "@/lib/trading/format";
import { SYMBOL_IDS } from "@/lib/trading/types";
import { useDesk } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export function Ticker() {
  const quotes = useDesk((s) => s.quotes);
  const items = [...SYMBOL_IDS, ...SYMBOL_IDS];
  return (
    <div className="hidden h-7 overflow-hidden border-t border-border bg-bg-elevated md:block">
      <div className="tape-scroll flex w-max items-center gap-8 px-4">
        {items.map((id, i) => {
          const q = quotes[id];
          const up = q.change >= 0;
          return (
            <span key={`${id}-${i}`} className="flex items-center gap-2 font-mono text-[11px] tabular">
              <span className="text-muted">{id}</span>
              <span className="text-fg">{formatPrice(id, q.bid)}</span>
              <span className={cn(up ? "text-buy" : "text-sell")}>{formatPct(q.change)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
