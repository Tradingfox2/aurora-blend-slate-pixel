import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/bridge/commands")({
  server:{handlers:{
    GET:async({request})=>{
      const configured=env("BRIDGE_TOKEN");
      const auth=(request.headers.get("authorization")||"").replace(/^Bearer\s+/i,"").trim();
      if(!configured||auth!==configured)return Response.json({ok:false,error:"unauthorized"},{status:401});
      const url=new URL(request.url), login=url.searchParams.get("login")||"", platform=url.searchParams.get("platform")||request.headers.get("x-volt-platform")||"";
      if(!login||!["MT4","MT5"].includes(platform))return Response.json({ok:false,error:"missing_login_or_platform"},{status:400});
      const {getSql}=await import("@/lib/db");const sql=await getSql();
      // Reclaim crashed/stale executions before claiming new work.
      await sql.query(`update volt_bridge_commands set status='queued',claimed_at=null
        where login=$1 and platform=$2 and status='claimed' and claimed_at is not null and claimed_at < now()-interval '45 seconds'`,[login,platform]);
      const rows=await sql.query(`with candidates as (
          select id from volt_bridge_commands
          where login=$1 and platform=$2 and status='queued'
            
          order by created_at asc
          for update skip locked limit 10
        )
        update volt_bridge_commands c
        set status='claimed',claimed_at=now(),claimed_until=now()+interval '45 seconds',attempts=c.attempts+1
        from candidates
        where c.id=candidates.id
        returning c.id,c.command_type as "type",c.payload_json as payload,c.attempts`,[login,platform]);
      return Response.json({ok:true,commands:rows.map((r:any)=>({id:r.id,type:r.type,payload:JSON.parse(String(r.payload)),attempts:r.attempts})),serverTime:Date.now()});
    }
  }}
});
