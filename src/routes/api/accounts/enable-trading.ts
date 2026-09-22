import { createFileRoute } from "@tanstack/react-router";
import { requireUserId, UnauthorizedError } from "@/lib/auth/verify.server";

export const Route = createFileRoute("/api/accounts/enable-trading")({
  server: { handlers: {
    POST: async ({ request }) => {
      try {
        const userId = await requireUserId();
        const body = await request.json() as { id?: string; enabled?: boolean };
        const id = String(body.id ?? "");
        const enabled = body.enabled === true;
        if (!id) return Response.json({ ok: false, error: "id_required" }, { status: 400 });
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const rows = await sql.query(
          `update volt_broker_connections set trading_enabled=$1, updated_at=now()
             where id=$2 and user_id=$3 and status='connected'
             returning id, status, trading_enabled`,
          [enabled, id, userId],
        );
        if (!rows[0]) return Response.json({ ok: false, error: "account_not_connected" }, { status: 409 });
        return Response.json({ ok: true, account: rows[0] });
      } catch (error) {
        if (error instanceof UnauthorizedError) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        return Response.json({ ok: false, error: error instanceof Error ? error.message : "internal_error" }, { status: 500 });
      }
    },
  }},
});