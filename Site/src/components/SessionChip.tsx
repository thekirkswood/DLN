"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isPlatePath } from "@/lib/plate";

export function SessionChip() {
  const path = usePathname() || "/";
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!isPlatePath(path)) {
      setOn(false);
      return;
    }
    try {
      setOn(Boolean(sessionStorage.getItem("dln-plate-chip")));
    } catch {
      setOn(false);
    }
    function sync() {
      try {
        setOn(Boolean(sessionStorage.getItem("dln-plate-chip")));
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("dln-plate-fold", sync);
    window.addEventListener("pointerdown", sync);
    return () => {
      window.removeEventListener("dln-plate-fold", sync);
      window.removeEventListener("pointerdown", sync);
    };
  }, [path]);

  if (!on) return null;
  return (
    <span className="session-chip" title="This plate remembers you" aria-hidden />
  );
}
