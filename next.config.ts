import type { NextConfig } from "next";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
