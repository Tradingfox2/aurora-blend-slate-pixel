import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

function authorized(request: Request) {
  const configured = env("MT5_CONNECTOR_TOKEN");
  const auth = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  return Boolean(configured && auth && auth === configured);
}

export const Route = createFileRoute("/api/internal/mt5/status")({
  server: { handlers: {
    POST: async ({ request }) => {
      if (!authorized(request)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
      let body: Record<string, unknown>;
      try { body = await request.json() as Record<string, unknown>; }
      catch { return Response.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

      const id = String(body.id ?? "");
      const connectorId = String(body.connectorId ?? "");
      const status = String(body.status ?? "");
      const allowed = ["pending", "connecting", "connected", "error", "disconnected"];
      if (!id || !connectorId || !allowed.includes(status)) {
        return Response.json({ ok: false, error: "invalid_status_payload" }, { status: 400 });
      }

      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const rows = await sql.query(
        `update volt_broker_connections
            set status=$1, connector_id=$2, last_error=$3,
                last_seen_at=case when $1='connected' then now() else last_seen_at end,
                updated_at=now()
          where id=$4
          returning id, status, trading_enabled, last_error, last_seen_at`,
        [status, connectorId, body.error ? String(body.error).slice(0, 1000) : null, id],
      );
      if (!rows[0]) return Response.json({ ok: false, error: "account_not_found" }, { status: 404 });
      return Response.json({ ok: true, account: rows[0] });
    },
  }},
});
