import Link from "next/link";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="legal wrap">
      <p className="kicker">Privacy</p>
      <h1>Privacy</h1>
      <p className="status">19 August 2026</p>
      <p>
        We hold as little as we can, for as short as we can, for the work we
        are doing with you. This notice is for designlabnorth.com, the account
        behind Sign in, and the live hosts we run for you on our names.
      </p>
      <p>
        Other products in the greenhouse — Various Titles, Swarm Fund,
        Choozlist — and a client’s own public site have their own hosts. Where
        those sites keep a separate book, that book has the last word.
      </p>

      <h2>Who we are</h2>
      <p>
        Design Lab North are Ewan Kirkwood and Dave Kirkwood. The public site is
        designlabnorth.com. Enquiries:{" "}
        <a href="mailto:build@designlabnorth.com">build@designlabnorth.com</a>.
        Company details will sit here once they are filed. Until then this is
        the trading name, and that mailbox is how you reach us.
      </p>

      <h2>What we collect</h2>
      <p>Only what the work needs.</p>
      <ul>
        <li>
          An enquiry: name, email, optional phone, what you said you need, and
          any message you typed on Practice.
        </li>
        <li>
          An account: email or login handle, display name, a hashed password,
          optional picture, optional mailbox and phone if we onboarded you that
          way.
        </li>
        <li>
          A session cookie (<code>dln_session</code>) so we know it is you on
          this site and on a gated plot we host.
        </li>
        <li>
          The account book: invoices, line items, whether a payment was marked
          sent, and when it was recorded paid. We do not take card numbers on
          this site.
        </li>
        <li>
          Notes you leave on a live host, and the plans we sweep from those
          notes so we can come back with an update.
        </li>
        <li>
          Ordinary server logs: IP, time, path — to keep the host up and to
          notice abuse.
        </li>
      </ul>
      <p>
        The ground you pick in the footer stays in your browser (local
        storage). It is not sent to us.
      </p>

      <h2>Why</h2>
      <p>
        To answer an enquiry, to sign you in, to show you your site and not
        someone else’s, to invoice and match a bank payment, and to keep the
        host secure. Legal bases: taking steps toward a contract, performing
        that contract, and legitimate interests (security and running the
        studio).
      </p>

      <h2>Cookies</h2>
      <p>
        The session cookie is essential. It is httpOnly, scoped to
        designlabnorth.com (including plot subdomains we put it on). It lasts
        up to ninety days and refreshes while you use the site. It is not an
        advertising tracker. There is no analytics tag on this site. If that
        changes, we will say so here first.
      </p>

      <h2>How long</h2>
      <p>
        Enquiries stay while they are open, then a short archive. Accounts last
        for the life of the project plus a short archive, then we delete them.
        Invoices stay as long as the book needs them — they are the record of
        what was issued and paid. Logs are rotated. You can ask us to delete
        what we no longer need for the work or the law.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell data. Hosting sits on our own server. If we send mail
        (an onboard login, a reply to an enquiry), that goes through the mail
        path we have set; we will name a provider here if one is in use. A bank
        transfer is between you and the account on the invoice — we do not
        process the payment through this site.
      </p>
      <p>
        Ewan and Dave both see the studio desk. We do not pass your account to
        another agency.
      </p>

      <h2>Your rights</h2>
      <p>
        If you are in the UK or EEA you can ask to see, correct, or delete what
        we hold, to restrict or object, and to complain to the ICO. Ask us
        first — we would rather just sort it. Write to{" "}
        <a href="mailto:build@designlabnorth.com">build@designlabnorth.com</a>.
      </p>

      <h2>Children</h2>
      <p>
        This site is for people commissioning design and build work. It is not
        aimed at anyone under 18.
      </p>

      <h2>Changes</h2>
      <p>
        If this notice changes in a way that matters, the date at the top
        moves, and we will tell people with an account if they need to know.
      </p>

      <p>
        How we work together is on <Link href="/terms">Terms</Link>.
      </p>
    </article>
  );
}
