import prisma from "./src/lib/utils/prisma";

async function main() {
  try {
    const count = await prisma.businessIntent.count();
    console.log("BusinessIntent count:", count);
    const businesses = await prisma.business.findMany({ take: 1 });
    console.log("First business:", businesses[0]?.id);
  } catch (err) {
    console.error("Prisma check failed:", err);
  }
}

main();
