import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useLocale } from './_app';
import { useRouter } from 'next/router';
import { SPECIALTIES } from '@/lib/specialties';

export default function Register() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const [form, setForm] = useState({ nom:'', prenom:'', email:'', password:'', confirmPassword:'', specialite:'', institution:'', pays:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const L = {
    fr: { title:"Demande d'accès au portail", nom:'Nom', prenom:'Prénom', email:'Email', password:'Mot de passe (min. 8 car.)', confirm:'Confirmer', specialite:'Spécialité', institution:'Institution', pays:'Pays de résidence', submit:"Soumettre la demande", has:'Déjà un compte ?', login:'Se connecter', passMin:'Min. 8 caractères', passMatch:'Mots de passe différents', success:'Compte créé ! Vérifiez votre email.' },
    en: { title:'Request Portal Access', nom:'Last Name', prenom:'First Name', email:'Email', password:'Password (min. 8 chars)', confirm:'Confirm', specialite:'Specialty', institution:'Institution', pays:'Country', submit:'Submit Request', has:'Have an account?', login:'Sign in', passMin:'Min. 8 characters', passMatch:'Passwords do not match', success:'Account created! Check your email.' },
    ar: { title:'طلب الانضمام', nom:'اللقب', prenom:'الاسم', email:'البريد الإلكتروني', password:'كلمة المرور (8 أحرف)', confirm:'تأكيد', specialite:'التخصص', institution:'المؤسسة', pays:'البلد', submit:'إرسال الطلب', has:'لديك حساب؟', login:'دخول', passMin:'8 أحرف على الأقل', passMatch:'كلمتا المرور مختلفتان', success:'تم إنشاء الحساب! تحقق من بريدك.' },
  }[locale] || {};

  const set = (f) => (e) => setForm({...form, [f]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (form.password.length < 8) { setError(L.passMin); setLoading(false); return; }
    if (form.password !== form.confirmPassword) { setError(L.passMatch); setLoading(false); return; }
    try {
      const res = await fetch('/api/auth/register', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email:form.email, password:form.password, nom:form.nom, prenom:form.prenom, specialite:form.specialite, institution:form.institution, pays:form.pays }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      alert(L.success || data.message);
      router.push('/login');
    } catch(err) { setError(err.message); } finally { setLoading(false); }
  };

  const IS = {width:'100%',padding:'12px 16px',borderRadius:'10px',border:'1.5px solid var(--gray-200)',fontSize:'0.95rem',outline:'none',background:'var(--white)',fontFamily:'inherit'};

  return (
    <>
      <Head><title>{`HCCSNE — ${L.title || ''}`}</title></Head>
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(165deg,var(--dark-900) 0%,var(--dark-800) 40%,var(--green-900) 100%)',padding:'2rem'}}>
        <div style={{background:'var(--white)',borderRadius:'24px',padding:'2.5rem',maxWidth:'520px',width:'100%',boxShadow:'var(--shadow-2xl)',maxHeight:'92vh',overflowY:'auto'}}>
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{width:56,height:56,borderRadius:'12px',background:'linear-gradient(135deg,var(--green-700),var(--green-500))',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'1.4rem',fontWeight:900,marginBottom:'0.75rem',boxShadow:'var(--shadow-green)'}}>HC</div>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',color:'var(--dark-800)'}}>{L.title}</h2>
            <div style={{display:'flex',justifyContent:'center',gap:4,marginTop:'0.75rem'}}>
              {['en','ar','fr'].map(l => (<button key={l} className={"lang-btn " + (locale===l ? "active" : "")} onClick={() => setLocale(l)} style={{padding:'4px 10px',fontSize:'0.7rem'}}>{l.toUpperCase()}</button>))}
            </div>
          </div>
          {error && <div style={{background:'var(--red-50)',border:'1px solid var(--red-100)',borderRadius:'10px',padding:'0.75rem 1rem',color:'var(--red-600)',fontSize:'0.85rem',marginBottom:'1rem'}}>⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem'}}>
              <div><label className="form-label">{L.prenom} *</label><input required value={form.prenom} onChange={set('prenom')} style={IS}/></div>
              <div><label className="form-label">{L.nom} *</label><input required value={form.nom} onChange={set('nom')} style={IS}/></div>
            </div>
            <div style={{marginBottom:'0.75rem'}}><label className="form-label">{L.email} *</label><input type="email" required value={form.email} onChange={set('email')} style={IS}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem'}}>
              <div><label className="form-label">{L.password} *</label><input type="password" required value={form.password} onChange={set('password')} style={IS}/></div>
              <div><label className="form-label">{L.confirm} *</label><input type="password" required value={form.confirmPassword} onChange={set('confirmPassword')} style={IS}/></div>
            </div>
            <div style={{marginBottom:'0.75rem'}}>
              <label className="form-label">{L.specialite} * (Commission d'affectation)</label>
              <select required value={form.specialite} onChange={set('specialite')} style={{...IS, cursor:'pointer', background:'#ffffff'}}>
                <option value="">-- Sélectionnez votre domaine de spécialité --</option>
                {SPECIALTIES.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1.25rem'}}>
              <div><label className="form-label">{L.institution}</label><input value={form.institution} onChange={set('institution')} style={IS}/></div>
              <div><label className="form-label">{L.pays}</label><input value={form.pays} onChange={set('pays')} style={IS}/></div>
            </div>
            <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:'1rem'}} disabled={loading}>{loading ? '⏳...' : L.submit} →</button>
          </form>
          <div style={{textAlign:'center',marginTop:'1.25rem',paddingTop:'1rem',borderTop:'1px solid var(--gray-100)'}}>
            <span style={{fontSize:'0.85rem',color:'var(--gray-400)'}}>{L.has} <Link href="/login" style={{color:'var(--green-600)',fontWeight:600}}>{L.login}</Link></span>
          </div>
          <div style={{textAlign:'center',marginTop:'0.75rem'}}><Link href="/" style={{fontSize:'0.85rem',color:'var(--gray-300)'}}>← {t.nav.home}</Link></div>
        </div>
      </div>
    </>
  );
}
