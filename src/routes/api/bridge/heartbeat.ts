import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

function authorized(request: Request) {
  const configured = env("BRIDGE_TOKEN");
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return Boolean(configured && token && token === configured);
}

export const Route = createFileRoute("/api/bridge/heartbeat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorized(request)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        let body: Record<string, unknown>;
        try { body = (await request.json()) as Record<string, unknown>; }
        catch { return Response.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

        const login = String(body.login ?? request.headers.get("x-volt-login") ?? "");
        const platform = String(body.platform ?? request.headers.get("x-volt-platform") ?? "");
        if (!login || !["MT4", "MT5"].includes(platform)) {
          return Response.json({ ok: false, error: "missing_login_or_platform" }, { status: 400 });
        }

        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        await sql.query(
          `insert into volt_bridge_accounts
            (login, platform, server, broker, balance, equity, margin, ea_version, ping_ms, last_heartbeat, connected)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),true)
           on conflict (login, platform) do update set
             server=excluded.server, broker=excluded.broker, balance=excluded.balance,
             equity=excluded.equity, margin=excluded.margin, ea_version=excluded.ea_version,
             ping_ms=excluded.ping_ms, last_heartbeat=now(), connected=true`,
          [login, platform, String(body.server ?? ""), String(body.broker ?? ""),
           Number(body.balance ?? 0), Number(body.equity ?? 0), Number(body.margin ?? 0),
           String(body.eaVersion ?? ""), Number(body.pingMs ?? 0)],
        );

        const commands = await sql.query(
          `select id, command_type as "type", payload_json as payload
             from volt_bridge_commands
            where login=$1 and platform=$2 and status='queued'
            order by created_at asc limit 1`,
          [login, platform],
        );
        for (const c of commands as Array<{id:string}>) {
          await sql.query("update volt_bridge_commands set status='claimed',claimed_at=now(),claimed_until=now()+interval '45 seconds',attempts=attempts+1 where id=$1 and status='queued'", [c.id]);
        }
        return Response.json({ ok: true, login, platform, commands: commands.map((c) => ({
          id: c.id, type: c.type, payload: JSON.parse(String(c.payload)),
        })), serverTime: Date.now() });
      },
    },
  },
});
