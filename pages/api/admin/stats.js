import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const authUser = verifyToken(req);
  const canManage = authUser && (authUser.role === 'ADMIN' || authUser.role === 'COORDINATOR');
  if (!canManage) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs et au coordinateur principal.' });
  }

  try {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      adminsCount,
      coordinatorsCount,
      leadersCount,
      membersCount,
      guestsCount,
      roomsCount,
      messagesCount,
      documentsCount,
      visioCount,
      forumCount,
      recentUsers,
      allProjects,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.user.count({ where: { active: false } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'COORDINATOR' } }),
      prisma.user.count({ where: { role: 'LEADER' } }),
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.user.count({ where: { role: 'GUEST' } }),
      prisma.room.count(),
      prisma.message.count(),
      prisma.document.count(),
      prisma.visioSession.count(),
      prisma.forumPost.count(),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          active: true,
          specialite: true,
          createdAt: true,
        },
      }),
      prisma.project.findMany({
        select: {
          id: true,
          code: true,
          titre: true,
          specialite: true,
          statut: true,
          avancement: true,
          priorite: true,
          modeleEconomique: true,
          typePassation: true,
          budgetDZD: true,
          budgetDevises: true,
          devise: true,
          statutValidationCoordinateur: true,
          avisCoordinateur: true,
          dateValidationCoordinateur: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Strategic Projects Analytics Aggregations
    const totalProjects = allProjects.length;
    const totalBudgetDZD = allProjects.reduce((sum, p) => sum + (p.budgetDZD || 0), 0);
    const totalBudgetDevises = allProjects.reduce((sum, p) => sum + (p.budgetDevises || 0), 0);
    const avgProgress = totalProjects > 0
      ? Math.round(allProjects.reduce((sum, p) => sum + (p.avancement || 0), 0) / totalProjects)
      : 0;

    const projectsByStatus = {
      IDEATION: allProjects.filter((p) => p.statut === 'IDEATION').length,
      CONSORTIUM: allProjects.filter((p) => p.statut === 'CONSORTIUM').length,
      VALIDATION_CONSEIL: allProjects.filter((p) => p.statut === 'VALIDATION_CONSEIL').length,
      APPEL_OFFRES: allProjects.filter((p) => p.statut === 'APPEL_OFFRES').length,
      EN_REALISATION: allProjects.filter((p) => p.statut === 'EN_REALISATION').length,
      FINALISE: allProjects.filter((p) => p.statut === 'FINALISE').length,
    };

    const projectsByCoordination = {
      VALIDE: allProjects.filter((p) => p.statutValidationCoordinateur === 'VALIDE').length,
      RESERVES: allProjects.filter((p) => p.statutValidationCoordinateur === 'RESERVES').length,
      REVISION: allProjects.filter((p) => p.statutValidationCoordinateur === 'REVISION').length,
      EN_ATTENTE: allProjects.filter((p) => !p.statutValidationCoordinateur || p.statutValidationCoordinateur === 'EN_ATTENTE').length,
    };

    const projectsByPriority = {
      STRATEGIQUE: allProjects.filter((p) => p.priorite === 'STRATEGIQUE').length,
      URGENT: allProjects.filter((p) => p.priorite === 'URGENT').length,
      STRUCTURANT: allProjects.filter((p) => p.priorite === 'STRUCTURANT').length,
    };

    // Grouping by Commission / Spécialité
    const commissionMap = {};
    allProjects.forEach((p) => {
      const spec = p.specialite || 'Non assignée';
      if (!commissionMap[spec]) {
        commissionMap[spec] = {
          name: spec,
          count: 0,
          totalProgress: 0,
          budgetDZD: 0,
          budgetDevises: 0,
          validCount: 0,
        };
      }
      commissionMap[spec].count += 1;
      commissionMap[spec].totalProgress += (p.avancement || 0);
      commissionMap[spec].budgetDZD += (p.budgetDZD || 0);
      commissionMap[spec].budgetDevises += (p.budgetDevises || 0);
      if (p.statutValidationCoordinateur === 'VALIDE') {
        commissionMap[spec].validCount += 1;
      }
    });

    const projectsByCommission = Object.values(commissionMap)
      .map((c) => ({
        ...c,
        avgProgress: c.count > 0 ? Math.round(c.totalProgress / c.count) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Recent updated projects (top 6)
    const recentProjects = allProjects.slice(0, 6).map((p) => ({
      id: p.id,
      code: p.code,
      titre: p.titre,
      specialite: p.specialite,
      statut: p.statut,
      avancement: p.avancement,
      priorite: p.priorite,
      statutValidationCoordinateur: p.statutValidationCoordinateur,
      updatedAt: p.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pending: pendingUsers,
          admins: adminsCount,
          coordinators: coordinatorsCount,
          leaders: leadersCount,
          members: membersCount,
          guests: guestsCount,
        },
        collaboration: {
          rooms: roomsCount,
          messages: messagesCount,
          documents: documentsCount,
          visioSessions: visioCount,
          forumPosts: forumCount,
        },
        projects: {
          total: totalProjects,
          totalBudgetDZD,
          totalBudgetDevises,
          avgProgress,
          byStatus: projectsByStatus,
          byCoordination: projectsByCoordination,
          byPriority: projectsByPriority,
          byCommission: projectsByCommission,
          recent: recentProjects,
        },
        recentUsers,
      },
    });
  } catch (error) {
    console.error('ADMIN STATS ERROR:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
  }
}
