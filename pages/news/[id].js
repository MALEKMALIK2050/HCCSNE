import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLocale } from '../_app';

export default function NewsArticle() {
  const router = useRouter();
  const { id } = router.query;
  const { t, locale, setLocale, dir } = useLocale();
  const isRtl = locale === 'ar' || dir === 'rtl';

  const newsItems = (t.newsSection && t.newsSection.items) || [];
  const articleId = parseInt(id, 10) || 1;
  const article = newsItems.find((n) => n.id === articleId) || newsItems[0];

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <p>Chargement du communiqué officiel...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} — HCCSNE</title>
        <meta name="description" content={article.summary} />
      </Head>

      <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
        {/* Top Institutional Header */}
        <header
          style={{
            background: 'linear-gradient(135deg, #003820 0%, #006233 60%, #007A40 100%)',
            color: '#ffffff',
            padding: '1.25rem 2rem',
            borderBottom: '2px solid #C8A951',
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                }}
              >
                HC
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px' }}>HCCSNE</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 600 }}>
                  {isRtl ? 'الجمهورية الجزائرية الديمقراطية الشعبية' : locale === 'en' ? 'People’s Democratic Republic of Algeria' : 'République Algérienne Démocratique et Populaire'}
                </div>
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="lang-switcher" style={{ background: 'rgba(255,255,255,0.15)' }}>
                {['fr', 'en', 'ar'].map((l) => (
                  <button
                    key={l}
                    className={"lang-btn " + (locale === l ? "active" : "")}
                    onClick={() => setLocale(l)}
                    style={{ color: locale === l ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              <Link
                href="/"
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                }}
              >
                {isRtl ? '← العودة إلى البوابة' : locale === 'en' ? '← Back to Portal' : '← Retour au portail'}
              </Link>
            </div>
          </div>
        </header>

        {/* Main Article Container */}
        <main style={{ maxWidth: 960, margin: '2.5rem auto 4rem', padding: '0 1.5rem' }}>
          {/* Article Header Card */}
          <div
            className="glass-card-spotlight"
            style={{
              padding: '2.5rem 3rem',
              marginBottom: '2rem',
              background: '#ffffff',
              borderTop: '4px solid #006233',
            }}
          >
            {/* Tag, Date, Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#065f46',
                  padding: '5px 14px',
                  borderRadius: 16,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  border: '1px solid #a7f3d0',
                }}
              >
                {article.tag}
              </span>
              <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>
                📅 {article.date}
              </span>
              <span style={{ fontSize: '0.86rem', color: '#006233', fontWeight: 700 }}>
                📍 {article.location}
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.3,
                marginBottom: '1.5rem',
              }}
            >
              {article.title}
            </h1>

            {/* Lead Summary */}
            <p
              style={{
                fontSize: '1.12rem',
                fontWeight: 600,
                color: '#334155',
                lineHeight: 1.8,
                padding: '1.25rem 1.5rem',
                background: '#f8fafc',
                borderRadius: 16,
                borderLeft: isRtl ? 'none' : '4px solid #006233',
                borderRight: isRtl ? '4px solid #006233' : 'none',
                marginBottom: '2rem',
              }}
            >
              {article.summary}
            </p>

            {/* Official Photo */}
            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                marginBottom: '2.5rem',
                position: 'relative',
              }}
            >
              <img
                src={article.image}
                alt={article.title}
                style={{
                  width: '100%',
                  maxHeight: 520,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                style={{
                  padding: '10px 16px',
                  background: '#0f172a',
                  color: '#e2e8f0',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  {isRtl ? 'الصورة الرسمية: رئاسة الجمهورية الجزائرية / وكالة الأنباء الجزائرية' : 'Photographie officielle : Présidence de la République / Agence Algérie Presse Service (APS)'}
                </span>
                <span style={{ color: '#94a3b8' }}>
                  {article.location}
                </span>
              </div>
            </div>

            {/* Full Body Content */}
            <div
              style={{
                fontSize: '1.05rem',
                color: '#334155',
                lineHeight: 1.9,
                whiteSpace: 'pre-line',
                marginBottom: '2.5rem',
              }}
            >
              {article.fullContent || article.summary}
            </div>

            {/* Presidential Decree Reference Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                borderRadius: 18,
                padding: '1.75rem 2rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isRtl ? 'السند القانوني والمؤسساتي' : 'Fondement Légal & Institutionnel'}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                  {isRtl ? 'المرسوم 26-293' : 'Décret n° 26-293'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.65 }}>
                {isRtl
                  ? 'يخضع المجلس الأعلى لأحكام المرسوم الرئاسي رقم 26-293 المؤرخ في 7 سبتمبر 2026، كأعلى هيئة استشارية وطنية تابعة مباشرة للسيد رئيس الجمهورية.'
                  : 'Institué par Décret présidentiel n° 26-293 du 7 septembre 2026, le Haut Conseil est placé directement auprès de Monsieur le Président de la République en tant qu’organe consultatif suprême de souveraineté scientifique.'}
              </p>
            </div>

            {/* Actions Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <button
                onClick={handleCopyLink}
                style={{
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                🔗 {copied ? (isRtl ? 'تم نسخ الرابط !' : 'Lien copié !') : (isRtl ? 'نسخ رابط البيان' : 'Copier le lien')}
              </button>

              <Link
                href="/"
                style={{
                  padding: '10px 22px',
                  background: 'linear-gradient(135deg, #006233, #007A40)',
                  color: '#ffffff',
                  borderRadius: 10,
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                {isRtl ? '← العودة إلى الصفحة الرئيسية' : locale === 'en' ? '← Return to Portal Homepage' : '← Retour au portail principal'}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
