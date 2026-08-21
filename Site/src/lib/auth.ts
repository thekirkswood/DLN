import { promises as fs } from "fs";
import path from "path";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  randomUUID,
} from "crypto";
import { headers } from "next/headers";
import { isLabHost } from "@/lib/lab-host";
import { isHomeTicket, verifyHomeTicket } from "@/lib/home-ticket";

const ROOT = path.join(process.cwd(), "..", "_meta", "accounts");
const USERS = path.join(ROOT, "users.json");
const SESSIONS = path.join(ROOT, "sessions.json");
const SEED = path.join(ROOT, "SEED.txt");
export const AVATARS = path.join(ROOT, "avatars");

export const COOKIE = "dln_session";
const SESSION_DAYS = 90;

export type Role = "owner" | "studio" | "client";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: Role;
  plots: string[];
  createdAt: string;
  avatar?: string;
  /** Mailbox. Login may be a .local handle. */
  personalEmail?: string;
  phone?: string;
  notes?: string;
  enquiryId?: string;
  /** false = not this book. Their live plot has its own book. Puppet accounts ignore this and sign in on lab hosts only. */
  hubLogin?: boolean;
  /** Campus/lab test client. Sign in on lab hosts to see a client account. Never mail or regenerate a login. */
  puppet?: boolean;
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
  const expires = new Date(Date.now() + maxAge * 1000);
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    expires,
    secure,
    ...(cookieDomain() ? { domain: cookieDomain() } : {}),
  };
}

export function generatePassword(): string {
  return randomBytes(12).toString("base64url");
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
  return generatePassword();
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
    const absorbed = await absorbObsoleteModyu(users);
    const puppets = markPuppetClients(users);
    if (!extra.length && !absorbed && !puppets) return;
    await fs.writeFile(USERS, `${JSON.stringify(users, null, 2)}\n`, "utf8");
    if (!extra.length) return;
    await fs.appendFile(
      SEED,
      ["", "Hub accounts — added when missing.", ...extra, ""].join("\n"),
      { encoding: "utf8", mode: 0o600 },
    );
  } catch {
    /* store unreadable — leave as-is */
  }
}

/** Offline puppets we sign in as on campus. Not a person to mail. */
const PUPPET_EMAILS = new Set(["modyu@designlabnorth.com"]);

export function isPuppetEmail(email: string): boolean {
  return PUPPET_EMAILS.has(email.trim().toLowerCase());
}

function markPuppetClients(users: User[]): boolean {
  let changed = false;
  for (const u of users) {
    if (!PUPPET_EMAILS.has(u.email.toLowerCase())) continue;
    if (u.puppet === true && u.hubLogin !== false) continue;
    u.puppet = true;
    delete u.hubLogin;
    changed = true;
  }
  return changed;
}

function requestIsLab(): boolean {
  try {
    return isLabHost(headers().get("host"));
  } catch {
    return false;
  }
}

export function canHubLogin(
  user: Pick<User, "hubLogin" | "puppet">,
  lab = requestIsLab(),
): boolean {
  if (user.puppet) return lab;
  return user.hubLogin !== false;
}

/** Seed `.local` ModYu is obsolete. Anne Marie’s `.com` login is the live one. */
async function absorbObsoleteModyu(users: User[]): Promise<boolean> {
  const keep = users.find((u) => u.email === "modyu@designlabnorth.com");
  const drop = users.find((u) => u.email === "modyu@designlabnorth.local");
  if (!keep || !drop) return false;
  if (drop.avatar && !keep.avatar) keep.avatar = drop.avatar;
  keep.plots = Array.from(new Set([...(keep.plots || []), ...(drop.plots || [])]));
  if (drop.phone && !keep.phone) keep.phone = drop.phone;
  if (drop.personalEmail && !keep.personalEmail) keep.personalEmail = drop.personalEmail;
  if (drop.notes) {
    keep.notes = keep.notes ? `${keep.notes}\n${drop.notes}` : drop.notes;
  }
  const idx = users.findIndex((u) => u.id === drop.id);
  if (idx >= 0) users.splice(idx, 1);
  const { remapClientRecords } = await import("@/lib/unify-client");
  await remapClientRecords(drop.id, keep.id);
  return true;
}

async function seed() {
  const ownerPass = genPass();
  const studioPass = genPass();
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
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.rename(tmp, file);
}

