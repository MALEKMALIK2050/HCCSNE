const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../lib/prisma-client/index.js');
const prisma = new PrismaClient();

async function main() {
  const photoUrl = '/uploads/profiles/elias-zerhouni.jpg';

  console.log('1. Updating SQLite user zerhouni@hccsne.dz...');
  const user = await prisma.user.findFirst({
    where: { email: 'zerhouni@hccsne.dz' },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { photo: photoUrl },
    });
    console.log('SQLite user updated with photo:', photoUrl);
  } else {
    console.log('User zerhouni@hccsne.dz not found in DB');
  }

  console.log('2. Updating lib/members.js...');
  const membersPath = path.join(process.cwd(), 'lib', 'members.js');
  let content = fs.readFileSync(membersPath, 'utf8');

  // Replace image for Elias Zerhouni
  const regex = /("nom":\s*"Elias Zerhouni"[\s\S]*?"image":\s*")[^"]*(")/;
  if (regex.test(content)) {
    content = content.replace(regex, `$1${photoUrl}$2`);
    fs.writeFileSync(membersPath, content, 'utf8');
    console.log('lib/members.js updated for Elias Zerhouni!');
  } else {
    console.log('Could not find Elias Zerhouni image entry with regex');
  }

  await prisma.$disconnect();
  console.log('Done!');
}

main().catch(console.error);
