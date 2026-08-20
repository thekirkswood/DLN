import Link from "next/link";
import { allLabHouses } from "@/lib/lab";
import { requireLabStudioPage } from "@/lib/lab-guard";
import { OpenStation } from "@/components/OpenStation";
import { CampusDoors } from "@/components/CampusDoors";
import { StudioDesk } from "@/components/StudioDesk";
import { allPlots } from "@/lib/plots";
import { listClients } from "@/lib/auth";
import {
  invoicesVisibleTo,
  rollDueInvoices,
  liveCatalogue,
  getPayRail,
  paymentByInvoice,
  listRolls,
  getOnlineRail,
} from "@/lib/billing";
import { listEnquiries } from "@/lib/enquiries";
import { commentsFor, plansFor } from "@/lib/plans";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Lab" };
export const dynamic = "force-dynamic";

export default async function LabDoorPage() {
  const user = await requireLabStudioPage("/lab");
  await rollDueInvoices();
  const houses = await allLabHouses();
  const plots = await allPlots();
  const people = await listClients();
  const enquiries = await listEnquiries();
  const invoices = await invoicesVisibleTo(user);
  const comments = await commentsFor(user);
  const plans = await plansFor(user);
  const catalogue = await liveCatalogue();
  const rail = await getPayRail();
  const claims = await paymentByInvoice();
  const rolls = await listRolls();
  const online = await getOnlineRail();
  const settings = await getSettings();

  return (
    <article className="lab-door wrap">
      <p className="kicker">Design Lab North</p>
      <h1>Campus</h1>
      <p className="lede">
        This is the campus building. Each other door is its own unit. Own
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
      <section className="campus-book">
        <h2>Accounts</h2>
        <p className="body bill-note">
          Who we serve, what we charge, the diaries. Your own login is Account.
        </p>
        <StudioDesk
          people={people}
          plots={plots}
          enquiries={enquiries}
          invoices={invoices}
          comments={comments}
          plans={plans}
          lab
          catalogue={catalogue}
          rail={rail}
          claims={claims}
          rolls={rolls}
          online={online}
          settings={settings}
        />
      </section>
      <p className="body lab-door-walk">
        Walk the public Design Lab North pages with a note well at the foot.
        That queue is this campus. Other units have their own builder.
      </p>
      <p className="actions">
        <Link href="/">The public site</Link>
        <Link href="/account">Account</Link>
      </p>
      <OpenStation />
    </article>
  );
}
