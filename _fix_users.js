const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({ select: { id: true, email: true, role: true, active: true } });
  console.log('Users:', JSON.stringify(users, null, 2));
  
  // Fix: activate all seed users
  await p.user.updateMany({ where: { active: false }, data: { active: true } });
  console.log('All users activated!');
  
  const updated = await p.user.findMany({ select: { id: true, email: true, active: true } });
  console.log('After fix:', JSON.stringify(updated, null, 2));
}

main().catch(console.error).finally(() => p.$disconnect());
