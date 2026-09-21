import { SPECS } from "./symbols";
import type { Side, SignalStatus, SymbolId } from "./types";

export function formatPrice(symbol: SymbolId, price: number): string {
  return price.toFixed(SPECS[symbol].digits);
}

export function formatLots(lots: number): string {
  return lots.toFixed(2);
}

export function formatPnl(value: number, digits = 2): string {
  const abs = Math.abs(value).toFixed(digits);
  if (value > 0.004) return `+${abs}`;
  if (value < -0.004) return `-${abs}`;
  return (0).toFixed(digits);
}

export function formatUsd(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatSignedUsd(value: number): string {
  const body = `$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  if (value > 0.004) return `+${body}`;
  if (value < -0.004) return `-${body}`;
  return body;
}

export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${abs.toFixed(0)}`;
}

export function formatPct(value: number): string {
  const n = (value * 100).toFixed(2);
  if (value > 0.00004) return `+${n}%`;
  if (value < -0.00004) return `${n}%`;
  return "0.00%";
}

export function formatTime(ts: number, now = Date.now()): string {
  const diff = Math.max(0, now - ts);
  if (diff < 5_000) return "now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function sideLabel(side: Side): string {
  return side === "buy" ? "BUY" : "SELL";
}

export function signalTag(n: number): string {
  return `#${String(n).padStart(4, "0")}`;
}

export function statusLabel(status: SignalStatus): string {
  switch (status) {
    case "received":
      return "Received";
    case "interpreted":
      return "Parsed";
    case "routed":
      return "Routed";
    case "live":
      return "Live";
    case "closed":
      return "Closed";
    case "ignored":
      return "Ignored";
    case "failed":
      return "Failed";
    case "managed":
      return "Managed";
    default:
      return status;
  }
}

export function sessionName(ts: number): string {
  const h = new Date(ts).getUTCHours();
  if (h >= 0 && h < 7) return "Tokyo";
  if (h >= 7 && h < 12) return "London";
  if (h >= 12 && h < 16) return "London / New York";
  if (h >= 16 && h < 21) return "New York";
  return "Sydney";
}

export function latencyLabel(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 10) return `${ms.toFixed(1)}ms`;
  return `${Math.round(ms)}ms`;
}

export function pnlTone(value: number): "buy" | "sell" | "muted" {
  if (value > 0.004) return "buy";
  if (value < -0.004) return "sell";
  return "muted";
}
