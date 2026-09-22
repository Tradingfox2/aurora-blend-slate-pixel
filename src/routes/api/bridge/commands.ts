import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/bridge/commands")({
  server: { handlers: {
    GET: async ({ request }) => {
      const configured = env("BRIDGE_TOKEN");
      const auth = request.headers.get("authorization") ?? "";
      const token = auth.replace(/^Bearer\s+/i, "").trim();
      if (!configured || token !== configured) return Response.json({ ok:false,error:"unauthorized" },{status:401});
      const url=new URL(request.url);
      const login=url.searchParams.get("login") ?? "";
      const platform=url.searchParams.get("platform") ?? request.headers.get("x-volt-platform") ?? "";
      if(!login || !["MT4","MT5"].includes(platform)) return Response.json({ok:false,error:"missing_login_or_platform"},{status:400});
      const {getSql}=await import("@/lib/db"); const sql=await getSql();
      const rows=await sql.query(`select id, command_type as "type", payload_json as payload from volt_bridge_commands where login=$1 and platform=$2 and status='queued' order by created_at asc limit 25`,[login,platform]);
      for(const r of rows as Array<{id:string}>) await sql.query("update volt_bridge_commands set status='claimed',claimed_at=now() where id=$1 and status='queued'",[r.id]);
      return Response.json({ok:true,commands:rows.map((r)=>({id:r.id,type:r.type,payload:JSON.parse(r.payload)})),serverTime:Date.now()});
    }
  }}
});
