import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { calculateProgressFromMilestones, determineStatusFromProgress } from '@/lib/projects-config';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée' });
  }

  const { id } = req.query;
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    return res.status(400).json({ success: false, error: 'Identifiant invalide' });
  }

  try {
    const { milestoneId, completed, note } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    // Check if user is authorized to work on this project (Member/Leader of this commission, or Admin/Coordinator)
    const canWorkOnProject =
      tokenUser.role === 'ADMIN' ||
      tokenUser.role === 'COORDINATOR' ||
      project.specialite === tokenUser.specialite;

    if (!canWorkOnProject) {
      return res.status(403).json({
        success: false,
        error: 'Vous ne pouvez intervenir et valider les jalons que sur les projets relevant de votre propre commission.',
      });
    }

    let milestones = [];
    try {
      milestones = typeof project.jalons === 'string' ? JSON.parse(project.jalons) : project.jalons;
    } catch {}

    if (!Array.isArray(milestones)) {
      milestones = [];
    }

    // Update the specific milestone
    const targetIdx = milestones.findIndex((m) => String(m.id) === String(milestoneId));
    if (targetIdx !== -1) {
      const isNowCompleted = completed !== undefined ? Boolean(completed) : !milestones[targetIdx].completed;
      milestones[targetIdx].completed = isNowCompleted;
      milestones[targetIdx].completedAt = isNowCompleted ? new Date().toISOString().split('T')[0] : null;
      if (note !== undefined) {
        milestones[targetIdx].note = note;
      }
    }

    // Recalculate progress
    const newProgress = calculateProgressFromMilestones(milestones);
    const newStatus = determineStatusFromProgress(newProgress);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        jalons: JSON.stringify(milestones),
        avancement: newProgress,
        statut: newStatus,
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
      newProgress,
      newStatus,
      message: `Jalon #${milestoneId} mis à jour : Avancement global à ${newProgress}%`,
    });
  } catch (error) {
    console.error('Toggle Milestone Error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du jalon' });
  }
}
