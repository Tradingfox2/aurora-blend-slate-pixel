import { createFileRoute } from "@tanstack/react-router";

/**
 * EA → desk heartbeat.
 * Paper desk stores the last payload in memory via client; this route is the
 * production contract for a real local/tunnel worker.
 */
export const Route = createFileRoute("/api/bridge/heartbeat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.replace(/^Bearer\s+/i, "").trim();
        if (!token) {
          return Response.json({ ok: false, error: "missing_token" }, { status: 401 });
        }
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }
        const login = String(body.login ?? request.headers.get("x-volt-login") ?? "");
        if (!login) {
          return Response.json({ ok: false, error: "missing_login" }, { status: 400 });
        }
        return Response.json({
          ok: true,
          receivedAt: Date.now(),
          login,
          commands: [] as unknown[],
        });
      },
    },
  },
});
