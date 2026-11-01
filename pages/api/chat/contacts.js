import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée' });
  }

  try {
    const userId = parseInt(tokenUser.id);

    // 1. Get current full user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        specialite: true,
        photo: true,
        institution: true,
        pays: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
    }

    // 2. Load Rooms
    // Room 1: General Assembly (all members)
    const generalRoom = await prisma.room.findUnique({
      where: { id: 1 },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: { select: { id: true, nom: true, prenom: true, role: true } },
          },
        },
      },
    });

    // Check permissions
    const canBroadcast = ['ADMIN', 'COORDINATOR'].includes(currentUser.role);

    // Get specialty rooms
    // If ADMIN or COORDINATOR: all rooms (id: 2 to 11)
    // If LEADER or MEMBER: rooms they are member of
    let userRoomMemberships = [];
    if (currentUser.role === 'ADMIN' || currentUser.role === 'COORDINATOR') {
      userRoomMemberships = await prisma.room.findMany({
        where: { id: { gt: 1 } },
        orderBy: { id: 'asc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              user: { select: { id: true, nom: true, prenom: true, role: true } },
            },
          },
          members: {
            include: {
              user: { select: { id: true, nom: true, prenom: true, role: true, photo: true, specialite: true } },
            },
          },
        },
      });
    } else {
      const memberships = await prisma.roomMember.findMany({
        where: {
          userId,
          roomId: { gt: 1 },
        },
        include: {
          room: {
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: {
                  user: { select: { id: true, nom: true, prenom: true, role: true } },
                },
              },
              members: {
                include: {
                  user: { select: { id: true, nom: true, prenom: true, role: true, photo: true, specialite: true } },
                },
              },
            },
          },
        },
      });
      userRoomMemberships = memberships.map(m => m.room);
    }

    // 3. Load all other members (Contacts)
    const allUsers = await prisma.user.findMany({
      where: {
        active: true,
        id: { not: userId },
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        specialite: true,
        photo: true,
        institution: true,
        pays: true,
      },
      orderBy: [
        { role: 'asc' },
        { nom: 'asc' },
      ],
    });

    // Calculate unread counts for each contact and get last interaction
    const contactsWithStats = await Promise.all(
      allUsers.map(async (contact) => {
        const unreadCount = await prisma.message.count({
          where: {
            userId: contact.id,
            recipientId: userId,
            lu: false,
          },
        });

        const lastMsg = await prisma.message.findFirst({
          where: {
            OR: [
              { userId, recipientId: contact.id },
              { userId: contact.id, recipientId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true,
          },
        });

        return {
          ...contact,
          unreadCount,
          lastMessage: lastMsg ? {
            id: lastMsg.id,
            content: lastMsg.content,
            createdAt: lastMsg.createdAt,
            isMe: lastMsg.userId === userId,
          } : null,
        };
      })
    );

    // Sort contacts: those with unread messages first, then by last interaction, then by role/name
    contactsWithStats.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return 0;
    });

    // Format Channels list
    const generalChannel = generalRoom ? {
      id: `room_${generalRoom.id}`,
      roomId: generalRoom.id,
      name: 'Assemblée Générale (Tous les Membres)',
      shortName: 'Assemblée Générale',
      description: 'Espace officiel transversal pour tous les membres du Conseil',
      badge: '📢 Plénière',
      isGeneral: true,
      canBroadcast,
      lastMessage: generalRoom.messages[0] || null,
    } : null;

    const commissionChannels = userRoomMemberships.map((r) => ({
      id: `room_${r.id}`,
      roomId: r.id,
      name: r.name,
      shortName: r.name.replace(/^Commission\s*/i, ''),
      description: r.description,
      badge: '🏛️ Commission',
      isGeneral: false,
      memberCount: r.members ? r.members.length : 0,
      membersList: r.members ? r.members.map(m => m.user) : [],
      lastMessage: r.messages && r.messages[0] ? r.messages[0] : null,
    }));

    return res.status(200).json({
      success: true,
      currentUser,
      channels: {
        general: generalChannel,
        commissions: commissionChannels,
      },
      contacts: contactsWithStats,
    });

  } catch (error) {
    console.error('API CHAT CONTACTS ERROR:', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur lors du chargement des contacts' });
  }
}
