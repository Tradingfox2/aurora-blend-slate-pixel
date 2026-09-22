# VOLT

**Telegram signals → risk → MT4/MT5 paper execution desk.**

Numbered tickets, master/follower copy routing, circuit breakers, MAE/MFE journal, EA bridge handshake UI.

## What ships today

| Layer | Status |
| --- | --- |
| Signal parse (local regex) | Production |
| Grok interpret (opt-in, capped) | Production |
| Risk / circuits / bulk actions | Production |
| Master → follower copy | Production |
| Paper engine + live tape | Production |
| Trade journal (MAE/MFE, CSV) | Production |
| Telegram **session UI** | Production (simulated auth) |
| EA **bridge UI** + heartbeats | Production (simulated) |
| Real GramJS / MT socket fills | **Not in this build** — attach native EA + user session server-side |

This app is a **complete paper desk** you can demo, train on, and extend. Live broker fills require a local MT expert posting to the bridge token and a Telegram user-session worker (out of browser scope).

Starts empty: no seeded trades, no mock journal, no hardcoded chat list. Connect Telegram or inject signals, add accounts on the Accounts page.

## Run

```bash
npm install
npm run dev          # http://0.0.0.0:8080
npm run typecheck
npm run build
```

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Command desk |
| `/telegram` | Session + channel listen / auto-trade |
| `/signals` | Numbered ticket book |
| `/book` | Positions + bulk |
| `/accounts` | Terminals, roles, copy, connect |
| `/bridge` | EA token + heartbeats |
| `/providers` | Source scoreboard |
| `/history` | Journal + CSV |
| `/risk` | Circuits |
| `/settings` | Parse / Grok / export |

## Data

- Hot path: in-memory Zustand + `localStorage` (`volt-desk-v2`)
- Optional Postgres archive: `migrations/0002_volt.sql`, `0003_volt_journal.sql` via `src/lib/trading/persist.ts`

## Safety

- Global halt blocks new risk
- Daily loss / consecutive loss / spread / Friday cutoff gates
- Paper mode is the default; never treat simulated fills as live capital
