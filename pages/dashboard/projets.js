import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import StrategicProjectsModule from '@/components/StrategicProjectsModule';
import { ROLE_LABELS } from '@/lib/specialties';

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    router.push('/login');
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: '1.1rem',
          color: '#64748b',
          fontFamily: 'sans-serif',
        }}
      >
        Chargement des projets stratégiques...
      </div>
    );
  }

  if (!user) return null;

  const roleMeta = ROLE_LABELS[user.role] || ROLE_LABELS.MEMBER;

  return (
    <>
      <Head>
        <title>Projets Stratégiques Nationaux | HCCSNE - République Algérienne</title>
        <meta name="description" content="Portefeuille des projets stratégiques nationaux et internationaux du Haut Conseil HCCSNE" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
        {/* Top Header */}
        <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
          <div
            style={{
              maxWidth: 1320,
              margin: '0 auto',
              padding: '0.85rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #006233, #007A40)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                }}
              >
                🇩🇿
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#006233', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  HCCSNE
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                  Portail Stratégique • Décret 26-293
                </div>
              </div>
            </Link>

            {/* Nav Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Link
                href="/dashboard"
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                ← Tableau de Bord
              </Link>

              <Link
                href="/dashboard/chat"
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Messagerie
              </Link>

              {/* User badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px 4px 6px',
                  background: roleMeta.bg,
                  borderRadius: 20,
                  border: `1px solid ${roleMeta.color}30`,
                }}
              >
                {user.photo ? (
                  <img src={user.photo} alt={user.nom} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: roleMeta.color }} />
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: roleMeta.color }}>
                  {user.prenom} {user.nom}
                </span>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Action Notice Notification */}
        {actionNotice && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 99999,
              background: actionNotice.type === 'success' ? '#006233' : '#dc2626',
              color: 'white',
              padding: '12px 20px',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{actionNotice.text}</span>
          </div>
        )}

        {/* Main Body */}
        <main style={{ padding: '2rem 1.5rem' }}>
          <StrategicProjectsModule
            user={user}
            filterCommission={router.query.commission || ''}
            onActionNotice={(n) => {
              setActionNotice(n);
              setTimeout(() => setActionNotice(null), 4000);
            }}
          />
        </main>
      </div>
    </>
  );
}
