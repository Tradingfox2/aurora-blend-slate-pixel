import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/telegram/auth/send-code")({
  server: { handlers: {
    POST: async ({ request }) => {
      let body: { phone?: string };
      try { body = (await request.json()) as typeof body; }
      catch { return Response.json({ ok:false, error:"invalid_json" }, {status:400}); }
      const phone = body.phone?.trim();
      const worker = env("TELEGRAM_WORKER_URL");
      if (!phone) return Response.json({ok:false,error:"missing_phone"},{status:400});
      if (!worker) return Response.json({ok:false,error:"telegram_worker_not_configured",message:"Telegram authentication requires the persistent MTProto worker."},{status:503});
      try {
        const upstream = await fetch(new URL("/auth/send-code", worker), {
          method:"POST", headers:{"content-type":"application/json","x-volt-worker-token":env("TELEGRAM_WORKER_TOKEN") ?? ""},
          body:JSON.stringify({phone}),
          signal:AbortSignal.timeout(15000),
        });
        const data = await upstream.json().catch(()=>({ok:false,error:"invalid_worker_response"}));
        return Response.json(data,{status:upstream.status});
      } catch {
        return Response.json({ok:false,error:"telegram_worker_unreachable"},{status:503});
      }
    }
  }}
});
