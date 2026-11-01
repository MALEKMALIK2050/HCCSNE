import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';
import { getSpecialtyRoomId } from '@/lib/specialties';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const authUser = verifyToken(req);
  const canManage = authUser && (authUser.role === 'ADMIN' || authUser.role === 'COORDINATOR');
  if (!canManage) {
    return res.status(403).json({ error: 'Action réservée aux administrateurs et au coordinateur principal.' });
  }

  const { specialtyName, userId, newLeader, unassign } = req.body || {};

  if (!specialtyName) {
    return res.status(400).json({ error: 'Nom de la commission / spécialité requis.' });
  }

  try {
    const roomId = getSpecialtyRoomId(specialtyName);

    // Case 0: Unassign / Reset Leader of this Commission
    if (unassign || userId === 'NONE' || userId === '' || userId === null) {
      // Find current leaders of this specialty who are 'LEADER' (do not touch COORDINATOR or ADMIN)
      const prevLeaders = await prisma.user.findMany({
        where: { specialite: specialtyName, role: 'LEADER' },
        select: { id: true },
      });

      await prisma.user.updateMany({
        where: { specialite: specialtyName, role: 'LEADER' },
        data: { role: 'MEMBER' },
      });

      if (roomId) {
        for (const pl of prevLeaders) {
          await prisma.roomMember.updateMany({
            where: { userId: pl.id, roomId, role: 'LEADER' },
            data: { role: 'MEMBER' },
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `La direction de la commission "${specialtyName}" a été réinitialisée.`,
      });
    }

    let targetUser = null;

    // Case 1: Select an existing member to become Leader of this Commission
    if (userId) {
      targetUser = await prisma.user.update({
        where: { id: parseInt(userId, 10) },
        data: {
          role: 'LEADER',
          specialite: specialtyName,
          active: true,
        },
      });
    }
    // Case 2: Create a new Leader for this Commission directly
    else if (newLeader && newLeader.email && newLeader.nom && newLeader.prenom) {
      const email = newLeader.email.trim().toLowerCase();
      const defaultPassword = await bcrypt.hash('membre123', 10);

      targetUser = await prisma.user.upsert({
        where: { email },
        update: {
          role: 'LEADER',
          specialite: specialtyName,
          active: true,
          nom: newLeader.nom,
          prenom: newLeader.prenom,
          institution: newLeader.institution || null,
          pays: newLeader.pays || null,
        },
        create: {
          email,
          password: defaultPassword,
          nom: newLeader.nom,
          prenom: newLeader.prenom,
          role: 'LEADER',
          active: true,
          specialite: specialtyName,
          institution: newLeader.institution || null,
          pays: newLeader.pays || null,
        },
      });
    } else {
      return res.status(400).json({ error: 'Veuillez sélectionner un membre ou renseigner les informations du nouveau chef.' });
    }

    // Demote any OTHER user previously marked as LEADER of this specialty to MEMBER
    const previousLeaders = await prisma.user.findMany({
      where: {
        specialite: specialtyName,
        role: 'LEADER',
        id: { not: targetUser.id },
      },
      select: { id: true },
    });

    if (previousLeaders.length > 0) {
      await prisma.user.updateMany({
        where: {
          specialite: specialtyName,
          role: 'LEADER',
          id: { not: targetUser.id },
        },
        data: { role: 'MEMBER' },
      });
    }

    // Room synchronization
    if (roomId) {
      // Demote previous leaders in that room
      for (const pl of previousLeaders) {
        await prisma.roomMember.updateMany({
          where: { userId: pl.id, roomId, role: 'LEADER' },
          data: { role: 'MEMBER' },
        });
      }

      // Upsert target user as LEADER in commission room
      await prisma.roomMember.upsert({
        where: { userId_roomId: { userId: targetUser.id, roomId } },
        update: { role: 'LEADER' },
        create: { userId: targetUser.id, roomId, role: 'LEADER' },
      });

      // Also ensure enrollment in General Assembly (Room 1)
      await prisma.roomMember.upsert({
        where: { userId_roomId: { userId: targetUser.id, roomId: 1 } },
        update: { role: 'LEADER' },
        create: { userId: targetUser.id, roomId: 1, role: 'LEADER' },
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: `${targetUser.prenom} ${targetUser.nom} a été désigné(e) Chef de la commission "${specialtyName}".`,
      user: targetUser,
    });
  } catch (error) {
    console.error('ASSIGN LEADER ERROR:', error);
    return res.status(500).json({ error: 'Erreur lors de la désignation du chef de commission.', detail: error.message });
  }
}

