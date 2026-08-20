import type { NextConfig } from "next";
import path from "node:path";

const frontendRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: frontendRoot,
  },
  outputFileTracingRoot: frontendRoot,
};

export default nextConfig;
