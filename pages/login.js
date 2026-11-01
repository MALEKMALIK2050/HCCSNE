import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useLocale } from './_app';
import { useRouter } from 'next/router';

export default function Login() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (router.query.verified === 'true') setSuccess(locale === 'ar' ? 'تم تفعيل حسابك!' : locale === 'en' ? 'Account activated!' : 'Compte activé avec succès !');
    if (router.query.error === 'token_invalide') setError(locale === 'ar' ? 'رابط غير صالح' : 'Lien de vérification invalide');
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      router.push('/dashboard');
    } catch(err) { setError(err.message); } finally { setLoading(false); }
  };

  const IS = {width:'100%',padding:'12px 16px',borderRadius:'10px',border:'1.5px solid var(--gray-200)',fontSize:'0.95rem',outline:'none'};

  return (
    <>
      <Head><title>{`HCCSNE — ${locale === 'ar' ? 'تسجيل الدخول' : 'Connexion'}`}</title></Head>
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(165deg,var(--dark-900) 0%,var(--dark-800) 40%,var(--green-900) 100%)',padding:'2rem'}}>
        <div style={{background:'var(--white)',borderRadius:'24px',padding:'3rem',maxWidth:'440px',width:'100%',boxShadow:'var(--shadow-2xl)'}}>
          <div style={{textAlign:'center',marginBottom:'2rem'}}>
            <div style={{width:60,height:60,borderRadius:'12px',background:'linear-gradient(135deg,var(--green-700),var(--green-500))',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'1.5rem',fontWeight:900,marginBottom:'1rem',boxShadow:'var(--shadow-green)'}}>HC</div>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',color:'var(--dark-800)'}}>{t.auth.loginTitle}</h2>
            <div style={{display:'flex',justifyContent:'center',gap:4,marginTop:'1rem'}}>
              {['en','ar','fr'].map(l => (<button key={l} className={"lang-btn " + (locale===l ? "active" : "")} onClick={() => setLocale(l)} style={{padding:'4px 10px',fontSize:'0.7rem'}}>{l.toUpperCase()}</button>))}
            </div>
          </div>
          {success && <div style={{background:'var(--green-50)',border:'1px solid var(--green-100)',borderRadius:'10px',padding:'0.75rem 1rem',color:'var(--green-700)',fontSize:'0.85rem',marginBottom:'1.5rem'}}>✅ {success}</div>}
          {error && <div style={{background:'var(--red-50)',border:'1px solid var(--red-100)',borderRadius:'10px',padding:'0.75rem 1rem',color:'var(--red-600)',fontSize:'0.85rem',marginBottom:'1.5rem'}}>⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:'1.25rem'}}><label className="form-label">{t.auth.email}</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={IS}/></div>
            <div style={{marginBottom:'1.5rem'}}><label className="form-label">{t.auth.password}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={IS}/></div>
            <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:'1rem'}} disabled={loading}>{loading ? '⏳...' : t.auth.loginBtn}</button>
          </form>
          <div style={{textAlign:'center',marginTop:'1.5rem'}}><a href="#" style={{fontSize:'0.85rem',color:'var(--green-600)',fontWeight:500}}>{t.auth.forgotPassword}</a></div>
          <div style={{textAlign:'center',marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid var(--gray-100)'}}><span style={{fontSize:'0.85rem',color:'var(--gray-400)'}}>{t.auth.noAccount} <Link href="/register" style={{color:'var(--green-600)',fontWeight:600}}>{t.auth.registerHere}</Link></span></div>
          <div style={{textAlign:'center',marginTop:'1rem'}}><Link href="/" style={{fontSize:'0.85rem',color:'var(--gray-300)'}}>← {t.nav.home}</Link></div>
        </div>
      </div>
    </>
  );
}
