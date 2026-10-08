/** Logged-in account only. Keep the public site plain. */
export const ACCOUNT_FAQ = [
  {
    q: "What am I paying for each month?",
    a: "One host: the live site and a sandbox you can talk to. Comments in the evening become a rolling update if there are any. That is the monthly.",
  },
  {
    q: "What is the sandbox?",
    a: "The place you can talk to while the live site stays up. Comments and hotfixes land here. We work offline, then update live when the change is happy.",
  },
  {
    q: "What do I pay first?",
    a: "The sitting and the site are the start. The monthly is the host. Design-only and Strategy-only are sittings — they do not include a host unless we put you through to Build.",
  },
  {
    q: "How do comments work?",
    a: "Write what you want changed. We read them and turn them into a plan. If there are comments, we aim to run a rolling update that evening. Nothing on the live site changes from the box itself.",
  },
  {
    q: "What is a hotfix?",
    a: "Something is wrong right now. Put it in the hotfix box. We try to audit it within the hour. That is not the same as a comment for later.",
  },
  {
    q: "Where do I see what changed?",
    a: "Shipped updates sit on Sites, under the log. That is the patch we ran, written so you can read it.",
  },
  {
    q: "Who do I sit with?",
    a: "Design and Strategy sittings are with Dave. Build sittings are with Ewan. The monthly host is the desk coming in after that.",
  },
  {
    q: "I only wanted Strategy, then we talked about the website.",
    a: "That is not a walk on the public wall. If it comes up in the sitting, we put you through to Build from there.",
  },
] as const;
