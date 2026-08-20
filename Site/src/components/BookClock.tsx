"use client";

import { useEffect, useState } from "react";
import { londonNowLabel } from "@/lib/clock";

export function BookClock() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const tick = () => setLabel(londonNowLabel());
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  return <p className="book-clock">{label || "Europe/London"}</p>;
}
