import { CLIENTS } from "@/data/practice";

export const metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <article className="practice wrap">
      <p className="kicker">Practice</p>
      <h1>High-Value Brand Ecosystems</h1>
      <p className="practice-sub">Plan, Design, Build, Maintain.</p>
      <p className="lede">
        DLN creates Identities, marketing strategies, brand redesigns and
        facelifts, websites and design for print.
      </p>

      <h2 className="practice-head">Our Practice</h2>
      <p className="body">
        We are a small, fiercely independent creative and technical practice
        operating from an old border farm situated between England and Scotland
        in the true Border Riever; Debateable Lands. We don’t work from a sleek
        city agency, and we don’t subscribe to fashionable group-think. Instead,
        we live mostly off-grid, maintain our own land, and build world-class
        digital infrastructure for both local and global businesses from the
        ground up.
      </p>

      <h2 className="practice-head">The Landscape &amp; The Graft</h2>
      <p className="body">
        Our studio is surrounded by a working agricultural community. This
        environment dictates how we think and act. We live mostly off the grid,
        which means we design, manage, and maintain our own power and living
        systems. When you are largely responsible for your own energy and
        infrastructure, you develop a deep, uncompromising respect for logic,
        efficiency, and system architecture. We bring that exact same
        accountability to the global websites we build and host.
      </p>
      <p className="body">
        We believe in being active participants in our community, not
        observers. Every season, we roll up our sleeves to help our neighbours
        with lambing and land maintenance. Ewan combines his digital expertise
        with life as a farm worker, climber, and cook. This dual reality keeps
        our feet firmly on the ground. We don’t hide behind agency buzzwords or
        over-complicate strategy. We treat business challenges the same way we
        treat a broken fence or a long night in the lambing shed: you diagnose
        the problem, you prepare the right tools, and you get on with the job.
      </p>
      <p className="body">
        Right now, we are in the middle of renovating our old farm barn into a
        dedicated creative retreat—a space designed for deep focus, clear
        thinking, and strategic collaboration, watched over by our studio
        Labrador, <strong>Storm</strong>.
      </p>

      <h2 className="practice-head">Tested Resilience</h2>
      <p className="body">
        Our practice isn’t just shaped by the land; it has been tested by
        real-life adversity. A catastrophic accident nearly resulted in the
        loss of sight in a right eye. What followed was a gruelling series of
        major operations, a long recovery, and a choice.
      </p>
      <p className="body">
        Design Lab North’s rebirth is the definitive product of that fight
        back.
      </p>
      <p className="body">
        When we tell our clients, particularly fast-moving, high-stakes US
        businesses, that we are resilient, it isn’t a marketing tagline. We
        have stared down a life-altering crisis and built our way out of it.
        That unbreakable fighting spirit is exactly what we bring to defending,
        scaling, and securing your brand’s digital presence. When deadlines are
        tight and deployments are complex, we do not fold.
      </p>

      <h2 className="practice-head">Wired to the World</h2>
      <p className="body">
        There is a powerful contrast at the heart of our practice. While our
        daily lives are rooted in the soil, our work operates at the absolute
        forefront of global brand identity system expertise. As evidenced by
        four years working at the forefront of digital adoption.
      </p>
      <p className="body">
        We are award-winning designers and marketeers who lead high-stakes
        digital transformations, primarily for US organisations. Our clients
        choose us because our small size makes us agile, our academic rigour
        keeps us leading-edge, and our Northern remote-community attitude makes
        us exceptionally reliable. They get world-class design for print,
        packaging, and screen, married to an ironclad technical
        infrastructure—delivered with absolute transparency and zero fluff.
      </p>

      <section className="practice-person">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="practice-portrait"
          src="/practice/dave-kirkwood.png"
          alt="Dave Kirkwood"
        />
        <h2>Dave Kirkwood</h2>
        <p className="practice-role">
          Co-Founder | Award-Winning Designer &amp; Marketeer
        </p>
        <p className="practice-aside">
          Woodsman, dog trainer and conservationist
        </p>
        <p className="body">
          Dave’s career began in London, cutting his teeth at elite design
          institutions Peter Leonard Associates and Cartlidge Levene. Moving to
          Manchester, he founded his own successful practice before dedicating
          time to passing on the craft. As a qualified educator, he taught
          graphic design and built an industry-recognized type design and brand
          identity curriculum from the ground up.
        </p>
        <p className="body">
          His deep commercial acuity was solidified as a Partner at a prominent
          Manchester marketing agency, where he specialised in designing and
          scaling new businesses, including the rapid acceleration of major
          digital platforms like LateRooms.
        </p>
        <p className="body">
          Driven by a desire to return home, Dave brought his practice back
          North to the Anglo-Scottish border. Over his career, his work has
          secured prestigious design and marketing awards, earned industry
          publication, and seen him commissioned by bodies like Lancashire
          County Council to provide strategic brand and marketing expertise to
          fast-growth startups. A respected voice in design philosophy, Dave
          has lectured extensively, hosted major creative events, and spoken
          at numerous international symposiums.
        </p>
        <p className="body">
          Today, Dave channels this lifetime of high-stakes strategy, academic
          rigour, and award-winning design experience into leading cutting-edge
          digital adoption for global and US clients, directly from his
          off-grid border studio.
        </p>
      </section>

      <section className="practice-person">
        <h2>Ewan Kirkwood</h2>
        <p className="practice-role">
          Co-Founder | Lead Developer &amp; Technical Architect
        </p>
        <p className="practice-aside">
          Outdoorsman still helping with lambing once a year
        </p>
        <p className="body">
          Ewan is a driven, self-taught technical expert whose capability is
          rooted in real-world problem solving. He built his reputation from
          the ground up, engineering robust online presences and high-performance
          e-commerce engines for independent businesses and regional
          organisations. Known for his meticulous attention to detail, Ewan
          specialises in building intuitive, frictionless user interfaces
          (UI/UX) backed by exceptionally secure, high-utility backend
          dashboards.
        </p>
        <p className="body">
          Bringing this deep, practical development expertise into the family
          practice, Ewan transformed Design Lab North’s technical capabilities.
          He translates complex brand and business goals into flawless, reliable
          digital execution, ensuring every website and online store is
          engineered for absolute resilience.
        </p>
      </section>

      <h2 className="practice-head">Selected Experience</h2>
      <p className="body">
        We maintain deep, long-term relationships with organisations that value
        straight talking and technical precision. Our practice spans global
        enterprises in the world of fast-scaling US tech firms (largely under
        NDA), and boundary-pushing, local and national, independent brands.
      </p>
      <ul className="client-index">
        {CLIENTS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <h2>The work</h2>
      <p className="body">
        For the last ten years that work has sat directly with businesses,
        organisations, and multi-nationals — and with their agencies, under NDA
        — on brand strategy and how the brand behaves online. Further detail
        can be given under NDA.
      </p>
    </article>
  );
}
