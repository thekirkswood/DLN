import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { StudioApp } from "@/components/studio/StudioApp";

export const metadata = { title: "Studio" };

export default async function StudioPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/studio");
  return <StudioApp />;
}
