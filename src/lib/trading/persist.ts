import { createServerFn } from "@tanstack/react-start";
import type { ClosedTrade, Signal } from "./types";

export const archiveTrade = createServerFn({ method: "POST" })
  .validator((input: ClosedTrade) => input)
  .handler(async ({ data }) => {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      await sql.query(
        `insert into volt_trades (
          id, ticket, account_id, signal_number, source_id, symbol, side, lots,
          open_price, close_price, sl, tp, profit, open_time, close_time, comment
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        on conflict (id) do nothing`,
        [
          data.id,
          data.ticket,
          data.accountId,
          data.signalNumber,
          data.sourceId,
          data.symbol,
          data.side,
          data.lots,
          data.openPrice,
          data.closePrice,
          data.sl,
          data.tp,
          data.profit,
          new Date(data.openTime).toISOString(),
          new Date(data.closeTime).toISOString(),
          data.comment,
        ],
      );
      return { ok: true as const };
    } catch {
      return { ok: false as const };
    }
  });

export const archiveSignal = createServerFn({ method: "POST" })
  .validator((input: Pick<Signal, "id" | "number" | "sourceId" | "rawText" | "status" | "confidence" | "interpreter" | "receivedAt"> & { parsedJson: string | null }) => input)
  .handler(async ({ data }) => {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      await sql.query(
        `insert into volt_signals (
          id, number, source_id, raw_text, parsed_json, status, confidence, interpreter, received_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        on conflict (id) do update set status = excluded.status, parsed_json = excluded.parsed_json, confidence = excluded.confidence`,
        [
          data.id,
          data.number,
          data.sourceId,
          data.rawText,
          data.parsedJson,
          data.status,
          data.confidence,
          data.interpreter,
          new Date(data.receivedAt).toISOString(),
        ],
      );
      return { ok: true as const };
    } catch {
      return { ok: false as const };
    }
  });


export const enqueueBridgeCommand = createServerFn({ method: "POST" })
  .validator((input: {
    login: string;
    platform: "MT4" | "MT5";
    type: string;
    payload: Record<string, unknown>;
  }) => input)
  .handler(async ({ data }) => {
    try {
      const { requireUserId } = await import("@/lib/auth/verify.server");
      const userId = await requireUserId();
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      const owned = await sql.query(
        `select id, trading_enabled, status
           from volt_broker_connections
          where user_id=$1 and login=$2 and platform=$3
          limit 1`,
        [userId, data.login, data.platform],
      );
      if (!owned[0]) return { ok: false as const, error: "account_not_owned" };
      const status = String(owned[0].status);
      const tradingEnabled = Boolean(owned[0].trading_enabled);

      if (!["connected", "connecting"].includes(status)) {
        return { ok: false as const, error: "account_not_connected" };
      }
      if (data.type === "open_market" && !tradingEnabled) {
        return { ok: false as const, error: "live_trading_disabled" };
      }

      const id = `cmd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      await sql.query(
        `insert into volt_bridge_commands(id,login,platform,command_type,payload_json)
         values($1,$2,$3,$4,$5)`,
        [id, data.login, data.platform, data.type, JSON.stringify(data.payload)],
      );
      return { ok: true as const, id };
    } catch (error) {
      return { ok: false as const, error: error instanceof Error ? error.message : "queue_failed" };
    }
  });
