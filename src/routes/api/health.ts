import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";
import { dbSource, getSql } from "@/lib/db";

export const Route=createFileRoute("/api/health")({server:{handlers:{
 GET:async()=>{
  let db=false;try{await getSql();db=true}catch{}
  return Response.json({ok:db,db:{configured:Boolean(env("DATABASE_URL")),source:dbSource,reachable:db},telegramWorkerConfigured:Boolean(env("TELEGRAM_WORKER_URL")),bridgeConfigured:Boolean(env("BRIDGE_TOKEN"))},{status:db?200:503});
 }
}}});
