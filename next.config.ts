import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
    "*.ngrok-free.dev",
    "*.ngrok.dev",
    "*.trycloudflare.com",
  ],
  serverExternalPackages: ["pdf-parse", "exceljs", "node-cron", "web-push"],
};

export default nextConfig;
