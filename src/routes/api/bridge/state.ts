import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

function authorized(request: Request) {
  const configured = env("BRIDGE_TOKEN");
  const auth = (request.headers.get("authorization") || "").replace(/^Bearer\\s+/i, "").trim();
  return Boolean(configured && auth === configured);
}

export const Route = createFileRoute("/api/bridge/state")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorized(request)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        let body: Record<string, unknown>;
        try { body = await request.json() as Record<string, unknown>; }
        catch { return Response.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
        const login = String(body.login || "");
        const platform = String(body.platform || "");
        if (!login || !["MT4", "MT5"].includes(platform)) {
          return Response.json({ ok: false, error: "missing_login_or_platform" }, { status: 400 });
        }
        const positions = Array.isArray(body.positions) ? body.positions : [];
        const orders = Array.isArray(body.orders) ? body.orders : [];
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        await sql.query(
          `insert into volt_bridge_state(login,platform,positions_json,orders_json,updated_at)
           values($1,$2,$3,$4,now())
           on conflict(login,platform) do update set
             positions_json=excluded.positions_json,
             orders_json=excluded.orders_json,
             updated_at=now()`,
          [login, platform, JSON.stringify(positions), JSON.stringify(orders)],
        );
        return Response.json({ ok: true, updatedAt: Date.now() });
      },
    },
  },
});
