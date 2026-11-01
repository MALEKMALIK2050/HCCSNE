import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useLocale } from '../_app';
import { members } from '@/lib/members';

export default function MembersPage() {
  const { t, locale, setLocale } = useLocale();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'PROF' | 'DR' | 'MME' | 'MR' | 'LEADERS'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'slider'
  const sliderRef = useRef(null);

  const scrollSlider = (direction, amount = 420) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const [allMembers, setAllMembers] = useState(members);

  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.members)) {
          setAllMembers(d.members);
        }
      })
      .catch(() => {});
  }, []);

  const filteredMembers = allMembers.filter((m) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (m.titre && m.titre.toLowerCase().includes(q)) ||
      (m.civilite && m.civilite.toLowerCase().includes(q)) ||
      (q === 'prof' && m.titre.toLowerCase().includes('prof')) ||
      (q === 'dr' && m.titre.toLowerCase().includes('dr')) ||
      (q === 'mme' && m.civilite && m.civilite.toLowerCase().includes('mme')) ||
      (q === 'mr' && m.civilite && m.civilite.toLowerCase().includes('m.')) ||
      m.nom.toLowerCase().includes(q) ||
      m.specialite.toLowerCase().includes(q) ||
      (m.institution && m.institution.toLowerCase().includes(q)) ||
      (m.pays && m.pays.toLowerCase().includes(q)) ||
      (m.disciplineDesc && m.disciplineDesc.toLowerCase().includes(q));

    let matchCategory = true;
    if (filterType === 'PROF') matchCategory = m.titre === 'Prof.';
    else if (filterType === 'DR') matchCategory = m.titre === 'Dr.';
    else if (filterType === 'MME') matchCategory = m.civilite === 'Mme';
    else if (filterType === 'MR') matchCategory = m.civilite === 'M.';
    else if (filterType === 'LEADERS') matchCategory = m.role === 'leader' || m.role === 'coordinator';

    return matchSearch && matchCategory;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <Head>
        <title>{t.membersSection.title} | HCCSNE</title>
        <meta name="description" content="Annuaire officiel des membres du Haut Conseil de la Communauté Scientifique Nationale à l'Étranger." />
      </Head>

      {/* NAVBAR */}
      <nav className="navbar scrolled">
        <div className="navbar-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-emblem">HC</div>
            <div>
              <div style={{ fontSize: '0.95rem' }}>HCCSNE</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--gray-400)', fontWeight: 500 }}>
                {locale === 'ar' ? 'الجمهورية الجزائرية' : 'République Algérienne'}
              </div>
            </div>
          </Link>
          <ul className="nav-links">
            <li><Link href="/#missions">{t.nav.about}</Link></li>
            <li><Link href="/members" style={{ color: '#006233', fontWeight: 700 }}>{t.nav.members}</Link></li>
            <li><Link href="/#domains">{t.nav.domains}</Link></li>
            <li><Link href="/#contact">{t.nav.contact}</Link></li>
          </ul>
          <div className="nav-cta">
            <div className="lang-switcher">
              {['fr', 'en', 'ar'].map((l) => (
                <button
                  key={l}
                  className={'lang-btn ' + (locale === l ? 'active' : '')}
                  onClick={() => setLocale(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Link href="/login">
              <button className="btn-login">{t.nav.login}</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '120px 2rem 5rem' }}>
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#fef3c7',
              color: '#92400e',
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '0.85rem',
              border: '1px solid #fde68a',
            }}
          >
            ✦ Décret présidentiel n° 26-293 • Collège Officiel des 39 Membres
          </div>
          <h2>{t.membersSection.title}</h2>
          <p>{t.membersSection.subtitle}</p>
          <div className="section-line"></div>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Top row: search + view switch */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 360px', position: 'relative' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Rechercher : Prof., Dr., M., Mme, nom, discipline, pays, institution..."
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#f8fafc',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'slider' : 'grid')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  border: '1.5px solid #006233',
                  background: '#ffffff',
                  color: '#006233',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {viewMode === 'grid' ? '⇄ Défilement horizontal' : '⊞ Grille Complète'}
              </button>
            </div>
          </div>
        </div>

        {/* View Header with Chevrons when in slider mode */}
        {viewMode === 'slider' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>
              Affichage horizontal de {filteredMembers.length} personnalités éminentes (Faites défiler →)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="slider-nav-btn" onClick={() => scrollSlider('left', 420)}>
                ‹
              </button>
              <button className="slider-nav-btn" onClick={() => scrollSlider('right', 420)}>
                ›
              </button>
            </div>
          </div>
        )}

        {/* Members Cards Container */}
        {filteredMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Aucun membre trouvé</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Essayez un autre mot-clé (ex: Prof, Dr, robotique, énergie, EPFL, MIT, etc.).
            </p>
            <button
              onClick={() => { setSearch(''); setFilterType('ALL'); }}
              style={{
                marginTop: '1.25rem',
                padding: '10px 20px',
                background: '#006233',
                color: '#ffffff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : viewMode === 'slider' ? (
          /* SLIDER MODE */
          <div
            ref={sliderRef}
            className="hide-scrollbar"
            style={{
              display: 'flex',
              gap: '1.75rem',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              padding: '0.5rem 0.25rem 2rem',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {filteredMembers.map((m) => renderMemberCard(m, true))}
          </div>
        ) : (
          /* GRID MODE */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {filteredMembers.map((m) => renderMemberCard(m, false))}
          </div>
        )}

        {/* Back to Home & Portal Links */}
        <div style={{ textAlign: 'center', marginTop: '4rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-secondary">
            ← Revenir à l&apos;Accueil
          </Link>
          <Link href="/login" className="btn-primary">
            🔐 Accéder à l&apos;Espace Collaboratif
          </Link>
        </div>
      </div>
    </div>
  );

  function renderMemberCard(m, isSlider = false) {
    const isCoord = m.role === 'coordinator';
    const isLead = m.role === 'leader';
    const cardBorder = isCoord ? '#c8a951' : isLead ? '#006233' : '#e2e8f0';
    const cardShadow = isCoord
      ? '0 12px 30px rgba(200, 169, 81, 0.2)'
      : isLead
      ? '0 12px 30px rgba(0, 98, 51, 0.15)'
      : '0 8px 24px rgba(0, 0, 0, 0.05)';

    return (
      <div
        key={m.id}
        style={{
          flex: isSlider ? '0 0 clamp(320px, 80vw, 390px)' : 'none',
          scrollSnapAlign: isSlider ? 'start' : 'none',
          background: '#ffffff',
          borderRadius: 20,
          padding: '1.75rem',
          border: `2px solid ${cardBorder}`,
          boxShadow: cardShadow,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          position: 'relative',
        }}
      >
        <div>
          {/* Top Header: Avatar + Title & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1rem' }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${isCoord ? '#c8a951' : isLead ? '#006233' : '#cbd5e1'}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                flexShrink: 0,
                background: isCoord
                  ? 'linear-gradient(135deg, #c8a951, #eab308)'
                  : isLead
                  ? 'linear-gradient(135deg, #006233, #047857)'
                  : 'linear-gradient(135deg, #64748b, #94a3b8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.3rem',
              }}
            >
              {m.image ? (
                <img
                  src={m.image}
                  alt={`${m.titre} ${m.nom}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                m.nom.split(' ').map((n) => n[0]).join('')
              )}
            </div>

            <div>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                {isCoord && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '2px 8px',
                      borderRadius: 10,
                      border: '1px solid #fde68a',
                    }}
                  >
                    ✦ Coordinateur
                  </span>
                )}
                {isLead && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: '#ecfdf5',
                      color: '#065f46',
                      padding: '2px 8px',
                      borderRadius: 10,
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    👑 Chef de Groupe
                  </span>
                )}
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: '#f1f5f9',
                    color: '#0284c7',
                    padding: '2px 8px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                  }}
                >
                  {m.titre} {m.civilite ? `(${m.civilite})` : ''}
                </span>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                <span style={{ color: isCoord ? '#c8a951' : isLead ? '#006233' : '#0284c7', marginRight: 4 }}>
                  {m.titre}
                </span>
                {m.nom}
              </h3>

              <div style={{ fontSize: '0.82rem', color: '#006233', fontWeight: 600, marginTop: 2 }}>
                {m.specialite}
              </div>
            </div>
          </div>

          {/* Institution & Country */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: '0.82rem',
              color: '#475569',
              marginBottom: '1rem',
              background: '#f8fafc',
              padding: '0.75rem 1rem',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
            }}
          >
            {m.institution && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🏛️</span>
                <span style={{ fontWeight: 600 }}>{m.institution}</span>
              </div>
            )}
            {m.pays && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#065f46', fontWeight: 700 }}>
                <span>📍</span>
                <span>{m.pays}</span>
              </div>
            )}
          </div>

          {/* Mot de présentation de la discipline */}
          <div
            style={{
              background: isCoord ? '#fffbeb' : isLead ? '#f0fdf4' : '#f8fafc',
              borderRadius: 12,
              padding: '1rem',
              border: `1px solid ${isCoord ? '#fde68a' : isLead ? '#bbf7d0' : '#e2e8f0'}`,
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
              Discipline & Pôle d&apos;Expertise :
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.55 }}>
              &ldquo;{m.disciplineDesc || `Expertise reconnue en ${m.specialite} pour l'évaluation et la prospective nationale.`}&rdquo;
            </p>
          </div>
        </div>

        {/* Contact & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
          <a
            href={`mailto:${m.email || 'contact@hccsne.dz'}`}
            style={{
              fontSize: '0.8rem',
              color: '#006233',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ✉️ {m.email || 'contact@hccsne.dz'}
          </a>
          <a
            href={`mailto:${m.email || 'contact@hccsne.dz'}?subject=Contact%20HCCSNE`}
            style={{
              padding: '6px 14px',
              background: '#f1f5f9',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#334155',
              textDecoration: 'none',
            }}
          >
            Contacter →
          </a>
        </div>
      </div>
    );
  }
}
