import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['image.tmdb.org'],
  },
  typescript: {
    // Enable TypeScript's strict mode
    tsconfigPath: './tsconfig.json',
  },
};

export default nextConfig;
