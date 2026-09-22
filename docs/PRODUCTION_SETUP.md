# ⚡ VOLT Production Setup & Live Execution Guide

VOLT is a high-performance trading command desk supporting signal ingestion, risk routing, master/follower copy trading, persistent trade journaling, and MetaTrader 4 / MetaTrader 5 Expert Advisor (EA) execution.

---

## 1. System Requirements & Architecture

VOLT operates on a 3-tier production architecture:

```text
[ Telegram Channels ] ──(MTProto)──> [ Persistent Telegram Worker ]
                                                │ (HTTP Ingest)
                                                ▼
                                    [ VOLT (TanStack Start / Vercel) ]
                                      ▲                   │
                     (HTTP Heartbeat) │                   │ (Command Queue)
                                      │                   ▼
                             [ MT4 / MT5 Terminal (VoltBridge EA) ] ──> [ Live Broker ]
```

- **Web Dashboard**: Deployed on Vercel / TanStack Start.
- **Database**: PostgreSQL (Neon, Supabase, or AWS RDS).
- **Telegram Worker**: Long-running Node.js process running GramJS / MTProto client.
- **Broker Bridge**: MT4/MT5 Expert Advisor (`ea/VoltBridge.mq4` or `ea/VoltBridge.mq5`).

---

## 2. Environment Variables

Configure these variables in your Vercel project settings:

| Variable | Scope | Description |
| --- | --- | --- |
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `BRIDGE_TOKEN` | Server | Secret authentication key shared between VOLT and MT4/MT5 EA |
| `TELEGRAM_API_ID` | Server | Telegram API ID from [my.telegram.org](https://my.telegram.org) |
| `TELEGRAM_API_HASH` | Server | Telegram API Hash from [my.telegram.org](https://my.telegram.org) |
| `TELEGRAM_SESSION_ENCRYPTION_KEY` | Server | 32-byte secret key used to encrypt GramJS sessions at rest |
| `WORKER_INGEST_KEY` | Server | Secret key authenticating the long-running Telegram worker to `/api/telegram/ingest` |
| `XAI_API_KEY` | Server | (Optional) xAI Grok API key for automated signal parsing |

---

## 3. Database Setup

Database migrations run automatically during deployment (`npm run db:migrate`).

Tables created:
- `volt_trades`: Closed trades, open/close price, tickets, MAE/MFE, realized PnL.
- `volt_signals`: Signal history, raw text, confidence scores, execution latencies.
- `volt_bridge_accounts`: Live MT4/MT5 terminal heartbeats, balances, equities, ping times.
- `volt_bridge_commands`: Active queue for MT4/MT5 broker execution commands.
- `volt_bridge_fills`: Execution fill events and slippage reports from MetaTrader terminals.
- `volt_telegram_sessions`: Encrypted MTProto string sessions and authorization state.

---

## 4. MetaTrader 4 / MT5 Expert Advisor Setup

1. Open MetaTrader terminal (MT4 or MT5).
2. Go to **Tools → Options → Expert Advisors**:
   - Check **Allow WebRequest for listed URL**.
   - Add your production URL: `https://volt-telegram-trading-terminal.vercel.app`
3. Open MetaEditor (`F4`) and compile `ea/VoltBridge.mq4` (MT4) or `ea/VoltBridge.mq5` (MT5).
4. Attach `VoltBridge` to any chart window.
5. Set Inputs:
   - `InpDeskUrl`: `https://volt-telegram-trading-terminal.vercel.app`
   - `InpToken`: The secret value matching your `BRIDGE_TOKEN` environment variable.
   - `InpPollMs`: `200`
   - `InpMagic`: `20250922`

---

## 5. Health & Readiness API Endpoints

- **Health Check**: `GET /api/health`
- **Readiness Audit**: `GET /api/readiness`
  Returns sanitized status for DB connection, Telegram worker status, bridge status, and live trading eligibility.

---

## 6. Safety & Live Trading Arming

To arm Live Mode (`settings.paper = false`):
1. Verify `/api/readiness` reports `liveTrading.eligible = true`.
2. Verify at least one EA terminal is connected and sending regular heartbeats.
3. Verify global halt is disengaged.
