import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée' });
  }

  // Strictly reserved for the General Coordinator (NOT Admin, NOT Leader, NOT Member)
  if (tokenUser.role !== 'COORDINATOR') {
    return res.status(403).json({
      success: false,
      error: 'Seul le Coordinateur Général (Pr. Elias Zerhouni) dispose des prérogatives pour émettre un avis officiel et valider les fiches de projets stratégiques.',
    });
  }

  const { id } = req.query;
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    return res.status(400).json({ success: false, error: 'Identifiant de projet invalide' });
  }

  try {
    const { avisCoordinateur, statutValidationCoordinateur } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return res.status(404).json({ success: false, error: 'Projet stratégique introuvable' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        avisCoordinateur: avisCoordinateur !== undefined ? avisCoordinateur.trim() : existingProject.avisCoordinateur,
        statutValidationCoordinateur: statutValidationCoordinateur || existingProject.statutValidationCoordinateur || 'VALIDE',
        dateValidationCoordinateur: new Date(),
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
      message: 'Avis officiel et décision de la Coordination Générale enregistrés avec succès.',
    });
  } catch (error) {
    console.error('Coordinator Review API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l’enregistrement de l’avis du coordinateur : ' + error.message,
    });
  }
}
