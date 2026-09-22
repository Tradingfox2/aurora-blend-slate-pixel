import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/telegram/ingest")({
  server: { handlers: {
    POST: async ({ request }) => {
      const expected=env("TELEGRAM_WORKER_TOKEN");
      const auth=(request.headers.get("authorization")||"").replace(/^Bearer\s+/i,"").trim();
      if(!expected || auth!==expected) return Response.json({ok:false,error:"unauthorized"},{status:401});
      let b:Record<string,unknown>;
      try{b=(await request.json()) as Record<string,unknown>}catch{return Response.json({ok:false,error:"invalid_json"},{status:400})}
      const sourceId=String(b.sourceId||""), chatId=String(b.chatId||""), messageId=Number(b.telegramMessageId), text=String(b.text||"");
      if(!sourceId||!chatId||!Number.isSafeInteger(messageId)||messageId<=0||!text||text.length>100_000) return Response.json({ok:false,error:"invalid_message"},{status:400});
      const {getSql}=await import("@/lib/db"); const sql=await getSql();
      const rows=await sql.query(`insert into volt_telegram_messages(source_id,telegram_message_id,chat_id,message_date,text,raw_json)
        values($1,$2,$3,$4,$5,$6) on conflict(source_id,telegram_message_id) do nothing returning telegram_message_id`,
        [sourceId,messageId,chatId,b.messageDate?new Date(String(b.messageDate)).toISOString():null,text,JSON.stringify(b.raw??null)]);
      await sql.query("update volt_telegram_sources set last_message_id=$2,last_message_at=now(),worker_status='receiving',updated_at=now() where source_id=$1",[sourceId,messageId]);
      return Response.json({ok:true,duplicate:rows.length===0});
    }
  }}
});
