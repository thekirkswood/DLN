import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "projects.json");

export type StudioStill = {
  id: string;
  href: string;
  title: string;
  nodeId?: string;
  createdAt: string;
};

export type StudioProject = {
  id: string;
  title: string;
  plotSlug: string;
  workspaceSlug: string;
  sandboxSlug: string;
  stills?: StudioStill[];
  createdAt: string;
};

type Book = { projects: StudioProject[] };

function blank(): Book {
  return { projects: [] };
}

function slugify(value: string) {
  const next = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return next || "project";
}

async function readBook(): Promise<Book> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as Book;
    if (parsed && Array.isArray(parsed.projects)) return parsed;
  } catch {
    /* empty */
  }
  return blank();
}

async function writeBook(book: Book) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(book, null, 2)}\n`, "utf8");
}

export function projectSlug(plotSlug: string, title: string) {
  return `${slugify(plotSlug)}-${slugify(title)}`;
}

export async function listStudioProjects(plotSlug: string) {
  const book = await readBook();
  return book.projects
    .filter((row) => row.plotSlug === plotSlug)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getStudioProject(id: string) {
  const book = await readBook();
  return book.projects.find((row) => row.id === id) || null;
}

export async function updateStudioProject(
  id: string,
  patch: Partial<Pick<StudioProject, "title" | "plotSlug" | "workspaceSlug" | "sandboxSlug" | "stills">>,
) {
  const book = await readBook();
  const row = book.projects.find((item) => item.id === id);
  if (!row) return null;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.plotSlug !== undefined) row.plotSlug = patch.plotSlug;
  if (patch.workspaceSlug !== undefined) row.workspaceSlug = patch.workspaceSlug;
  if (patch.sandboxSlug !== undefined) row.sandboxSlug = patch.sandboxSlug;
  if (patch.stills !== undefined) row.stills = patch.stills;
  await writeBook(book);
  return row;
}

export async function appendStudioStill(id: string, still: StudioStill) {
  const book = await readBook();
  const row = book.projects.find((item) => item.id === id);
  if (!row) return null;
  row.stills = [still, ...(row.stills || [])].slice(0, 48);
  await writeBook(book);
  return row;
}

export async function createStudioProject(input: {
  title: string;
  plotSlug: string;
  workspaceSlug?: string;
  sandboxSlug?: string;
}) {
  const title = input.title.trim();
  if (!title) return null;
  const book = await readBook();
  const row: StudioProject = {
    id: randomUUID(),
    title,
    plotSlug: input.plotSlug,
    workspaceSlug: input.workspaceSlug || "",
    sandboxSlug: input.sandboxSlug || "",
    stills: [],
    createdAt: new Date().toISOString(),
  };
  book.projects.push(row);
  await writeBook(book);
  return row;
}
