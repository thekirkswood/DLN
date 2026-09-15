"use client";

import { useEffect, useState } from "react";
import { HOUSE_LIVE, LAN_HOUSES, LAN_IP, namedOrigin, pressKitId, isDlnLocalHost } from "@/lib/lan-names";
import { epkHref } from "@/lib/epk-map";

function carry(href: string, hereOrigin: string): string {
  try {
    const dest = new URL(href, hereOrigin || "http://dln.local");
    if (hereOrigin && dest.origin === hereOrigin) {
      return `${dest.pathname}${dest.search}${dest.hash}` || "/";
    }
    return `/api/auth/lan-enter?next=${encodeURIComponent(dest.toString())}`;
  } catch {
    return href;
  }
}

export function HousesDesk() {
  const [host, setHost] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setHost(window.location.hostname);
    setOrigin(window.location.origin);
  }, []);

  const hub = origin || "http://dln.local";

  return (
    <div className="houses-desk">
      <table className="houses-sheet">
        <thead>
          <tr>
            <th>House</th>
            <th>View site</th>
            <th>Live</th>
            <th>View EPK</th>
          </tr>
        </thead>
        <tbody>
          {LAN_HOUSES.map((row) => {
            const named = namedOrigin(row.id) || `http://${LAN_IP}:${row.port}`;
            const local =
              host && !isDlnLocalHost(host) ? `http://${LAN_IP}:${row.port}` : named;
            const live = HOUSE_LIVE[row.id];
            const press = pressKitId(row.id);
            return (
              <tr key={row.id}>
                <td>
                  <strong>{row.name}</strong>
                  <span className="status">:{row.port}</span>
                </td>
                <td>
                  <a href={carry(local, hub)} target="_blank" rel="noreferrer">
                    View site
                  </a>
                  <span className="status">{row.host}</span>
                </td>
                <td>
                  {live ? (
                    <>
                      <a href={live} target="_blank" rel="noreferrer">
                        Open live
                      </a>
                      <span className="status">{live.replace(/^https?:\/\//, "")}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {press ? (
                    <>
                      <a href={epkHref(press)}>View EPK</a>
                      <span className="status houses-press-live">
                        <a
                          href={carry(`https://designlabnorth.com${epkHref(press)}`, hub)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Live kit
                        </a>
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
