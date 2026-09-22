import http from "node:http";
import crypto from "node:crypto";
import { Pool } from "pg";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";

const PORT = Number(process.env.PORT || 8787);
const API_ID = Number(process.env.TELEGRAM_API_ID || 0);
const API_HASH = process.env.TELEGRAM_API_HASH || "";
const DB = process.env.DATABASE_URL;
const KEY = Buffer.from(process.env.TELEGRAM_SESSION_ENCRYPTION_KEY || "", "base64");
const WORKER_TOKEN = process.env.TELEGRAM_WORKER_TOKEN || "";
const APP_INGEST_URL = process.env.VOLT_INGEST_URL || "";
if (!API_ID || !API_HASH || !DB || KEY.length !== 32 || !WORKER_TOKEN || !APP_INGEST_URL) {
  throw new Error("Missing TELEGRAM_API_ID, TELEGRAM_API_HASH, DATABASE_URL, 32-byte base64 TELEGRAM_SESSION_ENCRYPTION_KEY, TELEGRAM_WORKER_TOKEN, or VOLT_INGEST_URL");
}
const pool = new Pool({connectionString: DB});
const clients = new Map();

function enc(text) {
  const iv=crypto.randomBytes(12);
  const c=crypto.createCipheriv("aes-256-gcm",KEY,iv);
  const out=Buffer.concat([c.update(text,"utf8"),c.final()]);
  return {ciphertext:out.toString("base64"),iv:iv.toString("base64"),tag:c.getAuthTag().toString("base64")};
}
function dec(row) {
  const d=crypto.createDecipheriv("aes-256-gcm",KEY,Buffer.from(row.session_iv,"base64"));
  d.setAuthTag(Buffer.from(row.session_tag,"base64"));
  return Buffer.concat([d.update(Buffer.from(row.session_ciphertext,"base64")),d.final()]).toString("utf8");
}
async function body(req){let s="";for await(const c of req)s+=c;return s?JSON.parse(s):{};}
function send(res,status,data){res.writeHead(status,{"content-type":"application/json"});res.end(JSON.stringify(data));}
function auth(req){return req.headers["x-volt-worker-token"]===WORKER_TOKEN;}

async function sendCode(body){
  const phone=String(body.phone||"").trim();
  if(!phone) throw Object.assign(new Error("missing_phone"),{status:400});
  const client=new TelegramClient(new StringSession(""),API_ID,API_HASH,{connectionRetries:5});
  await client.connect();
  const r=await client.sendCode({apiId:API_ID,apiHash:API_HASH},phone);
  const row=enc(client.session.save());
  await pool.query(`insert into volt_telegram_sessions(phone,phone_code_hash,session_ciphertext,session_iv,session_tag,status,updated_at)
    values($1,$2,$3,$4,$5,'code_sent',now())
    on conflict(phone) do update set phone_code_hash=excluded.phone_code_hash,session_ciphertext=excluded.session_ciphertext,session_iv=excluded.session_iv,session_tag=excluded.session_tag,status='code_sent',updated_at=now()`,
    [phone,r.phoneCodeHash,row.ciphertext,row.iv,row.tag]);
  await client.disconnect();
  return {ok:true,phone,phoneCodeHash:r.phoneCodeHash,isCodeViaApp:r.isCodeViaApp};
}

