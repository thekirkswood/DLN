import Link from "next/link";
import { GroundSwitch } from "@/components/GroundSwitch";
import { Mark } from "@/components/Mark";

export function Header() {
  return (
    <header className="site-header wrap">
      <Link className="brand-link" href="/" aria-label="Design Lab North home">
        <Mark size="nav" />
      </Link>
      <nav>
        <Link href="/">Home</Link>
        <GroundSwitch />
      </nav>
    </header>
  );
}
