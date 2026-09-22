import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/readiness")({
  server: {
    handlers: {
      GET: async () => {
        let dbConfigured = false;
        let dbReachable = false;
        let bridgeAccountsCount = 0;

        try {
          const dbUrl = env("DATABASE_URL");
          dbConfigured = Boolean(dbUrl);
          const { getSql } = await import("@/lib/db");
          const sql = await getSql();
          await sql.query("select 1");
          dbReachable = true;

          const bridgeRows = (await sql.query(
            "select count(*)::int as count from volt_bridge_accounts where connected = true and last_heartbeat > now() - interval '60 seconds'",
          )) as Array<{ count: number }>;
          bridgeAccountsCount = bridgeRows[0]?.count ?? 0;
        } catch {
          /* ignore error */
        }

        const bridgeTokenConfigured = Boolean(env("BRIDGE_TOKEN"));
        const telegramConfigured = Boolean(env("TELEGRAM_API_ID") && env("TELEGRAM_API_HASH"));

        const eligible = dbReachable && bridgeTokenConfigured && bridgeAccountsCount > 0;

        return Response.json({
          database: {
            configured: dbConfigured,
            reachable: dbReachable,
            persistent: dbConfigured,
          },
          telegram: {
            apiConfigured: telegramConfigured,
          },
          bridge: {
            tokenConfigured: bridgeTokenConfigured,
            activeTerminals: bridgeAccountsCount,
          },
          liveTrading: {
            eligible,
            mode: eligible ? "LIVE_READY" : "PAPER_OR_BLOCKED",
          },
          timestamp: new Date().toISOString(),
        });
      },
    },
  },
});
