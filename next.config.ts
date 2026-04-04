import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/todolist-pro',
  assetPrefix: '/todolist-pro/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
