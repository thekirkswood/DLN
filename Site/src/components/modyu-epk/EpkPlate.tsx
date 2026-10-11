import Link from "next/link";
import { modyuAsset } from "@/lib/modyu-epk/asset-origin";

type Col = {
  kicker?: string;
  title: string;
  body?: string;
  href?: string;
};

/** DAA-style header panel: section background + nested columns. */
export function EpkPlate({
  src,
  alt = "",
  kicker,
  title,
  lede,
  columns,
  linked,
}: {
  src?: string;
  alt?: string;
  kicker?: string;
  title?: string;
  lede?: string;
  columns?: Col[];
  linked?: boolean;
}) {
  return (
    <section className={`epk-plate${linked ? " is-linked" : ""}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="epk-plate__img" src={modyuAsset(src)} alt={alt} />
      ) : (
        <div
          className="epk-plate__img epk-plate__img--tone"
          aria-hidden
        />
      )}
      <div className="epk-plate__veil" />
      <div className="epk-plate__copy">
        {columns && columns.length ? (
          <div className="epk-plate__cols">
            {columns.map((col) => {
              const inner = (
                <>
                  {col.kicker ? (
                    <p className="epk-plate__col-kicker">{col.kicker}</p>
                  ) : null}
                  <h3>{col.title}</h3>
                  {col.body ? <p>{col.body}</p> : null}
                </>
              );
              return col.href ? (
                <Link key={col.title} href={col.href} className="epk-plate__col">
                  {inner}
                </Link>
              ) : (
                <div key={col.title} className="epk-plate__col">
                  {inner}
                </div>
              );
            })}
          </div>
        ) : null}
        {(kicker || title || lede) && (
          <div className="epk-plate__read">
            {kicker ? (
              <p className="epk-kicker epk-kicker--on-dark">{kicker}</p>
            ) : null}
            {title ? <h1>{title}</h1> : null}
            {lede ? <p className="epk-plate__lede">{lede}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}
