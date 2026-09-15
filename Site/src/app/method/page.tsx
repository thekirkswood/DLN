import { CampusPipeline, QualityFilter } from "@/components/MethodGraphics";
import { CampusEngine } from "@/components/CampusEngine";
import { ProjectFlows } from "@/components/ProjectFlows";
import { RuunPapers } from "@/components/RuunPapers";

export const metadata = { title: "Methodology" };

export default function MethodPage() {
  return (
    <>
      <RuunPapers />
      <article className="method wrap method-after-papers">
      <p className="kicker">Methodology</p>
      <h1>How we work</h1>
      <p className="lede">
        The work has to last. Ugly and wasteful are out. You always know where
        you are in the eight stages. Awards and clicks are not the score.
      </p>

      <h2 className="method-block">The quality filter</h2>
      <p>
        Every job is checked: is it clean, will it last, does it waste less,
        does it respect the natural world. Ugly and wasteful are out.
      </p>
      <QualityFilter />

      <h2 className="method-block">The eight stages</h2>
      <p>
        The eight stages stay the same. What we make at the end changes with
        the job.
      </p>
      <CampusEngine />
      <CampusPipeline />
      <ProjectFlows />
    </article>
    </>
  );
}
