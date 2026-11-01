const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const SPECIALTY_ROOMS = [
  { id: 1, name: 'Assemblée Générale', description: 'Espace plénier et transversal pour tous les membres du Haut Conseil', isPrivate: false },
  { id: 2, name: 'Commission Intelligence Artificielle & Big Data', description: 'Modélisation IA, apprentissage automatique, Big Data et calcul haute performance', isPrivate: true },
  { id: 3, name: 'Commission Cybersécurité & Systèmes Embarqués', description: 'Sécurité des infrastructures critiques, cryptographie et souveraineté numérique', isPrivate: true },
  { id: 4, name: 'Commission Santé, Médecine & Biomédical', description: 'Technologies médicales, immunologie, oncologie, imagerie diagnostique et santé publique', isPrivate: true },
  { id: 5, name: 'Commission Sécurité Énergétique & Transition', description: 'Énergies renouvelables, hydrogène vert, stockage et technologies des batteries', isPrivate: true },
  { id: 6, name: 'Commission Sécurité Hydrique & Dessalement', description: 'Dessalement d’eau de mer, traitement des eaux usées et gestion durable des aquifères', isPrivate: true },
  { id: 7, name: 'Commission Sécurité Alimentaire & Agriculture', description: 'Agronomie de précision, biotechnologies végétales et résilience alimentaire', isPrivate: true },
  { id: 8, name: 'Commission Matériaux & Nanotechnologies', description: 'Microélectronique, semi-conducteurs, nanomatériaux et packaging de puces', isPrivate: true },
  { id: 9, name: 'Commission Biotechnologies & Pharmacie', description: 'Bio-ingénierie, synthèse moléculaire, vaccins et valorisation de la biomasse', isPrivate: true },
  { id: 10, name: 'Commission Environnement, Climat & Géosciences', description: 'Surveillance climatique, géophysique appliquée et valorisation des ressources', isPrivate: true },
  { id: 11, name: 'Commission Robotique, Mécanique & Aérospatial', description: 'Automatisation industrielle, mécatronique, robotique avancée et technologies aérospatiales', isPrivate: true },
];

async function main() {
  console.log('🌱 Seeding HCCSNE Commissions & Chefs de Spécialités...');

  // 1. Create all Rooms
  for (const r of SPECIALTY_ROOMS) {
    await prisma.room.upsert({
      where: { id: r.id },
      update: { name: r.name, description: r.description },
      create: r,
    });
  }
  console.log('✅ 11 Commissions / Salons initialisés.');

  const defaultPassword = await bcrypt.hash('membre123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 2. Admin
  await prisma.user.upsert({
    where: { email: 'admin@hccsne.dz' },
    update: { role: 'ADMIN', active: true },
    create: {
      email: 'admin@hccsne.dz',
      password: adminPassword,
      nom: 'Admin',
      prenom: 'HCCSNE',
      role: 'ADMIN',
      active: true,
      specialite: 'Administration & Coordination Technique',
    },
  });

  // 3. Coordinateur Principal: Elias Zerhouni
  const zerhouni = await prisma.user.upsert({
    where: { email: 'zerhouni@hccsne.dz' },
    update: { role: 'COORDINATOR', active: true, specialite: 'Santé, Médecine & Génie Biomédical' },
    create: {
      email: 'zerhouni@hccsne.dz',
      password: defaultPassword,
      nom: 'Zerhouni',
      prenom: 'Elias',
      role: 'COORDINATOR',
      active: true,
      specialite: 'Santé, Médecine & Génie Biomédical',
      institution: 'Johns Hopkins University',
      pays: 'États-Unis',
    },
  });

  // 4. Chefs de Spécialités (Homepage Members)
  const foundingLeaders = [
    {
      email: 'youcef-toumi@hccsne.dz',
      nom: 'Youcef-Toumi',
      prenom: 'Kamal',
      specialite: 'Génie Mécanique, Robotique & Aérospatial',
      institution: 'MIT',
      pays: 'États-Unis',
      roomId: 11,
    },
    {
      email: 'haba@hccsne.dz',
      nom: 'Haba',
      prenom: 'Belgacem',
      specialite: 'Science des Matériaux & Nanotechnologies',
      institution: 'Xperi Corp',
      pays: 'États-Unis',
      roomId: 8,
    },
    {
      email: 'zaghib@hccsne.dz',
      nom: 'Zaghib',
      prenom: 'Karim',
      specialite: 'Sécurité Énergétique & Transition',
      institution: 'McGill University',
      pays: 'Canada',
      roomId: 5,
    },
    {
      email: 'belkaid@hccsne.dz',
      nom: 'Belkaid',
      prenom: 'Yasmine',
      specialite: 'Santé, Médecine & Génie Biomédical',
      institution: 'Institut Pasteur',
      pays: 'France',
      roomId: 4,
    },
    {
      email: 'zeroug@hccsne.dz',
      nom: 'Zeroug',
      prenom: 'Smaine',
      specialite: 'Environnement, Climat & Géosciences',
      institution: 'Schlumberger',
      pays: 'États-Unis',
      roomId: 10,
    },
    {
      email: 'guerraoui@hccsne.dz',
      nom: 'Guerraoui',
      prenom: 'Rachid',
      specialite: 'Cybersécurité & Systèmes Embarqués',
      institution: 'EPFL',
      pays: 'Suisse',
      roomId: 3,
    },
  ];

  for (const leader of foundingLeaders) {
    const user = await prisma.user.upsert({
      where: { email: leader.email },
      update: { role: 'LEADER', active: true, specialite: leader.specialite, institution: leader.institution, pays: leader.pays },
      create: {
        email: leader.email,
        password: defaultPassword,
        nom: leader.nom,
        prenom: leader.prenom,
        role: 'LEADER',
        active: true,
        specialite: leader.specialite,
        institution: leader.institution,
        pays: leader.pays,
      },
    });

    // Enroll into General Assembly (room 1)
    await prisma.roomMember.upsert({
      where: { userId_roomId: { userId: user.id, roomId: 1 } },
      update: { role: 'LEADER' },
      create: { userId: user.id, roomId: 1, role: 'LEADER' },
    });

    // Enroll into Specialty Room as LEADER
    await prisma.roomMember.upsert({
      where: { userId_roomId: { userId: user.id, roomId: leader.roomId } },
      update: { role: 'LEADER' },
      create: { userId: user.id, roomId: leader.roomId, role: 'LEADER' },
    });
  }

  // Also enroll Zerhouni into General Assembly as COORDINATOR
  await prisma.roomMember.upsert({
    where: { userId_roomId: { userId: zerhouni.id, roomId: 1 } },
    update: { role: 'COORDINATOR' },
    create: { userId: zerhouni.id, roomId: 1, role: 'COORDINATOR' },
  });

  console.log('✅ Configuration terminée avec succès !');
}

main().catch(console.error).finally(() => prisma.$disconnect());
