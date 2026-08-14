import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer wrap">
      <span>Design Lab North</span>
      <nav>
        <Link href="/practice">Practice</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  );
}
