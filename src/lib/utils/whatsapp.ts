const rawGowaBase = process.env.GOWA_API_BASE || "http://localhost:3001";
const GOWA_API_BASE = rawGowaBase.replace(/\/+$/, "");
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
    null;
  if (typeof candidate !== "string") return null;
  // Gowa returns the phone as a WhatsApp JID, e.g. "6281231847161@s.whatsapp.net"
  // or "6281231847161:12@s.whatsapp.net". Strip the domain and device suffix so
  // we store a clean phone number.
  const cleaned = candidate.split("@")[0].split(":")[0].trim();
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Check whether a Gowa device is currently logged in, and return its phone
 * number when available.
 *
 * Primary source is `GET /devices/:device_id` (device info), which returns both
 * `state` and the `jid` carrying the phone number. The `/devices/:id/status`
 * endpoint only reports login state (no phone), so it is a fallback, followed
 * by `GET /app/status` with the X-Device-Id header.
 */
export async function fetchGowaDeviceStatus(
  deviceId: string
): Promise<{ connected: boolean; phoneNumber: string | null }> {
  const headersInit: Record<string, string> = {
    Accept: "application/json",
    "X-Device-Id": deviceId,
    ...gowaAuthHeader(),
  };

  // ── Primary: GET /devices/:device_id (device info) ──────────────────
  // Unlike /devices/:id/status (which only returns is_logged_in / is_connected),
  // this endpoint also returns the `jid` field that carries the phone number.
  try {
    const res = await fetch(`${GOWA_API_BASE}/devices/${deviceId}`, {
      method: "GET",
      headers: headersInit,
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      console.log("[gowa] /devices/:id =>", JSON.stringify(data));
      const r = data.results ?? data;

      // Gowa returns { state: "logged_in" | "disconnected", jid: "...", ... }
      if (r.state === "logged_in") {
        const phone = extractPhone(r) ?? extractPhone(r?.user) ?? null;
        return { connected: true, phoneNumber: phone };
      }
      return { connected: false, phoneNumber: null };
    }
  } catch (err) {
    console.warn("[gowa] /devices/:id error:", err);
  }

  // ── Fallback 1: GET /devices/:device_id/status ──────────────────────
  // Only confirms login state; no phone number available here.
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

      if (r.is_logged_in === true || r.is_connected === true || r.connected === true) {
        const phone = extractPhone(r) ?? extractPhone(r?.user) ?? null;
        return { connected: true, phoneNumber: phone };
      }
      return { connected: false, phoneNumber: null };
    }
  } catch (err) {
    console.warn("[gowa] /devices/:id/status error:", err);
  }

  // ── Fallback 2: GET /app/status ─────────────────────────────────────
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

      if (r.is_logged_in === true || r.is_connected === true || r.connected === true) {
        const phone = extractPhone(r) ?? extractPhone(r?.user) ?? null;
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

export async function sendGowaMessage(
  to: string,
  message: string,
  token: string
): Promise<{ ok: boolean; status: number; body: string }> {
  try {
    const res = await fetch(`${GOWA_API_BASE}/send/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Device-Id": token,
        ...gowaAuthHeader(),
      },
      body: JSON.stringify({ phone: to, message }),
      signal: AbortSignal.timeout(10000),
    });

    const body = await res.text().catch(() => "");
    if (!res.ok) {
      console.error(
        `[gowa] /send/message failed (${res.status}):`,
        body.slice(0, 500)
      );
    }
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    console.error("[gowa] /send/message error:", err);
    return { ok: false, status: 0, body: String(err) };
  }
}
