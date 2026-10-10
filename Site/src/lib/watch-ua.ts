/** Short device line for Watch. Not a fingerprint. */
export function deviceLine(ua: string): string {
  const raw = (ua || "").trim();
  if (!raw) return "unknown device";
  const low = raw.toLowerCase();
  if (
    /(?:bot|crawl|spider|scrapy|python-requests|curl\/|wget|httpclient|go-http|bytespider|semrush|ahrefs)/i.test(
      raw,
    )
  ) {
    const name = raw.split(/[/\s]/)[0] || "bot";
    return `bot · ${name.slice(0, 40)}`;
  }
  const apple = /iphone/.test(low)
    ? "iPhone"
    : /ipad/.test(low)
      ? "iPad"
      : /macintosh|mac os x/.test(low)
        ? "Mac"
        : "";
  const android = /android/.test(low);
  const win = /windows/.test(low);
  const browser = /edg\//.test(low)
    ? "Edge"
    : /chrome|crios/.test(low) && !/edg/.test(low)
      ? "Chrome"
      : /firefox|fxios/.test(low)
        ? "Firefox"
        : /safari/.test(low)
          ? "Safari"
          : "browser";
  if (apple) return `${apple} · ${browser}`;
  if (android) return `Android · ${browser}`;
  if (win) return `Windows · ${browser}`;
  if (/linux/.test(low)) return `Linux · ${browser}`;
  return browser;
}
