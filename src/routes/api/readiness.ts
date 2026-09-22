import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";
import { getSql } from "@/lib/db";

export const Route=createFileRoute("/api/readiness")({server:{handlers:{
 GET:async()=>{
  let database=false;try{await getSql();database=true}catch{}
  const persistent=Boolean(env("DATABASE_URL"));
  const bridge=Boolean(env("BRIDGE_TOKEN"));
  const worker=Boolean(env("TELEGRAM_WORKER_URL")&&env("TELEGRAM_WORKER_TOKEN"));
  const liveEligible=database&&persistent&&bridge&&worker;
  return Response.json({ok:liveEligible,database:{configured:persistent,reachable:database,persistent},bridge:{configured:bridge},telegram:{workerConfigured:worker},liveTrading:{eligible:liveEligible,reason:liveEligible?null:"requires persistent DATABASE_URL, BRIDGE_TOKEN, and Telegram worker"}},{status:liveEligible?200:503});
 }
}}});
