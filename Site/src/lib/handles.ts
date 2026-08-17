/** Internal login, not a mailbox. Same address opens Various Titles. */
export function localHandleFromName(name: string): string {
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "") || "client";
  return `${slug}@designlabnorth.local`;
}

export function isLocalHandle(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@designlabnorth.local");
}
