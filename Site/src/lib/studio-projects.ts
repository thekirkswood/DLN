import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "projects.json");

export type StudioProject = {
  id: string;
  title: string;
  plotSlug: string;
  workspaceSlug: string;
  sandboxSlug: string;
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

export async function createStudioProject(input: {
  title: string;
  plotSlug: string;
  workspaceSlug: string;
  sandboxSlug: string;
}) {
  const title = input.title.trim();
  if (!title) return null;
  const book = await readBook();
  const row: StudioProject = {
    id: randomUUID(),
    title,
    plotSlug: input.plotSlug,
    workspaceSlug: input.workspaceSlug,
    sandboxSlug: input.sandboxSlug,
    createdAt: new Date().toISOString(),
  };
  book.projects.push(row);
  await writeBook(book);
  return row;
}
