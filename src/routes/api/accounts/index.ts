import { createFileRoute } from "@tanstack/react-router";
import { requireUserId, UnauthorizedError } from "@/lib/auth/verify.server";

export const Route = createFileRoute("/api/accounts")({
  server: { handlers: {
    GET: async () => {
      try {
        const userId = await requireUserId();
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const rows = await sql.query(
          `select c.id, c.platform, c.broker, c.server, c.login, c.environment, c.status,
                  c.trading_enabled, c.connector_id, c.last_error, c.created_at, c.updated_at, c.last_seen_at,
                  b.balance, b.equity, b.margin, b.ea_version, b.ping_ms, b.last_heartbeat,
                  b.connected as bridge_connected,
                  s.positions_json, s.orders_json
             from volt_broker_connections c
             left join volt_bridge_accounts b
               on b.login=c.login and b.platform=c.platform
             left join volt_bridge_state s
               on s.login=c.login and s.platform=c.platform
              and s.updated_at > now() - interval '45 seconds'
            where c.user_id=$1
            order by c.created_at desc`,
          [userId],
        );

        const accounts = rows.map((r: any) => ({
          id: String(r.id),
          name: `${r.broker || "Broker"} · ${r.login}`,
          platform: r.platform,
          broker: r.broker,
          server: r.server,
          login: String(r.login),
          role: "independent",
          currency: "USD",
          leverage: 0,
          balance: Number(r.balance ?? 0),
          equity: Number(r.equity ?? r.balance ?? 0),
          margin: Number(r.margin ?? 0),
          connected: r.status === "connected" && r.bridge_connected === true && r.last_heartbeat
            ? new Date(r.last_heartbeat).getTime() > Date.now() - 45_000
            : false,
          connecting: r.status === "connecting" || r.status === "pending",
          pingMs: Number(r.ping_ms ?? 0),
          frozen: !Boolean(r.trading_enabled),
          receivesSignals: Boolean(r.trading_enabled),
          tradingEnabled: Boolean(r.trading_enabled),
          status: r.status,
          environment: r.environment,
          connectorId: r.connector_id,
          lastError: r.last_error,
          lastHeartbeat: r.last_heartbeat ? new Date(r.last_heartbeat).getTime() : undefined,
          eaVersion: r.ea_version || "mt5-python",
          risk: {
            mode: "percent", percent: 1, fixedLots: 0.1, fixedPips: 20, rr: 2,
            maxDailyLossPct: 4, maxOpenLots: 5, maxTradesPerDay: 40,
            maxConsecutiveLosses: 6, maxSlippagePips: 3, maxSpreadPips: 40,
            flattenOnTrip: false, fridayCutoffHour: 21,
          },
          positions: safeJson(r.positions_json),
          orders: safeJson(r.orders_json),
        }));

        const positions = accounts.flatMap((a: any) =>
          (Array.isArray(a.positions) ? a.positions : []).map((p: any) => ({
            id: `broker-${a.id}-${p.ticket}`,
            ticket: Number(p.ticket),
            accountId: a.id,
            signalId: null,
            signalNumber: null,
            sourceId: null,
            symbol: p.symbol,
            side: p.side,
            lots: Number(p.lots || 0),
            openPrice: Number(p.openPrice || 0),
            sl: p.sl == null ? null : Number(p.sl),
            tp: p.tp == null ? null : Number(p.tp),
            tps: [],
            beAfterTp1: false,
            trailingPips: null,
            openTime: Number(p.openTime || Date.now()) * 1000,
            magic: Number(p.magic || 0),
            comment: String(p.comment || ""),
            commission: 0,
            mfe: Math.max(0, Number(p.profit || 0)),
            mae: Math.max(0, -Number(p.profit || 0)),
          })),
        );

        const orders = accounts.flatMap((a: any) =>
          (Array.isArray(a.orders) ? a.orders : []).map((o: any) => ({ ...o, accountId: a.id })),
        );

        return Response.json({ ok: true, accounts, positions, orders, serverTime: Date.now() });
      } catch (error) {
        if (error instanceof UnauthorizedError) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        return Response.json({ ok: false, error: error instanceof Error ? error.message : "internal_error" }, { status: 500 });
      }
    },
  }},
});

function safeJson(value: unknown): unknown[] {
  if (value == null) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
