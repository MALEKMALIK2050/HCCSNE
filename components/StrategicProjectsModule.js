import { useState, useEffect, useRef } from 'react';
import { SPECIALTIES } from '@/lib/specialties';
import {
  PROJECT_STATUSES,
  PASSATION_TYPES,
  ECONOMIC_MODELS,
  PRIORITIES,
  calculateProgressFromMilestones,
  determineStatusFromProgress,
} from '@/lib/projects-config';

// -------------------------------------------------------------
// Elegant Micro SVG Icons (Sober, Institutional, Presidential)
// -------------------------------------------------------------
const Icons = {
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  FileText: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  Print: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  ShieldCheck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <polyline points="9 12 11 14 15 10"></polyline>
    </svg>
  ),
  Building: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="9" y1="22" x2="9" y2="22.01"></line>
      <line x1="15" y1="22" x2="15" y2="22.01"></line>
      <line x1="9" y1="6" x2="9" y2="6.01"></line>
      <line x1="15" y1="6" x2="15" y2="6.01"></line>
      <line x1="9" y1="10" x2="9" y2="10.01"></line>
      <line x1="15" y1="10" x2="15" y2="10.01"></line>
      <line x1="9" y1="14" x2="9" y2="14.01"></line>
      <line x1="15" y1="14" x2="15" y2="14.01"></line>
      <line x1="9" y1="18" x2="9" y2="18.01"></line>
      <line x1="15" y1="18" x2="15" y2="18.01"></line>
    </svg>
  ),
  Upload: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Info: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
};

