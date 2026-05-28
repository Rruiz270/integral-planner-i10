import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    { source: "/planner", destination: "/", permanent: true },
  ],
};

export default nextConfig;
