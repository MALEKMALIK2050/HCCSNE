const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'pages/dashboard/index.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variable
const stateTarget = `  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'commissions' | 'stats' | 'tools' | 'users' | 'security'`;

const stateReplacement = `  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'commissions' | 'stats' | 'tools' | 'users' | 'security'
  const [projectCommissionFilter, setProjectCommissionFilter] = useState('');`;

if (!content.includes(stateTarget)) {
  console.error('State target not found');
  process.exit(1);
}
content = content.replace(stateTarget, stateReplacement);

// 2. Top nav tab projects reset
const topNavTarget = `<button
                onClick={() => setActiveTab('projects')}
                style={{
                  padding: '12px 14px',
                  fontSize: '0.88rem',
                  fontWeight: activeTab === 'projects' ? 700 : 500,
                  color: activeTab === 'projects' ? '#006233' : '#64748b',
                  borderBottom: activeTab === 'projects' ? '2.5px solid #006233' : '2.5px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{isAdmin || isCoordinator ? 'Portefeuille des Projets Stratégiques' : 'Projets de la Commission'}</span>
              </button>`;

const topNavReplacement = `<button
                onClick={() => {
                  setProjectCommissionFilter('');
                  setActiveTab('projects');
                }}
                style={{
                  padding: '12px 14px',
                  fontSize: '0.88rem',
                  fontWeight: activeTab === 'projects' ? 700 : 500,
                  color: activeTab === 'projects' ? '#006233' : '#64748b',
                  borderBottom: activeTab === 'projects' ? '2.5px solid #006233' : '2.5px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{isAdmin || isCoordinator ? 'Portefeuille des Projets Stratégiques' : 'Projets de la Commission'}</span>
              </button>`;

if (!content.includes(topNavTarget)) {
  console.error('Top nav target not found');
  process.exit(1);
}
content = content.replace(topNavTarget, topNavReplacement);

// 3. Commission card "Projets" button
const commissionCardBtnTarget = `                          <button
                            type="button"
                            onClick={() => setActiveTab('projects')}
                            style={{
                              flex: 1.2,
                              padding: '7px 10px',
                              background: '#ecfdf5',
                              color: '#006233',
                              border: '1px solid #006233',
                              borderRadius: 8,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                            }}
                          >
                            
                            <span>Projets</span>
                          </button>`;

const commissionCardBtnReplacement = `                          <button
                            type="button"
                            onClick={() => {
                              setProjectCommissionFilter(spec.name);
                              setActiveTab('projects');
                            }}
                            title={\`Voir uniquement les projets de la commission \${spec.name}\`}
                            style={{
                              flex: 1.2,
                              padding: '7px 10px',
                              background: '#ecfdf5',
                              color: '#006233',
                              border: '1px solid #006233',
                              borderRadius: 8,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                            }}
                          >
                            <span>Projets</span>
                          </button>`;

if (!content.includes(commissionCardBtnTarget)) {
  console.error('Commission card button target not found');
  process.exit(1);
}
content = content.replace(commissionCardBtnTarget, commissionCardBtnReplacement);

// 4. StrategicProjectsModule call in activeTab === 'projects'
const moduleTarget = `          {/* TAB: STRATEGIC PROJECTS MODULE */}
          {activeTab === 'projects' && (
            <StrategicProjectsModule
              user={user}
              onActionNotice={(n) => {
                setActionNotice(n);
                setTimeout(() => setActionNotice(null), 4000);
              }}
            />
          )}`;

const moduleReplacement = `          {/* TAB: STRATEGIC PROJECTS MODULE */}
          {activeTab === 'projects' && (
            <StrategicProjectsModule
              user={user}
              filterCommission={projectCommissionFilter}
              onClearCommissionFilter={() => setProjectCommissionFilter('')}
              onActionNotice={(n) => {
                setActionNotice(n);
                setTimeout(() => setActionNotice(null), 4000);
              }}
            />
          )}`;

if (!content.includes(moduleTarget)) {
  console.error('Module target not found');
  process.exit(1);
}
content = content.replace(moduleTarget, moduleReplacement);

// 5. In Stats table: make commission row clickable to filter
const statsCommRowTarget = `<td style={{ padding: '10px 12px', fontWeight: 700, color: '#006233' }}>
                                    {comm.name}
                                  </td>`;

const statsCommRowReplacement = `<td
                                    onClick={() => {
                                      setProjectCommissionFilter(comm.name);
                                      setActiveTab('projects');
                                    }}
                                    title={\`Voir les projets de \${comm.name}\`}
                                    style={{ padding: '10px 12px', fontWeight: 700, color: '#006233', cursor: 'pointer', textDecoration: 'underline' }}
                                  >
                                    {comm.name}
                                  </td>`;

if (content.includes(statsCommRowTarget)) {
  content = content.replace(statsCommRowTarget, statsCommRowReplacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Commission projects button & filter connection updated successfully in pages/dashboard/index.js');
