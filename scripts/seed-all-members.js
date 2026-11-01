const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { members } = require('../lib/members');

const prisma = new PrismaClient();

// Commission mapping by specialty keywords
function getRoomIdForSpecialty(spec) {
  const s = (spec || '').toLowerCase();
  if (s.includes('intelligence') || s.includes('vision') || s.includes('cloud') || s.includes('informatique')) return 2; // IA
  if (s.includes('cybersécurité') || s.includes('signal') || s.includes('réseaux')) return 3; // Cyber
  if (s.includes('santé') || s.includes('biomédical') || s.includes('médecine') || s.includes('radiologie') || s.includes('immunologie') || s.includes('biophysique')) return 4; // Santé
  if (s.includes('énergie') || s.includes('batteries') || s.includes('chimie')) return 5; // Énergie
  if (s.includes('dessalement') || s.includes('eau') || s.includes('hydrique')) return 6; // Eau
  if (s.includes('agriculture') || s.includes('alimentaire') || s.includes('production animale') || s.includes('protéomique')) return 7; // Agri
  if (s.includes('matériaux') || s.includes('puces') || s.includes('physique quantique') || s.includes('photonique') || s.includes('génie civil')) return 8; // Matériaux
  if (s.includes('biologie') || s.includes('vaccinales') || s.includes('pharmacologie') || s.includes('génomique')) return 9; // Biotech
  if (s.includes('géophysique') || s.includes('climat') || s.includes('logistique') || s.includes('enseignement') || s.includes('environnement')) return 10; // Environnement
  if (s.includes('robotique') || s.includes('mécanique') || s.includes('mécatronique') || s.includes('aérospatial')) return 11; // Robotique
  return 2; // default IA
}

async function run() {
  console.log('Synchronizing all 30 members into database...');
  const defaultPassword = await bcrypt.hash('membre123', 10);

  for (const m of members) {
    const parts = m.nom.trim().split(' ');
    const prenom = parts[0];
    const nom = parts.slice(1).join(' ') || parts[0];
    const roomId = getRoomIdForSpecialty(m.specialite);

    let role = 'MEMBER';
    if (m.role === 'coordinator') role = 'COORDINATOR';
    else if (m.role === 'leader') role = 'LEADER';

    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {
        nom,
        prenom,
        photo: m.image,
        specialite: m.specialite,
        institution: m.institution,
        pays: m.pays,
        bio: m.disciplineDesc,
        active: true,
      },
      create: {
        email: m.email,
        password: defaultPassword,
        nom,
        prenom,
        photo: m.image,
        specialite: m.specialite,
        institution: m.institution,
        pays: m.pays,
        bio: m.disciplineDesc,
        role,
        active: true,
      },
    });

    // Room 1 (General Assembly)
    await prisma.roomMember.upsert({
      where: { userId_roomId: { userId: user.id, roomId: 1 } },
      update: { role: user.role },
      create: { userId: user.id, roomId: 1, role: user.role },
    });

    // Specialty Room
    await prisma.roomMember.upsert({
      where: { userId_roomId: { userId: user.id, roomId } },
      update: { role: user.role },
      create: { userId: user.id, roomId, role: user.role },
    });

    console.log(`Synced: ${user.prenom} ${user.nom} (${user.email}) -> Room ${roomId}`);
  }

  console.log('All members synchronized successfully!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
