import Link from "next/link";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <article className="legal wrap">
      <p className="kicker">Terms</p>
      <h1>Terms</h1>
      <p className="status">19 August 2026</p>
      <p>
        These terms are for the public site, Sign in, and the live hosts Design
        Lab North run for you. A proper engagement letter still governs paid
        work. If that letter and this page disagree, the letter wins for that
        job.
      </p>

      <h2>Who</h2>
      <p>
        Design Lab North are Ewan Kirkwood and Dave Kirkwood. The public site is
        designlabnorth.com. Write to{" "}
        <a href="mailto:build@designlabnorth.com">build@designlabnorth.com</a>.
        Company details will sit here once they are filed.
      </p>

      <h2>The public site</h2>
      <p>
        The greenhouse is our products. Client sites live on the account, not
        on that wall. Copy on this hub is ours. Do not scrape it for a model or
        a catalogue without asking.
      </p>

      <h2>Accounts</h2>
      <p>
        An account is for the person we named. Keep the login to yourself. Tell
        us if you think it has been used by someone else. We can close a login
        that is being abused.
      </p>
      <p>
        Sign in uses a session cookie. Logout ends it on this browser.
      </p>

      <h2>Live hosts</h2>
      <p>
        A growing copy on our host is a working site, not always the finished
        public one, unless we say so in writing. Access is for the client we
        named. Isolation (one plot, one container) is how we stop one problem
        becoming everyone’s problem.
      </p>
      <p>
        You leave notes. We read them, turn them into one plan, and come back
        with an update — including what changed. We do not push every save
        live. A bigger update goes up when it is ready.
      </p>
      <p>
        After the first stretch a client plot can move onto your own server and
        URL. We keep coming in from our desk. You keep the site files you paid
        for.
      </p>

      <h2>Invoices</h2>
      <p>
        Work is invoiced on this book. The invoice is the document: who it is
        for, the lines, the amount, and how to pay. Pay by bank transfer using
        the invoice number as the reference. Mark it sent when you have; we
        record it paid when the money lands.
      </p>
      <p>
        An invoice that stays unpaid for seven days after it is due can shut
        the bound live host for the client. Studio can still walk in. Paying
        opens it again.
      </p>

      <h2>Your content</h2>
      <p>
        You keep what you bring — words, pictures, brand files. We keep our
        tools, our way of working, and the studio itself. You licence us to use
        your materials to do the job. We will not sell them on.
      </p>

      <h2>Availability</h2>
      <p>
        We take care. A live host is not a 99.99% promise. We will say if a
        host is down for longer than a short blip.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not use a host we run to break the law, to harm someone, or to push
        load that is not the site. We can shut a host that is being used that
        way, and we will tell you.
      </p>

      <h2>Liability</h2>
      <p>
        We are careful. We are not liable for loss that was not a reasonably
        foreseeable result of us breaking these terms, or for something outside
        our control. Nothing here limits liability for death, personal injury,
        or fraud, or anything else the law will not let us limit.
      </p>

      <h2>Law</h2>
      <p>
        English law. The courts of England and Wales. If you are a consumer and
        live elsewhere in the UK, you may also use the courts of your home
        nation.
      </p>

      <h2>Changes</h2>
      <p>
        If these terms change in a way that matters, the date at the top moves.
        For a live job, the engagement letter still stands unless we agree
        otherwise in writing.
      </p>

      <p>
        What we hold, and why, is on <Link href="/privacy">Privacy</Link>.
      </p>
    </article>
  );
}
