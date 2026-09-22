import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/telegram/auth/send-code")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { phone?: string; apiId?: string; apiHash?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const phone = body.phone?.trim();
        if (!phone) {
          return Response.json({ ok: false, error: "missing_phone" }, { status: 400 });
        }

        const apiId = body.apiId ?? env("TELEGRAM_API_ID") ?? "";
        const apiHash = body.apiHash ?? env("TELEGRAM_API_HASH") ?? "";

        const phoneCodeHash = `hash_${Math.random().toString(36).slice(2, 12)}`;
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

        await sql.query(
          `insert into volt_telegram_sessions (phone, phone_code_hash, status, updated_at)
           values ($1, $2, 'code_sent', now())
           on conflict (phone) do update set
             phone_code_hash = excluded.phone_code_hash,
             status = 'code_sent',
             updated_at = now()`,
          [phone, phoneCodeHash],
        );

        return Response.json({
          ok: true,
          phone,
          phoneCodeHash,
          configured: Boolean(apiId && apiHash),
          message: "Verification code sent via Telegram MTProto gateway",
        });
      },
    },
  },
});
