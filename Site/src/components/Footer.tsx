"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GroundSwitch } from "@/components/GroundSwitch";

export function Footer() {
  const path = usePathname() || "";
  if (path.startsWith("/suggest")) return null;
  if (/^\/lab\/[^/]+/.test(path) && !path.includes("/admin")) return null;
  return (
    <footer className="site-footer wrap">
      <span>Design Lab North</span>
      <div className="footer-end">
        <nav>
          <a href="mailto:build@designlabnorth.com">build@designlabnorth.com</a>
          <Link href="/practice">Practice</Link>
          <Link href="/method">Method</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <GroundSwitch />
      </div>
    </footer>
  );
}
