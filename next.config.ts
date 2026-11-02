import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import { BASE_PATH } from "./src/lib/site-paths";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  serverExternalPackages: ["sql.js"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    mdxRs: true,
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
};

export default function config(phase: string): NextConfig {
  return { ...nextConfig, distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next" };
}
