import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { calculateProgressFromMilestones, determineStatusFromProgress } from '@/lib/projects-config';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée' });
  }

  const { id } = req.query;
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    return res.status(400).json({ success: false, error: 'Identifiant de projet invalide' });
  }

  const userId = parseInt(tokenUser.id);
  const userRole = tokenUser.role;

  // -------------------------------------------------------------
  // GET: Single Project Details
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          leader: {
            select: { id: true, nom: true, prenom: true, email: true, photo: true, institution: true, specialite: true },
          },
          createdBy: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
          documents: {
            include: {
              uploadedBy: {
                select: { id: true, nom: true, prenom: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Projet introuvable' });
      }

      // Member privacy rule: If member is neither ADMIN nor COORDINATOR, and doesn't belong to this commission,
      // they only receive the high-level summary overview (no TDRs, financial specs, or confidential docs)
      if (userRole !== 'ADMIN' && userRole !== 'COORDINATOR' && project.specialite !== tokenUser.specialite) {
        return res.status(200).json({
          success: true,
          isRestricted: true,
          project: {
            id: project.id,
            code: project.code,
            titre: project.titre,
            specialite: project.specialite,
            statut: project.statut,
            avancement: project.avancement,
            priorite: project.priorite,
            dureeMois: project.dureeMois,
            leader: project.leader,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          },
        });
      }

      return res.status(200).json({ success: true, project });
    } catch (error) {
      console.error('Project GET Error:', error);
      return res.status(500).json({ success: false, error: 'Erreur serveur lors de la récupération du projet' });
    }
  }

  // -------------------------------------------------------------
  // PUT / PATCH: Update Project
  // -------------------------------------------------------------
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const existingProject = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!existingProject) {
        return res.status(404).json({ success: false, error: 'Projet introuvable' });
      }

      // Check permissions: Only Chef de Commission (LEADER of this commission), Coordinator, or Admin can modify
      const canEdit =
        userRole === 'ADMIN' ||
        userRole === 'COORDINATOR' ||
        (userRole === 'LEADER' && existingProject.specialite === tokenUser.specialite);

      if (!canEdit) {
        return res.status(403).json({
          success: false,
          error: 'Seul le Chef de cette Commission (ou la Coordination Générale) est habilité à modifier les paramètres de cette fiche projet.',
        });
      }

      const {
        titre,
        specialite,
        priorite,
        statut: manualStatut,
        avancement: manualAvancement,
        objectifs,
        tdrTexte,
        tdrFichierUrl,
        tdrFichierNom,
        impactSouverainete,
        universitesAlge,
        universitesEtrang,
        entreprisesAlge,
        entreprisesEtrang,
        ministeresTutelle,
        modeleEconomique,
        typePassation,
        impactEconomique,
        budgetDZD,
        budgetDevises,
        devise,
        sourcesFinancement,
        dureeMois,
        dateDebut,
        dateFin,
        jalons,
        leaderId,
      } = req.body;

      let computedAvancement = existingProject.avancement;
      let computedStatut = existingProject.statut;

      // If jalons array or string updated, recalculate progress automatically
      if (jalons !== undefined) {
        try {
          const parsedJalons = typeof jalons === 'string' ? JSON.parse(jalons) : jalons;
          if (Array.isArray(parsedJalons)) {
            computedAvancement = calculateProgressFromMilestones(parsedJalons);
            computedStatut = determineStatusFromProgress(computedAvancement);
          }
        } catch {}
      } else if (manualAvancement !== undefined) {
        computedAvancement = Number(manualAvancement);
        computedStatut = determineStatusFromProgress(computedAvancement);
      }

      if (manualStatut) {
        computedStatut = manualStatut;
      }

      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          ...(titre !== undefined && { titre: titre.trim() }),
          ...(specialite !== undefined && { specialite: specialite.trim() }),
          ...(priorite !== undefined && { priorite }),
          statut: computedStatut,
          avancement: computedAvancement,
          ...(objectifs !== undefined && { objectifs: objectifs ? objectifs.trim() : null }),
          ...(tdrTexte !== undefined && { tdrTexte: tdrTexte ? tdrTexte.trim() : null }),
          ...(tdrFichierUrl !== undefined && { tdrFichierUrl }),
          ...(tdrFichierNom !== undefined && { tdrFichierNom }),
          ...(impactSouverainete !== undefined && { impactSouverainete: impactSouverainete ? impactSouverainete.trim() : null }),
          ...(universitesAlge !== undefined && { universitesAlge: universitesAlge ? universitesAlge.trim() : null }),
          ...(universitesEtrang !== undefined && { universitesEtrang: universitesEtrang ? universitesEtrang.trim() : null }),
          ...(entreprisesAlge !== undefined && { entreprisesAlge: entreprisesAlge ? entreprisesAlge.trim() : null }),
          ...(entreprisesEtrang !== undefined && { entreprisesEtrang: entreprisesEtrang ? entreprisesEtrang.trim() : null }),
          ...(ministeresTutelle !== undefined && { ministeresTutelle: ministeresTutelle ? ministeresTutelle.trim() : null }),
          ...(modeleEconomique !== undefined && { modeleEconomique: modeleEconomique ? modeleEconomique.trim() : null }),
          ...(typePassation !== undefined && { typePassation: typePassation ? typePassation.trim() : null }),
          ...(impactEconomique !== undefined && { impactEconomique: impactEconomique ? impactEconomique.trim() : null }),
          ...(budgetDZD !== undefined && { budgetDZD: Number(budgetDZD) }),
          ...(budgetDevises !== undefined && { budgetDevises: Number(budgetDevises) }),
          ...(devise !== undefined && { devise }),
          ...(sourcesFinancement !== undefined && { sourcesFinancement: sourcesFinancement ? sourcesFinancement.trim() : null }),
          ...(dureeMois !== undefined && { dureeMois: Number(dureeMois) }),
          ...(dateDebut !== undefined && { dateDebut: dateDebut ? new Date(dateDebut) : null }),
          ...(dateFin !== undefined && { dateFin: dateFin ? new Date(dateFin) : null }),
          ...(jalons !== undefined && {
            jalons: typeof jalons === 'string' ? jalons : JSON.stringify(jalons),
          }),
          ...(leaderId !== undefined && { leaderId: leaderId ? parseInt(leaderId) : null }),
        },
        include: {
          leader: {
            select: { id: true, nom: true, prenom: true, email: true, photo: true },
          },
          createdBy: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
          documents: true,
        },
      });

      return res.status(200).json({
        success: true,
        project: updatedProject,
        message: 'Fiche projet mise à jour avec succès !',
      });
    } catch (error) {
      console.error('Project PUT Error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du projet : ' + error.message });
    }
  }

  // -------------------------------------------------------------
  // DELETE: Delete Project
  // -------------------------------------------------------------
  if (req.method === 'DELETE') {
    try {
      const existingProject = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!existingProject) {
        return res.status(404).json({ success: false, error: 'Projet introuvable' });
      }

      // Only Admin, Coordinator, or Chef of this Commission can delete
      const canDelete =
        userRole === 'ADMIN' ||
        userRole === 'COORDINATOR' ||
        (userRole === 'LEADER' && existingProject.specialite === tokenUser.specialite);

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          error: 'Seul le Chef de Commission habilité ou la Coordination Générale peuvent supprimer ce projet.',
        });
      }

      await prisma.project.delete({
        where: { id: projectId },
      });

      return res.status(200).json({
        success: true,
        message: `Projet "${existingProject.titre}" (${existingProject.code}) supprimé.`,
      });
    } catch (error) {
      console.error('Project DELETE Error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression du projet' });
    }
  }

  return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
}
