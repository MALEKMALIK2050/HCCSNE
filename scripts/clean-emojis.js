const fs = require('fs');
const path = require('path');

function cleanFile(relPath) {
  const filePath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.length;

  // Exact UI replacements for high-level elements
  const replacements = [
    // Header & Navigation Tabs
    ["<span>💬</span>\n                <span className=\"hidden sm:inline\">Messagerie</span>", "<span className=\"hidden sm:inline\">Messagerie</span>"],
    ["<span>💬</span>", ""],
    ["👤 Mon Profil & Photo", "Mon Profil & Dossier"],
    ["👤 Mon Profil", "Mon Profil"],
    ["🔒 Mon Mot de passe", "Sécurité & Mot de passe"],
    ["🔒 Mot de passe", "Sécurité & Mot de passe"],
    ["🏠 Vue d'ensemble & Outils", "Vue d'ensemble & Outils"],
    ["🏛️ Les 10 Commissions & Groupes", "Commissions & Groupes Spécialisés"],
    ["<span>🚀</span>\n                <span>{isAdmin || isCoordinator ? 'Tous les Projets Nationaux' : 'Projets de la Commission'}</span>", "<span>{isAdmin || isCoordinator ? 'Portefeuille des Projets Stratégiques' : 'Projets de la Commission'}</span>"],
    ["<span>🚀</span>", ""],
    ["📊 Statistiques Plateforme", "Statistiques Plateforme"],
    ["⚙️ Gestion des Outils", "Gestion des Outils"],
    ["👥 Membres, Chefs & Rôles", "Membres & Rôles"],

    // Banner & Badges
    ["✦ COORDINATEUR PRINCIPAL — SUPERVISION GLOBALE DU HCCSNE", "COORDINATION GÉNÉRALE — PRÉSIDENCE DU HCCSNE"],
    ["👑 CHEF DE COMMISSION :", "CHEF DE COMMISSION :"],
    ["⚙️ ESPACE D’ADMINISTRATION SYSTÈME", "ADMINISTRATION SYSTÈME"],
    ["👤 ESPACE MEMBRE SCIENTIFIQUE —", "ESPACE MEMBRE SCIENTIFIQUE —"],
    ["🛠️ Outils collaboratifs disponibles", "Outils Collaboratifs Souverains"],
    ["⚙️ Configurer les outils", "Configurer les outils"],
    ["🏛️ Les 10 Commissions Stratégiques & Salons de Travail", "Les 10 Commissions Stratégiques & Salons de Travail"],
    ["👑 Chef de Commission", "Chef de Commission"],
    ["✓ VOTRE GROUPE", "VOTRE COMMISSION"],
    ["✓ Valider l'accès", "Valider l'accès"],
    ["👑 Valider la nomination", "Confirmer la désignation"],
    ["👑 Nommer Chef", "Nommer Chef"],
    ["👑 Confirmer la nomination", "Confirmer la désignation"],
    ["— ✕ Retirer le chef désigné —", "— Retirer le chef désigné —"],

    // Profile & Dossier
    ["👤 Dossier Officiel du Membre & Formulaire Académique", "Dossier Officiel du Membre & Parcours Académique"],
    ["{uploadingPhoto ? '⏳' : '📷'}", "{uploadingPhoto ? 'Chargement...' : 'Modifier la photo'}"],
    ["<span>📷</span>", ""],
    ["👁️ Consulter", "Consulter"],
    ["{uploadingDoc === 'cv' ? 'Envoi...' : '🔄 Remplacer'}", "{uploadingDoc === 'cv' ? 'Envoi...' : 'Remplacer'}"],
    ["{uploadingDoc === 'lettre' ? 'Envoi...' : '🔄 Remplacer'}", "{uploadingDoc === 'lettre' ? 'Envoi...' : 'Remplacer'}"],
    ["<span>📤</span>", ""],
    ["<span>📎</span>", ""],
    ["🗑️", "Supprimer"],
    ["✕ Supprimer", "Supprimer"],
    ["➔ Présent (En cours)", "Présent (En cours)"],
    ["🔒 Modifier mon mot de passe", "Modifier mon mot de passe"],
    ["<span>{savingProfile ? 'Enregistrement en cours...' : '💾 Enregistrer et publier mon profil officiel'}</span>", "<span>{savingProfile ? 'Enregistrement en cours...' : 'Enregistrer et publier mon profil officiel'}</span>"],
    ["💾 Enregistrer et publier mon profil officiel", "Enregistrer et publier mon profil officiel"],
    ["🔄 Actualiser", "Actualiser"],
    ["⚙️ Gestion & Contrôle des Outils Collaboratifs", "Gestion & Contrôle des Outils Collaboratifs"],
    ["👥 Membres, Chefs de Groupes & Commissions", "Membres, Chefs de Groupes & Commissions"],
    ["📊 Statistiques globales de la plateforme", "Statistiques globales de la plateforme"],
    ["placeholder=\"🔍 Nom, email...\"", "placeholder=\"Rechercher par nom, email...\""],
    ["<option value=\"ADMIN\">⚙️ Administrateur</option>", "<option value=\"ADMIN\">Administrateur</option>"],
    ["<option value=\"COORDINATOR\">✦ Coordinateur Principal</option>", "<option value=\"COORDINATOR\">Coordinateur Principal</option>"],
    ["<option value=\"MEMBER\">👤 Membre</option>", "<option value=\"MEMBER\">Membre Scientifique</option>"],
    ["📋 Liste déroulante des membres", "Liste des membres"],
    ["➕ Créer un nouveau compte", "Créer un nouveau compte"],
    ["💡 Pré-remplir avec la personnalité suggérée :", "Personnalité suggérée :"],
  ];

  let replacedCount = 0;
  replacements.forEach(([target, rep]) => {
    if (content.includes(target)) {
      content = content.split(target).join(rep);
      replacedCount++;
    }
  });

  // Clean specific emoji unicode spans like <span style={{ fontSize: '1.2rem' }}>🏛️</span>
  content = content.replace(/<span style=\{\{[^}]+\}\}>[🏛🎓📁📄✉📜🏢📝🔒✅⚠️👑👥]<\/span>/gu, '');
  content = content.replace(/<div style=\{\{ fontSize: '1\.8rem', marginBottom: '0\.5rem' \}\}>[👥👑🏛️📄]<\/div>/gu, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned ${relPath}: ${replacedCount} patterns replaced, len diff: ${originalLength - content.length}`);
}

cleanFile('pages/dashboard/index.js');
cleanFile('pages/dashboard/projets.js');
