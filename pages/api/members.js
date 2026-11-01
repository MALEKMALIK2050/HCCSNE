import prisma from '@/lib/prisma';
import { members } from '@/lib/members';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    const dbUsers = await prisma.user.findMany({
      where: { active: true },
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
        role: true,
        diplome: true,
        universite: true,
        exploitsAcademiques: true,
        carrieres: true,
        scholarUrl: true,
        orcidUrl: true,
      },
    });

    const userByEmail = new Map();
    const userByName = new Map();

    for (const u of dbUsers) {
      if (u.email) userByEmail.set(u.email.toLowerCase(), u);
      const fullName = `${u.prenom} ${u.nom}`.toLowerCase().trim();
      userByName.set(fullName, u);
    }

    const merged = members.map((m) => {
      const match =
        (m.email && userByEmail.get(m.email.toLowerCase())) ||
        userByName.get((m.nom || '').toLowerCase().trim());

      if (match) {
        return {
          ...m,
          image: match.photo || m.image,
          photo: match.photo || m.image,
          institution: match.institution || m.institution,
          pays: match.pays || m.pays,
          disciplineDesc: match.bio || m.disciplineDesc,
          specialite: match.specialite || m.specialite,
          diplome: match.diplome || null,
          universite: match.universite || m.institution,
          exploitsAcademiques: match.exploitsAcademiques || null,
          carrieres: match.carrieres || null,
          scholarUrl: match.scholarUrl || null,
          orcidUrl: match.orcidUrl || null,
        };
      }

      return {
        ...m,
        photo: m.image,
      };
    });

    return res.status(200).json({ success: true, members: merged });
  } catch (error) {
    console.error('API MEMBERS ERROR:', error);
    // Fallback to static members
    return res.status(200).json({ success: true, members });
  }
}
