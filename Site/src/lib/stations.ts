import { promises as fs } from "fs";
import path from "path";
import { allPlots, savePlots } from "@/lib/plots";
import type { Plot } from "@/lib/plot-types";

const HOUSE_PARENT = process.env.DLN_HOUSE_PARENT?.trim() || "/home/main";

const RESERVED = new Set([
  "admin",
  "lab",
  "go",
  "api",
  "login",
  "logout",
  "account",
  "greenhouse",
  "preview",
  "practice",
  "design",
  "strategy",
  "build",
  "privacy",
  "terms",
  "not-yours",
  "dln",
  "site",
  "memory",
  "ops",
  "deploy",
]);

export function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function validStationSlug(slug: string): boolean {
  return /^[a-z][a-z0-9-]{1,46}[a-z0-9]$/.test(slug) && !RESERVED.has(slug);
}

export async function createStation(input: {
  slug: string;
  name: string;
  party?: "client" | "studio";
}): Promise<{ plot: Plot; housePath: string; created: boolean }> {
  const slug = input.slug.trim().toLowerCase();
  const name = input.name.trim();
  if (!validStationSlug(slug)) throw new Error("bad-slug");
  if (!name) throw new Error("bad-name");

  const plots = await allPlots();
  if (plots.some((p) => p.slug === slug)) throw new Error("exists");

  const housePath = path.join(HOUSE_PARENT, slug);
  try {
    await fs.access(housePath);
    throw new Error("exists");
  } catch (err) {
    if (err instanceof Error && err.message === "exists") throw err;
  }

  await fs.mkdir(path.join(housePath, "_meta", "lab-inbox"), { recursive: true });
  await fs.mkdir(path.join(housePath, "memory"), { recursive: true });
  await fs.writeFile(
    path.join(housePath, "_meta", "lab-inbox", "messages.json"),
    "[]\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(housePath, "AGENTS.md"),
    `# ${name}

House on this PC for Design Lab North. Live hosts stay on the VPS. This folder is the editor.

## Wake

When \`_meta/lab-inbox/wake.flag\` changes, open \`_meta/lab-inbox/messages.json\`, take every \`pending\` item in order, set \`working\`, do the work in **this** filesystem, then stamp \`done\` or \`error\` with a reply. One failure does not block the rest. Do not auto-deploy.

Comments and \`/lab/${slug}/admin\` on localhost:3010 write here. That is this house's Cursor, not the Design Lab North hub chat.
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(housePath, "README.md"),
    `# ${name}

Station opened from Design Lab North. Build the site in this folder. The live upload is a later step.
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(housePath, "memory", "protocol.md"),
    `# ${name}

Opened as a Design Lab North station. Build the named site here. Do not invent a live domain until Ewan names it.
`,
    "utf8",
  );

  const plot: Plot = {
    slug,
    name,
    status: "growing",
    kind: "new",
    party: input.party || "client",
    hosts: [],
    localPreview: `/lab/${slug}`,
    public: false,
    voice: `Design Lab North are building ${name}.`,
    lab: {
      housePath,
      inboxRel: "_meta/lab-inbox",
    },
  };
  plots.push(plot);
  await savePlots(plots);
  return { plot, housePath, created: true };
}
