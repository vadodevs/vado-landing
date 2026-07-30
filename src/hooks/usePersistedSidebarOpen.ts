"use client";

import { useCallback, useLayoutEffect, useState } from "react";

/** Panel lateral colapsable; persiste en sessionStorage por clave. */
export function usePersistedSidebarOpen(storageKey: string, defaultOpen = true) {
  const [open, setOpen] = useState(defaultOpen);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw === "0") setOpen(false);
      else if (raw === "1") setOpen(true);
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
  }, [storageKey]);

  const setOpenPersisted = useCallback(
    (value: boolean) => {
      setOpen(value);
      try {
        sessionStorage.setItem(storageKey, value ? "1" : "0");
      } catch {
        /* noop */
      }
    },
    [storageKey]
  );

  return { open, hydrated, toggle, setOpen: setOpenPersisted };
}