export default function StrategicProjectsModule({
  user,
  onActionNotice,
  filterCommission = '',
  onClearCommissionFilter,
}) {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState(filterCommission || '');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Synchronize when filterCommission prop changes from parent
  useEffect(() => {
    if (filterCommission !== undefined) {
      setFilterSpecialty(filterCommission);
    }
  }, [filterCommission]);

  // Selected project for Details / Checklist view
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeTabSubView, setActiveTabSubView] = useState('commission'); // 'commission' | 'all'

  // Coordinator live feedback state by project id
  const [coordOpinions, setCoordOpinions] = useState({});
  const [coordStatuses, setCoordStatuses] = useState({});
  const [submittingCoordReview, setSubmittingCoordReview] = useState(null);

  // External project summary modal (for member viewing another commission's project)
  const [summaryModalProject, setSummaryModalProject] = useState(null);

  // Project Creation Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [savingProject, setSavingProject] = useState(false);

  const [newProjectForm, setNewProjectForm] = useState({
    titre: '',
    specialite: user?.specialite || SPECIALTIES[0]?.name || '',
    priorite: 'STRATEGIQUE',
    objectifs: '',
    tdrTexte: '',
    impactSouverainete: '',
    universitesAlge: '',
    universitesEtrang: '',
    entreprisesAlge: '',
    entreprisesEtrang: '',
    ministeresTutelle: '',
    modeleEconomique: ECONOMIC_MODELS[0]?.label || '',
    typePassation: PASSATION_TYPES[0]?.label || '',
    impactEconomique: '',
    budgetDZD: '',
    budgetDevises: '',
    devise: 'EUR',
    sourcesFinancement: '',
    dureeMois: 24,
    dateDebut: new Date().toISOString().split('T')[0],
  });

  // TDR file upload
  const tdrInputRef = useRef(null);
  const [uploadingTdr, setUploadingTdr] = useState(false);

  // Printable Export modal
  const [exportModalProject, setExportModalProject] = useState(null);

  // Role booleans
  const isAdmin = user?.role === 'ADMIN';
  const isCoordinator = user?.role === 'COORDINATOR';
  const isLeader = user?.role === 'LEADER';
  const isMember = !isAdmin && !isCoordinator && !isLeader;
  const userSpecialite = user?.specialite || '';

  // Who can create projects?
  // Chef de Commission (for their commission), Coordinator, Admin
  const canCreateNewProject = isAdmin || isCoordinator || isLeader;

  // Load projects from API
  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSpecialty) params.append('specialite', filterSpecialty);
      if (filterStatus) params.append('statut', filterStatus);
      if (filterPriority) params.append('priorite', filterPriority);
      if (search) params.append('search', search);

      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
        setStats(data.stats || null);

        // Prepopulate coordinator fields for active coordinator
        const initOpinions = {};
        const initStatuses = {};
        (data.projects || []).forEach((p) => {
          initOpinions[p.id] = p.avisCoordinateur || '';
          initStatuses[p.id] = p.statutValidationCoordinateur || 'VALIDE';
        });
        setCoordOpinions(initOpinions);
        setCoordStatuses(initStatuses);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [filterSpecialty, filterStatus, filterPriority]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProjects();
  };

  // Toggle milestone in checklist (Members of that commission, Leader, Coordinator, Admin)
  const handleToggleMilestone = async (projectId, milestoneId, currentVal) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/toggle-milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, completed: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, avancement: data.newProgress, statut: data.newStatus, jalons: data.project.jalons }
              : p
          )
        );
        if (onActionNotice) {
          onActionNotice({ type: 'success', text: data.message });
        }
      } else {
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      alert('Erreur réseau lors de la validation du jalon');
    }
  };

  // Upload TDR File
  const handleUploadTdrFile = async (e, projectId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Le document est trop volumineux (taille maximale autorisée : 20 Mo).');
      return;
    }

    setUploadingTdr(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        const res = await fetch(`/api/projects/${projectId}/upload-document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            title: `Termes de Référence (TDR) - ${file.name}`,
            type: 'TDR',
            filename: file.name,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    tdrFichierUrl: data.fileUrl,
                    tdrFichierNom: data.filename,
                    documents: data.project.documents || p.documents,
                  }
                : p
            )
          );
          if (onActionNotice) {
            onActionNotice({ type: 'success', text: 'Document TDR téléversé et consigné dans le dossier officiel.' });
          }
        } else {
          alert(data.error || 'Erreur lors du téléversement du document.');
        }
      } catch (err) {
        alert('Erreur réseau lors de l’envoi');
      } finally {
        setUploadingTdr(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Coordinator Arbitrate & Validate Action (Exclusive to Coordinator)
  const handleSubmitCoordinatorReview = async (projectId) => {
    const avis = coordOpinions[projectId] || '';
    const statut = coordStatuses[projectId] || 'VALIDE';

    setSubmittingCoordReview(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}/coordinator-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avisCoordinateur: avis,
          statutValidationCoordinateur: statut,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, ...data.project } : p))
        );
        if (onActionNotice) {
          onActionNotice({
            type: 'success',
            text: 'Avis officiel et décision de la Coordination Générale enregistrés.',
          });
        }
      } else {
        alert(data.error || 'Erreur lors de l’enregistrement de l’avis.');
      }
    } catch (err) {
      alert('Erreur réseau');
    } finally {
      setSubmittingCoordReview(null);
    }
  };

  // Create Project Submit (Leader of Commission, Coordinator, Admin)
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectForm.titre || !newProjectForm.specialite) {
      alert('Veuillez renseigner le titre du projet et la commission de rattachement.');
      return;
    }

    setSavingProject(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjectForm),
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => [data.project, ...prev]);
        setWizardOpen(false);
        setWizardStep(1);
        setNewProjectForm({
          titre: '',
          specialite: user?.specialite || SPECIALTIES[0]?.name || '',
          priorite: 'STRATEGIQUE',
          objectifs: '',
          tdrTexte: '',
          impactSouverainete: '',
          universitesAlge: '',
          universitesEtrang: '',
          entreprisesAlge: '',
          entreprisesEtrang: '',
          ministeresTutelle: '',
          modeleEconomique: ECONOMIC_MODELS[0]?.label || '',
          typePassation: PASSATION_TYPES[0]?.label || '',
          impactEconomique: '',
          budgetDZD: '',
          budgetDevises: '',
          devise: 'EUR',
          sourcesFinancement: '',
          dureeMois: 24,
          dateDebut: new Date().toISOString().split('T')[0],
        });
        if (onActionNotice) {
          onActionNotice({ type: 'success', text: data.message });
        }
        loadProjects();
      } else {
        alert(data.error || 'Erreur lors de la création du projet');
      }
    } catch (err) {
      alert('Erreur réseau');
    } finally {
      setSavingProject(false);
    }
  };

  // Delete project (Leader of the commission, Coordinator, Admin)
  const handleDeleteProject = async (projectId, code, titre) => {
    if (!confirm(`Confirmez-vous la suppression du projet stratégique "${titre}" (${code}) ? Cette action est irréversible.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        if (selectedProjectId === projectId) setSelectedProjectId(null);
        if (onActionNotice) {
          onActionNotice({ type: 'success', text: data.message });
        }
        loadProjects();
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  // Determine permissions per project
  const canEditProject = (proj) => {
    if (isAdmin || isCoordinator) return true;
    if (isLeader && proj.specialite === userSpecialite) return true;
    return false;
  };

  const canDeleteProject = (proj) => {
    if (isAdmin || isCoordinator) return true;
    if (isLeader && proj.specialite === userSpecialite) return true;
    return false;
  };

  const canWorkOnProject = (proj) => {
    if (isAdmin || isCoordinator) return true;
    if (proj.specialite === userSpecialite) return true;
    return false;
  };

  // Partition projects:
  // For Admin & Coordinator: All fetched projects (filtered by filterSpecialty in API) are in full detail.
  // For Leader & Member:
  // If filterSpecialty is selected:
  //   - If filterSpecialty === userSpecialite: myCommissionProjects has them in full detail.
  //   - If filterSpecialty !== userSpecialite: otherCommissionProjects has them in summary table!
  // If no filterSpecialty is selected:
  //   - myCommissionProjects has projects matching userSpecialite.
  //   - otherCommissionProjects has all other projects.
  const myCommissionProjects = (isAdmin || isCoordinator)
    ? projects
    : (filterSpecialty && filterSpecialty !== userSpecialite)
    ? []
    : projects.filter((p) => p.specialite === userSpecialite);

  const otherCommissionProjects = (isAdmin || isCoordinator)
    ? []
    : (filterSpecialty && filterSpecialty === userSpecialite)
    ? []
    : (filterSpecialty && filterSpecialty !== userSpecialite)
    ? projects.filter((p) => p.specialite === filterSpecialty)
    : projects.filter((p) => p.specialite !== userSpecialite);

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* ------------------------------------------------------------- */}
      {/* Top Banner: Sovereign Republican Header (Zero Emojis) */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          background: 'linear-gradient(135deg, #004d28 0%, #006233 55%, #057a44 100%)',
          borderRadius: 16,
          padding: '2.25rem 2.5rem',
          color: '#ffffff',
          marginBottom: '2rem',
          border: '1px solid #00502a',
          boxShadow: '0 8px 30px rgba(0, 98, 51, 0.16)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.14)',
                padding: '4px 14px',
                borderRadius: 20,
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#fef08a',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              <span>République Algérienne Démocratique et Populaire</span>
              <span>•</span>
              <span>Décret Présidentiel N° 26-293</span>
            </div>

            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              Portefeuille des Projets Stratégiques Nationaux
            </h2>

            <p style={{ margin: 0, fontSize: '0.92rem', color: '#e2e8f0', maxWidth: 840, lineHeight: 1.55 }}>
              {isAdmin
                ? 'Supervision administrative et consolidée des initiatives stratégiques des 10 commissions souveraines.'
                : isCoordinator
                ? 'Tour de contrôle présidentielle. Arbitrage stratégique, cadrage des Termes de Référence et validation exécutive des projets (Pr. Elias Zerhouni).'
                : isLeader
                ? `Direction des projets de la Commission ${userSpecialite || 'Souveraine'}. Élaboration des Termes de Référence, structuration des consortiums et gouvernance des jalons.`
                : `Espace de travail collaboratif de la Commission ${userSpecialite || 'Souveraine'}. Consultez les TDR, réalisez les jalons techniques et accédez à la synthèse nationale.`}
            </p>
          </div>

          {/* Action Button: Create Project (Leader, Coordinator, Admin) */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {canCreateNewProject ? (
              <button
                type="button"
                onClick={() => {
                  setNewProjectForm({
                    ...newProjectForm,
                    specialite: isLeader ? userSpecialite : (userSpecialite || SPECIALTIES[0]?.name || ''),
                  });
                  setWizardOpen(true);
                }}
                style={{
                  padding: '11px 20px',
                  background: '#facc15',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'background 0.15s ease',
                }}
              >
                <Icons.Plus />
                <span>Nouveau Projet Stratégique</span>
              </button>
            ) : (
              <div
                style={{
                  padding: '9px 16px',
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  maxWidth: 280,
                  lineHeight: 1.35,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Initiation des fiches projets habilitée auprès du Chef de Commission.
              </div>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '11px 18px',
                background: 'rgba(255,255,255,0.14)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.28)',
                borderRadius: 10,
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icons.Print />
              <span>Synthèse Imprimable (PDF)</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Cards */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1.75rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 10 }}>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Projets au Portefeuille
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fef08a' }}>{stats.totalProjects}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 10 }}>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Avancement Moyen
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#86efac' }}>{stats.avgProgress}%</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 10 }}>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Budget Mobilisé (DZD)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                {(stats.totalDZD / 1000000).toFixed(1)} M DZD
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 10 }}>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Composante Devises
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fde047' }}>
                {(stats.totalDevises / 1000000).toFixed(1)} M $/€
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 10 }}>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                En Réalisation & Pilote
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#38bdf8' }}>
                {(stats.byStatus?.EN_REALISATION || 0) + (stats.byStatus?.FINALISE || 0)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Filter and Search Bar */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '1.15rem 1.4rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 320px', display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par intitulé, code, université, industriel ou mot-clé..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  background: '#f8fafc',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }}>
                <Icons.Search />
              </div>
            </div>
            <button
              type="submit"
              style={{
                padding: '9px 16px',
                background: '#006233',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Filtrer
            </button>
          </form>

          {/* Quick Clear */}
          {(filterSpecialty || filterStatus || filterPriority || search) && (
            <button
              type="button"
              onClick={() => {
                setFilterSpecialty('');
                setFilterStatus('');
                setFilterPriority('');
                setSearch('');
              }}
              style={{
                background: 'none',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '7px 12px',
                borderRadius: 8,
              }}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Dropdowns (Available for Coordinator & Admin, or to filter general view) */}
        {(isAdmin || isCoordinator) && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filtres :
            </span>

            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 7,
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                color: '#334155',
                background: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="">Toutes les Commissions (10)</option>
              {SPECIALTIES.map((spec) => (
                <option key={spec.id} value={spec.name}>
                  {spec.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 7,
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                color: '#334155',
                background: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="">Tous les Statuts</option>
              {Object.values(PROJECT_STATUSES).map((st) => (
                <option key={st.code} value={st.code}>
                  {st.label}
                </option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 7,
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                color: '#334155',
                background: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="">Toutes les Priorités</option>
              {PRIORITIES.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Loading & Empty State */}
      {/* ------------------------------------------------------------- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b', background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>Chargement du portefeuille stratégique en cours...</div>
        </div>
      ) : projects.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '3.5rem 2rem',
            textAlign: 'center',
            border: '1px dashed #cbd5e1',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Aucun projet stratégique enregistré pour ces critères
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: 520, margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            {canCreateNewProject
              ? 'Initiez une fiche de cadrage pour cette commission en renseignant les Termes de Référence et les universités partenaires.'
              : 'Aucun projet n’est encore initialisé pour votre commission sectorielle. Le Chef de Commission ouvrira prochainement les fiches d’exécution.'}
          </p>
          {canCreateNewProject && (
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              style={{
                padding: '9px 20px',
                background: '#006233',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Élaborer une Fiche Projet
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Active Commission Filter Notification Banner */}
          {filterSpecialty && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1.5px solid #006233',
                borderRadius: 12,
                padding: '12px 18px',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                boxShadow: '0 2px 8px rgba(0, 98, 51, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#006233',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: 6,
                    border: '1px solid #a7f3d0',
                  }}
                >
                  Filtre Commission Actif
                </span>
                <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                  {filterSpecialty}
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    background: '#006233',
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  {projects.length} {projects.length > 1 ? 'projets répertoriés' : 'projet répertorié'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFilterSpecialty('');
                  if (onClearCommissionFilter) onClearCommissionFilter();
                }}
                style={{
                  padding: '6px 14px',
                  background: '#ffffff',
                  border: '1px solid #006233',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#006233',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>×</span>
                <span>Afficher toutes les commissions</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 1: PROJETS DE LA COMMISSION (OU TOUS POUR COORD/ADMIN) */}
          {/* ========================================================= */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #006233', paddingBottom: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#006233', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isAdmin || isCoordinator ? 'Gouvernance Consolidée' : 'Espace de Travail Sectoriel'}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {filterSpecialty
                    ? `Projets de la Commission : ${filterSpecialty}`
                    : isAdmin || isCoordinator
                    ? 'Projets Stratégiques Nationaux (10 Commissions Souveraines)'
                    : `Projets de la Commission : ${userSpecialite || 'Non assignée'}`}
                </h3>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#006233', background: '#ecfdf5', padding: '4px 12px', borderRadius: 20 }}>
                {myCommissionProjects.length} {myCommissionProjects.length > 1 ? 'projets actifs' : 'projet actif'}
              </div>
            </div>

            {myCommissionProjects.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: 12, padding: '2.5rem', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
                  Aucun projet n’est actuellement référencé pour la commission {userSpecialite}.
                </p>
                {canCreateNewProject && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewProjectForm({ ...newProjectForm, specialite: userSpecialite });
                      setWizardOpen(true);
                    }}
                    style={{
                      padding: '8px 18px',
                      background: '#006233',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Créer le premier projet de la commission
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {myCommissionProjects.map((proj) => {
                  const statusConfig = PROJECT_STATUSES[proj.statut] || PROJECT_STATUSES.IDEATION;
                  let milestones = [];
                  try {
                    milestones = typeof proj.jalons === 'string' ? JSON.parse(proj.jalons) : proj.jalons;
                  } catch {}
                  if (!Array.isArray(milestones)) milestones = [];

                  const completedMilestonesCount = milestones.filter((m) => m.completed).length;
                  const isExpanded = selectedProjectId === proj.id;
                  const canEdit = canEditProject(proj);
                  const canDelete = canDeleteProject(proj);
                  const canWork = canWorkOnProject(proj);

                  return (
                    <div
                      key={proj.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: 14,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.2s ease',
                      }}
                    >
                      {/* Project Header Bar */}
                      <div
                        style={{
                          padding: '1.15rem 1.6rem',
                          background: '#f8fafc',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              background: '#0f172a',
                              color: '#f8fafc',
                              borderRadius: 6,
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                            }}
                          >
                            {proj.code}
                          </span>

                          <span
                            style={{
                              padding: '3px 10px',
                              background: '#ecfdf5',
                              color: '#006233',
                              border: '1px solid #a7f3d0',
                              borderRadius: 10,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {proj.specialite}
                          </span>

                          <span
                            style={{
                              padding: '3px 10px',
                              background: statusConfig.bg,
                              color: statusConfig.color,
                              border: `1px solid ${statusConfig.border}`,
                              borderRadius: 10,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {statusConfig.badge}
                          </span>

                          {/* Coordinator Validation Badge if applicable */}
                          {proj.statutValidationCoordinateur && proj.statutValidationCoordinateur !== 'EN_ATTENTE' && (
                            <span
                              style={{
                                padding: '3px 10px',
                                background: proj.statutValidationCoordinateur === 'VALIDE' ? '#dcfce7' : '#fef3c7',
                                color: proj.statutValidationCoordinateur === 'VALIDE' ? '#15803d' : '#b45309',
                                border: `1px solid ${proj.statutValidationCoordinateur === 'VALIDE' ? '#86efac' : '#fde68a'}`,
                                borderRadius: 10,
                                fontSize: '0.72rem',
                                fontWeight: 800,
                              }}
                            >
                              Coordination : {proj.statutValidationCoordinateur === 'VALIDE' ? 'Validé' : 'Réserves'}
                            </span>
                          )}
                        </div>

                        {/* Top-Right Quick Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => setExportModalProject(proj)}
                            style={{
                              padding: '6px 12px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: 7,
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Icons.FileText />
                            <span>Dossier Officiel</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProjectId(isExpanded ? null : proj.id)}
                            style={{
                              padding: '6px 14px',
                              background: isExpanded ? '#0f172a' : '#006233',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 7,
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span>{isExpanded ? 'Réduire la Fiche' : 'Consulter & Jalons'}</span>
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id, proj.code, proj.titre)}
                              title="Supprimer ce projet stratégique"
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                borderRadius: 7,
                                cursor: 'pointer',
                                padding: '6px 8px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Icons.Trash />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main Project Overview Card */}
                      <div style={{ padding: '1.4rem 1.6rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                          {/* Left Column: Title, Objectives, Stakeholders */}
                          <div>
                            <h4
                              style={{
                                margin: '0 0 0.5rem 0',
                                fontSize: '1.22rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                lineHeight: 1.35,
                              }}
                            >
                              {proj.titre}
                            </h4>

                            <p style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.86rem', lineHeight: 1.55 }}>
                              {proj.objectifs || 'Objectifs stratégiques et termes de référence en cours de formalisation.'}
                            </p>

                            {/* Stakeholders (Zero Emojis, clean institutional labels) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem' }}>
                              {proj.universitesAlge && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                  <span style={{ fontWeight: 700, color: '#006233', minWidth: 175, flexShrink: 0 }}>
                                    Algérie (Univ & Labos) :
                                  </span>
                                  <span style={{ color: '#334155' }}>{proj.universitesAlge}</span>
                                </div>
                              )}

                              {proj.universitesEtrang && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                  <span style={{ fontWeight: 700, color: '#0369a1', minWidth: 175, flexShrink: 0 }}>
                                    Diaspora & Partenaires :
                                  </span>
                                  <span style={{ color: '#334155' }}>{proj.universitesEtrang}</span>
                                </div>
                              )}

                              {proj.entreprisesAlge && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                  <span style={{ fontWeight: 700, color: '#b45309', minWidth: 175, flexShrink: 0 }}>
                                    Secteur Éco & Industrie :
                                  </span>
                                  <span style={{ color: '#334155' }}>{proj.entreprisesAlge}</span>
                                </div>
                              )}
                            </div>

                            {/* TDR File Link */}
                            {proj.tdrFichierUrl && (
                              <div
                                style={{
                                  marginTop: '1rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  background: '#f8fafc',
                                  padding: '6px 12px',
                                  borderRadius: 8,
                                  border: '1px solid #cbd5e1',
                                }}
                              >
                                <Icons.FileText />
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#006233' }}>
                                  TDR Officiels : {proj.tdrFichierNom || 'Cahier_des_charges.pdf'}
                                </span>
                                <a
                                  href={proj.tdrFichierUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    color: '#006233',
                                    textDecoration: 'underline',
                                    marginLeft: 6,
                                  }}
                                >
                                  Consulter
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Right Column: Avancement Gauge & Budget Info */}
                          <div
                            style={{
                              background: '#f8fafc',
                              borderRadius: 12,
                              padding: '1.15rem',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.85rem',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Avancement Global
                                </span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#006233' }}>
                                  {proj.avancement}%
                                </span>
                              </div>
                              <div style={{ width: '100%', height: 9, background: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${proj.avancement}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #006233 0%, #10b981 100%)',
                                    borderRadius: 8,
                                    transition: 'width 0.4s ease',
                                  }}
                                />
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 5 }}>
                                {completedMilestonesCount} sur {milestones.length || 8} phases de réalisation validées
                              </div>
                            </div>

                            {/* Budget Synthesis */}
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                              <div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Budget National</div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                                  {proj.budgetDZD ? `${(proj.budgetDZD / 1000000).toLocaleString('fr-FR')} M DZD` : 'En chiffrage'}
                                </div>
                              </div>

                              <div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Composante Devises</div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#b45309' }}>
                                  {proj.budgetDevises ? `${(proj.budgetDevises / 1000000).toLocaleString('fr-FR')} M ${proj.devise}` : 'N/A'}
                                </div>
                              </div>
                            </div>

                            {/* Passation mode */}
                            {proj.typePassation && (
                              <div style={{ fontSize: '0.72rem', color: '#475569', background: '#ffffff', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>Modalité :</span> {proj.typePassation}
                              </div>
                            )}

                            {/* Leader */}
                            {proj.leader && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 2 }}>
                                <div
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: '50%',
                                    background: '#006233',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    overflow: 'hidden',
                                  }}
                                >
                                  {proj.leader.photo ? (
                                    <img src={proj.leader.photo} alt={proj.leader.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    `${proj.leader.prenom?.[0] || ''}${proj.leader.nom?.[0] || ''}`
                                  )}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#334155' }}>
                                  Porteur : <strong style={{ color: '#0f172a' }}>Pr. {proj.leader.prenom} {proj.leader.nom}</strong>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ========================================================= */}
                        {/* EXPANDABLE SECTION: JALONS, TDR & COORDINATOR REVIEW */}
                        {/* ========================================================= */}
                        {isExpanded && (
                          <div style={{ marginTop: '1.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            
                            {/* ------------------------------------------------------------- */}
                            {/* EXCLUSIVE COORDINATOR ARBITRATION PANEL (Only for isCoordinator) */}
                            {/* ------------------------------------------------------------- */}
                            {isCoordinator && (
                              <div
                                style={{
                                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                  borderRadius: 12,
                                  border: '1.5px solid #059669',
                                  padding: '1.35rem',
                                  marginBottom: '1.5rem',
                                  boxShadow: '0 2px 10px rgba(5, 150, 105, 0.08)',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Icons.ShieldCheck />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                      Avis Stratégique & Arbitrage de la Coordination Générale (Pr. Elias Zerhouni)
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#065f46' }}>Décision :</span>
                                    <select
                                      value={coordStatuses[proj.id] || 'VALIDE'}
                                      onChange={(e) => setCoordStatuses({ ...coordStatuses, [proj.id]: e.target.value })}
                                      style={{
                                        padding: '5px 10px',
                                        borderRadius: 6,
                                        border: '1px solid #059669',
                                        background: '#ffffff',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        color: '#065f46',
                                        outline: 'none',
                                      }}
                                    >
                                      <option value="VALIDE">Validation Officielle</option>
                                      <option value="RESERVES">Validation avec Réserves</option>
                                      <option value="REVISION">Demande de Révision des TDR</option>
                                      <option value="EN_ATTENTE">En attente d'instruction</option>
                                    </select>
                                  </div>
                                </div>

                                <div style={{ marginBottom: 10 }}>
                                  <textarea
                                    rows={3}
                                    value={coordOpinions[proj.id] ?? (proj.avisCoordinateur || '')}
                                    onChange={(e) => setCoordOpinions({ ...coordOpinions, [proj.id]: e.target.value })}
                                    placeholder="Consigner ici les orientations de la Coordination Générale, la conformité de souveraineté et les directives présidentielles..."
                                    style={{
                                      width: '100%',
                                      padding: '9px 12px',
                                      borderRadius: 8,
                                      border: '1px solid #a7f3d0',
                                      fontSize: '0.85rem',
                                      outline: 'none',
                                      background: '#ffffff',
                                      boxSizing: 'border-box',
                                      lineHeight: 1.5,
                                    }}
                                  />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                  <div style={{ fontSize: '0.74rem', color: '#047857' }}>
                                    {proj.dateValidationCoordinateur ? (
                                      <span>Dernière validation enregistrée le {new Date(proj.dateValidationCoordinateur).toLocaleDateString('fr-FR')}</span>
                                    ) : (
                                      <span>Projet en attente d’avis officiel de la coordination.</span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleSubmitCoordinatorReview(proj.id)}
                                    disabled={submittingCoordReview === proj.id}
                                    style={{
                                      padding: '8px 18px',
                                      background: '#006233',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: 8,
                                      fontSize: '0.82rem',
                                      fontWeight: 800,
                                      cursor: submittingCoordReview === proj.id ? 'not-allowed' : 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      boxShadow: '0 2px 6px rgba(0, 98, 51, 0.2)',
                                    }}
                                  >
                                    <Icons.Check />
                                    <span>{submittingCoordReview === proj.id ? 'Validation en cours...' : 'Commenter et Valider'}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Read-Only Coordinator Opinion for Other Users (if exists) */}
                            {!isCoordinator && proj.avisCoordinateur && (
                              <div
                                style={{
                                  background: '#f0fdf4',
                                  borderRadius: 10,
                                  border: '1px solid #a7f3d0',
                                  padding: '1rem 1.25rem',
                                  marginBottom: '1.5rem',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                  <Icons.ShieldCheck />
                                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>
                                    Avis Officiel de la Coordination Générale (Pr. Elias Zerhouni)
                                  </span>
                                  <span
                                    style={{
                                      marginLeft: 'auto',
                                      padding: '2px 8px',
                                      borderRadius: 6,
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      background: proj.statutValidationCoordinateur === 'VALIDE' ? '#dcfce7' : '#fef3c7',
                                      color: proj.statutValidationCoordinateur === 'VALIDE' ? '#15803d' : '#b45309',
                                    }}
                                  >
                                    {proj.statutValidationCoordinateur === 'VALIDE' ? 'Projet Validé' : 'Réserves Émises'}
                                  </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.84rem', color: '#1e293b', fontStyle: 'italic', lineHeight: 1.5 }}>
                                  "{proj.avisCoordinateur}"
                                </p>
                              </div>
                            )}

                            {/* Section Header: Checklist & Realisation Phases */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                              <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Checklist d’Exécution & Phases de Réalisation
                              </h5>
                              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                {canWork ? 'Cochez une phase pour actualiser l’avancement national.' : 'Consultation des jalons.'}
                              </span>
                            </div>

                            {/* Checklist of 8 Milestones */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {milestones.map((m) => (
                                <div
                                  key={m.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '9px 12px',
                                    borderRadius: 8,
                                    background: m.completed ? '#f0fdf4' : '#f8fafc',
                                    border: m.completed ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                                    fontSize: '0.82rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input
                                      type="checkbox"
                                      checked={Boolean(m.completed)}
                                      disabled={!canWork}
                                      onChange={() => handleToggleMilestone(proj.id, m.id, m.completed)}
                                      style={{
                                        width: 17,
                                        height: 17,
                                        accentColor: '#006233',
                                        cursor: canWork ? 'pointer' : 'default',
                                      }}
                                    />
                                    <span style={{ fontWeight: m.completed ? 700 : 500, color: m.completed ? '#0f172a' : '#475569' }}>
                                      {m.label}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: 6,
                                        background: m.completed ? '#dcfce7' : '#f1f5f9',
                                        color: m.completed ? '#15803d' : '#64748b',
                                      }}
                                    >
                                      {m.phase || 'Jalon'} (+{m.weight || 12}%)
                                    </span>
                                    {m.completedAt && (
                                      <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                                        Validé le {m.completedAt}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* TDR & Working Documents Upload Area */}
                            {canWork && (
                              <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                  <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                                      Dépôt des Termes de Référence (TDR) & Études Complémentaires
                                    </div>
                                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                      Formats acceptés : PDF, Word (.docx), jusqu’à 20 Mo. Les documents sont accessibles à tous les membres de la commission.
                                    </div>
                                  </div>

                                  <div>
                                    <input
                                      type="file"
                                      ref={tdrInputRef}
                                      onChange={(e) => handleUploadTdrFile(e, proj.id)}
                                      accept=".pdf,.docx,.doc"
                                      style={{ display: 'none' }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => tdrInputRef.current?.click()}
                                      disabled={uploadingTdr}
                                      style={{
                                        padding: '7px 14px',
                                        background: '#006233',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: 7,
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        cursor: uploadingTdr ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                      }}
                                    >
                                      <Icons.Upload />
                                      <span>{uploadingTdr ? 'Téléversement...' : 'Téléverser TDR / Étude'}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: AUTRES COMMISSIONS (APERÇU NATIONAL SYNTHÉTIQUE) */}
          {/* ========================================================= */}
          {otherCommissionProjects.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem', borderBottom: '2px solid #cbd5e1', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {filterSpecialty ? 'Filtre Sectoriel Spécifique' : 'Coordination Inter-Commissions'}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {filterSpecialty
                    ? `Commission : ${filterSpecialty} • Aperçu Synthétique`
                    : 'Autres Commissions Stratégiques • Aperçu National Consolidé'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  {filterSpecialty
                    ? `Synthèse d’avancement des projets de la commission ${filterSpecialty}. Les Termes de Référence détaillés et pièces contractuelles sont réservés aux membres accrédités de cette commission.`
                    : 'Synthèse d’avancement des projets des 9 autres commissions souveraines. Conformément aux dispositions de discrétion technique, les Termes de Référence détaillés et pièces contractuelles sont réservés aux commissions de rattachement.'}
                </p>
              </div>

              {/* Table of Other Projects */}
              <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 800 }}>Réf. Code</th>
                      <th style={{ padding: '12px 16px', fontWeight: 800 }}>Commission Souveraine</th>
                      <th style={{ padding: '12px 16px', fontWeight: 800 }}>Intitulé du Projet</th>
                      <th style={{ padding: '12px 16px', fontWeight: 800 }}>Statut Actuel</th>
                      <th style={{ padding: '12px 16px', fontWeight: 800 }}>Avancement</th>
                      <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherCommissionProjects.map((p, idx) => {
                      const st = PROJECT_STATUSES[p.statut] || PROJECT_STATUSES.IDEATION;
                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: idx === otherCommissionProjects.length - 1 ? 'none' : '1px solid #f1f5f9',
                            background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                            <span style={{ padding: '2px 6px', background: '#f1f5f9', borderRadius: 4, fontSize: '0.74rem' }}>
                              {p.code}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#006233', fontWeight: 700 }}>
                            {p.specialite}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, maxWidth: 360 }}>
                            {p.titre}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                background: st.bg,
                                color: st.color,
                                border: `1px solid ${st.border}`,
                                borderRadius: 8,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              {st.badge}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                                <div style={{ width: `${p.avancement}%`, height: '100%', background: '#006233', borderRadius: 6 }} />
                              </div>
                              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>{p.avancement}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSummaryModalProject(p)}
                              style={{
                                padding: '5px 12px',
                                background: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: 6,
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Aperçu
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SUMMARY OVERVIEW FOR EXTERNAL COMMISSION PROJECT */}
      {/* ------------------------------------------------------------- */}
      {summaryModalProject && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              maxWidth: 580,
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#006233', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Commission {summaryModalProject.specialite}
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {summaryModalProject.titre}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSummaryModalProject(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
              >
                <Icons.Close />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div><strong>Code :</strong> {summaryModalProject.code}</div>
                <div><strong>Priorité :</strong> {summaryModalProject.priorite}</div>
                <div><strong>Statut :</strong> {summaryModalProject.statut}</div>
                <div><strong>Avancement :</strong> {summaryModalProject.avancement}%</div>
              </div>
              {summaryModalProject.leader && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 6, color: '#475569' }}>
                  Chef de projet : Pr. {summaryModalProject.leader.prenom} {summaryModalProject.leader.nom}
                </div>
              )}
            </div>

            {/* Privacy notice banner */}
            <div
              style={{
                background: '#fefce8',
                borderRadius: 8,
                border: '1px solid #fde047',
                padding: '10px 14px',
                fontSize: '0.76rem',
                color: '#713f12',
                lineHeight: 1.45,
                display: 'flex',
                gap: 8,
              }}
            >
              <Icons.Info />
              <span>
                <strong>Accès restreint au résumé national :</strong> Les termes de référence techniques, dossiers de passation et conventions industrielles de ce projet relèvent exclusivement de la commission <em>{summaryModalProject.specialite}</em> et de la Coordination Générale.
              </span>
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setSummaryModalProject(null)}
                style={{
                  padding: '7px 18px',
                  background: '#006233',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: STEP-BY-STEP PROJECT CREATION WIZARD */}
      {/* ------------------------------------------------------------- */}
      {wizardOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 860,
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #004d28 0%, #006233 100%)',
                color: 'white',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Dossier Stratégique National • Décret N° 26-293
                </div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 800 }}>
                  Élaboration d’une Fiche de Projet Stratégique
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWizardOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icons.Close />
              </button>
            </div>

            {/* Stepper Tabs Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 1rem' }}>
              {[
                { step: 1, label: '1. Cadrage & TDR' },
                { step: 2, label: '2. Consortium' },
                { step: 3, label: '3. Marché & Passation' },
                { step: 4, label: '4. Budget & Délais' },
                { step: 5, label: '5. Validation' },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setWizardStep(s.step)}
                  style={{
                    flex: 1,
                    padding: '12px 6px',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.78rem',
                    fontWeight: wizardStep === s.step ? 800 : 500,
                    color: wizardStep === s.step ? '#006233' : '#64748b',
                    borderBottom: wizardStep === s.step ? '2.5px solid #006233' : '2.5px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateProject} style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* STEP 1: CADRAGE & TDR */}
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Intitulé Stratégique du Projet *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProjectForm.titre}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, titre: e.target.value })}
                      placeholder="ex: Plateforme Nationale de Bio-ingénierie & Séquençage Génomique Souverain"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Commission de Rattachement *
                      </label>
                      <select
                        disabled={isLeader} // Lock to Leader's commission if role is LEADER
                        value={newProjectForm.specialite}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, specialite: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: isLeader ? '#f1f5f9' : '#ffffff', boxSizing: 'border-box' }}
                      >
                        {SPECIALTIES.map((spec) => (
                          <option key={spec.id} value={spec.name}>
                            {spec.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Degré de Priorité Nationale
                      </label>
                      <select
                        value={newProjectForm.priorite}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, priorite: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                      >
                        {PRIORITIES.map((pr) => (
                          <option key={pr.id} value={pr.id}>
                            {pr.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Objectifs Stratégiques & Justification
                    </label>
                    <textarea
                      rows={3}
                      value={newProjectForm.objectifs}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, objectifs: e.target.value })}
                      placeholder="Définir la vision, les impacts attendus pour le pays et l'alignement avec les priorités nationales..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Synthèse des Termes de Référence (TDR préliminaires)
                    </label>
                    <textarea
                      rows={4}
                      value={newProjectForm.tdrTexte}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, tdrTexte: e.target.value })}
                      placeholder="Cahier des charges succinct, spécifications techniques initiales et résultats livrables attendus..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: CONSORTIUM & PARTIES PRENANTES */}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Universités & Centres de Recherche Nationaux (Algérie)
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.universitesAlge}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, universitesAlge: e.target.value })}
                      placeholder="ex: USTHB, Univ Constantine 1, Centre de Recherche CRBt, Institut Pasteur d'Algérie..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Universités & Laboratoires de la Diaspora (International)
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.universitesEtrang}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, universitesEtrang: e.target.value })}
                      placeholder="ex: Johns Hopkins University, Broad Institute MIT/Harvard, CNRS, EPFL..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Entreprises Publiques & Privées Algériennes
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.entreprisesAlge}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, entreprisesAlge: e.target.value })}
                      placeholder="ex: Sonatrach, Sonelgaz, Groupe Saidal, Algérie Télécom..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Partenaires Technologiques & Industriels Internationaux
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.entreprisesEtrang}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, entreprisesEtrang: e.target.value })}
                      placeholder="ex: Équipementiers, groupes pharmaceutiques, développeurs technologiques..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Ministère(s) de Tutelle & Organismes d’État
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.ministeresTutelle}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, ministeresTutelle: e.target.value })}
                      placeholder="ex: Ministère de l'Enseignement Supérieur (MESRS), Ministère de l'Industrie..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: MARCHÉ & PASSATION */}
              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Modèle Économique & Valorisation
                    </label>
                    <select
                      value={newProjectForm.modeleEconomique}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, modeleEconomique: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    >
                      {ECONOMIC_MODELS.map((em) => (
                        <option key={em.id} value={em.label}>
                          {em.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Modalité de Passation / Commande Publique
                    </label>
                    <select
                      value={newProjectForm.typePassation}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, typePassation: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    >
                      {PASSATION_TYPES.map((pt) => (
                        <option key={pt.id} value={pt.label}>
                          {pt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Impact Économique & Création d’Emplois en Algérie
                    </label>
                    <textarea
                      rows={3}
                      value={newProjectForm.impactEconomique}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, impactEconomique: e.target.value })}
                      placeholder="Économies en devises estimées, nombre d’emplois créés, brevets déposés..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: BUDGET & DÉLAIS */}
              {wizardStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.6fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Budget Estimé en Dinars (DZD)
                      </label>
                      <input
                        type="number"
                        value={newProjectForm.budgetDZD}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, budgetDZD: e.target.value })}
                        placeholder="ex: 500000000"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Composante Devises
                      </label>
                      <input
                        type="number"
                        value={newProjectForm.budgetDevises}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, budgetDevises: e.target.value })}
                        placeholder="ex: 3500000"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Devise
                      </label>
                      <select
                        value={newProjectForm.devise}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, devise: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Date de Démarrage Estimée
                      </label>
                      <input
                        type="date"
                        value={newProjectForm.dateDebut}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, dateDebut: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Durée Prévue (en mois)
                      </label>
                      <input
                        type="number"
                        value={newProjectForm.dureeMois}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, dureeMois: e.target.value })}
                        placeholder="24"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: VALIDATION & RECAP */}
              {wizardStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                      Récapitulatif de la Fiche
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#006233', marginBottom: 8 }}>
                      {newProjectForm.titre || '(Intitulé non renseigné)'}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.84rem' }}>
                      <div><strong>Commission :</strong> {newProjectForm.specialite}</div>
                      <div><strong>Priorité :</strong> {newProjectForm.priorite}</div>
                      <div><strong>Modalité :</strong> {newProjectForm.typePassation}</div>
                      <div><strong>Budget :</strong> {newProjectForm.budgetDZD ? `${Number(newProjectForm.budgetDZD).toLocaleString('fr-FR')} DZD` : 'En chiffrage'}</div>
                    </div>
                  </div>

                  <div style={{ background: '#ecfdf5', padding: '10px 14px', borderRadius: 8, border: '1px solid #a7f3d0', fontSize: '0.8rem', color: '#065f46' }}>
                    <strong>Checklist Initiale :</strong> La création de ce projet initialisera la checklist des 8 phases d’exécution stratégiques.
                  </div>
                </div>
              )}

              {/* Stepper Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: 'auto' }}>
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep - 1)}
                    style={{
                      padding: '9px 18px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Précédent
                  </button>
                ) : <div />}

                {wizardStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep + 1)}
                    style={{
                      padding: '9px 22px',
                      background: '#006233',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={savingProject}
                    style={{
                      padding: '11px 24px',
                      background: savingProject ? '#94a3b8' : '#006233',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      cursor: savingProject ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {savingProject ? 'Enregistrement...' : 'Valider et Créer la Fiche Projet'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: PRINTABLE OFFICIAL DOSSIER EXPORT */}
      {/* ------------------------------------------------------------- */}
      {exportModalProject && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              width: '100%',
              maxWidth: 900,
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              padding: '2.5rem',
              color: '#0f172a',
            }}
          >
            {/* Header: Republic & Presidency */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #006233', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#006233' }}>
                République Algérienne Démocratique et Populaire
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginTop: 2 }}>
                Présidence de la République • Haut Conseil de la Communauté Scientifique Nationale à l’Étranger (HCCSNE)
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                Décret Présidentiel N° 26-293 • Fiche Officielle de Projet Stratégique
              </div>
            </div>

            {/* Document Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <span style={{ display: 'inline-block', padding: '3px 12px', background: '#ecfdf5', color: '#006233', fontWeight: 800, fontSize: '0.8rem', borderRadius: 6, marginBottom: 6 }}>
                CODE PROJET : {exportModalProject.code}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                {exportModalProject.titre}
              </h2>
              <div style={{ fontSize: '0.88rem', color: '#006233', fontWeight: 700 }}>
                Commission Souveraine : {exportModalProject.specialite}
              </div>
            </div>

            {/* Structured Table Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.86rem', lineHeight: 1.55 }}>
              <div>
                <strong style={{ color: '#006233', fontSize: '0.92rem' }}>1. Cadrage Stratégique & Termes de Référence (TDR)</strong>
                <p style={{ margin: '4px 0 0 0', color: '#334155' }}>
                  {exportModalProject.objectifs || 'Non spécifié.'}
                </p>
                {exportModalProject.tdrTexte && (
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, marginTop: 8, borderLeft: '3px solid #006233' }}>
                    {exportModalProject.tdrTexte}
                  </div>
                )}
              </div>

              <div>
                <strong style={{ color: '#006233', fontSize: '0.92rem' }}>2. Consortium & Parties Prenantes</strong>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6, fontSize: '0.84rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 0', fontWeight: 700, width: 240 }}>Universités & Labos Algérie :</td>
                      <td style={{ padding: '6px 0', color: '#334155' }}>{exportModalProject.universitesAlge || 'En cours'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 0', fontWeight: 700 }}>Réseau Diaspora & Étranger :</td>
                      <td style={{ padding: '6px 0', color: '#334155' }}>{exportModalProject.universitesEtrang || 'En cours'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 0', fontWeight: 700 }}>Opérateurs Économiques / Entreprises :</td>
                      <td style={{ padding: '6px 0', color: '#334155' }}>{exportModalProject.entreprisesAlge || 'En cours'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', fontWeight: 700 }}>Ministère(s) de Tutelle :</td>
                      <td style={{ padding: '6px 0', color: '#334155' }}>{exportModalProject.ministeresTutelle || 'MESRS'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <strong style={{ color: '#006233', fontSize: '0.92rem' }}>3. Arbitrage de la Coordination Générale</strong>
                <div style={{ marginTop: 4, background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                  <div><strong>Statut d’évaluation :</strong> {exportModalProject.statutValidationCoordinateur || 'En cours d’instruction'}</div>
                  {exportModalProject.avisCoordinateur && (
                    <div style={{ marginTop: 4, fontStyle: 'italic', color: '#1e293b' }}>
                      "{exportModalProject.avisCoordinateur}"
                    </div>
                  )}
                </div>
              </div>

              <div>
                <strong style={{ color: '#006233', fontSize: '0.92rem' }}>4. Enveloppe Budgétaire & Calendrier</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                  <div>
                    <strong>Budget National :</strong> {exportModalProject.budgetDZD ? `${(exportModalProject.budgetDZD / 1000000).toLocaleString('fr-FR')} M DZD` : 'En évaluation'}
                  </div>
                  <div>
                    <strong>Composante Devises :</strong> {exportModalProject.budgetDevises ? `${(exportModalProject.budgetDevises / 1000000).toLocaleString('fr-FR')} M ${exportModalProject.devise}` : 'N/A'}
                  </div>
                  <div>
                    <strong>Durée Globale :</strong> {exportModalProject.dureeMois || 24} mois
                  </div>
                  <div>
                    <strong>Avancement Global :</strong> {exportModalProject.avancement}%
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setExportModalProject(null)}
                style={{
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: 7,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '8px 20px',
                  background: '#006233',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 7,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icons.Print />
                <span>Imprimer le Dossier Officiel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
