import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  nodeMiddleware: true, // Enable Node.js middleware (because auth.js middleware is too big)
};

export default nextConfig;
