import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    FEISHU_CLIENT_ID: process.env.FEISHU_CLIENT_ID,
    FEISHU_CLIENT_SECRET: process.env.FEISHU_CLIENT_SECRET,
    FEISHU_REDIRECT_URI: process.env.FEISHU_REDIRECT_URI,
  },
};

export default nextConfig;
