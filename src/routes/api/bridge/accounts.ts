import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/bridge/accounts")({
  server: {
    handlers: {
      GET: async () => {
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
          serverTime: Date.now(),
        });
      },
    },
  },
});
