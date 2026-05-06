import prisma from "../src/lib/utils/prisma";

async function main() {
  try {
    const businesses = await prisma.business.findMany({ take: 1 });
    const businessId = businesses[0]?.id;
    console.log("First business:", businessId);

    if (businessId) {
      const intents = await prisma.businessIntent.findMany({
        where: { businessId }
      });
      console.log("Intents for business:", intents.length);
    }
  } catch (err) {
    console.error("Prisma check failed:", err);
  }
}

main();
