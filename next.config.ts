import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "tirupatimedix.com",
        "www.tirupatimedix.com",
        "localhost:3000"
      ]
    }
  }
};

export default nextConfig;
