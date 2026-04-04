import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  distDir: "dist",
  basePath: isProd ? "/todolist-pro" : "",
  assetPrefix: isProd ? "/todolist-pro/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
