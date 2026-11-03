const prisma = require('../lib/prisma').default;

async function fixSequences() {
  console.log('--- Fixing PostgreSQL sequences for all tables ---');
  
  const tables = [
    'User',
    'Room',
    'RoomMember',
    'Message',
    'Document',
    'ForumPost',
    'ForumReply',
    'WikiPage',
    'WikiEdit',
    'VisioSession',
    'VisioParticipant',
    'Notification',
    'Announcement',
    'Project',
    'ProjectDocument'
  ];

  for (const table of tables) {
    try {
      const result = await prisma.$queryRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(max(id), 1)) FROM "${table}";`
      );
      console.log(`✅ Sequence fixed for table "${table}":`, result);
    } catch (err) {
      console.warn(`⚠️ Table "${table}" sequence skipped:`, err.message);
    }
  }

  // Test creating a new user now
  console.log('\n--- Testing User Creation ---');
  const testEmail = 'test_registration_' + Date.now() + '@hccsne.dz';
  const newUser = await prisma.user.create({
    data: {
      email: testEmail,
      password: 'testPassword123',
      nom: 'TestNom',
      prenom: 'TestPrenom',
      role: 'PENDING',
      active: false
    }
  });

  console.log(`🎉 Success! New user created with auto-increment ID: ${newUser.id} (${newUser.email})`);

  // Clean up test user
  await prisma.user.delete({ where: { id: newUser.id } });
  console.log('🧹 Cleaned up test user successfully.');
}

fixSequences()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
