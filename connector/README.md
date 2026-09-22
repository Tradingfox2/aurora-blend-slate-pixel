# VOLT MT5 connector

This is the server-side connector that makes MT5 account setup happen from inside VOLT.

It must run on a persistent Windows host with MetaTrader 5 terminal binaries available. Vercel remains the web/API layer; it is not the MT5 runtime.

## Required environment

- `VOLT_API_URL` — e.g. `https://volt-telegram-trading-terminal.vercel.app`
- `MT5_CONNECTOR_TOKEN` — same secret configured in VOLT
- `BRIDGE_TOKEN` — same bridge secret used by the existing bridge API
- `MT5_TERMINAL_PATH` — path to a MetaTrader 5 terminal executable
- `MT5_RUNTIME_ROOT` — writable directory used for isolated terminal instances

Install dependencies:

`py -m pip install -r connector/requirements.txt`

Start:

`py connector/worker.py`

The connector claims pending accounts, launches one isolated MT5 worker per account, authenticates with the supplied broker/server/login/password, and continuously publishes account/position/order state into VOLT.

Do not put real account passwords in source control or logs.
