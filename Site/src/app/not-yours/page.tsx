import { RedirectHome } from "@/components/RedirectHome";

export const metadata = {
  title: "Not yours",
  robots: { index: false, follow: false },
};

export default function NotYoursPage() {
  return (
    <article className="story-page wrap">
      <RedirectHome seconds={3} />
      <h1>Not yours.</h1>
      <p className="story">That plot isn’t on this account. Heading home.</p>
    </article>
  );
}
