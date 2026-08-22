"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GroundSwitch } from "@/components/GroundSwitch";

export function Footer() {
  const path = usePathname() || "";
  if (path.startsWith("/suggest")) return null;
  if (path === "/work") return null;
  if (/^\/lab\/[^/]+/.test(path) && !path.includes("/admin")) return null;
  return (
    <footer className="site-footer wrap">
      <div className="footer-who">
        <p>Design Lab North</p>
        <a href="mailto:build@designlabnorth.com">build@designlabnorth.com</a>
      </div>
      <div className="footer-ground">
        <GroundSwitch />
      </div>
      <nav className="footer-legal" aria-label="Legal">
        <Link href="/method">Methodology</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  );
}
