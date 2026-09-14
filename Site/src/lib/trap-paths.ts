/** Paths no honest page links to. Scrapers that fetch them trip a studio log. */

const MALICIOUS_EXACT = new Set([
  "/.env",
  "/.env.local",
  "/.env.production",
  "/.env.development",
  "/.git",
  "/.git/config",
  "/.git/head",
  "/.svn",
  "/.htaccess",
  "/.htpasswd",
  "/.ds_store",
  "/wp-login.php",
  "/xmlrpc.php",
  "/wp-admin",
  "/phpmyadmin",
  "/admin.php",
  "/backup.sql",
  "/backup.zip",
  "/dump.sql",
  "/database.sql",
  "/web.config",
  "/server-status",
  "/id_rsa",
  "/composer.json",
  "/.ssh",
  "/actuator",
  "/actuator/env",
  "/_meta/accounts",
  "/_meta/accounts/users.json",
  "/_meta/accounts/sessions.json",
  "/_meta/secrets",
  "/_dln/canary",
  "/_dln/canary/files",
]);

const MALICIOUS_PREFIXES = [
  "/.env.",
  "/.git/",
  "/.svn/",
  "/.ssh/",
  "/wp-admin/",
  "/wp-content/",
  "/wp-includes/",
  "/phpmyadmin/",
  "/actuator/",
  "/cgi-bin/",
  "/vendor/phpunit/",
  "/_meta/accounts/",
  "/_meta/secrets/",
  "/_dln/canary/",
];

/** Studio paths a curious person might type. 404 and log — do not auto-block. */
const CURIOSITY_EXACT = new Set([
  "/lab",
  "/admin",
  "/src",
  "/source",
  "/__nextjs_original-stack-frames",
]);

const CURIOSITY_PREFIXES = ["/lab/", "/admin/", "/src/", "/source/"];

export function cleanWatchPath(pathname: string): string {
  const raw = pathname.split("?")[0].split("#")[0];
  if (!raw.startsWith("/") || raw.startsWith("//")) return "";
  return raw.length > 200 ? raw.slice(0, 200) : raw;
}

function hitSet(lower: string, exact: Set<string>, prefixes: string[]): boolean {
  if (exact.has(lower)) return true;
  return prefixes.some((pre) => lower.startsWith(pre));
}

/** Known scanner toolkit. These are the only doors that auto-shut an address. */
export function isMaliciousPath(pathname: string): boolean {
  const lower = cleanWatchPath(pathname).toLowerCase();
  if (!lower) return false;
  if (hitSet(lower, MALICIOUS_EXACT, MALICIOUS_PREFIXES)) return true;
  return /(?:^|\/)(?:wp-login\.php|wp-admin|wp-content|wp-includes|xmlrpc|phpmyadmin|phpinfo|cgi-bin|vendor\/phpunit|actuator|server-status|id_rsa|composer\.json|web\.config)(?:\/|$)/.test(
    lower,
  );
}

export function isTrapPath(pathname: string): boolean {
  const lower = cleanWatchPath(pathname).toLowerCase();
  if (!lower) return false;
  if (isMaliciousPath(lower)) return true;
  return hitSet(lower, CURIOSITY_EXACT, CURIOSITY_PREFIXES);
}

/** Scanner-shaped or curiosity. Edge-safe (no disk). Log these; do not auto-block on curiosity alone. */
export function looksLikeProbe(pathname: string): boolean {
  const lower = cleanWatchPath(pathname).toLowerCase();
  if (!lower || lower.startsWith("/.well-known")) return false;
  if (isTrapPath(lower)) return true;
  if (lower.startsWith("/.") || lower.includes("/.")) return true;
  if (/\.(?:php|asp|aspx|cgi|env|sql|bak|old|zip|tar|gz|tgz|7z|rar|map)$/.test(lower)) {
    return true;
  }
  if (lower.endsWith(".map") || lower.includes(".js.map")) return true;
  return false;
}

export function pathsLookMalicious(paths: { path?: string }[]): boolean {
  return paths.some((hit) => hit.path && isMaliciousPath(hit.path));
}
