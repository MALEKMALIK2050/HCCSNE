import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ success: true }); // Security

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpires: new Date(Date.now() + 3600000) },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    await sendEmail({
      to: email,
      subject: '🔐 HCCSNE — Réinitialisation de mot de passe',
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:2rem;"><div style="background:linear-gradient(135deg,#006233,#009950);padding:2rem;border-radius:12px;text-align:center;margin-bottom:2rem;"><h1 style="color:white;margin:0;">HCCSNE</h1></div><p>Cliquez ci-dessous pour réinitialiser votre mot de passe :</p><div style="text-align:center;margin:2rem 0;"><a href="' + baseUrl + '/reset-password?token=' + resetToken + '" style="background:#D21034;color:white;padding:1rem 2.5rem;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Réinitialiser</a></div><p style="color:#94a3b8;font-size:0.8rem;">Ce lien expire dans 1 heure.</p></div>',
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
