import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import {
  notifyPrivateMessage,
  notifyGeneralBroadcast,
  notifySpecialtyCommission,
} from '@/lib/chat-notifications';

export default async function handler(req, res) {
  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée' });
  }

  const userId = parseInt(tokenUser.id);

  // -------------------------------------------------------------
  // GET: Fetch messages
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const { type, contactId, roomId } = req.query;

      if (type === 'private') {
        if (!contactId) {
          return res.status(400).json({ success: false, error: 'contactId requis pour les messages privés' });
        }
        const otherUserId = parseInt(contactId);

        // Fetch conversation messages
        const messages = await prisma.message.findMany({
          where: {
            roomId: null,
            OR: [
              { userId, recipientId: otherUserId },
              { userId: otherUserId, recipientId: userId },
            ],
          },
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                role: true,
                specialite: true,
                photo: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        // Mark unread messages sent by contact to current user as read
        await prisma.message.updateMany({
          where: {
            userId: otherUserId,
            recipientId: userId,
            lu: false,
          },
          data: { lu: true },
        });

        return res.status(200).json({ success: true, messages });

      } else if (type === 'room') {
        if (!roomId) {
          return res.status(400).json({ success: false, error: 'roomId requis pour les salons' });
        }
        const targetRoomId = parseInt(roomId);

        // Verify authorization for room
        const room = await prisma.room.findUnique({
          where: { id: targetRoomId },
        });

        if (!room) {
          return res.status(404).json({ success: false, error: 'Salon de commission introuvable' });
        }

        // Room 1 (General Assembly) is accessible to all authenticated members
        if (targetRoomId !== 1 && !['ADMIN', 'COORDINATOR'].includes(tokenUser.role)) {
          const membership = await prisma.roomMember.findUnique({
            where: {
              userId_roomId: { userId, roomId: targetRoomId },
            },
          });
          if (!membership) {
            return res.status(403).json({ success: false, error: 'Accès non autorisé à cette commission' });
          }
        }

        const messages = await prisma.message.findMany({
          where: { roomId: targetRoomId },
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                role: true,
                specialite: true,
                photo: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        return res.status(200).json({ success: true, messages, room });

      } else {
        return res.status(400).json({ success: false, error: 'Type invalide (doit être "private" ou "room")' });
      }

    } catch (error) {
      console.error('API CHAT GET ERROR:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des messages' });
    }
  }

  // -------------------------------------------------------------
  // POST: Send new message
  // -------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      const { type, content, contactId, recipientId, roomId, notifyEmail } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Le contenu du message ne peut être vide' });
      }

      const cleanContent = content.trim();

      // Get full current user sender info
      const sender = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          specialite: true,
          photo: true,
        },
      });

      // 1. Private Message
      if (type === 'private') {
        const targetUserId = parseInt(recipientId || contactId);
        if (!targetUserId) {
          return res.status(400).json({ success: false, error: 'Destinataire non spécifié' });
        }

        const recipient = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true, email: true, nom: true, prenom: true },
        });

        if (!recipient) {
          return res.status(404).json({ success: false, error: 'Membre destinataire introuvable' });
        }

        const newMessage = await prisma.message.create({
          data: {
            content: cleanContent,
            userId,
            recipientId: targetUserId,
            roomId: null,
            lu: false,
          },
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                role: true,
                specialite: true,
                photo: true,
              },
            },
          },
        });

        // Trigger email notification (defaults to true for private messages)
        if (notifyEmail !== false) {
          notifyPrivateMessage({
            recipientId: targetUserId,
            sender,
            content: cleanContent,
          }).catch(err => console.error('Email alert private message failed:', err));
        }

        return res.status(201).json({ success: true, message: newMessage });

      // 2. Room / Commission / Broadcast Message
      } else if (type === 'room') {
        const targetRoomId = parseInt(roomId);
        if (!targetRoomId) {
          return res.status(400).json({ success: false, error: 'Identifiant de commission manquant' });
        }

        const room = await prisma.room.findUnique({
          where: { id: targetRoomId },
        });

        if (!room) {
          return res.status(404).json({ success: false, error: 'Commission ou salon introuvable' });
        }

        // Room 1: General Assembly
        if (targetRoomId === 1) {
          // Check permissions: Admin and Coordinator can broadcast to all
          // Leaders can also post official announcements
          const canBroadcast = ['ADMIN', 'COORDINATOR'].includes(sender.role);

          const newMessage = await prisma.message.create({
            data: {
              content: cleanContent,
              userId,
              roomId: 1,
              recipientId: null,
              lu: false,
            },
            include: {
              user: {
                select: {
                  id: true,
                  nom: true,
                  prenom: true,
                  role: true,
                  specialite: true,
                  photo: true,
                },
              },
            },
          });

          // If notifyEmail requested or if Admin/Coordinator broadcast
          if (notifyEmail === true || (canBroadcast && notifyEmail !== false)) {
            notifyGeneralBroadcast({
              sender,
              content: cleanContent,
            }).catch(err => console.error('Email alert general broadcast failed:', err));
          }

          return res.status(201).json({ success: true, message: newMessage });

        // Specialty Commission Rooms (id: 2 to 11)
        } else {
          // Check if user is member of room or Admin/Coordinator
          if (!['ADMIN', 'COORDINATOR'].includes(sender.role)) {
            const membership = await prisma.roomMember.findUnique({
              where: { userId_roomId: { userId, roomId: targetRoomId } },
            });
            if (!membership) {
              return res.status(403).json({ success: false, error: 'Vous ne faites pas partie de cette commission' });
            }
          }

          const newMessage = await prisma.message.create({
            data: {
              content: cleanContent,
              userId,
              roomId: targetRoomId,
              recipientId: null,
              lu: false,
            },
            include: {
              user: {
                select: {
                  id: true,
                  nom: true,
                  prenom: true,
                  role: true,
                  specialite: true,
                  photo: true,
                },
              },
            },
          });

          // Email notification to other members of the commission if requested
          if (notifyEmail === true) {
            notifySpecialtyCommission({
              roomId: targetRoomId,
              roomName: room.name,
              sender,
              content: cleanContent,
            }).catch(err => console.error('Email alert commission failed:', err));
          }

          return res.status(201).json({ success: true, message: newMessage });
        }

      } else {
        return res.status(400).json({ success: false, error: 'Type invalide' });
      }

    } catch (error) {
      console.error('API CHAT POST ERROR:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de l’envoi du message' });
    }
  }

  return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
}
