import Link from "next/link";
import type { PublicUser } from "@/lib/auth";
import { GroundSwitch } from "@/components/GroundSwitch";
import { Mark } from "@/components/Mark";

export function Header({ user }: { user: PublicUser | null }) {
  return (
    <header className="site-header wrap">
      <Link className="brand-link" href="/" aria-label="Design Lab North home">
        <Mark size="nav" />
      </Link>
      <nav>
        <Link href="/practice">Practice</Link>
        <Link href="/greenhouse">Greenhouse</Link>
        {user ? <Link href="/logout">Sign out</Link> : <Link href="/login">Sign in</Link>}
        <GroundSwitch />
      </nav>
    </header>
  );
}
