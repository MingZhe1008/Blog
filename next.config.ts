import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    mdxRs: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default function config(phase: string): NextConfig {
  return { ...nextConfig, distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next" };
}
