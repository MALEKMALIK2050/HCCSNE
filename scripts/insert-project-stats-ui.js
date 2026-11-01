const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'pages/dashboard/index.js');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `                      <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 10, color: '#991b1b' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>En attente</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.users.pending}</div>
                      </div>
                    </div>
                  </div>`;

if (!content.includes(targetStr)) {
  console.error('Target string not found in pages/dashboard/index.js');
  process.exit(1);
}

const projectStatsJSX = `
                  {/* ============================================================== */}
                  {/* SECTION : STATISTIQUES & ANALYSE DES PROJETS STRATÉGIQUES */}
                  {/* ============================================================== */}
                  {stats.projects && (
                    <div style={{ marginTop: '2.5rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '1.25rem',
                          borderBottom: '2.5px solid #006233',
                          paddingBottom: '0.65rem',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: '#006233',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}
                          >
                            Gouvernance & Portefeuille Stratégique • Décret N° 26-293
                          </span>
                          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                            Statistiques des Projets Stratégiques Nationaux
                          </h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                            Indicateurs consolidés d'arbitrage de la Coordination Générale, des engagements budgétaires et de l'état d'avancement par commission.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab('projects')}
                          style={{
                            padding: '8px 16px',
                            background: '#006233',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Accéder au Portefeuille Complet →
                        </button>
                      </div>

                      {/* 4 Key Performance Metrics for Projects */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '1.25rem',
                          marginBottom: '2rem',
                        }}
                      >
                        {/* Total Projects */}
                        <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Projets au Portefeuille
                          </div>
                          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#006233', margin: '4px 0' }}>
                            {stats.projects.total}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                            {(stats.projects.byStatus?.EN_REALISATION || 0) + (stats.projects.byStatus?.FINALISE || 0)} en phase active / pilote
                          </div>
                        </div>

                        {/* Avancement Moyen */}
                        <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Avancement National Moyen
                          </div>
                          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                            {stats.projects.avgProgress}%
                          </div>
                          <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden', marginTop: 4 }}>
                            <div style={{ width: \`\${stats.projects.avgProgress}%\`, height: '100%', background: '#006233', borderRadius: 6 }} />
                          </div>
                        </div>

                        {/* Budget Mobilisé DZD */}
                        <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Enveloppe Budgétaire (DZD)
                          </div>
                          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                            {(stats.projects.totalBudgetDZD / 1000000).toLocaleString('fr-FR')} M
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 600 }}>
                            Devises : {(stats.projects.totalBudgetDevises / 1000000).toLocaleString('fr-FR')} M $/€
                          </div>
                        </div>

                        {/* Arbitrage Coordination */}
                        <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Arbitrage Coordination Générale
                          </div>
                          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#15803d', margin: '4px 0' }}>
                            {stats.projects.byCoordination?.VALIDE || 0}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                            {stats.projects.byCoordination?.RESERVES || 0} avec réserves • {stats.projects.byCoordination?.EN_ATTENTE || 0} en instruction
                          </div>
                        </div>
                      </div>

                      {/* Double Analytical Panels: Statuts & Décisions */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                          gap: '1.5rem',
                          marginBottom: '2rem',
                        }}
                      >
                        {/* Panel 1: Répartition par Phase du Cycle de Vie */}
                        <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                            Cycle de Vie des Projets (Phases d'Exécution)
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                              { label: "1. Idéation & Cadrage TDR", count: stats.projects.byStatus?.IDEATION || 0, color: '#4f46e5' },
                              { label: "2. Structuration du Consortium", count: stats.projects.byStatus?.CONSORTIUM || 0, color: '#0284c7' },
                              { label: "3. Validation Conseil & Tutelle", count: stats.projects.byStatus?.VALIDATION_CONSEIL || 0, color: '#b45309' },
                              { label: "4. Passation & Marché Public", count: stats.projects.byStatus?.APPEL_OFFRES || 0, color: '#7e22ce' },
                              { label: "5. En Réalisation & Pilote", count: stats.projects.byStatus?.EN_REALISATION || 0, color: '#006233' },
                              { label: "6. Finalisé & Déployé", count: stats.projects.byStatus?.FINALISE || 0, color: '#15803d' },
                            ].map((phase, idx) => {
                              const pct = stats.projects.total > 0 ? Math.round((phase.count / stats.projects.total) * 100) : 0;
                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>{phase.label}</span>
                                    <span style={{ fontWeight: 800, color: phase.color }}>{phase.count} ({pct}%)</span>
                                  </div>
                                  <div style={{ width: '100%', height: 7, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                                    <div style={{ width: \`\${pct}%\`, height: '100%', background: phase.color, borderRadius: 6 }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Panel 2: Décisions de la Coordination & Priorités */}
                        <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                            Arbitrage de la Coordination Générale & Priorités
                          </h4>
                          
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                              Décisions du Coordinateur (Pr. Elias Zerhouni)
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              <div style={{ padding: '10px', background: '#dcfce7', borderRadius: 8, border: '1px solid #86efac' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}>Projets Validés</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>
                                  {stats.projects.byCoordination?.VALIDE || 0}
                                </div>
                              </div>

                              <div style={{ padding: '10px', background: '#fef3c7', borderRadius: 8, border: '1px solid #fde68a' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>Réserves Émises</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#b45309' }}>
                                  {stats.projects.byCoordination?.RESERVES || 0}
                                </div>
                              </div>

                              <div style={{ padding: '10px', background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c2410c' }}>Révision TDR</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#c2410c' }}>
                                  {stats.projects.byCoordination?.REVISION || 0}
                                </div>
                              </div>

                              <div style={{ padding: '10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>En Instruction</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#475569' }}>
                                  {stats.projects.byCoordination?.EN_ATTENTE || 0}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                              Degré de Priorité Stratégique
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, padding: '8px 12px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46' }}>Souveraineté</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>{stats.projects.byPriority?.STRATEGIQUE || 0}</div>
                              </div>
                              <div style={{ flex: 1, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991b1b' }}>Haute Priorité</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b' }}>{stats.projects.byPriority?.URGENT || 0}</div>
                              </div>
                              <div style={{ flex: 1, padding: '8px 12px', background: '#eef2ff', borderRadius: 8, border: '1px solid #c7d2fe' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3730a3' }}>Structurant</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3730a3' }}>{stats.projects.byPriority?.STRUCTURANT || 0}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Table by Commission */}
                      <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                            Cartographie & Performance par Commission Souveraine
                          </h4>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            {stats.projects.byCommission?.length || 0} commissions avec projets référencés
                          </span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                <th style={{ padding: '10px 12px', fontWeight: 800 }}>Commission Souveraine</th>
                                <th style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'center' }}>Projets</th>
                                <th style={{ padding: '10px 12px', fontWeight: 800 }}>Avancement Moyen</th>
                                <th style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'center' }}>Validés Coord.</th>
                                <th style={{ padding: '10px 12px', fontWeight: 800 }}>Budget National</th>
                                <th style={{ padding: '10px 12px', fontWeight: 800 }}>Devises</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.projects.byCommission?.map((comm, idx) => (
                                <tr
                                  key={idx}
                                  style={{
                                    borderBottom: idx === stats.projects.byCommission.length - 1 ? 'none' : '1px solid #f1f5f9',
                                    background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                                  }}
                                >
                                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#006233' }}>
                                    {comm.name}
                                  </td>
                                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                    <span style={{ padding: '2px 8px', background: '#ecfdf5', color: '#006233', borderRadius: 10, fontWeight: 800, fontSize: '0.76rem' }}>
                                      {comm.count}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <div style={{ width: 65, height: 6, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                                        <div style={{ width: \`\${comm.avgProgress}%\`, height: '100%', background: '#006233', borderRadius: 6 }} />
                                      </div>
                                      <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.76rem' }}>{comm.avgProgress}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                    <span style={{ color: comm.validCount > 0 ? '#15803d' : '#94a3b8', fontWeight: 700 }}>
                                      {comm.validCount} / {comm.count}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                                    {(comm.budgetDZD / 1000000).toLocaleString('fr-FR')} M DZD
                                  </td>
                                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#b45309' }}>
                                    {comm.budgetDevises ? \`\${(comm.budgetDevises / 1000000).toLocaleString('fr-FR')} M\` : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Recent Projects Activity */}
                      {stats.projects.recent?.length > 0 && (
                        <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                            Dernières Fiches Projets Actualisées
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {stats.projects.recent.map((rp) => (
                              <div
                                key={rp.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  borderRadius: 8,
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  flexWrap: 'wrap',
                                  gap: 10,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ padding: '2px 6px', background: '#0f172a', color: '#ffffff', borderRadius: 4, fontSize: '0.72rem', fontWeight: 800 }}>
                                    {rp.code}
                                  </span>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>{rp.titre}</div>
                                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{rp.specialite}</div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#006233', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6 }}>
                                    {rp.avancement}%
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      padding: '2px 8px',
                                      borderRadius: 6,
                                      background: rp.statutValidationCoordinateur === 'VALIDE' ? '#dcfce7' : '#f1f5f9',
                                      color: rp.statutValidationCoordinateur === 'VALIDE' ? '#15803d' : '#475569',
                                    }}
                                  >
                                    Coordination : {rp.statutValidationCoordinateur === 'VALIDE' ? 'Validé' : 'En instruction'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab('projects')}
                                    style={{
                                      padding: '4px 10px',
                                      background: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: 6,
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      color: '#334155',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Consulter
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
`;

content = content.replace(targetStr, targetStr + projectStatsJSX);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Project stats UI successfully inserted into pages/dashboard/index.js');
