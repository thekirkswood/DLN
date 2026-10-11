"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { epkNav } from "@/lib/modyu-epk/content";
import { modyuAsset } from "@/lib/modyu-epk/asset-origin";

export function EpkNav() {
  const pathname = usePathname();

  return (
    <aside className="epk-nav" aria-label="Press kit">
      <Link href="/epk/modyu" className="epk-nav__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={modyuAsset("/assets/brand/logo-3.svg")} alt="ModYu" />
        <span>
          HT4
          <small>Electronic Press Kit</small>
        </span>
      </Link>

      {epkNav.map((group) => (
        <div key={group.id} className="epk-nav__group">
          <p className="epk-nav__group-title">{group.title}</p>
          <p className="epk-nav__group-blurb">{group.blurb}</p>
          <ul>
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <p className="epk-nav__host">
        Hosted by Design Lab North
        <br />
        <a href="mailto:design@designlabnorth.com">design@designlabnorth.com</a>
      </p>
    </aside>
  );
}
