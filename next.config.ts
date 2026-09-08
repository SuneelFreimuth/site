import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  async headers() {
    return [
      {
        // Prevent CDNs/browsers from long-term caching the HTML shell and
        // other non-hashed routes. Stale HTML can reference old JS chunks
        // that no longer exist, which is what caused the
        // `_old.<hash>.js` React Router error on suneel.me.
        // Content-hashed assets under /_next/static/** are excluded since
        // they're safe to cache immutably (handled by Next.js itself).
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
