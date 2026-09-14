import type { Blueprint, BlueprintNode } from "@/lib/clock-types";

function sitClass(sitting: boolean | null): string {
  if (sitting === true) return "is-ok";
  if (sitting === false) return "is-miss";
  return "is-idle";
}

function sitWord(sitting: boolean | null): string {
  if (sitting === true) return "Sitting";
  if (sitting === false) return "Silent";
  return "Unprobed";
}

function nameOf(nodes: BlueprintNode[], id: string): string {
  return nodes.find((n) => n.id === id)?.name || id;
}

export function ClockBlueprint({ blueprint }: { blueprint: Blueprint }) {
  const here =
    blueprint.viewer === "lan"
      ? "Debian LAN"
      : blueprint.viewer === "local"
        ? "this PC"
        : "the live host";
  const ports = blueprint.nodes.filter((n) => n.port != null);
  const sittingHere = (n: BlueprintNode) =>
    blueprint.viewer === "lan" ? n.sittingLan : blueprint.viewer === "local" ? n.sittingLocal : null;

  return (
    <div className="clock-blueprint">
      <p className="lede">
        Lined up: every port we host, the live URL, the lab desk, and how they join.
        You are on <strong>{here}</strong>. Dave bookmarks <code>dln.local</code> names.
        Backup is {blueprint.lanHost} with a port. This PC’s <code>localhost</code> is
        Ewan’s tower and is not on the LAN.
      </p>

      <div className="clock-hosts">
        <article className={`clock-host ${blueprint.viewer === "local" ? "is-here" : ""}`}>
          <p className="kicker">This PC</p>
          <h3>localhost</h3>
          <p>Ewan’s Cursor. Design Lab North :3010. Units sit only while occupied.</p>
        </article>
        <article className={`clock-host ${blueprint.viewer === "lan" ? "is-here" : ""}`}>
          <p className="kicker">Debian</p>
          <h3>dln.local</h3>
          <p>Always-on host. Caddy :80. Backup {blueprint.lanHost}. Units stay up.</p>
        </article>
        <article className={`clock-host ${blueprint.viewer === "live" ? "is-here" : ""}`}>
          <p className="kicker">Internet</p>
          <h3>Live URLs</h3>
          <p>IONOS. Pulse authority. Clock faces on owned domains. No auto-deploy.</p>
        </article>
      </div>

      <ol className="clock-port-line" aria-label="Local ports">
        {ports.map((n) => (
          <li key={n.id} className={`clock-port chamfer ${sitClass(sittingHere(n))}`}>
            <a
              href={
                blueprint.viewer === "lan"
                  ? n.named || n.lan || n.localhost || "#"
                  : n.localhost || n.named || n.lan || "#"
              }
              target="_blank"
              rel="noreferrer"
            >
              <span className="kicker">{n.party}</span>
              <strong>:{n.port}</strong>
              <span>{n.name}</span>
              <span className="clock-port-sit">{sitWord(sittingHere(n))}</span>
            </a>
          </li>
        ))}
      </ol>

      <div className="clock-sheet-wrap">
        <table className="clock-sheet">
          <thead>
            <tr>
              <th>Port</th>
              <th>House</th>
              <th>This PC</th>
              <th>LAN</th>
              <th>Live</th>
              <th>Clock</th>
              <th>Lab desk</th>
            </tr>
          </thead>
          <tbody>
            {blueprint.nodes.map((n) => (
              <tr key={n.id}>
                <td>{n.port != null ? `:${n.port}` : "—"}</td>
                <td>
                  <strong>{n.name}</strong>
                  {n.disk ? <p className="status">{n.disk}</p> : null}
                  {n.github ? <p className="status">{n.github}</p> : null}
                  <p className="status">{n.note}</p>
                </td>
                <td>
                  {n.localhost ? (
                    <a href={n.localhost} target="_blank" rel="noreferrer">
                      {n.localhost.replace("http://", "")}
                    </a>
                  ) : (
                    "—"
                  )}
                  <span className="status">{sitWord(n.sittingLocal)}</span>
                </td>
                <td>
                  {n.named || n.lan ? (
                    <a href={n.named || n.lan || "#"} target="_blank" rel="noreferrer">
                      {(n.named || n.lan || "").replace("http://", "")}
                    </a>
                  ) : (
                    "—"
                  )}
                  {n.named && n.lan ? (
                    <span className="status">
                      backup{" "}
                      <a href={n.lan} target="_blank" rel="noreferrer">
                        {n.lan.replace("http://", "")}
                      </a>
                    </span>
                  ) : null}
                  <span className="status">{sitWord(n.sittingLan)}</span>
                </td>
                <td>
                  {n.liveUrl ? (
                    <a href={n.liveUrl} target="_blank" rel="noreferrer">
                      {n.liveUrl.replace("https://", "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {n.liveClock || n.labClock ? (
                    <a
                      href={
                        blueprint.viewer === "lan"
                          ? n.namedClock || n.lanClock || n.liveClock || n.labClock || "#"
                          : n.labClock || n.liveClock || "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Clock
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {n.namedDesk || n.labDesk ? (
                    <>
                      {n.namedDesk ? (
                        <a href={n.namedDesk} target="_blank" rel="noreferrer">
                          builder.dln.local
                        </a>
                      ) : (
                        <a href={n.labDesk || "#"} target="_blank" rel="noreferrer">
                          :3100
                        </a>
                      )}
                      {n.lanDesk ? (
                        <>
                          {" · "}
                          <a href={n.lanDesk} target="_blank" rel="noreferrer">
                            backup
                          </a>
                        </>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="clock-blueprint-head">How they join</h3>
      <ul className="clock-joins">
        {blueprint.links.map((link) => (
          <li key={link.id}>
            <p className="kicker">
              {nameOf(blueprint.nodes, link.from)} → {nameOf(blueprint.nodes, link.to)} · {link.via}
            </p>
            <p>{link.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClockPortRuler({ blueprint }: { blueprint: Blueprint }) {
  const sittingHere = (n: BlueprintNode) =>
    blueprint.viewer === "lan" ? n.sittingLan : blueprint.viewer === "local" ? n.sittingLocal : null;
  const ports = blueprint.nodes.filter((n) => n.port != null);
  return (
    <ol className="clock-port-line clock-port-line-tight" aria-label="Hosted ports">
      {ports.map((n) => (
        <li key={n.id} className={`clock-port chamfer ${sitClass(sittingHere(n))}`}>
          <a
            href={
              blueprint.viewer === "lan"
                ? n.named || n.lan || n.localhost || "#"
                : n.localhost || n.named || n.lan || "#"
            }
            target="_blank"
            rel="noreferrer"
          >
            <strong>:{n.port}</strong>
            <span>{n.name}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}
