import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');

function syncWithMembersJs(email, photoUrl) {
  try {
    const membersPath = path.join(process.cwd(), 'lib', 'members.js');
    if (!fs.existsSync(membersPath)) return;

    let content = fs.readFileSync(membersPath, 'utf8');
    const emailClean = (email || '').toLowerCase().trim();

    // Regex 1: email appears before image
    const regex1 = new RegExp(`("email":\\s*"${emailClean}"[\\s\\S]*?"image":\\s*")[^"]*(")`, 'i');
    if (regex1.test(content)) {
      content = content.replace(regex1, `$1${photoUrl}$2`);
      fs.writeFileSync(membersPath, content, 'utf8');
      console.log(`✅ Synchronized photo in lib/members.js for ${email}`);
      return;
    }

    // Regex 2: image appears before email
    const regex2 = new RegExp(`("image":\\s*")[^"]*("[\\s\\S]*?"email":\\s*"${emailClean}")`, 'i');
    if (regex2.test(content)) {
      content = content.replace(regex2, `$1${photoUrl}$2`);
      fs.writeFileSync(membersPath, content, 'utf8');
      console.log(`✅ Synchronized photo (alt regex) in lib/members.js for ${email}`);
    }
  } catch (err) {
    console.error('Failed to sync members.js:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée. Veuillez vous reconnecter.' });
  }

  try {
    const { image, userId: targetUserId } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, error: 'Aucune donnée d’image reçue' });
    }

    let userId = parseInt(tokenUser.id);
    if (targetUserId && tokenUser.role === 'ADMIN') {
      userId = parseInt(targetUserId);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
    }

    let buffer;
    let ext = '.jpg';

    if (image.startsWith('http://') || image.startsWith('https://')) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { photo: image },
      });
      syncWithMembersJs(user.email, image);
      return res.status(200).json({
        success: true,
        photoUrl: image,
        user: updatedUser,
        message: 'Photo mise à jour !',
      });
    }

    // Robust base64 parser: handles data URI with or without mime, with newlines or spaces
    const dataUriMatch = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,([\s\S]+)$/i) ||
                         image.match(/^data:application\/octet-stream;base64,([\s\S]+)$/i) ||
                         image.match(/^data:[^;]+;base64,([\s\S]+)$/i);

    let rawBase64 = '';
    if (dataUriMatch) {
      const mimeSub = (dataUriMatch[1] || '').toLowerCase();
      if (mimeSub.includes('png')) ext = '.png';
      else if (mimeSub.includes('webp')) ext = '.webp';
      else if (mimeSub.includes('gif')) ext = '.gif';
      else ext = '.jpg';

      rawBase64 = dataUriMatch[dataUriMatch.length - 1].replace(/\s+/g, '');
    } else {
      rawBase64 = image.replace(/\s+/g, '');
    }

    try {
      buffer = Buffer.from(rawBase64, 'base64');
    } catch {
      return res.status(400).json({ success: false, error: 'Format base64 corrompu' });
    }

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'Fichier image vide' });
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `member-${userId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const photoUrl = `/uploads/profiles/${filename}`;

    // Clean up old local profile photo if it exists and is not default
    if (user.photo && user.photo.startsWith('/uploads/profiles/') && !user.photo.includes('elias-zerhouni')) {
      const oldPath = path.join(process.cwd(), 'public', user.photo);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch {}
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { photo: photoUrl },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        specialite: true,
        institution: true,
        pays: true,
        bio: true,
        photo: true,
      },
    });

    syncWithMembersJs(user.email, photoUrl);

    return res.status(200).json({
      success: true,
      photoUrl,
      user: updatedUser,
      message: 'Photo officielle mise à jour et diffusée avec succès !',
    });
  } catch (error) {
    console.error('Upload Photo Error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de l’enregistrement de la photo : ' + (error.message || error) });
  }
}
