"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { labStationPath } from "@/lib/lab-host";

type Door = {
  slug: string;
  name: string;
  localPort: number | null;
};

type Run = {
  slug: string;
  status?: string;
  occupancy?: number;
};

export function CampusDoors({ houses }: { houses: Door[] }) {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/lab/houses", { credentials: "include", cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (alive && Array.isArray(data?.houses)) setRuns(data.houses);
        })
        .catch(() => {});
    };
    load();
    const id = window.setInterval(load, 8000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="lab-doors">
      {houses.map((house) => {
        const href = labStationPath(house.slug);
        const campus = house.slug === "dln";
        const run = runs.find((r) => r.slug === house.slug);
        const n = campus ? 1 : run?.occupancy || 0;
        const up = run?.status === "ready";
        const label = campus ? "Campus building site" : house.name;
        const meta = campus
          ? "Always on. Notes for Design Lab North."
          : !house.localPort
            ? "Folder on this PC"
            : n
              ? up
                ? "In use — app up"
                : "In use — starting"
              : up
                ? "Empty — will sleep"
                : "Asleep until someone walks in";
        return (
          <Link key={house.slug} className="lab-door-btn chamfer" href={href}>
            <span className="lab-door-name">{label}</span>
            <span className="lab-door-meta">{meta}</span>
          </Link>
        );
      })}
    </div>
  );
}
