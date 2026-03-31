import type { NextConfig } from "next";

const API_URL = process.env.API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
