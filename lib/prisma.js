import { PrismaClient } from './prisma-client-v3/index.js';

let prisma;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma || !global.prisma._customClientV4) {
    if (global.prisma && global.prisma.$disconnect) {
      try { global.prisma.$disconnect(); } catch {}
    }
    global.prisma = new PrismaClient();
    global.prisma._customClientV4 = true;
  }
  prisma = global.prisma;
}
export default prisma;
