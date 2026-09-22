import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bridge/fill")({
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
        if (body.ticket == null || !body.symbol || !body.side || !body.event) {
          return Response.json({ ok: false, error: "incomplete_fill" }, { status: 400 });
        }
        return Response.json({
          ok: true,
          receivedAt: Date.now(),
          ticket: body.ticket,
          event: body.event,
        });
      },
    },
  },
});
