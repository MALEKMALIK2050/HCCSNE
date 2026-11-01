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

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  const tokenUser = verifyToken(req);
  if (!tokenUser) {
    return res.status(401).json({ success: false, error: 'Session non authentifiée' });
  }

  const { id } = req.query;
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    return res.status(400).json({ success: false, error: 'Identifiant invalide' });
  }

  const userId = parseInt(tokenUser.id);

  try {
    const { file, title, type = 'TDR', filename: originalFilename } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier transmis' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    // Check if user is authorized to upload documents to this project
    const canUpload =
      tokenUser.role === 'ADMIN' ||
      tokenUser.role === 'COORDINATOR' ||
      project.specialite === tokenUser.specialite;

    if (!canUpload) {
      return res.status(403).json({
        success: false,
        error: 'Vous ne pouvez déposer des documents (TDR, études) que sur les projets de votre commission.',
      });
    }

    // Parse Data URI
    const matches = file.match(/^data:([A-Za-z-+\/.]+);base64,([\s\S]+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: 'Format de fichier base64 invalide' });
    }

    let ext = '.pdf';
    const mime = matches[1].toLowerCase();
    if (mime.includes('word') || mime.includes('document')) ext = '.docx';
    else if (mime.includes('msword')) ext = '.doc';
    else if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
    else if (mime.includes('png')) ext = '.png';
    else if (originalFilename && originalFilename.includes('.')) {
      ext = path.extname(originalFilename).toLowerCase();
    }

    const buffer = Buffer.from(matches[2].replace(/\s+/g, ''), 'base64');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const cleanBase = originalFilename
      ? path.basename(originalFilename, path.extname(originalFilename)).replace(/[^a-zA-Z0-9_-]/g, '_')
      : 'doc';
    const savedFilename = `prj-${projectId}-${Date.now()}-${cleanBase}${ext}`;
    const filePath = path.join(uploadDir, savedFilename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/projects/${savedFilename}`;
    const displayFilename = originalFilename || savedFilename;

    // Create ProjectDocument record
    const docRecord = await prisma.projectDocument.create({
      data: {
        projectId,
        title: title || displayFilename,
        filename: displayFilename,
        fileUrl,
        type,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: { id: true, nom: true, prenom: true },
        },
      },
    });

    // If type is TDR, also update the main project TDR fields
    let updatedProject = project;
    if (type === 'TDR' || !project.tdrFichierUrl) {
      updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          tdrFichierUrl: fileUrl,
          tdrFichierNom: displayFilename,
        },
        include: {
          leader: {
            select: { id: true, nom: true, prenom: true, email: true, photo: true },
          },
          createdBy: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
          documents: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      fileUrl,
      filename: displayFilename,
      document: docRecord,
      project: updatedProject,
      message: 'Document de projet téléversé et rattaché avec succès !',
    });
  } catch (error) {
    console.error('Upload Project Document Error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de l’enregistrement du document' });
  }
}
