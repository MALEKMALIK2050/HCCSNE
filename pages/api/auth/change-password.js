import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const authUser = verifyToken(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Non authentifié. Veuillez vous reconnecter.' });
  }

  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Le mot de passe actuel est incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: 'Votre mot de passe a été modifié avec succès !',
    });
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error);
    return res.status(500).json({ error: 'Erreur interne lors de la mise à jour du mot de passe.' });
  }
}

