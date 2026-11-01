import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Non authentifié' });
  }

  try {
    const userId = parseInt(tokenUser.id);

    // Total unread private messages
    const unreadCount = await prisma.message.count({
      where: {
        recipientId: userId,
        lu: false,
      },
    });

    return res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error('API CHAT UNREAD COUNT ERROR:', error);
    return res.status(500).json({ success: false, error: 'Erreur' });
  }
}
