import Link from "next/link";
import { allLabHouses } from "@/lib/lab";
import { requireLabStudioPage } from "@/lib/lab-guard";
import { primeAllHouseInboxes } from "@/lib/lab-inbox";
import { OpenStation } from "@/components/OpenStation";
import { CampusDoors } from "@/components/CampusDoors";

export const metadata = { title: "Lab" };
export const dynamic = "force-dynamic";

export default async function LabDoorPage() {
  await requireLabStudioPage("/lab");
  await primeAllHouseInboxes();
  const houses = await allLabHouses();

  return (
    <article className="lab-door wrap">
      <p className="kicker">Design Lab North</p>
      <h1>Campus</h1>
      <p className="lede">
        This is the campus building. Each other door is its own unit — own
        folder, own builder, own app. A unit only runs while someone is in it.
        When the last person leaves, it sleeps. Notes still land in that unit
        at once.
      </p>
      <CampusDoors
        houses={houses.map((h) => ({
          slug: h.slug,
          name: h.name,
          localPort: h.localPort,
        }))}
      />
      <p className="body lab-door-walk">
        Walk the public Design Lab North pages with a note well at the foot —
        that queue is this campus. Other units have their own builder.
      </p>
      <p className="actions">
        <Link href="/">The public site</Link>
        <Link href="/account">Desk</Link>
      </p>
      <OpenStation />
    </article>
  );
}
