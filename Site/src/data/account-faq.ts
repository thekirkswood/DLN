/** Logged-in account only. Keep the public site plain. */
export const ACCOUNT_FAQ = [
  {
    q: "What am I paying for each month?",
    a: "One host: the live site and a sandbox. You watch. We do the work. A hotfix is for when something is actually wrong.",
  },
  {
    q: "What is the sandbox?",
    a: "The sitting copy while the live site stays up. We work there, then update live when the change is happy.",
  },
  {
    q: "What do I pay first?",
    a: "The sitting and the site are the start. The monthly is the host. Design-only and Strategy-only are sittings — they do not include a host unless we put you through to Build.",
  },
  {
    q: "How do I talk to the site?",
    a: "On that site’s tab on the home: the sandbox, patch notes from what we pushed, and a hotfix box if something is wrong. Pick a page first so we know which window you mean.",
  },
  {
    q: "What is a hotfix?",
    a: "Something is wrong right now — a broken page, spelling, the host not answering. We ping the host and look at it. A change to the look of the work is not a hotfix; we do that work, you don’t drive it from the box.",
  },
  {
    q: "Where do I see what changed?",
    a: "Patch notes sit on the home tab for that site, under the sandbox. Date, then a straight list of what we actually ran.",
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
