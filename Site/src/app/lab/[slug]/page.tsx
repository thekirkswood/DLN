import { notFound, redirect } from "next/navigation";
import { proxyPath, resolveHouse, startHint } from "@/lib/lab";
import { requireLabStudioPage } from "@/lib/lab-guard";
import { LabStation } from "@/components/LabStation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const house = await resolveHouse(params.slug);
  return { title: house?.name || "Station" };
}

export default async function LabStationPage({
  params,
}: {
  params: { slug: string };
}) {
  await requireLabStudioPage(`/lab/${params.slug}`);
  if (params.slug === "dln") redirect("/admin");
  const house = await resolveHouse(params.slug);
  if (!house) notFound();

  return (
    <LabStation
      slug={house.slug}
      name={house.name}
      src={proxyPath(house.slug)}
      hint={startHint(house)}
      port={house.localPort}
    />
  );
}
