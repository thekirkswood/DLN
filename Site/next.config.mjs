import os from "node:os";

function lanDevOrigins() {
  const hosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
