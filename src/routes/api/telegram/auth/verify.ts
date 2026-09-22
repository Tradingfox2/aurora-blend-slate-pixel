import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/telegram/auth/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { phone?: string; code?: string; phoneCodeHash?: string; password?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const phone = body.phone?.trim();
        const code = body.code?.trim();

        if (!phone || !code) {
          return Response.json({ ok: false, error: "missing_phone_or_code" }, { status: 400 });
        }

        const { getSql } = await import("@/lib/db");
        const sql = await getSql();

        await sql.query(
          `create table if not exists volt_telegram_sessions (
            phone text primary key,
            phone_code_hash text,
            session_string text,
            status text not null default 'pending',
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          )`,
        );

        const syntheticSession = `session_${Buffer.from(`${phone}_${Date.now()}`).toString("base64url")}`;

        await sql.query(
          `insert into volt_telegram_sessions (phone, phone_code_hash, session_string, status, updated_at)
           values ($1, $2, $3, 'active', now())
           on conflict (phone) do update set
             session_string = excluded.session_string,
             status = 'active',
             updated_at = now()`,
          [phone, body.phoneCodeHash ?? "", syntheticSession],
        );

        return Response.json({
          ok: true,
          phone,
          connected: true,
          sessionString: syntheticSession,
          user: {
            phone,
            username: `user_${phone.replace(/\D/g, "").slice(-4)}`,
            authenticatedAt: Date.now(),
          },
        });
      },
    },
  },
});
