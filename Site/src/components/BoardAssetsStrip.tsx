"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isImageHref, isShared, type ShareFlags } from "@/lib/assets-view";
import { boardEnterHref } from "@/lib/board-enter";
import { pressKitForPlot } from "@/lib/epk-map";

type Row = {
  id: string;
  href: string;
  title: string;
  kind: string;
  flags: ShareFlags;
  kit?: string;
};

export function BoardAssetsStrip({ plot }: { plot?: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const kit = plot ? pressKitForPlot(plot) : null;
    if (!kit) {
      setRows([]);
      setReady(true);
      return;
    }
    let live = true;
    fetch(`/api/assets?kit=${encodeURIComponent(kit)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: Row[] } | null) => {
        if (!live) return;
        const items = (data?.items || [])
          .filter((item) => item.kind === "image" && isImageHref(item.href) && isShared(item))
          .slice(0, 8);
        setRows(items);
        setReady(true);
      })
      .catch(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, [plot]);

  return (
    <aside className="board-asset-strip" aria-label="Assets on this plot">
      <p className="board-zone-kicker">Assets</p>
      {!ready ? null : rows.length ? (
        <ul>
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={boardEnterHref("plot", plot)} title={row.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.href} alt="" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="board-asset-empty">
          {plot
            ? "Stills ticked for this plot in Assets sit here. Nothing is generated."
            : "A plot on the book can show its stills here."}
        </p>
      )}
    </aside>
  );
}
