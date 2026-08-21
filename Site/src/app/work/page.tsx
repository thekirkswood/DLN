export const metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <article className="work-page">
      <h1 className="visually-hidden">Work</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/work/dln-work.gif"
        alt="Design Lab North work"
      />
    </article>
  );
}
