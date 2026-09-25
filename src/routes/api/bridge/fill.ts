import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route=createFileRoute("/api/bridge/fill")({server:{handlers:{
  POST:async({request})=>{
    const configured=env("BRIDGE_TOKEN");
    const auth=(request.headers.get("authorization")||"").replace(/^Bearer\s+/i,"").trim();
    if(!configured||auth!==configured)return Response.json({ok:false,error:"unauthorized"},{status:401});
    let body:Record<string,unknown>;try{body=(await request.json()) as Record<string,unknown>}catch{return Response.json({ok:false,error:"invalid_json"},{status:400})}
    const login=String(body.login||""),platform=String(body.platform||""),commandId=String(body.commandId||""),connectionId=String(body.connectionId||"");
    if(!login||!["MT4","MT5"].includes(platform)||!commandId||body.ticket==null||!body.symbol||!body.side||!body.event)return Response.json({ok:false,error:"incomplete_fill"},{status:400});
    const {getSql}=await import("@/lib/db");const sql=await getSql();
    const cmd=await sql.query<{id:string;status:string;login:string;platform:string}>(`select id,status,login,platform,connection_id from volt_bridge_commands where id=$1`,[commandId]);
    if(!cmd.length||cmd[0].login!==login||cmd[0].platform!==platform||(connectionId && cmd[0].connection_id && cmd[0].connection_id!==connectionId))return Response.json({ok:false,error:"unknown_command"},{status:404});
    const id=String(body.id||`fill_${commandId}_${body.ticket}_${body.event}`);
    await sql.query(`insert into volt_bridge_fills(id,login,platform,ticket,event,symbol,side,lots,price,profit,payload_json)
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict(id) do nothing`,
      [id,login,platform,Number(body.ticket),String(body.event),String(body.symbol),String(body.side),Number(body.lots||0),body.price==null?null:Number(body.price),body.profit==null?null:Number(body.profit),JSON.stringify(body)]);
    const ev=String(body.event);
    const terminal=["failed","rejected","cancelled"].includes(ev);
    await sql.query(`update volt_bridge_commands set status=$2,completed_at=now(),result_json=$3,last_error=$4,lease_until=null where id=$1`,
      [commandId,terminal?"failed":"completed",JSON.stringify(body),terminal?String(body.error||ev):null]);
    return Response.json({ok:true,id,receivedAt:Date.now(),duplicate:false});
  }
}}});
