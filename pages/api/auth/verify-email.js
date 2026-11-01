import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token manquant' });

  try {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return res.redirect('/login?error=token_invalide');

    await prisma.user.update({
      where: { id: user.id },
      data: { active: true, verificationToken: null },
    });

    return res.redirect('/login?verified=true');
  } catch (error) {
    console.error('VERIFY EMAIL ERROR:', error);
    return res.redirect('/login?error=erreur_serveur');
  }
}
