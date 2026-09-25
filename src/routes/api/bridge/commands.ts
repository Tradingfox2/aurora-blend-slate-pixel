import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

function authorized(request: Request) {
  const configured = env("BRIDGE_TOKEN");
  const auth = (request.headers.get("authorization") || "").replace(/^Bearer\\s+/i, "").trim();
  return Boolean(configured && auth === configured);
}

export const Route=createFileRoute("/api/bridge/commands")({server:{handlers:{
 GET:async({request})=>{
  if(!authorized(request))return Response.json({ok:false,error:"unauthorized"},{status:401});
  const u=new URL(request.url),login=u.searchParams.get("login")||"",platform=u.searchParams.get("platform")||request.headers.get("x-volt-platform")||"",connectionId=u.searchParams.get("connectionId")||"";
  if(!login||!["MT4","MT5"].includes(platform))return Response.json({ok:false,error:"missing_login_or_platform"},{status:400});
  const {getSql}=await import("@/lib/db");const sql=await getSql();
  await sql.query(`update volt_bridge_commands
    set status='queued',claimed_at=null,lease_until=null
    where login=$1 and platform=$2 and status='claimed' and ($3='' or connection_id=$3)
      and claimed_at is not null and claimed_at < now()-interval '45 seconds'`,[login,platform,connectionId]);
  const rows=await sql.query(`with candidates as (
    select id from volt_bridge_commands
    where login=$1 and platform=$2 and status='queued'
      and ($3='' or connection_id=$3)
    order by created_at asc
    for update skip locked limit 10
  )
  update volt_bridge_commands c set
    status='claimed',
    claimed_at=now(),
    lease_until=now()+interval '45 seconds',
    attempt_count=c.attempt_count+1
  from candidates where c.id=candidates.id
  returning c.id,c.command_type as "type",c.payload_json as payload`,[login,platform,connectionId]);
  return Response.json({ok:true,commands:rows.map((r:any)=>({id:r.id,type:r.type,payload:JSON.parse(String(r.payload))})),serverTime:Date.now()});
 }
}}});