function pub(u: User): PublicUser {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

export async function clientForPlot(slug: string): Promise<PublicUser | null> {
  const users = await readJson<User>(USERS);
  const matches = users.filter(
    (x) =>
      x.role === "client" &&
      (x.plots.includes(slug) || x.plots.includes("*")),
  );
  const u =
    matches.find((x) => !x.email.endsWith(".local")) || matches[0] || null;
  return u ? pub(u) : null;
}

export function canAccessPlot(user: PublicUser, slug: string): boolean {
  if (user.role === "owner" || user.role === "studio") return true;
  if (user.plots.includes("*")) return true;
  return user.plots.includes(slug);
}

export function isStudio(user: PublicUser): boolean {
  return user.role === "owner" || user.role === "studio";
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  const users = await readJson<User>(USERS);
  const u = users.find((x) => x.id === id);
  return u ? pub(u) : null;
}

export async function listClients(): Promise<PublicUser[]> {
  const users = await readJson<User>(USERS);
  return users.filter((u) => u.role === "client").map(pub);
}

export async function createClient(input: {
  email: string;
  displayName: string;
  plots: string[];
  password?: string;
  personalEmail?: string;
  phone?: string;
  notes?: string;
  enquiryId?: string;
}): Promise<{ user: PublicUser; password: string }> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const password = (input.password || generatePassword()).trim();
  if (!email || !displayName || password.length < 8) throw new Error("invalid");
  const users = await readJson<User>(USERS);
  if (users.some((u) => u.email.toLowerCase() === email)) throw new Error("exists");
  const plots = input.plots.map((p) => p.trim()).filter(Boolean);
  const personalEmail = input.personalEmail?.trim().toLowerCase() || undefined;
  const user: User = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(password),
    displayName,
    role: "client",
    plots,
    createdAt: new Date().toISOString(),
    personalEmail,
    phone: input.phone?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    enquiryId: input.enquiryId?.trim() || undefined,
    ...(isPuppetEmail(email) ? { puppet: true } : {}),
  };
  users.push(user);
  await writeJson(USERS, users);
  if (!user.puppet) {
    await fs.appendFile(
      SEED,
      `client  ${email}  ${password}${personalEmail ? `  mailbox ${personalEmail}` : ""}\n`,
      { encoding: "utf8", mode: 0o600 },
    );
  }
  return { user: pub(user), password };
}

/** Keep a live session from going stale while they walk the site. */
export async function touchSession(token: string | undefined): Promise<PublicUser | null> {
  const user = await userFromSession(token);
  if (!user || !token) return user;
  const sessions = await readJson<Session>(SESSIONS);
  const s = sessions.find((x) => x.token === token);
  if (!s) return user;
  const now = Date.now();
  const expires = new Date(s.expiresAt).getTime();
  if (expires - now > 7 * 86400000) return user;
  s.expiresAt = new Date(now + SESSION_DAYS * 86400000).toISOString();
  await writeJson(SESSIONS, sessions);
  return user;
}

export async function updateDisplayName(userId: string, displayName: string): Promise<PublicUser> {
  const name = displayName.trim();
  if (!name) throw new Error("invalid");
  const users = await readJson<User>(USERS);
  const u = users.find((x) => x.id === userId);
  if (!u) throw new Error("missing");
  u.displayName = name;
  await writeJson(USERS, users);
  return pub(u);
}

export async function setAvatar(userId: string, filename: string): Promise<PublicUser> {
  const users = await readJson<User>(USERS);
  const u = users.find((x) => x.id === userId);
  if (!u) throw new Error("missing");
  await fs.mkdir(AVATARS, { recursive: true });
  u.avatar = filename;
  await writeJson(USERS, users);
  return pub(u);
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
  await ensure();
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  if (!canHubLogin(user)) return null;
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

/** Plot logins: Ewan and Dave only. Clients on this book stay off the house staff door. */
export async function verifyStudioLogin(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  await ensure();
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  const pubUser = pub(user);
  if (!isStudio(pubUser)) return null;
  return pubUser;
}

export async function userFromSession(
  token: string | undefined,
): Promise<PublicUser | null> {
  await ensure();
  if (!token) return null;
  if (isHomeTicket(token)) {
    const claims = await verifyHomeTicket(token);
    if (!claims) return null;
    const user = await findUserByEmail(claims.email);
    if (!user || user.role !== claims.role) return null;
    const pubUser = pub(user);
    if (!isStudio(pubUser) || !canHubLogin(user)) return null;
    return pubUser;
  }
  const sessions = await readJson<Session>(SESSIONS);
  const s = sessions.find((x) => x.token === token);
  if (!s) return null;
  if (new Date(s.expiresAt).getTime() < Date.now()) return null;
  const users = await readJson<User>(USERS);
  const user = users.find((u) => u.id === s.userId);
  if (!user || !canHubLogin(user)) return null;
  return pub(user);
}

export async function logout(token: string | undefined) {
  if (!token || isHomeTicket(token)) return;
  const sessions = await readJson<Session>(SESSIONS);
  await writeJson(
    SESSIONS,
    sessions.filter((s) => s.token !== token),
  );
}
