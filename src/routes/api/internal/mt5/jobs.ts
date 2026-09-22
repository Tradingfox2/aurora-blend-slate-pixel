import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";
import { decryptMt5Password } from "@/lib/mt5-credentials.server";

function authorized(request: Request) {
  const configured = env("MT5_CONNECTOR_TOKEN");
  const auth = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  return Boolean(configured && auth && auth === configured);
}

export const Route = createFileRoute("/api/internal/mt5/jobs")({
  server: { handlers: {
    GET: async ({ request }) => {
      if (!authorized(request)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const rows = await sql.query(
        `with next_job as (
           select id from volt_broker_connections
            where status in ('pending','error')
              and (status='pending' or updated_at < now()-interval '15 seconds')
            order by created_at asc
            for update skip locked limit 1
         )
         update volt_broker_connections c
            set status='connecting', connector_id=$1, updated_at=now(), last_error=null
           from next_job
          where c.id=next_job.id
          returning c.id, c.platform, c.broker, c.server, c.login, c.environment, c.credential_ciphertext`,
        [String(request.headers.get("x-volt-connector-id") ?? "connector")],
      );
      if (!rows[0]) return Response.json({ ok: true, job: null });
      const row = rows[0] as Record<string, unknown>;
      return Response.json({
        ok: true,
        job: {
          id: row.id,
          platform: row.platform,
          broker: row.broker,
          server: row.server,
          login: row.login,
          environment: row.environment,
          password: decryptMt5Password(String(row.credential_ciphertext)),
        },
      });
    },
  }},
});
