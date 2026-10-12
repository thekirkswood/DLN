export type CopyProvider = "ollama" | "gemini";

const OLLAMA = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/+$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function ollamaUp() {
  try {
    const res = await fetch(`${OLLAMA}/api/tags`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resolveCopyProvider(): Promise<CopyProvider | null> {
  if (await ollamaUp()) return "ollama";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

export function noCopyDesk(host?: string | null) {
  const h = (host || "").toLowerCase();
  if (h.includes("designlabnorth.com")) {
    return "Ollama on your PC does not reach the public site. Use the house at localhost:3010, or put GEMINI_API_KEY on the live host.";
  }
  return "Text sits on this house. Start Ollama on this machine (the one serving :3010), or set GEMINI_API_KEY.";
}

async function fromOllama(system: string, user: string) {
  const res = await fetch(`${OLLAMA}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      system,
      prompt: user,
      stream: false,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { response?: string; error?: string };
  if (!res.ok || !data.response) {
    throw new Error(data.error || "Ollama did not write.");
  }
  return data.response.trim();
}

async function fromGemini(system: string, user: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is empty.");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = (data.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("").trim();
  if (!res.ok || !text) {
    throw new Error(data.error?.message || "Gemini did not write.");
  }
  return text;
}

export async function writeStudioCopy(opts: {
  system: string;
  user: string;
  provider?: CopyProvider | null;
}): Promise<{ text: string; provider: CopyProvider }> {
  const provider = opts.provider || (await resolveCopyProvider());
  if (!provider) throw new Error(noCopyDesk());
  const text = provider === "ollama" ? await fromOllama(opts.system, opts.user) : await fromGemini(opts.system, opts.user);
  return { text, provider };
}