async function verify(body){
  const phone=String(body.phone||"").trim(), code=String(body.code||"").trim(), hash=String(body.phoneCodeHash||"").trim();
  if(!phone||!code||!hash) throw Object.assign(new Error("missing_phone_code_or_hash"),{status:400});
  const q=await pool.query("select * from volt_telegram_sessions where phone=$1 and phone_code_hash=$2",[phone,hash]);
  if(!q.rows[0]) throw Object.assign(new Error("code_session_not_found"),{status:400});
  const row=q.rows[0], client=new TelegramClient(new StringSession(dec(row)),API_ID,API_HASH,{connectionRetries:5});
  await client.connect();
  let user;
  try {
    user=await client.invoke(new Api.auth.SignIn({phoneNumber:phone,phoneCodeHash:hash,phoneCode:code}));
  } catch(e) {
    if(e?.errorMessage!=="SESSION_PASSWORD_NEEDED") throw e;
    if(!body.password) throw Object.assign(new Error("two_factor_required"),{status:409});
    user=await client.signInWithPassword({apiId:API_ID,apiHash:API_HASH},{password:async()=>String(body.password),onError:()=>true});
  }
  const me=await client.getMe();
  const session=enc(client.session.save());
  await pool.query(`update volt_telegram_sessions set session_ciphertext=$2,session_iv=$3,session_tag=$4,status='active',username=$5,telegram_user_id=$6,updated_at=now() where phone=$1`,
    [phone,session.ciphertext,session.iv,session.tag,me?.username||null,String(me?.id||"")]);
  await client.disconnect();
  await startClient(phone);
  return {ok:true,phone,connected:true,user:{id:String(me?.id||""),username:me?.username||null,phone:me?.phone||phone}};
}

function mapError(e){
  const m=String(e?.errorMessage||e?.message||"telegram_error");
  if(m.includes("PHONE_CODE_INVALID")) return ["invalid_code",400];
  if(m.includes("PHONE_CODE_EXPIRED")) return ["expired_code",400];
  if(m.includes("SESSION_PASSWORD_NEEDED")) return ["two_factor_required",409];
  if(m.includes("FLOOD_WAIT")) return ["flood_wait",429];
  if(m.includes("PHONE_NUMBER_INVALID")) return ["invalid_phone",400];
  return [m,500];
}

async function postIngest(payload){
  await fetch(APP_INGEST_URL,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${WORKER_TOKEN}`},body:JSON.stringify(payload)});
}

async function startClient(phone){
  if(clients.has(phone)) return;
  const q=await pool.query("select * from volt_telegram_sessions where phone=$1 and status='active'",[phone]);
  if(!q.rows[0]) return;
  const row=q.rows[0], client=new TelegramClient(new StringSession(dec(row)),API_ID,API_HASH,{connectionRetries:10});
  await client.connect();
  if(!await client.checkAuthorization()){await client.disconnect();return;}
  clients.set(phone,client);
  const sources=await pool.query("select * from volt_telegram_sources where enabled=true");
  for(const s of sources.rows){
    client.addEventHandler(async event=>{
      const msg=event.message;
      const text=String(msg?.message||"");
      if(!text) return;
      await postIngest({sourceId:s.source_id,chatId:String(s.chat_id),telegramMessageId:Number(msg.id),messageDate:msg.date,text,raw:msg.toJSON?.()||null});
      await pool.query("update volt_telegram_sources set last_message_id=$2,last_message_at=now(),worker_status='receiving',updated_at=now() where source_id=$1",[s.source_id,Number(msg.id)]);
    },new NewMessage({chats:[String(s.chat_id)]}));
  }
  await pool.query("update volt_telegram_sources set worker_status='connected',updated_at=now() where enabled=true");
}

async function startAll(){
  const q=await pool.query("select phone from volt_telegram_sessions where status='active'");
  for(const r of q.rows){try{await startClient(r.phone)}catch(e){console.error("[telegram]",r.phone,e)}}
}
setInterval(()=>startAll().catch(console.error),30000);
await startAll();

const server=http.createServer(async(req,res)=>{
  try{
    if(!auth(req)) return send(res,401,{ok:false,error:"unauthorized"});
    const url=new URL(req.url,`http://127.0.0.1:${PORT}`);
    if(req.method==="GET"&&url.pathname==="/health") return send(res,200,{ok:true,activeSessions:clients.size});
    if(req.method==="POST"&&url.pathname==="/auth/send-code") return send(res,200,await sendCode(await body(req)));
    if(req.method==="POST"&&url.pathname==="/auth/verify") return send(res,200,await verify(await body(req)));
    return send(res,404,{ok:false,error:"not_found"});
  }catch(e){const [error,status]=mapError(e);send(res,status,{ok:false,error})}
});
server.listen(PORT,"0.0.0.0",()=>console.log(`VOLT Telegram worker listening on ${PORT}`));
