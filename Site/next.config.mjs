import os from "node:os";

function lanDevOrigins() {
  const hosts = new Set([
    "localhost",
    "127.0.0.1",
    "[::1]",
    "dln.local",
    "builder.dln.local",
    "modyu.dln.local",
    "titles.dln.local",
    "swarm.dln.local",
    "pfp.dln.local",
    "dks.dln.local",
    "daa.dln.local",
  ]);
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.internal) continue;
      hosts.add(a.family === "IPv6" ? `[${a.address}]` : a.address);
    }
  }
  return [...hosts];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: lanDevOrigins(),
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
