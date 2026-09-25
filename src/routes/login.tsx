import { createFileRoute } from "@tanstack/react-router";
import { SignInButtons } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Checking session…
        </div>
      </main>
    );
  }

  if (user) {
    window.location.replace("/");
    return null;
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-md rounded-lg border border-border bg-bg-subtle/70 p-8 shadow-[var(--shadow-border)]">
        <div className="mb-8">
          <div className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-buy">
            VOLT
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Sign in to VOLT</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Authenticate to manage your trading accounts and live bridge connections.
          </p>
        </div>
        <SignInButtons />
      </div>
    </main>
  );
}
