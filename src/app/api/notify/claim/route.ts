import {
  buildWhatsAppWebDeepLink,
  claimHandover,
} from "@/lib/utils/notifications/assignment";

function htmlPage(title: string, body: string): Response {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1c1917; padding: 1.5rem; }
  .card { background: #fff; border: 1px solid #e7e5e4; border-radius: 16px; padding: 2rem; max-width: 360px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
  h1 { font-size: 1.2rem; margin: 0 0 .6rem; }
  p { color: #57534e; font-size: .95rem; margin: 0; line-height: 1.55; }
</style>
</head>
<body><div class="card">${body}</div></body>
</html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return htmlPage(
      "Link tidak berlaku",
      "<h1>Link tidak berlaku</h1><p>Token tidak ditemukan pada link ini.</p>",
    );
  }

  try {
    const result = await claimHandover(token);

    if (result.status === "claimed") {
      return Response.redirect(buildWhatsAppWebDeepLink(result.customerPhone), 302);
    }

    if (result.status === "reassigned") {
      return htmlPage(
        "Sudah dialihkan",
        "<h1>↪️ Sudah dialihkan</h1><p>Lead ini sudah dialihkan ke admin lain karena belum sempat ditangani. Tidak perlu tindakan dari kamu.</p>",
      );
    }

    if (result.status === "already_handled") {
      return htmlPage(
        "Sudah ditangani",
        "<h1>✅ Sudah ditangani</h1><p>Percakapan ini sudah ditangani admin lain.</p>",
      );
    }

    return htmlPage(
      "Link tidak berlaku",
      "<h1>Link tidak berlaku</h1><p>Link ini sudah tidak valid.</p>",
    );
  } catch (error) {
    console.error("[notify] Claim failed:", error);
    return htmlPage(
      "Terjadi kesalahan",
      "<h1>Terjadi kesalahan</h1><p>Gagal memproses permintaan. Coba lagi sebentar.</p>",
    );
  }
}
