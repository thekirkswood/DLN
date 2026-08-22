"use client";

import { useEffect, useRef, useState } from "react";

const WASH = [
  "#db328a",
  "#f26822",
  "#fed402",
  "#d3de29",
  "#00aeef",
  "#662d91",
] as const;
const DWELL = 3000;

export function HomeHero() {
  const [wash, setWash] = useState<(typeof WASH)[number]>(WASH[0]);
  const [go, setGo] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setGo(true);
  }, []);

  useEffect(() => {
    if (!go) return;
    let i = 0;
    const t = window.setInterval(() => {
      i = (i + 1) % WASH.length;
      setWash(WASH[i]);
    }, DWELL);
    return () => window.clearInterval(t);
  }, [go]);

  return (
    <div className="home-hero-loop" style={{ background: wash }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/home/dln-home.gif?v=2"
        alt=""
        onLoad={() => setGo(true)}
      />
    </div>
  );
}
