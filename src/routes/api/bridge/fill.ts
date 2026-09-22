import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/bridge/fill")({
  server:{handlers:{
    POST:async({request})=>{
      const configured=env("BRIDGE_TOKEN");
      const auth=request.headers.get("authorization")??"";
      const token=auth.replace(/^Bearer\s+/i,"").trim();
      if(!configured || token!==configured) return Response.json({ok:false,error:"unauthorized"},{status:401});
      let body:Record<string,unknown>;
      try{body=(await request.json()) as Record<string,unknown>}catch{return Response.json({ok:false,error:"invalid_json"},{status:400})}
      const login=String(body.login??request.headers.get("x-volt-login")??"");
      const platform=String(body.platform??request.headers.get("x-volt-platform")??"");
      if(!login||!["MT4","MT5"].includes(platform)||body.ticket==null||!body.symbol||!body.side||!body.event) return Response.json({ok:false,error:"incomplete_fill"},{status:400});
      const {getSql}=await import("@/lib/db"); const sql=await getSql();
      const id=String(body.id??`fill_${login}_${body.ticket}_${Date.now()}`);
      await sql.query(`insert into volt_bridge_fills(id,login,platform,ticket,event,symbol,side,lots,price,profit,payload_json) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict(id) do nothing`,[id,login,platform,Number(body.ticket),String(body.event),String(body.symbol),String(body.side),Number(body.lots??0),body.price==null?null:Number(body.price),body.profit==null?null:Number(body.profit),JSON.stringify(body)]);
      if(body.commandId) await sql.query("update volt_bridge_commands set status='completed',completed_at=now(),result_json=$2 where id=$1",[String(body.commandId),JSON.stringify(body)]);
      return Response.json({ok:true,id,receivedAt:Date.now()});
    }
  }}
});
