import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const fallbackBaseUrl =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || fallbackBaseUrl,
  plugins: [adminClient()],
});
