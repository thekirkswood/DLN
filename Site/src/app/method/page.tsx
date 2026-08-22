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
        Design Lab North are an independent design and build institute, based
        on a campus in the Anglo-Scottish borders. We architect identities,
        sites, and commerce channels that have to last — for leaders who want
        velocity, certainty, and proof. Awards and clicks are not the score.
        Permanent, systemic adoption is.
      </p>

      <h2 className="method-block">The quality filter</h2>
      <p>
        Every project runs through four dimensions of value: clean, enduring,
        resource-efficient, and respectful of the natural world. We reject the
        ugly, the wasteful, and the grab for attention. Bad design is bad
        business.
      </p>
      <QualityFilter />

      <h2 className="method-block">The campus pipeline</h2>
      <p>
        While our uniform 8-stage framework never changes, the practical
        pipeline path and final physical or digital outputs adjust dynamically
        to meet the specific requirements of each creative and technical
        discipline:
      </p>
      <CampusEngine />
      <CampusPipeline />
      <ProjectFlows />
    </article>
    </>
  );
}
