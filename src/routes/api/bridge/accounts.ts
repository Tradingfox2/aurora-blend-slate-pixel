import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

function authorized(request: Request) {
  const configured = env("BRIDGE_TOKEN");
  const auth = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  return Boolean(configured && auth === configured);
}

export const Route = createFileRoute("/api/bridge/accounts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!authorized(request)) {
          return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        }

        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const rows = await sql.query(
          `select login, platform, server, broker, balance, equity, margin,
                  ea_version, ping_ms, last_heartbeat, connected
             from volt_bridge_accounts
            where connected = true
              and last_heartbeat > now() - interval '45 seconds'
            order by platform, login`,
        );
        const stateRows = await sql.query(
          `select login, platform, positions_json, orders_json
             from volt_bridge_state
            where updated_at > now() - interval '45 seconds'`,
        );
        const stateByKey = new Map(stateRows.map((r: any) => [
          `${r.platform}:${r.login}`,
          { positions: JSON.parse(String(r.positions_json || "[]")), orders: JSON.parse(String(r.orders_json || "[]")) },
        ]));
        return Response.json({
          ok: true,
          accounts: rows.map((r: any) => ({
            id: `bridge-${r.platform}-${r.login}`,
            name: `${r.broker || "Broker"} · ${r.login}`,
            platform: r.platform,
            broker: r.broker,
            server: r.server,
            login: String(r.login),
            role: "independent",
            currency: "USD",
            leverage: 0,
            balance: Number(r.balance),
            equity: Number(r.equity),
            margin: Number(r.margin),
            connected: true,
            connecting: false,
            pingMs: Number(r.ping_ms),
            frozen: false,
            receivesSignals: false,
            risk: {
              mode: "percent", percent: 1, fixedLots: 0.1, fixedPips: 20, rr: 2,
              maxDailyLossPct: 4, maxOpenLots: 5, maxTradesPerDay: 40,
              maxConsecutiveLosses: 6, maxSlippagePips: 3, maxSpreadPips: 40,
              flattenOnTrip: false, fridayCutoffHour: 21,
            },
            lastHeartbeat: new Date(r.last_heartbeat).getTime(),
            eaVersion: r.ea_version,
          })),
          positions: rows.flatMap((r: any) => {
            const state = stateByKey.get(`${r.platform}:${r.login}`);
            return (state?.positions || []).map((p: any) => ({
              id: `broker-${r.platform}-${r.login}-${p.ticket}`,
              ticket: Number(p.ticket),
              accountId: `bridge-${r.platform}-${r.login}`,
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
            }));
          }),
          orders: rows.flatMap((r: any) => {
            const state = stateByKey.get(`${r.platform}:${r.login}`);
            return state?.orders || [];
          }),
          serverTime: Date.now(),
        });
      },
    },
  },
});
