import json
import os
import shutil
import time
from pathlib import Path

import MetaTrader5 as mt5
import requests

API = os.environ["VOLT_API_URL"].rstrip("/")
BRIDGE_TOKEN = os.environ["BRIDGE_TOKEN"]
CONNECTOR_TOKEN = os.environ["MT5_CONNECTOR_TOKEN"]
CONNECTOR_ID = os.environ["MT5_CONNECTOR_ID"]
CONNECTION_ID = os.environ["MT5_CONNECTION_ID"]
BROKER = os.environ["MT5_BROKER"]
SERVER = os.environ["MT5_SERVER"]
LOGIN = int(os.environ["MT5_LOGIN"])
PASSWORD = os.environ["MT5_PASSWORD"]
ENVIRONMENT = os.environ["MT5_ENVIRONMENT"]
TEMPLATE_EXE = Path(os.environ["MT5_TERMINAL_PATH"])
RUNTIME_ROOT = Path(os.environ["MT5_RUNTIME_ROOT"])
INSTANCE_DIR = RUNTIME_ROOT / CONNECTION_ID
TERMINAL_EXE = INSTANCE_DIR / TEMPLATE_EXE.name


def status(value, error=None):
    try:
        requests.post(
            f"{API}/api/internal/mt5/status",
            headers={"Authorization": f"Bearer {CONNECTOR_TOKEN}"},
            json={"id": CONNECTION_ID, "connectorId": CONNECTOR_ID, "status": value, "error": error},
            timeout=20,
        ).raise_for_status()
    except Exception:
        pass


def bridge_headers():
    return {"Authorization": f"Bearer {BRIDGE_TOKEN}"}


def bridge_post(path, payload):
    r = requests.post(f"{API}{path}", headers=bridge_headers(), json=payload, timeout=20)
    r.raise_for_status()
    return r.json()


def heartbeat():
    info = mt5.account_info()
    terminal = mt5.terminal_info()
    if info is None:
        raise RuntimeError(f"account_info_failed:{mt5.last_error()}")
    return bridge_post("/api/bridge/heartbeat", {
        "login": str(info.login),
        "platform": "MT5",
        "server": str(info.server or SERVER),
        "broker": BROKER,
        "connectionId": CONNECTION_ID,
        "connectorId": CONNECTOR_ID,
        "balance": float(info.balance),
        "equity": float(info.equity),
        "margin": float(info.margin),
        "eaVersion": f"python-mt5/{getattr(mt5, '__version__', 'unknown')}",
        "pingMs": 0 if terminal is None else 1,
    })


def state():
    positions = mt5.positions_get() or ()
    orders = mt5.orders_get() or ()
    p = []
    for x in positions:
        p.append({
            "ticket": int(x.ticket), "symbol": x.symbol,
            "side": "buy" if x.type == mt5.POSITION_TYPE_BUY else "sell",
            "lots": float(x.volume), "openPrice": float(x.price_open),
            "sl": float(x.sl) if x.sl else None, "tp": float(x.tp) if x.tp else None,
            "openTime": int(x.time), "magic": int(x.magic),
            "comment": str(x.comment), "profit": float(x.profit),
        })
    o = []
    for x in orders:
        side = {
            mt5.ORDER_TYPE_BUY_LIMIT: "buy_limit",
            mt5.ORDER_TYPE_SELL_LIMIT: "sell_limit",
            mt5.ORDER_TYPE_BUY_STOP: "buy_stop",
            mt5.ORDER_TYPE_SELL_STOP: "sell_stop",
        }.get(x.type, str(x.type))
        o.append({
            "ticket": int(x.ticket), "symbol": x.symbol, "side": side,
            "lots": float(x.volume_initial), "price": float(x.price_open),
            "sl": float(x.sl) if x.sl else None, "tp": float(x.tp) if x.tp else None,
            "magic": int(x.magic), "comment": str(x.comment),
        })
    info = mt5.account_info()
    return bridge_post("/api/bridge/state", {
        "login": str(info.login), "platform": "MT5",
        "positions": p, "orders": o,
    })


def report(command, event, ticket, symbol, side, lots=0, price=None, profit=None, error=None):
    payload = {
        "login": str(LOGIN), "platform": "MT5", "connectionId": CONNECTION_ID, "commandId": command["id"],
        "ticket": int(ticket), "event": event, "symbol": symbol, "side": side,
        "lots": float(lots), "price": price, "profit": profit,
    }
    if error:
        payload["error"] = str(error)[:1000]
    try:
        bridge_post("/api/bridge/fill", payload)
    except Exception:
        pass


def ensure_terminal():
    INSTANCE_DIR.mkdir(parents=True, exist_ok=True)
    if not TERMINAL_EXE.exists():
        # A separate installation directory is required for concurrent MT5 instances.
        shutil.copytree(TEMPLATE_EXE.parent, INSTANCE_DIR, dirs_exist_ok=True)
    if not TERMINAL_EXE.exists():
        raise FileNotFoundError(f"MT5 terminal not found: {TERMINAL_EXE}")
    return str(TERMINAL_EXE)


