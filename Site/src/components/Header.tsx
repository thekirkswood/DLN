"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GroundSwitch } from "@/components/GroundSwitch";
import { Mark } from "@/components/Mark";

export function Header() {
  const path = usePathname();
  const atHome = path === "/";
  return (
    <header className="site-header wrap">
      <Link className="brand-link" href="/" aria-label="Design Lab North home">
        <Mark size="nav" />
      </Link>
      <nav>
        {atHome ? null : <Link href="/">Home</Link>}
        <GroundSwitch />
      </nav>
    </header>
  );
}
