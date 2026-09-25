import os
import subprocess
import sys
import time
import uuid
from pathlib import Path

import requests

API = os.environ["VOLT_API_URL"].rstrip("/")
CONNECTOR_TOKEN = os.environ["MT5_CONNECTOR_TOKEN"]
RUNTIME_ROOT = Path(os.environ.get("MT5_RUNTIME_ROOT", r"C:\VOLT\mt5-runtime"))
WORKER = Path(__file__).with_name("account_worker.py")
POLL_SECONDS = float(os.environ.get("MT5_JOB_POLL_SECONDS", "2"))


def headers():
    return {
        "Authorization": f"Bearer {CONNECTOR_TOKEN}",
        "x-volt-connector-id": CONNECTOR_ID,
    }


CONNECTOR_ID = os.environ.get("MT5_CONNECTOR_ID", f"mt5-{uuid.uuid4().hex[:12]}")
RUNTIME_ROOT.mkdir(parents=True, exist_ok=True)


def claim_job():
    r = requests.get(f"{API}/api/internal/mt5/jobs", headers=headers(), timeout=30)
    r.raise_for_status()
    return r.json().get("job")


def main():
    children = {}
    while True:
        for connection_id, proc in list(children.items()):
            if proc.poll() is not None:
                children.pop(connection_id, None)
                try:
                    requests.post(
                        f"{API}/api/internal/mt5/status",
                        headers={"Authorization": f"Bearer {CONNECTOR_TOKEN}"},
                        json={
                            "id": connection_id,
                            "connectorId": CONNECTOR_ID,
                            "status": "error",
                            "error": f"account_worker_exit:{proc.returncode}",
                        },
                        timeout=20,
                    )
                except Exception:
                    pass

        try:
            job = claim_job()
            if job and job["id"] not in children:
                env = os.environ.copy()
                env.update({
                    "VOLT_API_URL": API,
                    "BRIDGE_TOKEN": os.environ["BRIDGE_TOKEN"],
                    "MT5_CONNECTOR_TOKEN": CONNECTOR_TOKEN,
                    "MT5_CONNECTOR_ID": CONNECTOR_ID,
                    "MT5_CONNECTION_ID": str(job["id"]),
                    "MT5_BROKER": str(job["broker"]),
                    "MT5_SERVER": str(job["server"]),
                    "MT5_LOGIN": str(job["login"]),
                    "MT5_PASSWORD": str(job["password"]),
                    "MT5_ENVIRONMENT": str(job["environment"]),
                    "MT5_TERMINAL_PATH": os.environ["MT5_TERMINAL_PATH"],
                    "MT5_RUNTIME_ROOT": str(RUNTIME_ROOT),
                })
                proc = subprocess.Popen(
                    [sys.executable, str(WORKER)],
                    env=env,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                )
                children[str(job["id"])] = proc
        except Exception:
            # The connector must survive transient VOLT/network failures.
            pass
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
