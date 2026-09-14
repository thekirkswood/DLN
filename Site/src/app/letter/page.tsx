import { HomeIntro } from "@/components/HomeIntro";
import { HomeOffer } from "@/components/HomeOffer";

export const metadata = { title: "Letter" };

export default function LetterPage() {
  return (
    <>
      <HomeIntro />
      <HomeOffer />
    </>
  );
}
