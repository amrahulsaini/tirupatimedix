"use client";

import { usePathname } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function RouteTransitionLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const startRef = useRef(0);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) {
        return;
      }

      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
        return;
      }

      startRef.current = Date.now();
      setIsLoading(true);
    };

    const onPopState = () => {
      startRef.current = Date.now();
      setIsLoading(true);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const elapsed = Date.now() - startRef.current;
    const minVisible = 250;
    const remaining = Math.max(minVisible - elapsed, 0);

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => {
      setIsLoading(false);
      hideTimerRef.current = null;
    }, remaining);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [pathname, isLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="route-loader" role="status" aria-live="polite" aria-label="Loading next page">
      <div className="route-loader__panel">
        <LoaderCircle size={34} className="route-loader__spinner" />
        <p>Loading next page...</p>
      </div>
    </div>
  );
}
