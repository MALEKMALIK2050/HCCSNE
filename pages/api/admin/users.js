import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getSpecialtyRoomId } from '@/lib/specialties';

export default async function handler(req, res) {
  const authUser = verifyToken(req);
  const canManage = authUser && (authUser.role === 'ADMIN' || authUser.role === 'COORDINATOR');
  if (!canManage) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs et au coordinateur principal.' });
  }

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          active: true,
          specialite: true,
          institution: true,
          pays: true,
          createdAt: true,
        },
      });
      return res.status(200).json({ success: true, users });
    } catch (error) {
      console.error('GET USERS ERROR:', error);
      return res.status(500).json({ error: 'Erreur lors du chargement des membres.' });
    }
  }

  if (req.method === 'PATCH') {
    const { userId, active, role, specialite } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'Identifiant utilisateur requis.' });
    }

    try {
      const dataToUpdate = {};
      if (typeof active === 'boolean') dataToUpdate.active = active;
      if (role && ['ADMIN', 'COORDINATOR', 'LEADER', 'MEMBER', 'GUEST', 'PENDING'].includes(role)) {
        dataToUpdate.role = role;
      }
      if (typeof specialite === 'string') {
        dataToUpdate.specialite = specialite;
      }

      const updated = await prisma.user.update({
        where: { id: parseInt(userId, 10) },
        data: dataToUpdate,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          active: true,
          specialite: true,
        },
      });

      // Synchroniser avec les Rooms si le rôle devient LEADER ou si la spécialité change
      if (updated.specialite) {
        const roomId = getSpecialtyRoomId(updated.specialite);
        if (roomId) {
          const roomRole = updated.role === 'LEADER' ? 'LEADER' : updated.role === 'COORDINATOR' ? 'COORDINATOR' : 'MEMBER';

          // Si promu LEADER, rétrograder les anciens chefs de ce même groupe
          if (updated.role === 'LEADER') {
            await prisma.user.updateMany({
              where: {
                specialite: updated.specialite,
                role: 'LEADER',
                id: { not: updated.id },
              },
              data: { role: 'MEMBER' },
            });
            await prisma.roomMember.updateMany({
              where: { roomId, userId: { not: updated.id }, role: 'LEADER' },
              data: { role: 'MEMBER' },
            });
          }

          await prisma.roomMember.upsert({
            where: { userId_roomId: { userId: updated.id, roomId } },
            update: { role: roomRole },
            create: { userId: updated.id, roomId, role: roomRole },
          }).catch(() => {});

          // Inscription Assemblée Générale (Room 1)
          await prisma.roomMember.upsert({
            where: { userId_roomId: { userId: updated.id, roomId: 1 } },
            update: { role: roomRole === 'LEADER' ? 'LEADER' : undefined },
            create: { userId: updated.id, roomId: 1, role: roomRole },
          }).catch(() => {});
        }
      }

      return res.status(200).json({ success: true, user: updated });
    } catch (error) {
      console.error('PATCH USER ERROR:', error);
      return res.status(500).json({ error: 'Erreur lors de la mise à jour de l’utilisateur.' });
    }
  }

  if (req.method === 'DELETE') {
    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'Identifiant utilisateur requis.' });
    }

    const id = parseInt(userId, 10);
    if (id === authUser.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte administrateur.' });
    }

    try {
      await prisma.user.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Utilisateur supprimé.' });
    } catch (error) {
      console.error('DELETE USER ERROR:', error);
      return res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}

