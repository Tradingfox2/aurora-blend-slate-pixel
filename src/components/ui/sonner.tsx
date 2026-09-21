import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "bg-bg-elevated text-fg shadow-[var(--shadow-border)] border-0",
          title: "text-fg",
          description: "text-muted",
        },
      }}
    />
  );
}
