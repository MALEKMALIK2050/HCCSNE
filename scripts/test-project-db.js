const { PrismaClient } = require('../lib/prisma-client-v2/index.js');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.project.count();
  console.log('Project table accessible! Current count:', count);
  await prisma.$disconnect();
}

main().catch(console.error);
