"use client";

import { useEffect } from "react";

export function AdminQueryCleaner() {
  useEffect(() => {
    const { pathname, hash } = window.location;
    const cleanUrl = `${pathname}${hash}`;
    window.history.replaceState(window.history.state, "", cleanUrl);
  }, []);

  return null;
}
