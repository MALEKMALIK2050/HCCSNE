import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/auth';

const CONFIG_PATH = path.join(process.cwd(), 'lib', 'tools-config.json');

function getToolsConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToolsConfig(tools) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(tools, null, 2), 'utf-8');
}

export default async function handler(req, res) {
  const authUser = verifyToken(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.method === 'GET') {
    const tools = getToolsConfig();
    return res.status(200).json({ success: true, tools });
  }

  if (req.method === 'PATCH') {
    const canManage = authUser && (authUser.role === 'ADMIN' || authUser.role === 'COORDINATOR');
    if (!canManage) {
      return res.status(403).json({ error: 'Action réservée aux administrateurs et au coordinateur principal.' });
    }

    const { toolId, enabled, name, description } = req.body || {};
    if (!toolId) {
      return res.status(400).json({ error: 'Identifiant d’outil requis.' });
    }

    const tools = getToolsConfig();
    const index = tools.findIndex(t => t.id === toolId);
    if (index === -1) {
      return res.status(404).json({ error: 'Outil introuvable.' });
    }

    if (typeof enabled === 'boolean') {
      tools[index].enabled = enabled;
    }
    if (name) {
      tools[index].name = name;
    }
    if (description) {
      tools[index].description = description;
    }

    saveToolsConfig(tools);
    return res.status(200).json({ success: true, tool: tools[index], tools });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}

