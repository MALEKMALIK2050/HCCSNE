import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';

const JWT_SECRET = process.env.JWT_SECRET || 'hccsne-secret-2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { nom, prenom, email, password, specialite, institution, pays } = req.body || {};
    if (email) email = email.trim().toLowerCase();

    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        nom, prenom, email,
        password: hashedPassword,
        role: 'PENDING',
        active: false,
        verificationToken,
        specialite: specialite || null,
        institution: institution || null,
        pays: pays || null,
      },
    });

    // Affectation automatique aux groupes (Assemblée Générale + Commission de spécialité)
    try {
      await prisma.roomMember.create({
        data: { userId: user.id, roomId: 1, role: 'MEMBER' },
      }).catch(() => {});

      if (specialite) {
        const keyword = specialite.split('&')[0].split(',')[0].trim();
        const specialtyRoom = await prisma.room.findFirst({
          where: {
            OR: [
              { name: { contains: keyword } },
              { description: { contains: keyword } },
            ],
          },
        });
        if (specialtyRoom && specialtyRoom.id !== 1) {
          await prisma.roomMember.create({
            data: { userId: user.id, roomId: specialtyRoom.id, role: 'MEMBER' },
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Room auto-enroll notice:', e.message);
    }

    // Email de vérification + notification admins (fire-and-forget pour ne pas bloquer la réponse)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const verificationLink = baseUrl + '/api/auth/verify-email?token=' + verificationToken;

    // Envoyer les emails en arrière-plan (ne bloque pas la réponse)
    const sendEmails = async () => {
      try {
        await sendEmail({
          to: user.email,
          subject: '🏛️ HCCSNE — Activez votre compte',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:2rem;background:#f8fafc;border-radius:12px;">
              <div style="background:linear-gradient(135deg,#006233,#009950);padding:2rem;border-radius:12px;text-align:center;margin-bottom:2rem;">
                <h1 style="color:white;margin:0;font-size:1.8rem;">🏛️ HCCSNE</h1>
                <p style="color:rgba(255,255,255,0.9);margin:0.5rem 0 0;">Haut Conseil de la Communauté Scientifique Nationale à l'Étranger</p>
              </div>
              <h2 style="color:#1e293b;">Bonjour ${prenom} ${nom},</h2>
              <p style="color:#475569;line-height:1.7;">Votre compte a été créé avec succès. Cliquez sur le bouton ci-dessous pour activer votre compte.</p>
              <div style="text-align:center;margin:2rem 0;background:#f0fdf4;padding:1.5rem;border-radius:8px;">
                <a href="${verificationLink}" style="background-color:#006233;color:#ffffff!important;padding:1rem 2.5rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:1.1rem;display:inline-block;">
                  Activer mon compte
                </a>
                <p style="color:#64748b;margin:1rem 0 0;font-size:0.8rem;">Ou copiez ce lien :<br/><span style="color:#006233;word-break:break-all;">${verificationLink}</span></p>
              </div>
              <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:1rem;margin:1.5rem 0;">
                <p style="margin:0;color:#92400e;font-size:0.9rem;">⏳ Ce lien est valable 24h.</p>
              </div>
              <div style="text-align:center;margin-top:2rem;padding-top:1rem;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:0.85rem;">HCCSNE — République Algérienne Démocratique et Populaire</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Email verification send error:', emailErr.message);
      }

      try {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN', active: true },
          select: { id: true, email: true, prenom: true },
        });

        for (const admin of admins) {
          await sendEmail({
            to: admin.email,
            subject: '🔔 Nouvelle demande d\'accès HCCSNE : ' + prenom + ' ' + nom,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:2rem;">
              <h2>Bonjour ${admin.prenom},</h2>
              <p>Une nouvelle demande d'accès a été soumise :</p>
              <ul><li><strong>Nom :</strong> ${prenom} ${nom}</li><li><strong>Email :</strong> ${email}</li>${specialite ? '<li><strong>Spécialité :</strong> ' + specialite + '</li>' : ''}${institution ? '<li><strong>Institution :</strong> ' + institution + '</li>' : ''}</ul>
              <div style="text-align:center;margin:2rem 0;"><a href="${baseUrl}/dashboard/admin?tab=users" style="background:#1e40af;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">👤 Gérer les utilisateurs</a></div>
            </div>`,
          }).catch(() => {});

          await prisma.notification.create({
            data: { userId: admin.id, type: 'NOUVEL_INSCRIT', titre: 'Nouvelle demande d\'accès', contenu: prenom + ' ' + nom + ' (' + email + ')', message: prenom + ' ' + nom + ' demande l\'accès au portail', lu: false },
          }).catch(() => {});
        }
      } catch (adminErr) {
        console.error('Admin notification error:', adminErr.message);
      }
    };

    // Fire-and-forget: ne pas attendre les emails
    sendEmails();

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.setHeader('Set-Cookie', 'token=' + token + '; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict');

    return res.status(201).json({
      success: true,
      message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
      user: { id: user.id, role: user.role, email: user.email },
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
}
