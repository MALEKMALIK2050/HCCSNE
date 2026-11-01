import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée' });
  }

  const userId = parseInt(tokenUser.id);

  try {
    const { docType, diplomeId } = req.body;

    if (!['cv', 'lettre', 'diplome'].includes(docType)) {
      return res.status(400).json({ success: false, error: 'Type de document invalide' });
    }

    let updateData = {};

    if (docType === 'cv') {
      updateData = {
        cvUrl: null,
        cvFilename: null,
      };
    } else if (docType === 'lettre') {
      updateData = {
        lettreMotivationUrl: null,
        lettreMotivationFilename: null,
      };
    } else if (docType === 'diplome') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      let existingDiplomes = [];
      try {
        if (currentUser?.diplomesDocuments) {
          existingDiplomes = typeof currentUser.diplomesDocuments === 'string'
            ? JSON.parse(currentUser.diplomesDocuments)
            : currentUser.diplomesDocuments;
        }
      } catch {}

      if (diplomeId) {
        existingDiplomes = existingDiplomes.filter(d => String(d.id) !== String(diplomeId));
      }

      updateData = {
        diplomesDocuments: JSON.stringify(existingDiplomes),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        cvUrl: true,
        cvFilename: true,
        lettreMotivationUrl: true,
        lettreMotivationFilename: true,
        diplomesDocuments: true,
        pourcentageCompletion: true,
      },
    });

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Document supprimé avec succès',
    });
  } catch (error) {
    console.error('Delete Document Error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la suppression du document' });
  }
}
