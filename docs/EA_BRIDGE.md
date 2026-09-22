# VOLT EA Bridge Protocol

Local MetaTrader experts talk to the desk over HTTP using a shared token.

## Endpoints (desk host)

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/bridge/heartbeat` | EA alive + account snapshot |
| `POST` | `/api/bridge/fill` | Report market fill / close |
| `GET` | `/api/bridge/commands?login=…` | Pull pending commands |
| `POST` | `/api/bridge/ack` | Acknowledge command execution |

All requests require header:

```
Authorization: Bearer <bridge-token>
X-Volt-Login: <mt-login>
X-Volt-Platform: MT4|MT5
```

## Heartbeat body

```json
{
  "login": "5123401",
  "platform": "MT5",
  "server": "ICMarkets-Demo",
  "balance": 12540.22,
  "equity": 12601.05,
  "margin": 420.1,
  "eaVersion": "1.4.2",
  "openTickets": [1001, 1002],
  "pingMs": 12
}
```

## Fill body

```json
{
  "ticket": 1001,
  "symbol": "XAUUSD",
  "side": "buy",
  "lots": 0.2,
  "openPrice": 2341.2,
  "closePrice": null,
  "sl": 2330,
  "tp": 2360,
  "profit": null,
  "event": "open",
  "comment": "volt#0042"
}
```

`event`: `open` | `close` | `modify` | `partial`

## Commands (desk → EA)

```json
{
  "id": "cmd_…",
  "type": "market_open" | "close" | "modify" | "cancel",
  "symbol": "XAUUSD",
  "side": "buy",
  "lots": 0.1,
  "sl": 2330,
  "tp": 2360,
  "ticket": null,
  "magic": 20250922,
  "comment": "volt#0042"
}
```

EA polls every 250–500 ms when online. Paper mode of the web desk does **not** require a real EA; use **Simulate EA pulse** on `/bridge`.

## Security

- Token is rotated from the Bridge page.
- Prefer binding the EA to `localhost` or a private tunnel (Cloudflare Tunnel / ngrok) — never expose the desk without TLS + token.
- Hobby Vercel deploys are fine for the UI; keep the EA worker on a machine that can reach MT terminals.
