import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateToken, setTokenCookie } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

    if (!user.active) return res.status(403).json({ error: 'Compte non activé. Vérifiez votre email.' });

    const token = generateToken(user);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, photo: user.photo, specialite: user.specialite },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
