import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveHouse } from "@/lib/lab";
import { requireLabStudioPage } from "@/lib/lab-guard";
import { LabDesk } from "@/components/LabDesk";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const house = await resolveHouse(params.slug);
  return { title: house ? `${house.name} builder` : "Builder" };
}

export default async function LabHouseAdminPage({
  params,
}: {
  params: { slug: string };
}) {
  await requireLabStudioPage(`/lab/${params.slug}/admin`);
  const house = await resolveHouse(params.slug);
  if (!house) notFound();

  return (
    <>
      <LabDesk plot={house.slug} houseName={house.name} />
      <p className="wrap lab-back">
        <Link href={house.slug === "dln" ? "/lab" : `/lab/${house.slug}`}>
          Back to the unit
        </Link>
      </p>
    </>
  );
}
