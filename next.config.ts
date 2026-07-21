import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // pdf-parse uses Node.js internals and must not be bundled for the browser.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
