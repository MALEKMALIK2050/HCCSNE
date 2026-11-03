const { PrismaClient: SqliteClient } = require('@prisma/client');
const { PrismaClient: PgClient } = require('../lib/prisma-client-v3/index.js');

const sqlite = new SqliteClient();
const pg = new PgClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('--- Migrating from SQLite to Supabase PostgreSQL ---');

  // 1. Migrate Rooms
  const rooms = await sqlite.room.findMany();
  console.log(`Found ${rooms.length} rooms in SQLite.`);
  for (const r of rooms) {
    await pg.room.upsert({
      where: { id: r.id },
      update: { name: r.name, description: r.description, isPrivate: r.isPrivate },
      create: { id: r.id, name: r.name, description: r.description, isPrivate: r.isPrivate, createdAt: r.createdAt }
    });
  }
  console.log('✅ Rooms migrated.');

  // 2. Migrate Users
  const users = await sqlite.user.findMany();
  console.log(`Found ${users.length} users in SQLite.`);
  for (const u of users) {
    const { id, createdAt, updatedAt, ...rest } = u;
    await pg.user.upsert({
      where: { email: u.email },
      update: { ...rest },
      create: { id: u.id, ...rest, createdAt: u.createdAt, updatedAt: u.updatedAt }
    });
  }
  console.log('✅ Users migrated.');

  // 3. Migrate RoomMembers
  const roomMembers = await sqlite.roomMember.findMany();
  console.log(`Found ${roomMembers.length} room members in SQLite.`);
  for (const rm of roomMembers) {
    await pg.roomMember.upsert({
      where: { userId_roomId: { userId: rm.userId, roomId: rm.roomId } },
      update: { role: rm.role },
      create: { userId: rm.userId, roomId: rm.roomId, role: rm.role, joinedAt: rm.joinedAt }
    });
  }
  console.log('✅ RoomMembers migrated.');

  // 4. Migrate Messages
  const messages = await sqlite.message.findMany();
  console.log(`Found ${messages.length} messages in SQLite.`);
  for (const m of messages) {
    await pg.message.upsert({
      where: { id: m.id },
      update: { content: m.content },
      create: { id: m.id, content: m.content, userId: m.userId, roomId: m.roomId, createdAt: m.createdAt }
    });
  }
  console.log('✅ Messages migrated.');

  // Check counts in Supabase
  const pgUsersCount = await pg.user.count();
  const pgRoomsCount = await pg.room.count();
  console.log(`\n🎉 Verification Supabase: ${pgUsersCount} users and ${pgRoomsCount} rooms are now active!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await sqlite.$disconnect();
    await pg.$disconnect();
  });
