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
          `select id, platform, broker, server, login, environment, status,
                  trading_enabled, connector_id, last_error, created_at, updated_at, last_seen_at
             from volt_broker_connections
            where user_id=$1 order by created_at desc`,
          [userId],
        );
        return Response.json({ ok: true, accounts: rows });
      } catch (error) {
        if (error instanceof UnauthorizedError) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        return Response.json({ ok: false, error: error instanceof Error ? error.message : "internal_error" }, { status: 500 });
      }
    },
  }},
});