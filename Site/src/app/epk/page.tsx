import { EpkChooser } from "@/components/EpkChooser";
import { EpkGate } from "@/components/EpkGate";
import { getEpkKit, kitsForUser, epkHref } from "@/lib/epk";
import { kitCopy } from "@/lib/epk-copy";
import { getSessionUser } from "@/lib/session";
import { isStudio } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Press kit" };
export const dynamic = "force-dynamic";

export default async function EpkPage() {
  const user = await getSessionUser();
  const studio = Boolean(user && isStudio(user));
  if (!user) {
    const kit = await getEpkKit();
    if (kit) redirect(epkHref(kit));
    return <EpkGate />;
  }
  const ids = kitsForUser(user);
  const kits = ids.map((id) => {
    const copy = kitCopy(id);
    return { id, name: copy.name, kicker: copy.kicker, lede: copy.lede };
  });
  return <EpkChooser kits={kits} title={studio ? "Press kits" : kits.length > 1 ? "Your press kits" : "Press kit"} />;
}
