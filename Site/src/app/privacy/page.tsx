export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="legal wrap">
      <p className="kicker">Privacy</p>
      <h1>Privacy</h1>
      <p>
        Design Lab North holds as little as we can, for as short as we can, for
        the work we are doing with you.
      </p>

      <h2>Who we are</h2>
      <p>
        Design Lab North, designlabnorth.com. Contact: the address we give you
        when we start work. Company details will sit here once they are filed.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account email, name, and a hashed password.</li>
        <li>
          A session cookie (<code>dln_session</code>) so we know it is you on
          this site and on your plot subdomain.
        </li>
        <li>
          The usual server logs: IP, time, path — to keep the greenhouse up and
          to notice abuse.
        </li>
      </ul>

      <h2>Why</h2>
      <p>
        To sign you in, to show you your plot and not someone else’s, and to
        run a secure host. Legal bases: contract (building and hosting your
        site) and legitimate interests (security).
      </p>

      <h2>Cookies</h2>
      <p>
        The session cookie is essential. It is httpOnly, scoped to
        designlabnorth.com (including plot subdomains). It is not an advertising
        tracker. There is no analytics tag on this site yet. If that changes, we
        will say so here first.
      </p>

      <h2>How long</h2>
      <p>
        Sessions last thirty days of inactivity at most. Accounts last for the
        life of the project plus a short archive, then we delete them. Logs are
        rotated.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell data. Hosting sits on our VPS. Email, if we send any,
        will be named here when we use a provider.
      </p>

      <h2>Your rights</h2>
      <p>
        If you are in the UK or EEA you can ask to see, correct, or delete what
        we hold, or complain to the ICO. Ask us first — we would rather just
        sort it.
      </p>
    </article>
  );
}
