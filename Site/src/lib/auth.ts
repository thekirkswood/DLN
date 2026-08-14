import { promises as fs } from "fs";
import path from "path";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  randomUUID,
} from "crypto";

const ROOT = path.join(process.cwd(), "..", "_meta", "accounts");
const USERS = path.join(ROOT, "users.json");
const SESSIONS = path.join(ROOT, "sessions.json");
const SEED = path.join(ROOT, "SEED.txt");

export const COOKIE = "dln_session";
const SESSION_DAYS = 30;

export type Role = "owner" | "studio" | "client";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: Role;
  plots: string[];
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

type Session = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

function cookieDomain(): string | undefined {
  const d = process.env.DLN_COOKIE_DOMAIN?.trim();
  return d || undefined;
}

export function sessionCookieOptions(token: string, maxAge = SESSION_DAYS * 24 * 60 * 60) {
  const secure = process.env.DLN_COOKIE_SECURE === "true";
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure,
    ...(cookieDomain() ? { domain: cookieDomain() } : {}),
  };
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = scryptSync(password, salt, 64);
  const buf = Buffer.from(hash, "hex");
  if (check.length !== buf.length) return false;
  return timingSafeEqual(check, buf);
}

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  try {
    await fs.access(USERS);
  } catch {
    await seed();
  }
  try {
    await fs.access(SESSIONS);
  } catch {
    await fs.writeFile(SESSIONS, "[]\n", "utf8");
  }
  await ensureHubAccounts();
}

function genPass(): string {
  return randomBytes(12).toString("base64url");
}

type SeedUser = {
  email: string;
  displayName: string;
  role: Role;
  plots: string[];
};

async function ensureHubAccounts() {
  try {
    const users = JSON.parse(await fs.readFile(USERS, "utf8")) as User[];
    if (!Array.isArray(users)) return;
    const wanted: SeedUser[] = [
      {
        email: "ewan@designlabnorth.com",
        displayName: "Ewan",
        role: "owner",
        plots: ["*"],
      },
      {
        email: "dave@designlabnorth.com",
        displayName: "Dave Kirkwood",
        role: "studio",
        plots: ["*"],
      },
    ];
    const extra: string[] = [];
    const now = new Date().toISOString();
    for (const w of wanted) {
      if (users.some((u) => u.email.toLowerCase() === w.email)) continue;
      const pass = genPass();
      users.push({
        id: randomUUID(),
        email: w.email,
        passwordHash: hashPassword(pass),
        displayName: w.displayName,
        role: w.role,
        plots: w.plots,
        createdAt: now,
      });
      extra.push(`${w.role}  ${w.email}  ${pass}`);
    }
    if (!extra.length) return;
    await fs.writeFile(USERS, `${JSON.stringify(users, null, 2)}\n`, "utf8");
    await fs.appendFile(
      SEED,
      ["", "Hub accounts — added when missing.", ...extra, ""].join("\n"),
      { encoding: "utf8", mode: 0o600 },
    );
  } catch {
    /* store unreadable — leave as-is */
  }
}

async function seed() {
  const ownerPass = genPass();
  const studioPass = genPass();
  const clientPass = genPass();
  const now = new Date().toISOString();
  const users: User[] = [
    {
      id: randomUUID(),
      email: "ewan@designlabnorth.com",
      passwordHash: hashPassword(ownerPass),
      displayName: "Ewan",
      role: "owner",
      plots: ["*"],
      createdAt: now,
    },
    {
      id: randomUUID(),
      email: "dave@designlabnorth.com",
      passwordHash: hashPassword(studioPass),
      displayName: "Dave Kirkwood",
      role: "studio",
      plots: ["*"],
      createdAt: now,
    },
    {
      id: randomUUID(),
      email: "ewan@designlabnorth.local",
      passwordHash: hashPassword(ownerPass),
      displayName: "Ewan",
      role: "owner",
      plots: ["*"],
      createdAt: now,
    },
    {
      id: randomUUID(),
      email: "modyu@designlabnorth.local",
      passwordHash: hashPassword(clientPass),
      displayName: "ModYu",
      role: "client",
      plots: ["modyu"],
      createdAt: now,
    },
  ];
  await fs.writeFile(USERS, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  await fs.writeFile(SESSIONS, "[]\n", "utf8");
  await fs.writeFile(
    SEED,
    [
      "DLN local seed — gitignored. Change these.",
      `owner  ewan@designlabnorth.com  ${ownerPass}`,
      `studio dave@designlabnorth.com  ${studioPass}`,
      `owner  ewan@designlabnorth.local  ${ownerPass}`,
      `client modyu@designlabnorth.local  ${clientPass}`,
      "",
    ].join("\n"),
    { encoding: "utf8", mode: 0o600 },
  );
}

async function readJson<T>(file: string): Promise<T[]> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8")) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJson<T>(file: string, data: T[]) {
  await ensure();
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function pub(u: User): PublicUser {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

export function canAccessPlot(user: PublicUser, slug: string): boolean {
  if (user.role === "owner" || user.role === "studio") return true;
  if (user.plots.includes("*")) return true;
  return user.plots.includes(slug);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await readJson<User>(USERS);
  const needle = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === needle) ?? null;
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string } | null> {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400000);
  const sessions = await readJson<Session>(SESSIONS);
  sessions.push({
    token,
    userId: user.id,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  });
  await writeJson(SESSIONS, sessions);
  return { user: pub(user), token };
}

export async function userFromSession(
  token: string | undefined,
): Promise<PublicUser | null> {
  await ensure();
  if (!token) return null;
  const sessions = await readJson<Session>(SESSIONS);
  const s = sessions.find((x) => x.token === token);
  if (!s) return null;
  if (new Date(s.expiresAt).getTime() < Date.now()) return null;
  const users = await readJson<User>(USERS);
  const user = users.find((u) => u.id === s.userId);
  return user ? pub(user) : null;
}

export async function logout(token: string | undefined) {
  if (!token) return;
  const sessions = await readJson<Session>(SESSIONS);
  await writeJson(
    SESSIONS,
    sessions.filter((s) => s.token !== token),
  );
}
