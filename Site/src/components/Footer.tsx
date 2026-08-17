import Link from "next/link";
import { GroundSwitch } from "@/components/GroundSwitch";

export function Footer() {
  return (
    <footer className="site-footer wrap">
      <span>Design Lab North</span>
      <nav>
        <a href="mailto:build@designlabnorth.com">build@designlabnorth.com</a>
        <Link href="/practice">Practice</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <GroundSwitch />
      </nav>
    </footer>
  );
}
