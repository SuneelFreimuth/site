"use client";

import { useEffect } from "react";

/**
 * One-time cleanup for visitors whose browsers still have a service worker
 * and/or CacheStorage entries registered by a previous, pre-Next.js version
 * of this site (built with React Router). If left in place, that stale
 * service worker can intercept navigation and serve an old cached shell
 * referencing JS chunks (e.g. `_old.<hash>.js`) that no longer exist,
 * causing "Cannot destructure property 'auth' of 'e' as it is undefined"
 * errors from React Router's default ErrorBoundary.
 *
 * This component is safe to run on every load: unregistering when there's
 * nothing to unregister, and clearing caches when there's nothing to clear,
 * are both no-ops.
 */
export function StaleCacheCleanup(): null {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      })
      .catch(() => {
        // Best-effort cleanup; ignore failures.
      });

    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {
          // Best-effort cleanup; ignore failures.
        });
    }
  }, []);

  return null;
}
