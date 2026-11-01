import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { DEFAULT_PROJECT_MILESTONES, calculateProgressFromMilestones, determineStatusFromProgress } from '@/lib/projects-config';
import { SPECIALTY_ROOM_MAP } from '@/lib/specialties';

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

  const userId = parseInt(tokenUser.id);
  const userRole = tokenUser.role; // ADMIN | COORDINATOR | LEADER | MEMBER

  // -----------------------------------------------------------------
  // GET: List Strategic Projects
  // -----------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const { specialite, statut, priorite, search, myCommissionOnly } = req.query;

      const whereClause = {};

      // Filter by commission/specialty if specified
      if (specialite) {
        whereClause.specialite = specialite;
      } else if (myCommissionOnly === 'true' && userRole !== 'ADMIN' && userRole !== 'COORDINATOR') {
        if (tokenUser.specialite) {
          whereClause.specialite = tokenUser.specialite;
        }
      }

      if (statut) {
        whereClause.statut = statut;
      }

      if (priorite) {
        whereClause.priorite = priorite;
      }

      if (search) {
        const q = String(search).trim();
        whereClause.OR = [
          { titre: { contains: q } },
          { code: { contains: q } },
          { specialite: { contains: q } },
          { objectifs: { contains: q } },
          { universitesAlge: { contains: q } },
          { entreprisesAlge: { contains: q } },
        ];
      }

      const projects = await prisma.project.findMany({
        where: whereClause,
        include: {
          leader: {
            select: { id: true, nom: true, prenom: true, email: true, photo: true, institution: true },
          },
          createdBy: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
          documents: true,
        },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      });

      // Calculate Global Stats
      const allProjectsForStats = await prisma.project.findMany({
        select: { id: true, statut: true, avancement: true, budgetDZD: true, budgetDevises: true, specialite: true },
      });

      const totalDZD = allProjectsForStats.reduce((sum, p) => sum + (p.budgetDZD || 0), 0);
      const totalDevises = allProjectsForStats.reduce((sum, p) => sum + (p.budgetDevises || 0), 0);
      const avgProgress = allProjectsForStats.length > 0
        ? Math.round(allProjectsForStats.reduce((sum, p) => sum + (p.avancement || 0), 0) / allProjectsForStats.length)
        : 0;

      const stats = {
        totalProjects: allProjectsForStats.length,
        totalDZD,
        totalDevises,
        avgProgress,
        byStatus: {
          IDEATION: allProjectsForStats.filter((p) => p.statut === 'IDEATION').length,
          CONSORTIUM: allProjectsForStats.filter((p) => p.statut === 'CONSORTIUM').length,
          VALIDATION_CONSEIL: allProjectsForStats.filter((p) => p.statut === 'VALIDATION_CONSEIL').length,
          APPEL_OFFRES: allProjectsForStats.filter((p) => p.statut === 'APPEL_OFFRES').length,
          EN_REALISATION: allProjectsForStats.filter((p) => p.statut === 'EN_REALISATION').length,
          FINALISE: allProjectsForStats.filter((p) => p.statut === 'FINALISE').length,
        },
      };

      return res.status(200).json({
        success: true,
        projects,
        stats,
        userRole,
        userSpecialite: tokenUser.specialite,
      });
    } catch (error) {
      console.error('Projects GET Error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors du chargement des projets stratégiques' });
    }
  }

  // -----------------------------------------------------------------
  // POST: Create a New Strategic Project
  // -----------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      const {
        titre,
        specialite,
        priorite = 'STRATEGIQUE',
        objectifs,
        tdrTexte,
        impactSouverainete,
        universitesAlge,
        universitesEtrang,
        entreprisesAlge,
        entreprisesEtrang,
        ministeresTutelle,
        modeleEconomique,
        typePassation,
        impactEconomique,
        budgetDZD = 0,
        budgetDevises = 0,
        devise = 'EUR',
        sourcesFinancement,
        dureeMois = 24,
        dateDebut,
        dateFin,
        customMilestones,
        leaderId,
      } = req.body;

      if (!titre || !specialite) {
        return res.status(400).json({ success: false, error: 'Le titre et la commission sont requis.' });
      }

      // Check permission: Only Chef de Commission (LEADER of this commission), COORDINATOR, or ADMIN can create projects
      const canCreate =
        userRole === 'ADMIN' ||
        userRole === 'COORDINATOR' ||
        (userRole === 'LEADER' && specialite.trim() === tokenUser.specialite);

      if (!canCreate) {
        return res.status(403).json({
          success: false,
          error: 'Seul le Chef de Commission (ou la Coordination Générale) est habilité à initier et créer un nouveau projet pour cette commission.',
        });
      }

      // Generate unique code e.g. PRJ-ENERGIE-2026-042
      const specSlug = specialite
        .substring(0, 5)
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
      const count = await prisma.project.count();
      const code = `PRJ-${specSlug || 'STRAT'}-2026-${String(count + 1).padStart(3, '0')}`;

      // Resolve room ID for the commission
      const roomId = SPECIALTY_ROOM_MAP[specialite] || null;

      // Initialize milestones
      const milestonesToUse = Array.isArray(customMilestones) && customMilestones.length > 0
        ? customMilestones
        : DEFAULT_PROJECT_MILESTONES.map((m, idx) => ({
            ...m,
            completed: idx === 0, // First milestone "Cadrage préliminaire" completed by default
            completedAt: idx === 0 ? new Date().toISOString().split('T')[0] : null,
            note: idx === 0 ? 'Fiche de cadrage initialisée sur le portail.' : '',
          }));

      const progress = calculateProgressFromMilestones(milestonesToUse);
      const status = determineStatusFromProgress(progress);

      // Find suitable leader
      let designatedLeaderId = leaderId ? parseInt(leaderId) : null;
      if (!designatedLeaderId) {
        // If current user is leader or member of this commission, or coordinator
        designatedLeaderId = userId;
      }

      const newProject = await prisma.project.create({
        data: {
          code,
          titre: titre.trim(),
          specialite: specialite.trim(),
          roomId,
          leaderId: designatedLeaderId,
          createdById: userId,
          statut: status,
          avancement: progress,
          priorite,
          objectifs: objectifs ? objectifs.trim() : null,
          tdrTexte: tdrTexte ? tdrTexte.trim() : null,
          impactSouverainete: impactSouverainete ? impactSouverainete.trim() : null,
          universitesAlge: universitesAlge ? universitesAlge.trim() : null,
          universitesEtrang: universitesEtrang ? universitesEtrang.trim() : null,
          entreprisesAlge: entreprisesAlge ? entreprisesAlge.trim() : null,
          entreprisesEtrang: entreprisesEtrang ? entreprisesEtrang.trim() : null,
          ministeresTutelle: ministeresTutelle ? ministeresTutelle.trim() : null,
          modeleEconomique: modeleEconomique ? modeleEconomique.trim() : null,
          typePassation: typePassation ? typePassation.trim() : null,
          impactEconomique: impactEconomique ? impactEconomique.trim() : null,
          budgetDZD: Number(budgetDZD) || 0,
          budgetDevises: Number(budgetDevises) || 0,
          devise: devise || 'EUR',
          sourcesFinancement: sourcesFinancement ? sourcesFinancement.trim() : null,
          dureeMois: Number(dureeMois) || 24,
          dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
          dateFin: dateFin ? new Date(dateFin) : null,
          jalons: JSON.stringify(milestonesToUse),
        },
        include: {
          leader: {
            select: { id: true, nom: true, prenom: true, email: true, photo: true },
          },
          createdBy: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
        },
      });

      return res.status(201).json({
        success: true,
        project: newProject,
        message: `Fiche de projet stratégique "${newProject.titre}" créée avec succès (${newProject.code}) !`,
      });
    } catch (error) {
      console.error('Projects POST Error:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la création du projet : ' + error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
}
