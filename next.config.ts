import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  allowedDevOrigins: ["*"],
  serverExternalPackages: ["pdf-parse", "exceljs", "node-cron"],
};

export default nextConfig;
