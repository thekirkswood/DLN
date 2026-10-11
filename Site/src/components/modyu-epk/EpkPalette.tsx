import Link from "next/link";
import { modyuAsset } from "@/lib/modyu-epk/asset-origin";

export type EpkPaletteLink = {
  href: string;
  label: string;
};

export type EpkPaletteTile = {
  id: string;
  src: string;
  alt: string;
  /** Caption on the picture (bottom-left). */
  label?: string;
  /** Whole tile navigates here when there are no overlay links. */
  href?: string;
  /** Stacked text links on the picture (founder / HT4 menu style). */
  links?: EpkPaletteLink[];
  /** Span two columns on the top row. */
  featured?: boolean;
};

/** Brief-style clickable picture palette for the EPK hub. */
export function EpkPalette({ tiles }: { tiles: EpkPaletteTile[] }) {
  return (
    <section className="epk-palette" aria-label="Press kit pictures">
      {tiles.map((tile) => {
        const media = (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="epk-palette__img"
              src={modyuAsset(tile.src)}
              alt={tile.alt}
            />
            <span className="epk-palette__veil" aria-hidden />
            {tile.links?.length ? (
              <nav className="epk-palette__links" aria-label={tile.label || tile.alt}>
                {tile.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            ) : tile.label ? (
              <span className="epk-palette__caption">{tile.label}</span>
            ) : null}
          </>
        );

        const className = `epk-palette__tile${tile.featured ? " is-featured" : ""}`;

        if (tile.links?.length) {
          return (
            <div key={tile.id} className={className}>
              {media}
            </div>
          );
        }

        if (tile.href) {
          return (
            <Link key={tile.id} href={tile.href} className={className}>
              {media}
            </Link>
          );
        }

        return (
          <div key={tile.id} className={className}>
            {media}
          </div>
        );
      })}
    </section>
  );
}
