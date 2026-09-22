import { createFileRoute } from "@tanstack/react-router";
import { requireUserId, UnauthorizedError } from "@/lib/auth/verify.server";

export const Route = createFileRoute("/api/accounts/disconnect")({
  server: { handlers: {
    POST: async ({ request }) => {
      try {
        const userId = await requireUserId();
        const body = await request.json() as { id?: string };
        const id = String(body.id ?? "");
        if (!id) return Response.json({ ok: false, error: "id_required" }, { status: 400 });
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const rows = await sql.query(
          `update volt_broker_connections set status='disconnected', trading_enabled=false, updated_at=now()
             where id=$1 and user_id=$2 returning id, status, trading_enabled`,
          [id, userId],
        );
        if (!rows[0]) return Response.json({ ok: false, error: "account_not_found" }, { status: 404 });
        return Response.json({ ok: true, account: rows[0] });
      } catch (error) {
        if (error instanceof UnauthorizedError) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        return Response.json({ ok: false, error: error instanceof Error ? error.message : "internal_error" }, { status: 500 });
      }
    },
  }},
});