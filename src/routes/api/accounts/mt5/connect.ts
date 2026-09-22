import { createFileRoute } from "@tanstack/react-router";
import { randomUUID } from "node:crypto";
import { requireUserId, UnauthorizedError } from "@/lib/auth/verify.server";
import { getSql } from "@/lib/db";
import { encryptMt5Password } from "@/lib/mt5-credentials.server";

function jsonError(error: unknown) {
  if (error instanceof UnauthorizedError) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const message = error instanceof Error ? error.message : "internal_error";
  return Response.json({ ok: false, error: message }, { status: 500 });
}

export const Route = createFileRoute("/api/accounts/mt5/connect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const userId = await requireUserId();
          const body = await request.json() as Record<string, unknown>;
          const broker = String(body.broker ?? "").trim();
          const server = String(body.server ?? "").trim();
          const login = String(body.login ?? "").trim();
          const password = String(body.password ?? "");
          const environment = String(body.environment ?? "live").trim().toLowerCase();

          if (!broker || !server || !login || !password) {
            return Response.json({ ok: false, error: "broker_server_login_password_required" }, { status: 400 });
          }
          if (!/^\d+$/.test(login)) {
            return Response.json({ ok: false, error: "login_must_be_numeric" }, { status: 400 });
          }
          if (environment !== "demo" && environment !== "live") {
            return Response.json({ ok: false, error: "invalid_environment" }, { status: 400 });
          }

          const sql = await getSql();
          const existing = await sql.query(
            "select id from volt_broker_connections where user_id=$1 and platform='MT5' and server=$2 and login=$3",
            [userId, server, login],
          );
          const ciphertext = encryptMt5Password(password);

          if (existing[0]) {
            const row = await sql.query(
              `update volt_broker_connections
                  set broker=$1, environment=$2, credential_ciphertext=$3,
                      status='pending', connector_id=null, last_error=null,
                      trading_enabled=false, updated_at=now()
                where id=$4 and user_id=$5
                returning id, platform, broker, server, login, environment, status, trading_enabled, created_at, updated_at`,
              [broker, environment, ciphertext, existing[0].id, userId],
            );
            return Response.json({ ok: true, account: row[0] }, { status: 202 });
          }

          const rows = await sql.query(
            `insert into volt_broker_connections
              (id, user_id, platform, broker, server, login, environment, credential_ciphertext, status)
             values ($1,$2,'MT5',$3,$4,$5,$6,$7,'pending')
             returning id, platform, broker, server, login, environment, status, trading_enabled, created_at, updated_at`,
            [randomUUID(), userId, broker, server, login, environment, ciphertext],
          );
          return Response.json({ ok: true, account: rows[0] }, { status: 202 });
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
