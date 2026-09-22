import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bridge/commands")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.replace(/^Bearer\s+/i, "").trim();
        if (!token) {
          return Response.json({ ok: false, error: "missing_token" }, { status: 401 });
        }
        const url = new URL(request.url);
        const login = url.searchParams.get("login") ?? request.headers.get("x-volt-login") ?? "";
        if (!login) {
          return Response.json({ ok: false, error: "missing_login" }, { status: 400 });
        }
        // Production: dequeue from Redis / Postgres for this login.
        // Paper desk queues live in the browser store.
        return Response.json({
          ok: true,
          login,
          commands: [] as unknown[],
          serverTime: Date.now(),
        });
      },
    },
  },
});
