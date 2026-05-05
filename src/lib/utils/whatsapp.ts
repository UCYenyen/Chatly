const GOWA_API_BASE = process.env.GOWA_API_BASE || "http://localhost:3001";
const GOWA_BASIC_AUTH_USER = process.env.GOWA_BASIC_AUTH_USER;
const GOWA_BASIC_AUTH_PASS = process.env.GOWA_BASIC_AUTH_PASS;

export function gowaAuthHeader(): Record<string, string> {
  if (!GOWA_BASIC_AUTH_USER || !GOWA_BASIC_AUTH_PASS) return {};
  const token = Buffer.from(
    `${GOWA_BASIC_AUTH_USER}:${GOWA_BASIC_AUTH_PASS}`
  ).toString("base64");
  return { Authorization: `Basic ${token}` };
}

export function extractPhone(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const candidate =
    (o.phone as string) ??
    (o.phone_number as string) ??
    (o.jid as string) ??
    (o.id as string) ??
    null;
  if (typeof candidate !== "string") return null;
  const cleaned = candidate.split("@")[0]?.split(":")[0] ?? null;
  return cleaned || null;
}

/**
 * Check whether a Gowa device is currently logged in by calling
 * `GET /devices/:device_id/status` (per gowareadme.md v8 API).
 *
 * Falls back to `GET /app/status` with X-Device-Id header if the
 * per-device endpoint fails.
 */
export async function fetchGowaDeviceStatus(
  deviceId: string
): Promise<{ connected: boolean; phoneNumber: string | null }> {
  const headersInit: Record<string, string> = {
    Accept: "application/json",
    "X-Device-Id": deviceId,
    ...gowaAuthHeader(),
  };

  // ── Primary: GET /devices/:device_id/status ─────────────────────────
  try {
    const res = await fetch(`${GOWA_API_BASE}/devices/${deviceId}/status`, {
      method: "GET",
      headers: headersInit,
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      console.log("[gowa] /devices/:id/status =>", JSON.stringify(data));
      const r = data.results ?? data;

      // Gowa returns { is_logged_in: true/false } in its status response
      if (r.is_logged_in === true || r.connected === true) {
        const phone = extractPhone(r) ?? extractPhone(r?.user) ?? deviceId.split("@")[0];
        return { connected: true, phoneNumber: phone };
      }
      return { connected: false, phoneNumber: null };
    }
  } catch (err) {
    console.warn("[gowa] /devices/:id/status error:", err);
  }

  // ── Fallback: GET /app/status ───────────────────────────────────────
  try {
    const res = await fetch(`${GOWA_API_BASE}/app/status`, {
      method: "GET",
      headers: headersInit,
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      console.log("[gowa] /app/status =>", JSON.stringify(data));
      const r = data.results ?? data;

      if (r.is_logged_in === true || r.connected === true) {
        const phone = extractPhone(r) ?? extractPhone(r?.user) ?? deviceId.split("@")[0];
        return { connected: true, phoneNumber: phone };
      }
      return { connected: false, phoneNumber: null };
    }
  } catch (err) {
    console.warn("[gowa] /app/status error:", err);
  }

  // If both endpoints failed, assume disconnected
  return { connected: false, phoneNumber: null };
}
