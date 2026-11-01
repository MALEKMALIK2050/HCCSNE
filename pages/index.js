import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useLocale } from './_app';
import { members } from '@/lib/members';
import { SPECIALTIES } from '@/lib/specialties';

function AnimatedCounter({ target, label, icon }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let s = 0;
    const inc = target / 120;
    const timer = setInterval(() => {
      s += inc;
      if (s >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.ceil(s));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);

  return (
    <div ref={ref} className="stat-item">
      <div className="stat-icon">{icon}</div>
      <div className="stat-number">{count}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Home() {
  const { t, locale, setLocale, dir } = useLocale();
  const isRtl = locale === 'ar' || dir === 'rtl';
  const arrowForward = isRtl ? '←' : '→';

  const [scrolled, setScrolled] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [viewMode, setViewMode] = useState('spotlight'); // 'spotlight' (1 at a time) | 'grid'

  // Active indices: ONE card displayed at a time
  const [activeNews, setActiveNews] = useState(0);
  const [expandedNews, setExpandedNews] = useState(false);
  const [activeMission, setActiveMission] = useState(0);
  const [activeDomain, setActiveDomain] = useState(0);
  const [activeMemberIndex, setActiveMemberIndex] = useState(0);

  const avatarRailRef = useRef(null);

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

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  // Filtered members list
  const filteredMembers = allMembers.filter((m) => {
    const q = memberSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (m.titre && m.titre.toLowerCase().includes(q)) ||
      (m.civilite && m.civilite.toLowerCase().includes(q)) ||
      (q === 'prof' && m.titre && m.titre.toLowerCase().includes('prof')) ||
      (q === 'dr' && m.titre && m.titre.toLowerCase().includes('dr')) ||
      (q === 'mme' && m.civilite && m.civilite.toLowerCase().includes('mme')) ||
      (q === 'mr' && m.civilite && m.civilite.toLowerCase().includes('m.')) ||
      m.nom.toLowerCase().includes(q) ||
      m.specialite.toLowerCase().includes(q) ||
      (m.institution && m.institution.toLowerCase().includes(q)) ||
      (m.pays && m.pays.toLowerCase().includes(q)) ||
      (m.disciplineDesc && m.disciplineDesc.toLowerCase().includes(q))
    );
  });

  const safeMemberIndex = Math.min(activeMemberIndex, Math.max(0, filteredMembers.length - 1));
  const currentMember = filteredMembers[safeMemberIndex] || filteredMembers[0];

  // News Items from i18n
  const newsItems = (t.newsSection && t.newsSection.items) || [];
  const safeNewsIndex = Math.min(activeNews, Math.max(0, newsItems.length - 1));
  const currentNews = newsItems[safeNewsIndex] || newsItems[0];

  // 4 Detailed Missions Palette
  const MISSION_PALETTE = [
    { accentColor: '#006233', bgGlow: 'rgba(0, 98, 51, 0.06)' },
    { accentColor: '#0284c7', bgGlow: 'rgba(2, 132, 199, 0.06)' },
    { accentColor: '#c8a951', bgGlow: 'rgba(200, 169, 81, 0.06)' },
    { accentColor: '#7c3aed', bgGlow: 'rgba(124, 58, 237, 0.06)' },
  ];

  const missionList = (t.missions && t.missions.items) || [
    {
      id: 'counsel',
      num: '01',
      tag: 'Conseil Stratégique',
      title: 'Counsel & Expertise Stratégique',
      shortDesc: 'Avis scientifiques indépendants placés directement auprès de la Présidence de la République.',
      fullDesc: 'Éclairer la décision publique au plus haut niveau de l’État par des avis consultatifs rigoureux, des études d’impact technologique et des audits d’experts indépendants sur les grands projets d’infrastructure, de souveraineté et de développement industriel de la Nation.',
      highlights: [
        'Avis scientifiques directs remis au Président de la République',
        'Appui stratégique aux 6 départements ministériels clés',
        'Audits de faisabilité technique selon les standards internationaux',
      ],
      legalRef: 'Article 4 du Décret présidentiel n° 26-293',
      statLabel: 'Destinataire Exécutif',
      statValue: 'Présidence de la République',
    },
    {
      id: 'watch',
      num: '02',
      tag: 'Veille Technologique',
      title: 'Technology Watch & Transfert',
      shortDesc: 'Anticipation des ruptures scientifiques et transfert accéléré de compétences.',
      fullDesc: 'Traquer en temps réel les ruptures technologiques mondiales (IA générative, batteries solides, hydrogène vert, biotechnologies de précision) et orchestrer le transfert direct de technologies critiques vers les universités, laboratoires et pôles d’ingénierie algériens.',
      highlights: [
        'Veille technologique prospective permanente et rapports de synthèse',
        'Partenariats de R&D avec les grands centres mondiaux (MIT, EPFL, Pasteur, CNRS)',
        'Accélération de l’industrialisation des brevets nationaux',
      ],
      legalRef: 'Article 5 du Décret présidentiel n° 26-293',
      statLabel: 'Réseau Partenaire',
      statValue: 'Centres Mondiaux R&D',
    },
    {
      id: 'network',
      num: '03',
      tag: 'Mise en Réseau',
      title: 'Networking & Synergie Diaspora',
      shortDesc: 'Mobilisation des compétences d’élite de la diaspora à travers le monde.',
      fullDesc: 'Fédérer le vivier d’exception des compétences scientifiques et entrepreneuriales algériennes établies dans les plus grands écosystèmes mondiaux. Connecter organiquement ces talents aux universités nationales, startups innovantes et entreprises industrielles.',
      highlights: [
        'Plateforme numérique collaborative interconnectée HCCSNE',
        '10 Commissions de travail interactives présidées par les chefs de groupe',
        'Programme national de mentorat doctoral et de conférences d’élite',
      ],
      legalRef: 'Article 6 du Décret présidentiel n° 26-293',
      statLabel: 'Architecture',
      statValue: '10 Commissions Métiers',
    },
    {
      id: 'evaluation',
      num: '04',
      tag: 'Évaluation & Prospective',
      title: 'Evaluation & Prospective Nationale',
      shortDesc: 'Évaluation méthodique et feuille de route technologique pour l’Algérie.',
      fullDesc: 'Mesurer avec précision la maturité technologique (TRL) des initiatives stratégiques nationales, évaluer les retombées socio-économiques de la recherche et formuler les feuilles de route pluriannuelles d’investissement dans l’économie de la connaissance.',
      highlights: [
        'Indicateurs d’impact et benchmarking mondial des performances',
        'Feuilles de route technologiques à horizon 2030 et 2035',
        'Accompagnement à l’accréditation internationale des cursus',
      ],
      legalRef: 'Article 7 du Décret présidentiel n° 26-293',
      statLabel: 'Horizon d’Action',
      statValue: 'Cap 2030 — 2035',
    },
  ];

  const safeMissionIndex = Math.min(activeMission, Math.max(0, missionList.length - 1));
  const currentMission = {
    ...missionList[safeMissionIndex],
    ...MISSION_PALETTE[safeMissionIndex % MISSION_PALETTE.length],
  };

  // Domain Item
  const safeDomainIndex = Math.min(activeDomain, Math.max(0, SPECIALTIES.length - 1));
  const currentDomain = SPECIALTIES[safeDomainIndex] || SPECIALTIES[0];

  const domainName = isRtl
    ? currentDomain.nameAr || currentDomain.name
    : locale === 'en'
    ? currentDomain.nameEn || currentDomain.name
    : currentDomain.name;

  const domainShortName = isRtl
    ? currentDomain.shortNameAr || currentDomain.shortName
    : locale === 'en'
    ? currentDomain.shortNameEn || currentDomain.shortName
    : currentDomain.shortName;

  const domainDesc = isRtl
    ? currentDomain.detailedDescriptionAr || currentDomain.detailedDescription
    : locale === 'en'
    ? currentDomain.detailedDescriptionEn || currentDomain.detailedDescription
    : currentDomain.detailedDescription || currentDomain.description;

  const domainGoals = isRtl
    ? currentDomain.priorityGoalsAr || currentDomain.priorityGoals
    : locale === 'en'
    ? currentDomain.priorityGoalsEn || currentDomain.priorityGoals
    : currentDomain.priorityGoals;

  const domainContext = isRtl
    ? currentDomain.algeriaContextAr || currentDomain.algeriaContext
    : locale === 'en'
    ? currentDomain.algeriaContextEn || currentDomain.algeriaContext
    : currentDomain.algeriaContext;

  return (
    <>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
      </Head>

      {/* NAVBAR */}
      <nav className={"navbar " + (scrolled ? "scrolled" : "")}>
        <div className="navbar-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-emblem">HC</div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>HCCSNE</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--gray-400)', fontWeight: 600 }}>
                {isRtl ? 'الجمهورية الجزائرية الديمقراطية الشعبية' : locale === 'en' ? 'People’s Democratic Republic of Algeria' : 'République Algérienne'}
              </div>
            </div>
          </Link>

          <ul className="nav-links">
            <li><a href="#news">{t.nav.news || (isRtl ? 'المستجدات' : locale === 'en' ? 'News' : 'Actualités')}</a></li>
            <li><a href="#missions">{t.nav.about}</a></li>
            <li><a href="#members">{t.nav.members}</a></li>
            <li><a href="#domains">{t.nav.domains}</a></li>
            <li><a href="#contact">{t.nav.contact}</a></li>
          </ul>

          <div className="nav-cta">
            <div className="lang-switcher">
              {['fr', 'en', 'ar'].map((l) => (
                <button
                  key={l}
                  className={"lang-btn " + (locale === l ? "active" : "")}
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

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>🏛️</span> {t.hero.badge}
          </div>

          {/* ALGERIAN NATIONAL EMBLEM FLAG */}
          <div className="hero-flag">
            <svg
              width="140"
              height="93"
              viewBox="0 0 900 600"
              style={{
                borderRadius: '8px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <rect width="450" height="600" fill="#006233" />
              <rect x="450" width="450" height="600" fill="#FFFFFF" />
              <circle cx="450" cy="300" r="150" fill="#D21034" />
              <circle cx="482" cy="300" r="125" fill="#006233" />
              <mask id="wm">
                <rect x="450" y="0" width="450" height="600" fill="white" />
              </mask>
              <circle cx="482" cy="300" r="125" fill="white" mask="url(#wm)" />
              <polygon
                points="495,255 507,290 545,290 514,312 525,347 495,325 465,347 476,312 445,290 483,290"
                fill="#D21034"
              />
            </svg>
          </div>

          <h1>
            {locale === 'fr' && (
              <>Haut Conseil de la Communauté <span>Scientifique</span> Nationale à l&apos;Étranger</>
            )}
            {locale === 'en' && (
              <>High Council of the National <span>Scientific</span> Community Abroad</>
            )}
            {isRtl && (
              <>المجلس الأعلى للكفاءات <span>العلمية</span> الوطنية بالخارج</>
            )}
          </h1>

          <p className="hero-subtitle">{t.hero.subtitle}</p>
          <p className="hero-decree">{t.hero.decree}</p>

          <div className="hero-actions">
            <a href="#missions" className="btn-primary">
              {t.hero.cta1} <span>{arrowForward}</span>
            </a>
            <Link href="/login" className="btn-secondary">
              {t.hero.cta2} <span>🔐</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stats-grid">
          <AnimatedCounter target={39} label={t.stats.members} icon="👥" />
          <AnimatedCounter target={15} label={t.stats.domains} icon="🎯" />
          <AnimatedCounter target={12} label={t.stats.countries} icon="🌍" />
          <AnimatedCounter target={6} label={t.stats.ministries} icon="🏛️" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NOUVEAUTÉ : ACTUALITÉS DU CONSEIL (DÉFILEMENT / CAROUSEL EN 3 LANGUES)     */}
      {/* ========================================================================= */}
      <section className="section" id="news" style={{ background: '#ffffff', padding: '5.5rem 2rem 4rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-header">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f0fdf4',
                color: '#065f46',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.85rem',
                border: '1px solid #bbf7d0',
              }}
            >
              ✦ {t.newsSection?.badge || (isRtl ? 'رئاسة الجمهورية والأنشطة الرسمية' : locale === 'en' ? 'Presidency & Official Affairs' : 'Présidence & Activités Officielles')}
            </div>
            <h2>{t.newsSection?.title || (isRtl ? 'مستجدات وأخبار المجلس الأعلى' : locale === 'en' ? 'High Council Official News' : 'Actualités du Haut Conseil')}</h2>
            <p>{t.newsSection?.subtitle || (isRtl ? 'متابعة اللقاءات الرئاسية الرسمية، الجلسات العامة والآراء الاستشارية الاستراتيجية' : locale === 'en' ? 'Coverage of presidential hearings, plenary sessions, and strategic advisories' : 'Suivi des audiences présidentielles, séances plénières et avis consultatifs stratégiques')}</p>
            <div className="section-line"></div>
          </div>

          {/* News Selector Pills & Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {newsItems.map((item, idx) => {
                const isActive = safeNewsIndex === idx;
                return (
                  <button
                    key={item.id || idx}
                    onClick={() => { setActiveNews(idx); setExpandedNews(false); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: isActive ? '#006233' : '#cbd5e1',
                      background: isActive ? '#006233' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 12px rgba(0, 98, 51, 0.25)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{idx + 1}.</span> {item.tag}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Chevrons and Dot Indicators */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#64748b' }}>
                {isRtl ? `الخبر ${safeNewsIndex + 1} من ${newsItems.length}` : locale === 'en' ? `Release ${safeNewsIndex + 1} / ${newsItems.length}` : `Actualité ${safeNewsIndex + 1} / ${newsItems.length}`}
              </span>
              <button
                className="slider-nav-btn"
                title={isRtl ? 'الخبر السابق' : 'Actualité précédente'}
                onClick={() => setActiveNews(Math.max(0, safeNewsIndex - 1))}
                disabled={safeNewsIndex === 0}
              >
                {isRtl ? '›' : '‹'}
              </button>
              <button
                className="slider-nav-btn"
                title={isRtl ? 'الخبر الموالي' : 'Actualité suivante'}
                onClick={() => setActiveNews(Math.min(newsItems.length - 1, safeNewsIndex + 1))}
                disabled={safeNewsIndex === newsItems.length - 1}
              >
                {isRtl ? '‹' : '›'}
              </button>
            </div>
          </div>

          {/* ONE SINGLE SHOWCASE NEWS CARD */}
          {currentNews && (
            <div
              className="glass-card-spotlight"
              style={{
                padding: 0,
                overflow: 'hidden',
                borderTop: '4px solid #006233',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {/* Left Column: Authentic News Photo with Overlay */}
                <div style={{ position: 'relative', minHeight: 340, overflow: 'hidden' }}>
                  <img
                    src={currentNews.image}
                    alt={currentNews.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(15, 23, 42, 0.88) 100%)',
                    }}
                  />
                  <div style={{ position: 'absolute', top: 20, [isRtl ? 'right' : 'left']: 20 }}>
                    <span
                      style={{
                        background: 'rgba(0, 98, 51, 0.92)',
                        color: '#ffffff',
                        padding: '5px 14px',
                        borderRadius: 16,
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backdropFilter: 'blur(6px)',
                        letterSpacing: '0.4px',
                      }}
                    >
                      {currentNews.tag}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, color: '#ffffff' }}>
                    <div style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: 700, marginBottom: 4 }}>
                      📍 {currentNews.location}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                      📅 {currentNews.date}
                    </div>
                  </div>
                </div>

                {/* Right Column: Detailed News Content */}
                <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: '#006233',
                          background: '#ecfdf5',
                          padding: '4px 10px',
                          borderRadius: 8,
                          border: '1px solid #a7f3d0',
                        }}
                      >
                        {currentNews.date}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {currentNews.location}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)',
                        fontWeight: 800,
                        color: '#0f172a',
                        lineHeight: 1.35,
                        marginBottom: '1.25rem',
                      }}
                    >
                      {currentNews.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.98rem',
                        color: '#334155',
                        lineHeight: 1.75,
                        marginBottom: '1.75rem',
                      }}
                    >
                      {currentNews.summary}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1.75rem',
                      borderTop: '1px solid #e2e8f0',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    {/* Action 1: Inline Accordion Toggle */}
                    <button
                      onClick={() => setExpandedNews(!expandedNews)}
                      style={{
                        padding: '10px 20px',
                        background: expandedNews ? '#ecfdf5' : '#f8fafc',
                        color: expandedNews ? '#006233' : '#334155',
                        border: `1.5px solid ${expandedNews ? '#006233' : '#cbd5e1'}`,
                        borderRadius: 30,
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: expandedNews ? '0 4px 14px rgba(0, 98, 51, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
                        fontFamily: isRtl ? 'var(--font-arabic-kufi)' : 'var(--font-display)',
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: expandedNews ? '#006233' : 'rgba(0, 98, 51, 0.1)',
                          color: expandedNews ? '#ffffff' : '#006233',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.68rem',
                          transition: 'transform 0.3s ease',
                          transform: expandedNews ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        ▼
                      </span>
                      <span>
                        {expandedNews
                          ? (isRtl ? 'إخفاء التفاصيل' : locale === 'en' ? 'Masquer les détails' : 'Masquer les détails')
                          : (isRtl ? 'قراءة البيان الكامل هنا' : locale === 'en' ? 'Read Full Details Here' : 'Lire les détails ici')}
                      </span>
                    </button>

                    {/* Action 2: Open Dedicated Page in New Tab */}
                    <Link
                      href={`/news/${currentNews.id || 1}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '11px 24px',
                        background: 'linear-gradient(135deg, #006233 0%, #007A40 60%, #009950 100%)',
                        color: '#ffffff',
                        borderRadius: 30,
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        boxShadow: '0 4px 18px rgba(0, 98, 51, 0.3), 0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        fontFamily: isRtl ? 'var(--font-arabic-kufi)' : 'var(--font-display)',
                        letterSpacing: isRtl ? '0' : '0.01em',
                      }}
                    >
                      <span>
                        {t.newsSection?.viewRelease ||
                          (isRtl
                            ? 'الاطلاع على البيان الرسمي الكامل'
                            : locale === 'en'
                            ? 'View Official Release (New Tab)'
                            : 'Consulter le communiqué')}
                      </span>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.22)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 900,
                        }}
                      >
                        ↗
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Expandable Full Article Drawer Right Below Card */}
              {expandedNews && (
                <div
                  style={{
                    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                    padding: '2.25rem 2.75rem',
                    borderTop: '1.5px solid #e2e8f0',
                    animation: 'fadeIn 0.35s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        color: '#006233',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      📜
                    </span>
                    <strong
                      style={{
                        fontSize: isRtl ? '1.05rem' : '0.98rem',
                        color: '#006233',
                        fontFamily: isRtl ? 'var(--font-arabic-display)' : 'var(--font-display)',
                        fontWeight: 800,
                      }}
                    >
                      {isRtl
                        ? 'نص البيان الرسمي الكامل الصادر عن رئاسة الجمهورية :'
                        : locale === 'en'
                        ? 'Full Official Communique from the Presidency of the Republic:'
                        : 'Texte intégral du communiqué officiel de la Présidence de la République :'}
                    </strong>
                  </div>

                  <div
                    style={{
                      fontSize: isRtl ? '1.05rem' : '0.98rem',
                      color: '#334155',
                      lineHeight: isRtl ? 1.95 : 1.85,
                      whiteSpace: 'pre-line',
                      background: '#ffffff',
                      borderRadius: 18,
                      padding: '1.75rem 2rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      marginBottom: '1.5rem',
                      fontFamily: isRtl ? 'var(--font-arabic-body)' : 'inherit',
                    }}
                  >
                    {currentNews.fullContent || currentNews.summary}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.84rem',
                        color: '#64748b',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>🏛️</span>
                      <span>
                        {isRtl
                          ? 'المرسوم الرئاسي رقم 26-293 المؤرخ في 7 سبتمبر 2026'
                          : 'Décret présidentiel n° 26-293 du 7 septembre 2026'}
                      </span>
                    </span>
                    <Link
                      href={`/news/${currentNews.id || 1}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#006233',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        textDecoration: 'none',
                        background: '#ecfdf5',
                        padding: '6px 14px',
                        borderRadius: 16,
                        border: '1px solid #a7f3d0',
                        fontFamily: isRtl ? 'var(--font-arabic-kufi)' : 'inherit',
                      }}
                    >
                      <span>{isRtl ? 'فتح في نافذة كاملة قابلة للطباعة والمشاركة' : 'Ouvrir en pleine page imprimable & partageable'}</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div style={{ background: '#f1f5f9', height: 4, width: '100%' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${((safeNewsIndex + 1) / Math.max(1, newsItems.length)) * 100}%`,
                    background: '#006233',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DIVISION 1: MISSIONS STRATÉGIQUES (1 SEULE CARTE VEDETTE À LA FOIS)       */}
      {/* ========================================================================= */}
      <section
        className="section"
        id="missions"
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #f0fdf4 35%, #ffffff 100%)',
          padding: '6rem 2rem',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-header">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#ecfdf5',
                color: '#065f46',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.85rem',
                border: '1px solid #a7f3d0',
              }}
            >
              ✦ {isRtl ? 'المرسوم الرئاسي رقم 26-293 • المهام السيادية' : locale === 'en' ? 'Presidential Decree No. 26-293 • Strategic Missions' : 'Décret présidentiel n° 26-293 • Missions Stratégiques'}
            </div>
            <h2>{t.missions.title}</h2>
            <p>{t.missions.subtitle}</p>
            <div className="section-line"></div>
          </div>

          {/* Segmented Mission Selector (NO EMOJIS IN TITLES) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {missionList.map((m, idx) => {
                const isActive = safeMissionIndex === idx;
                const palette = MISSION_PALETTE[idx % MISSION_PALETTE.length];
                return (
                  <button
                    key={m.id || idx}
                    onClick={() => setActiveMission(idx)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 24,
                      border: '1.5px solid',
                      borderColor: isActive ? palette.accentColor : '#cbd5e1',
                      background: isActive ? palette.accentColor : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: isActive ? `0 6px 18px ${palette.accentColor}35` : '0 2px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.25s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ opacity: isActive ? 1 : 0.6, fontSize: '0.78rem' }}>{m.num || `0${idx + 1}`}.</span>
                    <span>{m.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Chevrons */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#64748b' }}>
                {isRtl ? `المهمة ${safeMissionIndex + 1} من ${missionList.length}` : locale === 'en' ? `Mission ${safeMissionIndex + 1} / ${missionList.length}` : `Mission ${safeMissionIndex + 1} / ${missionList.length}`}
              </span>
              <button
                className="slider-nav-btn"
                title={isRtl ? 'المهمة السابقة' : 'Mission précédente'}
                onClick={() => setActiveMission(Math.max(0, safeMissionIndex - 1))}
                disabled={safeMissionIndex === 0}
              >
                {isRtl ? '›' : '‹'}
              </button>
              <button
                className="slider-nav-btn"
                title={isRtl ? 'المهمة الموالية' : 'Mission suivante'}
                onClick={() => setActiveMission(Math.min(missionList.length - 1, safeMissionIndex + 1))}
                disabled={safeMissionIndex === missionList.length - 1}
              >
                {isRtl ? '‹' : '›'}
              </button>
            </div>
          </div>

          {/* ONE SINGLE SHOWCASE MISSION CARD (GLASSMORPHIC & MODERN) */}
          <div
            className="glass-card-spotlight"
            style={{
              padding: '2.5rem 3rem',
              position: 'relative',
              overflow: 'hidden',
              borderTop: `4px solid ${currentMission.accentColor}`,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              {/* Left Column: Mission Content */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                  <span
                    style={{
                      background: currentMission.bgGlow,
                      color: currentMission.accentColor,
                      padding: '4px 12px',
                      borderRadius: 14,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      border: `1px solid ${currentMission.accentColor}30`,
                    }}
                  >
                    {isRtl ? `المهمة الاستراتيجية ${currentMission.num || '01'} / 04` : locale === 'en' ? `STRATEGIC MISSION ${currentMission.num || '01'} / 04` : `MISSION STRATÉGIQUE ${currentMission.num || '01'} / 04`}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                    {currentMission.legalRef}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '0.85rem',
                    lineHeight: 1.25,
                  }}
                >
                  {currentMission.title}
                </h3>

                <p
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: currentMission.accentColor,
                    marginBottom: '1rem',
                    lineHeight: 1.5,
                  }}
                >
                  {currentMission.shortDesc}
                </p>

                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                  {currentMission.fullDesc}
                </p>

                {/* Priority Action Pillars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {isRtl ? 'محاور العمل ذات الأولوية :' : locale === 'en' ? 'Priority Action Pillars:' : 'Piliers d\'action prioritaires :'}
                  </div>
                  {currentMission.highlights && currentMission.highlights.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: '#f8fafc',
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                    >
                      <span style={{ color: currentMission.accentColor, fontWeight: 900, fontSize: '1rem' }}>✓</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Presidential & Institutional Seal Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: 22,
                  padding: '2.5rem',
                  color: '#ffffff',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 340,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#94a3b8',
                        fontWeight: 700,
                      }}
                    >
                      {isRtl ? 'السيادة الوطنية' : locale === 'en' ? 'Sovereign Mandate' : 'Mandat Souverain'}
                    </span>
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#38bdf8',
                      }}
                    >
                      {isRtl ? 'المرسوم 26-293' : 'Décret n° 26-293'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    {currentMission.statLabel}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem', lineHeight: 1.3 }}>
                    {currentMission.statValue}
                  </div>

                  <blockquote
                    style={{
                      margin: 0,
                      padding: isRtl ? '0 1rem 0 0' : '0 0 0 1rem',
                      borderLeft: isRtl ? 'none' : `3px solid ${currentMission.accentColor}`,
                      borderRight: isRtl ? `3px solid ${currentMission.accentColor}` : 'none',
                      fontSize: '0.88rem',
                      color: '#cbd5e1',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                    }}
                  >
                    {isRtl
                      ? '« يصدر المجلس الأعلى آراء استشارية مستقلة ويحدد التوجهات الاستراتيجية للسيادة العلمية للبلاد. »'
                      : locale === 'en'
                      ? '“The High Council provides independent advisory opinions and defines strategic orientations for scientific sovereignty.”'
                      : '« Le Haut Conseil émet des avis consultatifs indépendants et formule les orientations stratégiques de souveraineté scientifique. »'}
                  </blockquote>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {isRtl ? `المادة الرسمية رقم ${safeMissionIndex + 4}` : locale === 'en' ? `Official decree article #${safeMissionIndex + 4}` : `Article officiel n° ${safeMissionIndex + 4}`}
                  </span>
                  <a
                    href="#contact"
                    style={{
                      padding: '8px 16px',
                      background: currentMission.accentColor,
                      color: '#ffffff',
                      borderRadius: 10,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    {isRtl ? 'طلب استشارة أو رأي ←' : locale === 'en' ? 'Request Advisory →' : 'Solliciter un avis →'}
                  </a>
                </div>
              </div>
            </div>

            {/* Subtle Progress Bar */}
            <div style={{ marginTop: '2.5rem', background: '#f1f5f9', height: 4, borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((safeMissionIndex + 1) / missionList.length) * 100}%`,
                  background: currentMission.accentColor,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DIVISION 2: COLLÈGE DES MEMBRES (1 SEUL MEMBRE VEDETTE À LA FOIS)          */}
      {/* ========================================================================= */}
      <section
        className="members-section"
        id="members"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
          padding: '6rem 2rem',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-header">
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
              ✦ {isRtl ? 'نخبة الجالية والكفاءات العلمية' : locale === 'en' ? 'Scientific Diaspora Elite' : 'Collège d\'Élite & Diaspora Scientifique'}
            </div>
            <h2>{t.membersSection.title}</h2>
            <p>{t.membersSection.subtitle}</p>
            <div className="section-line"></div>
          </div>

          {/* Search Toolbar & View Mode Switcher */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: '1.25rem 1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
            }}
          >
            {/* Search Input */}
            <div style={{ flex: '1 1 320px', position: 'relative' }}>
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setActiveMemberIndex(0);
                }}
                placeholder={isRtl ? '🔍 بحث : بروفيسور، دكتور، اسم، تخصص، بلد...' : locale === 'en' ? '🔍 Search: Prof., Dr., Mr, Ms, name, discipline, country...' : '🔍 Rechercher : Prof., Dr., M., Mme, nom, discipline, pays...'}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#f8fafc',
                }}
              />
              {memberSearch && (
                <button
                  onClick={() => { setMemberSearch(''); setActiveMemberIndex(0); }}
                  style={{
                    position: 'absolute',
                    [isRtl ? 'left' : 'right']: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => setViewMode(viewMode === 'spotlight' ? 'grid' : 'spotlight')}
                style={{
                  padding: '9px 18px',
                  borderRadius: 20,
                  border: '1.5px solid #006233',
                  background: '#ffffff',
                  color: '#006233',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {viewMode === 'spotlight'
                  ? (isRtl ? '⊞ عرض كشبكة' : locale === 'en' ? '⊞ View Grid' : '⊞ Voir en Grille')
                  : (isRtl ? '✦ نمط النخبة (واحد تلو الآخر)' : locale === 'en' ? '✦ Spotlight Mode (1 by 1)' : '✦ Mode Vedette (1 par 1)')}
              </button>
            </div>
          </div>

          {/* Members Render: Spotlight Mode (1 by 1) OR Grid Mode */}
          {filteredMembers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                {isRtl ? 'لم يتم العثور على أي شخصية تطابق بحثكم.' : locale === 'en' ? 'No member matches your search.' : 'Aucune personnalité ne correspond à votre recherche.'}
              </p>
              <button
                onClick={() => { setMemberSearch(''); setActiveMemberIndex(0); }}
                style={{
                  marginTop: '1rem',
                  padding: '8px 16px',
                  background: '#006233',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isRtl ? 'إعادة ضبط البحث' : locale === 'en' ? 'Reset Search' : 'Réinitialiser la recherche'}
              </button>
            </div>
          ) : viewMode === 'spotlight' ? (
            /* 1 SINGLE MEMBER SPOTLIGHT CARD (VIP LUXURY PRESENTATION) */
            <div>
              {/* Prev / Next Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>
                  {isRtl ? `الشخصية العلمية ${safeMemberIndex + 1} من ${filteredMembers.length}` : locale === 'en' ? `Featured Member ${safeMemberIndex + 1} of ${filteredMembers.length}` : `Membre vedette ${safeMemberIndex + 1} sur ${filteredMembers.length}`}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="slider-nav-btn"
                    title={isRtl ? 'الشخصية السابقة' : 'Membre précédent'}
                    onClick={() => setActiveMemberIndex(Math.max(0, safeMemberIndex - 1))}
                    disabled={safeMemberIndex === 0}
                  >
                    {isRtl ? '›' : '‹'}
                  </button>
                  <button
                    className="slider-nav-btn"
                    title={isRtl ? 'الشخصية الموالية' : 'Membre suivant'}
                    onClick={() => setActiveMemberIndex(Math.min(filteredMembers.length - 1, safeMemberIndex + 1))}
                    disabled={safeMemberIndex === filteredMembers.length - 1}
                  >
                    {isRtl ? '‹' : '›'}
                  </button>
                </div>
              </div>

              {/* The Spotlight Card */}
              {currentMember && (
                <div
                  className="glass-card-spotlight"
                  style={{
                    padding: '2.5rem 3rem',
                    marginBottom: '2rem',
                    borderLeft: isRtl ? 'none' : `5px solid ${
                      currentMember.role === 'coordinator'
                        ? '#c8a951'
                        : currentMember.role === 'leader'
                        ? '#006233'
                        : '#0284c7'
                    }`,
                    borderRight: isRtl ? `5px solid ${
                      currentMember.role === 'coordinator'
                        ? '#c8a951'
                        : currentMember.role === 'leader'
                        ? '#006233'
                        : '#0284c7'
                    }` : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '2.5rem',
                      alignItems: 'center',
                    }}
                  >
                    {/* Left Column: Member Photo + Badges + Origin */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <div
                        style={{
                          width: 160,
                          height: 160,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: `4px solid ${
                            currentMember.role === 'coordinator'
                              ? '#c8a951'
                              : currentMember.role === 'leader'
                              ? '#006233'
                              : '#cbd5e1'
                          }`,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                          marginBottom: '1.25rem',
                          background: '#f8fafc',
                        }}
                      >
                        {currentMember.image ? (
                          <img
                            src={currentMember.image}
                            alt={`${currentMember.titre} ${currentMember.nom}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '2.5rem',
                              fontWeight: 800,
                              color: '#006233',
                            }}
                          >
                            {currentMember.nom.split(' ').map((n) => n[0]).join('')}
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.75rem' }}>
                        {currentMember.role === 'coordinator' && (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '3px 10px',
                              borderRadius: 12,
                              border: '1px solid #fde68a',
                            }}
                          >
                            {isRtl ? '✦ المنسق الرئيسي للمجلس' : locale === 'en' ? '✦ Principal Coordinator' : '✦ Coordinateur Principal'}
                          </span>
                        )}
                        {currentMember.role === 'leader' && (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              background: '#ecfdf5',
                              color: '#065f46',
                              padding: '3px 10px',
                              borderRadius: 12,
                              border: '1px solid #a7f3d0',
                            }}
                          >
                            {isRtl ? '👑 رئيس مجموعة عمل' : locale === 'en' ? '👑 Group Leader' : '👑 Chef de Groupe'}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            background: '#f1f5f9',
                            color: '#0284c7',
                            padding: '3px 10px',
                            borderRadius: 12,
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          {currentMember.titre} {currentMember.civilite ? `(${currentMember.civilite})` : ''}
                        </span>
                      </div>

                      {/* Institution & Country */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem', color: '#475569' }}>
                        {currentMember.institution && (
                          <div style={{ fontWeight: 600 }}>🏛️ {currentMember.institution}</div>
                        )}
                        {currentMember.pays && (
                          <div style={{ color: '#006233', fontWeight: 700 }}>📍 {currentMember.pays}</div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Name, Discipline Presentation Quote, Contact */}
                    <div>
                      <h3
                        style={{
                          fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                          fontWeight: 800,
                          color: '#0f172a',
                          margin: '0 0 0.4rem',
                          lineHeight: 1.25,
                        }}
                      >
                        <span
                          style={{
                            color:
                              currentMember.role === 'coordinator'
                                ? '#c8a951'
                                : currentMember.role === 'leader'
                                ? '#006233'
                                : '#0284c7',
                            marginRight: isRtl ? 0 : 8,
                            marginLeft: isRtl ? 8 : 0,
                          }}
                        >
                          {currentMember.titre}
                        </span>
                        {currentMember.nom}
                      </h3>

                      <div style={{ fontSize: '1rem', color: '#006233', fontWeight: 700, marginBottom: '1.5rem' }}>
                        {currentMember.specialite}
                      </div>

                      {/* Official Presentation Quote */}
                      <div
                        style={{
                          background:
                            currentMember.role === 'coordinator'
                              ? '#fffbeb'
                              : currentMember.role === 'leader'
                              ? '#f0fdf4'
                              : '#f8fafc',
                          borderRadius: 16,
                          padding: '1.25rem 1.5rem',
                          border: `1px solid ${
                            currentMember.role === 'coordinator'
                              ? '#fde68a'
                              : currentMember.role === 'leader'
                              ? '#bbf7d0'
                              : '#e2e8f0'
                          }`,
                          marginBottom: '1.75rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            marginBottom: 6,
                            letterSpacing: '0.5px',
                          }}
                        >
                          {isRtl ? 'التخصص والإشعاع العلمي للمجلس :' : locale === 'en' ? 'Discipline & Scientific Leadership:' : 'Discipline & Rayonnement Scientifique :'}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.94rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.65 }}>
                          &ldquo;{currentMember.disciplineDesc || (isRtl ? `خبرة علمية متميزة في ${currentMember.specialite} في خدمة مشاريع السيادة الوطنية.` : `Expertise de pointe en ${currentMember.specialite} au service du développement souverain.`)}&rdquo;
                        </p>
                      </div>

                      {/* Direct Contact */}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <a
                          href={`mailto:${currentMember.email || 'contact@hccsne.dz'}`}
                          style={{
                            padding: '10px 20px',
                            background: '#006233',
                            color: '#ffffff',
                            borderRadius: 10,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          ✉️ {currentMember.email || 'contact@hccsne.dz'}
                        </a>
                        <a
                          href={`mailto:${currentMember.email || 'contact@hccsne.dz'}?subject=Contact%20HCCSNE`}
                          style={{
                            padding: '10px 18px',
                            background: '#f1f5f9',
                            color: '#334155',
                            borderRadius: 10,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          {isRtl ? 'طلب تواصل علمي ←' : locale === 'en' ? 'Request Scientific Contact →' : 'Solliciter un échange →'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AVATAR THUMBNAIL RAIL (CLICK TO SWITCH MEMBER INSTANTLY) */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.65rem' }}>
                  {isRtl ? 'اختر عضواً من الهيئة الاستشارية للنخبة :' : locale === 'en' ? 'Select a council member from the delegation:' : 'Sélectionnez un membre dans la délégation :'}
                </div>
                <div
                  ref={avatarRailRef}
                  className="hide-scrollbar"
                  style={{
                    display: 'flex',
                    gap: '0.65rem',
                    overflowX: 'auto',
                    padding: '0.5rem 0.25rem 1rem',
                  }}
                >
                  {filteredMembers.map((m, idx) => {
                    const isSelected = safeMemberIndex === idx;
                    return (
                      <button
                        key={m.id || idx}
                        onClick={() => setActiveMemberIndex(idx)}
                        style={{
                          flex: '0 0 auto',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          textAlign: 'center',
                          transition: 'transform 0.2s',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        }}
                        title={`${m.titre} ${m.nom}`}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2.5px solid ${isSelected ? '#006233' : '#cbd5e1'}`,
                            boxShadow: isSelected ? '0 0 12px rgba(0,98,51,0.4)' : 'none',
                            background: '#f1f5f9',
                          }}
                        >
                          {m.image ? (
                            <img src={m.image} alt={m.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#006233',
                              }}
                            >
                              {m.nom.split(' ').map((n) => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: isSelected ? 800 : 500,
                            color: isSelected ? '#006233' : '#64748b',
                            marginTop: 4,
                            maxWidth: 64,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {m.nom.split(' ')[1] || m.nom}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* GRID VIEW (WHEN TOGGLED) */
            <div className="members-grid">
              {filteredMembers.map((m) => {
                const isCoord = m.role === 'coordinator';
                const isLead = m.role === 'leader';
                return (
                  <div key={m.id} className={'member-card ' + (isCoord ? 'coordinator' : isLead ? 'leader' : '')}>
                    <div
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        margin: '0 auto 1rem',
                        border: `3px solid ${isCoord ? '#c8a951' : isLead ? '#006233' : '#cbd5e1'}`,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      }}
                    >
                      {m.image ? (
                        <img src={m.image} alt={m.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="member-avatar" style={{ margin: 0, width: '100%', height: '100%' }}>
                          {m.nom.split(' ').map((n) => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div className="member-name">
                      <span style={{ color: isCoord ? '#c8a951' : isLead ? '#006233' : '#0284c7', marginRight: 4 }}>
                        {m.titre || 'Prof.'}
                      </span>
                      {m.nom}
                    </div>
                    <div className="member-specialty">{m.specialite}</div>

                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', margin: '6px 0 8px' }}>
                      {isCoord && <div className="member-role-badge" style={{ margin: 0 }}>✦ {isRtl ? 'المنسق الرئيسي' : 'Coordinateur'}</div>}
                      {isLead && <div className="member-role-badge leader" style={{ margin: 0 }}>👑 {isRtl ? 'رئيس مجموعة' : 'Chef de Groupe'}</div>}
                      <div className="member-role-badge scientific" style={{ margin: 0, background: '#f1f5f9', color: '#0284c7' }}>
                        {m.titre || 'Prof.'} {m.civilite ? `(${m.civilite})` : ''}
                      </div>
                    </div>

                    {m.disciplineDesc && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', margin: '0.75rem 0', lineHeight: 1.4 }}>
                        &ldquo;{m.disciplineDesc.substring(0, 95)}...&rdquo;
                      </div>
                    )}

                    {m.institution && <div className="member-institution">🏛️ {m.institution}</div>}
                    {m.pays && <div className="member-institution" style={{ color: '#006233', fontWeight: 600 }}>📍 {m.pays}</div>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/members" className="btn-primary" style={{ display: 'inline-flex' }}>
              {t.membersSection.viewAll} ({allMembers.length}) {arrowForward}
            </Link>
            <Link href="/login" className="btn-secondary" style={{ display: 'inline-flex' }}>
              🔐 {isRtl ? 'فضاء الأعضاء واللجان المتخصصة' : locale === 'en' ? 'Council Members & Task Commissions' : 'Espace Membres & Commissions'}
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DIVISION 3: DOMAINES STRATÉGIQUES (1 SEUL DOMAINE À LA FOIS, SANS EMOJIS) */}
      {/* ========================================================================= */}
      <section
        className="section"
        id="domains"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 50%, #f8fafc 100%)',
          padding: '6rem 2rem',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-header">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#ecfdf5',
                color: '#065f46',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '0.85rem',
                border: '1px solid #a7f3d0',
              }}
            >
              ✦ {isRtl ? 'الأقطاب الوطنية للتميز التكنولوجي' : locale === 'en' ? 'National Centers of Technological Excellence' : 'Pôles d\'Excellence Technologique'}
            </div>
            <h2>{t.domains.title}</h2>
            <p>{t.domains.subtitle}</p>
            <div className="section-line"></div>
          </div>

          {/* Quick Domain Navigation Tabs (NO EMOJIS IN TITLES) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', maxWidth: '85%' }}>
              {SPECIALTIES.map((spec, idx) => {
                const isActive = safeDomainIndex === idx;
                const tabTitle = isRtl ? (spec.shortNameAr || spec.shortName) : locale === 'en' ? (spec.shortNameEn || spec.shortName) : spec.shortName;
                return (
                  <button
                    key={spec.id}
                    onClick={() => setActiveDomain(idx)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: isActive ? '#006233' : '#cbd5e1',
                      background: isActive ? '#006233' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}.</span> {tabTitle}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Arrows */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="slider-nav-btn"
                title={isRtl ? 'القطب السابق' : 'Domaine précédent'}
                onClick={() => setActiveDomain(Math.max(0, safeDomainIndex - 1))}
                disabled={safeDomainIndex === 0}
              >
                {isRtl ? '›' : '‹'}
              </button>
              <button
                className="slider-nav-btn"
                title={isRtl ? 'القطب الموالي' : 'Domaine suivant'}
                onClick={() => setActiveDomain(Math.min(SPECIALTIES.length - 1, safeDomainIndex + 1))}
                disabled={safeDomainIndex === SPECIALTIES.length - 1}
              >
                {isRtl ? '‹' : '›'}
              </button>
            </div>
          </div>

          {/* ONE SINGLE SHOWCASE DOMAIN CARD (REAL HIGH-DEF PHOTOGRAPHY & GLASSMORPHISM) */}
          {currentDomain && (
            <div
              className="glass-card-spotlight"
              style={{
                overflow: 'hidden',
                padding: 0,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
                {/* Left Side: Real Photographic Cover Banner */}
                <div style={{ position: 'relative', minHeight: 380, overflow: 'hidden' }}>
                  <img
                    src={currentDomain.image}
                    alt={domainName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {/* Subtle Dark Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(15, 23, 42, 0.88) 100%)',
                    }}
                  />

                  {/* Commission ID Badge (NO EMOJIS) */}
                  <div style={{ position: 'absolute', top: 20, [isRtl ? 'right' : 'left']: 20 }}>
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(8px)',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#006233',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {isRtl ? `اللجنة الاستراتيجية رقم ${currentDomain.roomId}` : locale === 'en' ? `Strategic Task Commission #${currentDomain.roomId}` : `Commission Stratégique n° ${currentDomain.roomId}`}
                    </span>
                  </div>

                  {/* Domain Title on Image (NO EMOJIS) */}
                  <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                    <div style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                      {isRtl ? 'القطب الوطني للسيادة' : locale === 'en' ? 'National Sovereign Pole' : 'Pôle National de Souveraineté'}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 800, color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.25 }}>
                      {domainName}
                    </h3>
                  </div>
                </div>

                {/* Right Side: Description, Leader, Priority Axes */}
                <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Designated Leader */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: '1.25rem',
                        background: '#ecfdf5',
                        padding: '0.75rem 1.25rem',
                        borderRadius: 12,
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>👑</span>
                      <div style={{ fontSize: '0.88rem' }}>
                        <span style={{ color: '#065f46', fontWeight: 600 }}>
                          {isRtl ? 'رئاسة وتأطير اللجنة :' : locale === 'en' ? 'Chaired by:' : 'Dirigée par :'}
                        </span>{' '}
                        <strong style={{ color: '#006233' }}>{currentDomain.suggestedLeader}</strong>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                      {domainDesc}
                    </p>

                    {/* Authentic Algerian Strategic Realizations Box */}
                    {domainContext && (
                      <div
                        style={{
                          background: '#f0fdf4',
                          borderRadius: 14,
                          padding: '12px 16px',
                          border: '1px solid #bbf7d0',
                          marginBottom: '1.5rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#065f46',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: 4,
                          }}
                        >
                          {isRtl
                            ? '🇩🇿 الإشعاع الوطني والمشاريع السيادية في الجزائر :'
                            : locale === 'en'
                            ? '🇩🇿 Strategic National Infrastructure in Algeria:'
                            : '🇩🇿 Ancrage National & Réalisations en Algérie :'}
                        </div>
                        <div style={{ fontSize: '0.88rem', color: '#006233', fontWeight: 700 }}>
                          {domainContext}
                        </div>
                      </div>
                    )}

                    {/* Priority Strategic Axes (NO EMOJIS IN TAGS) */}
                    {domainGoals && domainGoals.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            marginBottom: '0.65rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {isRtl ? 'المحاور الاستراتيجية والمشاريع الكبرى :' : locale === 'en' ? 'Strategic Pillars & Flagship Projects:' : 'Axes stratégiques & Projets phares :'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {domainGoals.map((g, i) => (
                            <span
                              key={i}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: 8,
                                padding: '5px 12px',
                                fontSize: '0.8rem',
                                color: '#1e293b',
                                fontWeight: 600,
                              }}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Collaborative Workspace Button */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid #f1f5f9',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {isRtl ? `فضاء العمل السيادي رقم ${currentDomain.roomId}` : locale === 'en' ? `Sovereign Digital Chamber #${currentDomain.roomId}` : `Espace de travail souverain n° ${currentDomain.roomId}`}
                    </span>
                    <Link
                      href="/dashboard"
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #006233, #007A40)',
                        color: '#ffffff',
                        borderRadius: 10,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 4px 14px rgba(0,98,51,0.22)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {isRtl ? 'الدخول إلى قاعة العمل التشاركية ←' : locale === 'en' ? 'Access Sovereign Digital Chamber →' : 'Accéder au Salon Collaboratif →'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CONTACT                                                                   */}
      {/* ========================================================================= */}
      <section className="section" id="contact" style={{ background: 'var(--gray-50)', maxWidth: '100%', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="section-header">
            <h2>{isRtl ? 'اتصل بنا' : locale === 'en' ? 'Contact Us' : 'Contactez-nous'}</h2>
            <p>{isRtl ? 'للتواصل مع الأمانة العامة للمجلس الأعلى' : locale === 'en' ? 'Get in touch with the General Secretariat' : 'Prenez contact avec le Secrétariat Général'}</p>
            <div className="section-line"></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <form onSubmit={(e) => { e.preventDefault(); alert(isRtl ? 'تم الإرسال بنجاح إلى الأمانة العامة' : locale === 'en' ? 'Message successfully sent!' : 'Message envoyé avec succès au Secrétariat !'); }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">{isRtl ? 'الاسم واللقب' : locale === 'en' ? 'Full Name' : 'Nom complet'}</label>
                <input required className="form-input" placeholder={isRtl ? 'أدخل اسمك الكامل...' : locale === 'en' ? 'Your full name...' : 'Votre nom complet...'} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">{isRtl ? 'البريد الإلكتروني المهني' : locale === 'en' ? 'Official Email' : 'Email professionnel'}</label>
                <input type="email" required className="form-input" placeholder="email@institution.dz" />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">{isRtl ? 'الموضوع' : locale === 'en' ? 'Subject' : 'Sujet'}</label>
                <input required className="form-input" placeholder={isRtl ? 'موضوع المراسلة أو الاستشارة...' : locale === 'en' ? 'Purpose of contact or advisory...' : 'Objet de la saisine ou consultation...'} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{isRtl ? 'نص الرسالة' : locale === 'en' ? 'Message' : 'Message'}</label>
                <textarea required rows={5} className="form-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} placeholder={isRtl ? 'حرر رسالتك أو استشارتك هنا...' : locale === 'en' ? 'Write your inquiry or scientific brief here...' : 'Rédigez votre message ou saisine ici...' }></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {isRtl ? 'إرسال الرسالة' : locale === 'en' ? 'Send Message' : 'Envoyer le message'} {arrowForward}
              </button>
            </form>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--gray-100)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                {isRtl ? 'معلومات الاتصال الرسمية' : locale === 'en' ? 'Official Contact Information' : 'Informations Officielles'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem' }}>🏛️</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{isRtl ? 'المقر' : locale === 'en' ? 'Headquarters' : 'Siège'}</div>
                    <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{isRtl ? 'الجزائر العاصمة، الجمهورية الجزائرية' : locale === 'en' ? 'Algiers, Algeria' : 'Alger, Algérie'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem' }}>📧</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email</div>
                    <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>contact@hccsne.dz</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem' }}>📞</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{isRtl ? 'الهاتف' : locale === 'en' ? 'Telephone' : 'Téléphone'}</div>
                    <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>+213 (0) 21 XX XX XX</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--green-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--green-100)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--green-700)', fontWeight: 600 }}>
                  🏛️ {isRtl ? 'المرسوم الرئاسي رقم 26-293 المؤرخ في 7 سبتمبر 2026' : locale === 'en' ? 'Presidential Decree No. 26-293 of September 7, 2026' : 'Décret présidentiel n° 26-293 du 7 septembre 2026'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>HCCSNE</h3>
            <p>{t.footer.description}</p>
            <p style={{ marginTop: '1rem', color: 'var(--gray-400)', fontSize: '0.85rem' }}>📍 {t.footer.address}</p>
          </div>
          <div className="footer-links">
            <h4>{t.footer.quickLinks}</h4>
            <ul>
              <li><a href="#news">{t.nav.news || (isRtl ? 'المستجدات' : locale === 'en' ? 'News' : 'Actualités')}</a></li>
              <li><a href="#missions">{t.nav.about}</a></li>
              <li><a href="#members">{t.nav.members}</a></li>
              <li><a href="#domains">{t.nav.domains}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t.nav.language}</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setLocale('fr'); }}>🇫🇷 Français</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setLocale('en'); }}>🇬🇧 English</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setLocale('ar'); }}>🇩🇿 العربية</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t.footer.copyright}</span>
          <div className="footer-flag">
            <svg width="30" height="20" viewBox="0 0 900 600" style={{ borderRadius: '3px' }}>
              <rect width="450" height="600" fill="#006233" />
              <rect x="450" width="450" height="600" fill="#FFF" />
              <circle cx="450" cy="300" r="100" fill="#D21034" />
              <circle cx="470" cy="300" r="80" fill="#006233" />
              <mask id="fm"><rect x="450" y="0" width="450" height="600" fill="white" /></mask>
              <circle cx="470" cy="300" r="80" fill="white" mask="url(#fm)" />
              <polygon points="490,270 497,292 520,292 502,306 509,328 490,315 471,328 478,306 460,292 483,292" fill="#D21034" />
            </svg>
          </div>
        </div>
      </footer>
    </>
  );
}
