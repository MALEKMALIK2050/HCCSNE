const { PrismaClient } = require('../lib/prisma-client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'zerhouni@hccsne.dz' } });
    console.log('User found id:', user?.id);
    console.log('User fields:', user ? Object.keys(user) : 'null');

    // Try selecting all fields that profile/index.js selects
    const testSelect = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        photo: true,
        specialite: true,
        institution: true,
        pays: true,
        bio: true,
        phone: true,
        role: true,
        active: true,
        diplome: true,
        universite: true,
        anneeDiplome: true,
        exploitsAcademiques: true,
        carrieres: true,
        scholarUrl: true,
        orcidUrl: true,
        cvUrl: true,
        cvFilename: true,
        lettreMotivationUrl: true,
        lettreMotivationFilename: true,
        diplomesDocuments: true,
        profilComplet: true,
        pourcentageCompletion: true,
        createdAt: true,
      },
    });
    console.log('Select successful! id:', testSelect.id);
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
