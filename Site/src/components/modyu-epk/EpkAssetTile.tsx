import Link from "next/link";
import { modyuAsset } from "@/lib/modyu-epk/asset-origin";
import type { EpkAsset } from "@/lib/modyu-epk/assets";
import { formatGbp } from "@/lib/modyu-epk/assets";

export function EpkAssetTile({
  asset,
  showRrp = false,
}: {
  asset: EpkAsset;
  showRrp?: boolean;
}) {
  const href = modyuAsset(asset.src);
  const filename =
    asset.src.split("/").pop() || `${asset.id}.png`;
  return (
    <figure id={asset.id} className="epk-asset-tile">
      <a
        className="epk-asset-tile__media"
        href={href}
        target="_blank"
        rel="noreferrer"
        download={filename}
        title="Open or drag to save"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={href} alt={asset.alt} draggable />
      </a>
      <figcaption>
        <strong>{asset.label}</strong>
        {asset.note ? <span className="epk-note">{asset.note}</span> : null}
        {showRrp && asset.rrp != null ? (
          <span className="epk-asset-tile__rrp">{formatGbp(asset.rrp)}</span>
        ) : null}
        <span className="epk-asset-tile__actions">
          <a href={href} download={filename}>
            Save
          </a>
          <a href={href} target="_blank" rel="noreferrer">
            Open
          </a>
          {asset.systemHref ? (
            <Link href={asset.systemHref}>RRP on system</Link>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