def open_market(command):
    p = command["payload"]
    symbol = str(p["symbol"])
    side = str(p["side"]).lower()
    lots = float(p["lots"])
    if not mt5.symbol_select(symbol, True):
        raise RuntimeError(f"symbol_unavailable:{symbol}")
    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        raise RuntimeError(f"no_tick:{symbol}")
    is_buy = side == "buy"
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": lots,
        "type": mt5.ORDER_TYPE_BUY if is_buy else mt5.ORDER_TYPE_SELL,
        "price": float(tick.ask if is_buy else tick.bid),
        "sl": float(p["sl"] or 0),
        "tp": float(p["tp"] or 0),
        "deviation": 20,
        "magic": int(p.get("magic") or 0),
        "comment": str(p.get("comment") or "VOLT"),
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }
    result = mt5.order_send(request)
    if result is None:
        raise RuntimeError(f"order_send_none:{mt5.last_error()}")
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        raise RuntimeError(f"order_rejected:{result.retcode}:{result.comment}")
    report(command, "filled", int(result.order or result.deal), symbol, side, lots, float(result.price or request["price"]))
    return result


def close_position(command, partial=False):
    p = command["payload"]
    ticket = int(p.get("ticket") or 0)
    positions = mt5.positions_get(ticket=ticket)
    if not positions:
        raise RuntimeError(f"position_not_found:{ticket}")
    pos = positions[0]
    requested = float(pos.volume)
    if partial:
        pct = float(p.get("closePct") or 0)
        requested = max(0.0, min(requested, requested * pct / 100.0))
    if requested <= 0:
        raise RuntimeError("close_volume_zero")
    tick = mt5.symbol_info_tick(pos.symbol)
    is_buy = pos.type == mt5.POSITION_TYPE_BUY
    request = {
        "action": mt5.TRADE_ACTION_DEAL, "symbol": pos.symbol,
        "volume": requested,
        "type": mt5.ORDER_TYPE_SELL if is_buy else mt5.ORDER_TYPE_BUY,
        "position": ticket,
        "price": float(tick.bid if is_buy else tick.ask),
        "deviation": 20, "magic": int(pos.magic),
        "comment": "VOLT close", "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }
    result = mt5.order_send(request)
    if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
        raise RuntimeError(f"close_rejected:{getattr(result, 'retcode', mt5.last_error())}")
    report(command, "closed" if not partial else "partial_closed", ticket, pos.symbol,
           "buy" if is_buy else "sell", requested, float(result.price or request["price"]),
           float(result.profit or 0))
    return result


def modify_position(command):
    p = command["payload"]
    ticket = int(p.get("ticket") or 0)
    positions = mt5.positions_get(ticket=ticket)
    if not positions:
        raise RuntimeError(f"position_not_found:{ticket}")
    pos = positions[0]
    result = mt5.order_send({
        "action": mt5.TRADE_ACTION_SLTP, "position": ticket,
        "symbol": pos.symbol, "sl": float(p.get("newSl") or 0),
        "tp": float(p.get("newTp") or 0),
    })
    if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
        raise RuntimeError(f"modify_rejected:{getattr(result, 'retcode', mt5.last_error())}")
    report(command, "modified", ticket, pos.symbol,
           "buy" if pos.type == mt5.POSITION_TYPE_BUY else "sell", float(pos.volume))


def cancel_order(command):
    p = command["payload"]
    ticket = int(p.get("ticket") or 0)
    orders = mt5.orders_get(ticket=ticket)
    if not orders:
        raise RuntimeError(f"order_not_found:{ticket}")
    o = orders[0]
    result = mt5.order_send({"action": mt5.TRADE_ACTION_REMOVE, "order": ticket})
    if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
        raise RuntimeError(f"cancel_rejected:{getattr(result, 'retcode', mt5.last_error())}")
    report(command, "cancelled", ticket, o.symbol, str(o.type), float(o.volume_initial))


def execute(command):
    kind = command["type"]
    if kind == "open_market":
        return open_market(command)
    if kind == "close_position":
        return close_position(command)
    if kind == "partial_close":
        return close_position(command, partial=True)
    if kind == "modify_position":
        return modify_position(command)
    if kind == "break_even":
        p = command["payload"]
        p["newSl"] = p.get("openPrice") or 0
        return modify_position(command)
    if kind == "cancel_order":
        return cancel_order(command)
    raise RuntimeError(f"unsupported_command:{kind}")


def poll_commands():
    r = requests.get(
        f"{API}/api/bridge/commands",
        headers=bridge_headers(),
        params={"login": str(LOGIN), "platform": "MT5", "connectionId": CONNECTION_ID},
        timeout=20,
    )
    r.raise_for_status()
    return r.json().get("commands", [])


def main():
    status("connecting")
    terminal = ensure_terminal()
    if not mt5.initialize(terminal, login=LOGIN, password=PASSWORD, server=SERVER, timeout=60000, portable=True):
        error = f"initialize_failed:{mt5.last_error()}"
        status("error", error)
        raise SystemExit(2)

    try:
        info = mt5.account_info()
        if info is None or int(info.login) != LOGIN:
            raise RuntimeError(f"account_login_mismatch:{getattr(info, 'login', None)}")
        status("connected")
        last_hb = 0.0
        last_state = 0.0
        while True:
            now = time.time()
            if now - last_hb >= 5:
                heartbeat()
                last_hb = now
            if now - last_state >= 2:
                state()
                last_state = now
            for command in poll_commands():
                try:
                    execute(command)
                except Exception as exc:
                    payload = command.get("payload", {})
                    report(command, "failed", int(payload.get("ticket") or 0), str(payload.get("symbol") or ""), str(payload.get("side") or ""), error=str(exc))
            time.sleep(0.5)
    except Exception as exc:
        status("error", str(exc))
        raise
    finally:
        try:
            status("disconnected")
        finally:
            mt5.shutdown()


if __name__ == "__main__":
    main()
