import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

function calculateCompletion(user) {
  let score = 0;
  if (user.nom && user.prenom) score += 15;
  if (user.photo) score += 15;
  if (user.institution && user.pays) score += 15;
  if (user.diplome && user.universite) score += 15;
  if (user.exploitsAcademiques && user.exploitsAcademiques.trim().length > 10) score += 15;
  if (user.bio && user.bio.trim().length > 10) score += 10;
  if (user.cvUrl) score += 10;
  if (user.lettreMotivationUrl) score += 5;
  let hasCareers = false;
  try {
    const list = typeof user.carrieres === 'string' ? JSON.parse(user.carrieres) : user.carrieres;
    if (Array.isArray(list) && list.some(p => p.titre || p.organisme)) hasCareers = true;
  } catch {}
  if (hasCareers) score += 10;
  return Math.min(100, score);
}

export default async function handler(req, res) {
  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée' });
  }

  const userId = parseInt(tokenUser.id);

  // -------------------------------------------------------------
  // GET: Current user profile
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
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

      if (!user) {
        return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
      }

      const score = calculateCompletion(user);

      return res.status(200).json({
        success: true,
        user: {
          ...user,
          pourcentageCompletion: score,
          profilComplet: score >= 75,
        },
      });
    } catch (error) {
      console.error('Profile GET Error:', error);
      return res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }

  // -------------------------------------------------------------
  // PUT: Update user profile (exploits, diplômes, carrières)
  // -------------------------------------------------------------
  if (req.method === 'PUT') {
    try {
      const {
        nom,
        prenom,
        institution,
        pays,
        bio,
        phone,
        specialite,
        diplome,
        universite,
        anneeDiplome,
        exploitsAcademiques,
        carrieres,
        scholarUrl,
        orcidUrl,
      } = req.body;

      // Serialize carrieres if it is an object/array
      const carrieresString =
        typeof carrieres === 'object' ? JSON.stringify(carrieres) : carrieres;

      const dataToUpdate = {
        ...(nom !== undefined && { nom: nom.trim() }),
        ...(prenom !== undefined && { prenom: prenom.trim() }),
        ...(institution !== undefined && { institution: institution.trim() }),
        ...(pays !== undefined && { pays: pays.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(specialite !== undefined && { specialite: specialite.trim() }),
        ...(diplome !== undefined && { diplome: diplome.trim() }),
        ...(universite !== undefined && { universite: universite.trim() }),
        ...(anneeDiplome !== undefined && { anneeDiplome: anneeDiplome.trim() }),
        ...(exploitsAcademiques !== undefined && { exploitsAcademiques: exploitsAcademiques.trim() }),
        ...(carrieresString !== undefined && { carrieres: carrieresString }),
        ...(scholarUrl !== undefined && { scholarUrl: scholarUrl.trim() }),
        ...(orcidUrl !== undefined && { orcidUrl: orcidUrl.trim() }),
      };

      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      const mergedForCalc = { ...existingUser, ...dataToUpdate };
      const score = calculateCompletion(mergedForCalc);

      dataToUpdate.pourcentageCompletion = score;
      dataToUpdate.profilComplet = score >= 75;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
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
        },
      });

      // Synchronize changes to lib/members.js if member exists
      try {
        const membersPath = path.join(process.cwd(), 'lib', 'members.js');
        if (fs.existsSync(membersPath)) {
          let content = fs.readFileSync(membersPath, 'utf8');
          if (bio && updatedUser.email) {
            const bioRegex = new RegExp(`("email":\\s*"${updatedUser.email}"[\\s\\S]*?"disciplineDesc":\\s*")[^"]*(")`);
            if (bioRegex.test(content)) {
              content = content.replace(bioRegex, `$1${bio.replace(/"/g, '\\"')}$2`);
              fs.writeFileSync(membersPath, content, 'utf8');
            }
          }
        }
      } catch (syncErr) {
        console.error('Sync to members.js error:', syncErr);
      }

      return res.status(200).json({
        success: true,
        user: updatedUser,
        message: 'Profil officiel enregistré et synchronisé avec succès !',
      });

    } catch (error) {
      console.error('Profile PUT Error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du profil' });
    }
  }

  return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
}
