const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'pages/dashboard/index.js');
let content = fs.readFileSync(filePath, 'utf8');

const finalReplacements = [
  ["<option value=\"LEADER\">👑 Chef de Groupe</option>", "<option value=\"LEADER\">Chef de Groupe</option>"],
  ["<option value=\"GUEST\">🏷️ Invité</option>", "<option value=\"GUEST\">Invité</option>"],
  ["<optgroup label=\"🌐 Autres membres de la communauté\">", "<optgroup label=\"Autres membres de la communauté\">"],
  ["<optgroup label=\"🌐 Autres membres enregistrés\">", "<optgroup label=\"Autres membres enregistrés\">"],
  ["{u.role === 'LEADER' ? '👑 (Chef actuel)' : ''}", "{u.role === 'LEADER' ? '(Chef actuel)' : ''}"],
  ["{u.role === 'LEADER' ? ' 👑 (Chef)' : u.role === 'COORDINATOR' ? ' ✦ (Coord.)' : ''}", "{u.role === 'LEADER' ? ' (Chef)' : u.role === 'COORDINATOR' ? ' (Coord.)' : ''}"],
  ["{u.id === assignedLeader?.id ? '👑 ' : '⭐ '}", "{u.id === assignedLeader?.id ? '[Chef] ' : ''}"],
  ["✓ {assignedLeader.role === 'COORDINATOR' ? 'Coordinateur' : 'Désigné'}", "{assignedLeader.role === 'COORDINATOR' ? 'Coordinateur' : 'Désigné'}"],
  ["<div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🏛️</div>", ""],
  ["<span style={{ fontSize: '1.2rem' }}>⚠️</span>", ""],
  ["<span style={{ fontSize: '1.2rem' }}>🏛️</span>", ""],
  ["<span style={{ fontSize: '1.2rem' }}>✉️</span>", ""],
  ["✓ Déposé", "Document déposé"],
  ["✓ Déposée", "Lettre déposée"],
  ["✅ {pwdSuccess}", "{pwdSuccess}"],
  ["⚠️ {pwdError}", "{pwdError}"],
  ["<span style={{ fontSize: '2.2rem' }}>{leaderModal.specIcon || '👑'}</span>", ""],
  ["<div style={{ color: '#64748b' }}>✉️ {sel.email}</div>", "<div style={{ color: '#64748b' }}>{sel.email}</div>"],
  ["{sel.institution && <div style={{ color: '#64748b' }}>🏛️ {sel.institution} ({sel.pays || '—'})</div>}", "{sel.institution && <div style={{ color: '#64748b' }}>{sel.institution} ({sel.pays || '—'})</div>}"],
  ["<span style={{ fontSize: '1.3rem' }}>👑</span>", ""],
  ["<span style={{ fontSize: '1.2rem', marginRight: 4 }}>👑</span>", ""],
  ["<span style={{ fontSize: '1.4rem' }}>🔒</span>", ""],
];

finalReplacements.forEach(([tgt, rep]) => {
  content = content.split(tgt).join(rep);
});

// Remove any remaining standalone emoji characters
content = content.replace(/👑/gu, '');
content = content.replace(/🏛️/gu, '');
content = content.replace(/🔒/gu, '');
content = content.replace(/🔄/gu, '');
content = content.replace(/✕/gu, '×');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final emoji cleanup complete for pages/dashboard/index.js');
