import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/telegram/auth/verify")({
  server: { handlers: {
    POST: async ({ request }) => {
      let body: { phone?: string; code?: string; phoneCodeHash?: string; password?: string };
      try { body = (await request.json()) as typeof body; }
      catch { return Response.json({ok:false,error:"invalid_json"},{status:400}); }
      const worker = env("TELEGRAM_WORKER_URL");
      if (!worker) return Response.json({ok:false,error:"telegram_worker_not_configured",message:"Telegram authentication requires the persistent MTProto worker."},{status:503});
      if (!body.phone?.trim() || !body.code?.trim() || !body.phoneCodeHash?.trim()) return Response.json({ok:false,error:"missing_phone_code_or_hash"},{status:400});
      try {
        const upstream = await fetch(new URL("/auth/verify", worker), {
          method:"POST", headers:{"content-type":"application/json","x-volt-worker-token":env("TELEGRAM_WORKER_TOKEN") ?? ""},
          body:JSON.stringify(body),
          signal:AbortSignal.timeout(20000),
        });
        const data = await upstream.json().catch(()=>({ok:false,error:"invalid_worker_response"}));
        return Response.json(data,{status:upstream.status});
      } catch {
        return Response.json({ok:false,error:"telegram_worker_unreachable"},{status:503});
      }
    }
  }}
});
