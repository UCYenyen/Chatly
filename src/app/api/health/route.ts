import prisma from "@/lib/utils/prisma";

export async function GET() {
  const health = {
    status: "ok" as const,
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown" as "ok" | "failed" | "unknown",
      whatsapp: "unknown" as "ok" | "failed" | "unknown",
    },
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = "ok";
  } catch (err) {
    console.error("[health] Database check failed:", err);
    health.services.database = "failed";
  }

  // Check if at least one WhatsApp device is authenticated
  try {
    const authenticatedDevices = await prisma.whatsAppAuth.count({
      where: { status: "AUTHENTICATED" },
    });
    health.services.whatsapp = authenticatedDevices > 0 ? "ok" : "failed";
    if (authenticatedDevices === 0) {
      console.warn("[health] No authenticated WhatsApp devices found");
    }
  } catch (err) {
    console.error("[health] WhatsApp check failed:", err);
    health.services.whatsapp = "failed";
  }

  // Overall status: ok only if all services are ok
  const overallStatus =
    health.services.database === "ok" && health.services.whatsapp === "ok"
      ? 200
      : 503;

  return new Response(JSON.stringify(health), {
    status: overallStatus,
    headers: { "Content-Type": "application/json" },
  });
}
