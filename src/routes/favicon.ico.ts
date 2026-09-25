import { createFileRoute } from "@tanstack/react-router";

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#090b10"/>
  <rect x="1" y="1" width="30" height="30" rx="6" fill="none" stroke="#c5ccd8" stroke-opacity="0.22"/>
  <path fill="#c5ccd8" d="M8.2 7.4h4.2L16 18.6 19.6 7.4h4.2L17.4 24.6h-2.8z"/>
</svg>`;

export const Route = createFileRoute("/favicon.ico")({
  server: {
    handlers: {
      GET: () =>
        new Response(FAVICON_SVG, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        }),
    },
  },
});
