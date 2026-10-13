"use client";

import type { PublicUser } from "@/lib/auth";
import type { TokenLedger } from "@/lib/tokens";

export function TokensDesk({
  people,
  ledgers,
  pingCost,
  genCost,
  textCost,
}: {
  people: PublicUser[];
  ledgers: TokenLedger[];
  pingCost: number;
  genCost: number;
  textCost: number;
}) {
  const named = ledgers.map((row) => {
    const person = people.find((p) => p.id === row.userId);
    return {
      row,
      name: person?.displayName || person?.email || row.userId,
      email: person?.email || "",
    };
  });
  named.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="tokens-desk">
      <h2>Tokens</h2>
      <p className="body bill-note">
        One wallet per account. Instant update costs {pingCost}, a picture costs{" "}
        {genCost}, a text document costs {textCost}. Monthly renewal tops the
        wallet up from their stack.
      </p>
      {named.length ? (
        <ul className="note-list">
          {named.map(({ row, name, email }) => (
            <li key={row.id}>
              <span className="status">
                {name}
                {email ? ` · ${email}` : ""}
              </span>
              <p>
                {row.balance} tokens
                {row.grantedThisPeriod
                  ? ` · ${row.grantedThisPeriod} granted this month`
                  : ""}
                {row.plotSlug ? ` · last used on ${row.plotSlug}` : ""}.
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="body">No wallets yet. They open when a monthly roll is live.</p>
      )}
    </section>
  );
}