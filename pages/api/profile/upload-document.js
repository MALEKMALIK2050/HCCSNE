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

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée' });
  }

  const userId = parseInt(tokenUser.id);

  try {
    const { file, docType, filename: originalFilename, title } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier transmis' });
    }

    if (!['cv', 'lettre', 'diplome'].includes(docType)) {
      return res.status(400).json({ success: false, error: 'Type de document invalide (doit être cv, lettre ou diplome)' });
    }

    // Parse Data URI
    const matches = file.match(/^data:([A-Za-z-+\/.]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: 'Format de fichier base64 invalide' });
    }

    const mime = matches[1].toLowerCase();
    let ext = '.pdf';

    if (mime.includes('pdf')) ext = '.pdf';
    else if (mime.includes('word') || mime.includes('document')) ext = '.docx';
    else if (mime.includes('msword')) ext = '.doc';
    else if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
    else if (mime.includes('png')) ext = '.png';
    else if (mime.includes('webp')) ext = '.webp';
    else {
      // Check original extension
      if (originalFilename && originalFilename.includes('.')) {
        ext = path.extname(originalFilename).toLowerCase();
      } else {
        return res.status(400).json({ success: false, error: 'Format non supporté (autorisés: PDF, Word DOCX/DOC, JPG, PNG)' });
      }
    }

    const buffer = Buffer.from(matches[2], 'base64');

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const cleanBaseName = originalFilename
      ? path.basename(originalFilename, path.extname(originalFilename)).replace(/[^a-zA-Z0-9_-]/g, '_')
      : docType;

    const savedFilename = `${docType}-${userId}-${Date.now()}-${cleanBaseName}${ext}`;
    const filePath = path.join(uploadDir, savedFilename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/documents/${savedFilename}`;
    const displayFilename = originalFilename || savedFilename;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    let updateData = {};

    if (docType === 'cv') {
      updateData = {
        cvUrl: fileUrl,
        cvFilename: displayFilename,
      };
    } else if (docType === 'lettre') {
      updateData = {
        lettreMotivationUrl: fileUrl,
        lettreMotivationFilename: displayFilename,
      };
    } else if (docType === 'diplome') {
      let existingDiplomes = [];
      try {
        if (currentUser?.diplomesDocuments) {
          existingDiplomes = typeof currentUser.diplomesDocuments === 'string'
            ? JSON.parse(currentUser.diplomesDocuments)
            : currentUser.diplomesDocuments;
        }
      } catch {}

      const newDiplomeItem = {
        id: Date.now(),
        title: title || displayFilename,
        filename: displayFilename,
        fileUrl,
        uploadedAt: new Date().toISOString(),
      };

      existingDiplomes.push(newDiplomeItem);
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
      },
    });

    return res.status(200).json({
      success: true,
      fileUrl,
      filename: displayFilename,
      user: updatedUser,
      message: 'Document officiel téléversé et rattaché avec succès !',
    });

  } catch (error) {
    console.error('Upload Document Error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de l’enregistrement du document' });
  }
}
