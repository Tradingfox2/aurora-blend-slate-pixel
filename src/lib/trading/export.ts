import type { ClosedTrade } from "./types";

function csvEscape(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function historyToCsv(
  rows: ClosedTrade[],
  names: { account: (id: string) => string; source: (id: string | null) => string },
): string {
  const header = [
    "closed_at",
    "ticket",
    "signal",
    "account",
    "source",
    "symbol",
    "side",
    "lots",
    "open",
    "close",
    "sl",
    "tp",
    "profit",
    "mfe",
    "mae",
    "hold_min",
    "comment",
  ].join(",");
  const body = rows
    .map((h) =>
      [
        new Date(h.closeTime).toISOString(),
        h.ticket,
        h.signalNumber ?? "",
        names.account(h.accountId),
        names.source(h.sourceId),
        h.symbol,
        h.side,
        h.lots,
        h.openPrice,
        h.closePrice,
        h.sl ?? "",
        h.tp ?? "",
        h.profit.toFixed(2),
        (h.mfe ?? 0).toFixed(2),
        (h.mae ?? 0).toFixed(2),
        ((h.durationMs ?? h.closeTime - h.openTime) / 60_000).toFixed(1),
        h.comment,
      ]
        .map(csvEscape)
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}\n`;
}

export function downloadText(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
