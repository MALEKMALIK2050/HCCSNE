import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useLocale } from '../_app';
import { SPECIALTIES, ROLE_LABELS } from '@/lib/specialties';
import { members } from '@/lib/members';
import StrategicProjectsModule from '@/components/StrategicProjectsModule';

export default function Dashboard() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();

  // User session
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'commissions' | 'stats' | 'tools' | 'users' | 'security'
  const [projectCommissionFilter, setProjectCommissionFilter] = useState('');

  // Admin Data states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [tools, setTools] = useState([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Password change form state
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Assign Leader modal state
  const [leaderModal, setLeaderModal] = useState({ open: false, specialtyName: '', specIcon: '', suggestedLeader: '' });
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [newLeaderForm, setNewLeaderForm] = useState({ nom: '', prenom: '', email: '', institution: '', pays: '' });
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  // Quick dropdown designation state (Coordinateur & Admin)
  const [quickSpecialty, setQuickSpecialty] = useState('');
  const [quickLeaderId, setQuickLeaderId] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [assigningSpecId, setAssigningSpecId] = useState(null);

  // Notification / Alert message for admin actions
  const [actionNotice, setActionNotice] = useState(null);

  // Profile management state & photo ref
  const photoInputRef = useRef(null);
  const [profileNom, setProfileNom] = useState('');
  const [profilePrenom, setProfilePrenom] = useState('');
  const [profileSpecialite, setProfileSpecialite] = useState('');
  const [profileInstitution, setProfileInstitution] = useState('');
  const [profilePays, setProfilePays] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Academic & Career profile states (International Standards)
  const [profileDiplome, setProfileDiplome] = useState("Doctorat d'État / Ph.D");
  const [profileUniversite, setProfileUniversite] = useState('');
  const [profileAnneeDiplome, setProfileAnneeDiplome] = useState('');
  const [profileExploits, setProfileExploits] = useState('');
  const [profileScholarUrl, setProfileScholarUrl] = useState('');
  const [profileOrcidUrl, setProfileOrcidUrl] = useState('');
  const [profileCarrieres, setProfileCarrieres] = useState([
    { id: 1, titre: '', organisme: '', paysVille: '', anneeDebut: '', anneeFin: '', enCours: true, realisations: '' },
    { id: 2, titre: '', organisme: '', paysVille: '', anneeDebut: '', anneeFin: '', enCours: false, realisations: '' },
    { id: 3, titre: '', organisme: '', paysVille: '', anneeDebut: '', anneeFin: '', enCours: false, realisations: '' },
    { id: 4, titre: '', organisme: '', paysVille: '', anneeDebut: '', anneeFin: '', enCours: false, realisations: '' },
  ]);

  // Official Documents states (CV, Lettre de motivation, Diplômes)
  const cvInputRef = useRef(null);
  const lettreInputRef = useRef(null);
  const diplomeInputRef = useRef(null);
  const [profileCv, setProfileCv] = useState({ url: '', filename: '' });
  const [profileLettre, setProfileLettre] = useState({ url: '', filename: '' });
  const [profileDiplomesDocs, setProfileDiplomesDocs] = useState([]);
  const [diplomeCustomTitle, setDiplomeCustomTitle] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(null);

  // Load user session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          if (router.query.tab) {
            setActiveTab(router.query.tab);
          }
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  // Load tools list, admin data, and unread chat count
  useEffect(() => {
    if (user) {
      loadTools();
      fetch('/api/chat/unread-count')
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setChatUnreadCount(d.unreadCount || 0);
        })
        .catch(() => {});
      if (user.role === 'ADMIN' || user.role === 'COORDINATOR') {
        loadStats();
        loadUsers();
      }
    }
  }, [user]);

  const loadTools = async () => {
    setLoadingTools(true);
    try {
      const res = await fetch('/api/admin/tools');
      const data = await res.json();
      if (data.success) setTools(data.tools);
    } catch (err) {
      console.error('Error loading tools:', err);
    } finally {
      setLoadingTools(false);
    }
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsersList(data.users);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Toggle tool enabled status
  const handleToggleTool = async (toolId, currentEnabled) => {
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setTools((prev) =>
          prev.map((t) => (t.id === toolId ? { ...t, enabled: !currentEnabled } : t))
        );
        setActionNotice({
          type: 'success',
          text: `Outil "${data.tool?.name || toolId}" ${!currentEnabled ? 'activé' : 'désactivé'} avec succès.`,
        });
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || 'Erreur lors de la modification de l’outil');
      }
    } catch (err) {
      alert('Erreur réseau lors de la modification');
    }
  };

  // Change user role, specialty or active status
  const handleUpdateUser = async (userId, updates) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
        );
        loadStats();
        setActionNotice({
          type: 'success',
          text: `Profil de ${data.user.prenom} ${data.user.nom} mis à jour avec succès.`,
        });
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`Confirmez-vous la suppression du compte de ${name} ? Cette action est irréversible.`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== userId));
        loadStats();
        setActionNotice({ type: 'success', text: `Compte de ${name} supprimé.` });
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  // Auto-fill suggested leader into newLeaderForm
  const handleAutoFillSuggested = (suggested) => {
    if (!suggested) return;
    const clean = suggested.replace(/^(Dr\.|Pr\.|Prof\.)\s*/i, '').trim();
    const parts = clean.split(' ');
    const prenom = parts[0] || '';
    const nom = parts.slice(1).join(' ') || '';
    const emailPrefix = `${prenom.toLowerCase()}.${nom.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    setNewLeaderForm({
      nom,
      prenom,
      email: `${emailPrefix || 'chef'}@hccsne.dz`,
      institution: 'Haut Conseil HCCSNE',
      pays: 'Algérie / Diaspora',
    });
  };

  // Direct quick assignment from inline Commission card dropdown
  const handleDropdownAssignLeader = async (specialtyName, selectedUserId, specId) => {
    setAssigningSpecId(specId);
    try {
      if (!selectedUserId || selectedUserId === 'NONE') {
        const res = await fetch('/api/admin/assign-leader', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ specialtyName, unassign: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors de la réinitialisation');

        setActionNotice({ type: 'success', text: data.message });
        setTimeout(() => setActionNotice(null), 4000);
        await loadUsers();
        await loadStats();
        return;
      }

      const res = await fetch('/api/admin/assign-leader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialtyName, userId: selectedUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la désignation');

      setActionNotice({ type: 'success', text: data.message });
      setTimeout(() => setActionNotice(null), 4000);
      await loadUsers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigningSpecId(null);
    }
  };

  // Quick Assignment Bar submit (Dropdown 1: Commission, Dropdown 2: Member)
  const handleQuickAssignSubmit = async () => {
    if (!quickSpecialty || !quickLeaderId) {
      alert('Veuillez sélectionner à la fois une commission et un membre dans les listes déroulantes.');
      return;
    }
    setQuickLoading(true);
    try {
      const res = await fetch('/api/admin/assign-leader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialtyName: quickSpecialty, userId: quickLeaderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la désignation');

      setActionNotice({ type: 'success', text: data.message });
      setTimeout(() => setActionNotice(null), 5000);
      setQuickSpecialty('');
      setQuickLeaderId('');
      await loadUsers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setQuickLoading(false);
    }
  };

  // Assign or Designate Commission Leader
  const handleAssignLeader = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAssignLoading(true);
    try {
      const payload = isCreatingNew
        ? { specialtyName: leaderModal.specialtyName, newLeader: newLeaderForm }
        : { specialtyName: leaderModal.specialtyName, userId: selectedMemberId };

      if (!isCreatingNew && !selectedMemberId) {
        alert('Veuillez sélectionner un membre dans la liste déroulante.');
        setAssignLoading(false);
        return;
      }

      const res = await fetch('/api/admin/assign-leader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la désignation');

      setActionNotice({ type: 'success', text: data.message });
      setTimeout(() => setActionNotice(null), 5000);
      setLeaderModal({ open: false, specialtyName: '', specIcon: '', suggestedLeader: '' });
      setSelectedMemberId('');
      setNewLeaderForm({ nom: '', prenom: '', email: '', institution: '', pays: '' });
      await loadUsers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 8) {
      setPwdError('Le nouveau mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.');

      setPwdSuccess(data.message || 'Mot de passe modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  // Initialize profile values when user is loaded
  useEffect(() => {
    if (user) {
      setProfileNom(user.nom || '');
      setProfilePrenom(user.prenom || '');
      setProfileSpecialite(user.specialite || '');
      setProfileInstitution(user.institution || '');
      setProfilePays(user.pays || '');
      setProfileBio(user.bio || '');
      setProfilePhone(user.phone || '');
      setProfilePhoto(user.photo || null);
      setProfileDiplome(user.diplome || "Doctorat d'État / Ph.D");
      setProfileUniversite(user.universite || user.institution || '');
      setProfileAnneeDiplome(user.anneeDiplome || '');
      setProfileExploits(user.exploitsAcademiques || '');
      setProfileScholarUrl(user.scholarUrl || '');
      setProfileOrcidUrl(user.orcidUrl || '');

      setProfileCv({
        url: user.cvUrl || '',
        filename: user.cvFilename || '',
      });
      setProfileLettre({
        url: user.lettreMotivationUrl || '',
        filename: user.lettreMotivationFilename || '',
      });
      if (user.diplomesDocuments) {
        try {
          const parsedDocs = typeof user.diplomesDocuments === 'string'
            ? JSON.parse(user.diplomesDocuments)
            : user.diplomesDocuments;
          if (Array.isArray(parsedDocs)) {
            setProfileDiplomesDocs(parsedDocs);
          }
        } catch {}
      }

      if (user.carrieres) {
        try {
          let parsed = typeof user.carrieres === 'string' ? JSON.parse(user.carrieres) : user.carrieres;
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Strictly enforce: only the 1st position is "en cours", all others are previous positions
            parsed = parsed.map((item, idx) => ({
              ...item,
              enCours: idx === 0,
            }));
            setProfileCarrieres(parsed);
          }
        } catch {}
      }
    }
  }, [user]);

  // Handle career positions (Official Member Form - 1st is current, others historical)
  const handleCareerChange = (id, field, value) => {
    setProfileCarrieres((prev) =>
      prev.map((item, idx) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: value,
            enCours: idx === 0,
          };
        }
        return {
          ...item,
          enCours: idx === 0,
        };
      })
    );
  };

  const handleAddCareerPosition = () => {
    const nextId = profileCarrieres.length > 0 ? Math.max(...profileCarrieres.map((p) => p.id || 0)) + 1 : 1;
    setProfileCarrieres((prev) => [
      ...prev,
      { id: nextId, titre: '', organisme: '', paysVille: '', anneeDebut: '', anneeFin: '', enCours: false, realisations: '' },
    ]);
  };

  const handleRemoveCareerPosition = (id) => {
    if (profileCarrieres.length <= 1) return;
    setProfileCarrieres((prev) => prev.filter((p) => p.id !== id));
  };

  // Handle Document Upload (CV, Lettre de motivation, Diplôme)
  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Le document est trop volumineux (maximum 20 Mo).');
      return;
    }

    setUploadingDoc(docType);
    setProfileSuccess('');
    setProfileError('');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        const res = await fetch('/api/profile/upload-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            docType,
            filename: file.name,
            title: docType === 'diplome' ? (diplomeCustomTitle.trim() || file.name) : undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (docType === 'cv') {
            setProfileCv({ url: data.fileUrl, filename: data.filename });
            setUser((prev) => ({ ...prev, cvUrl: data.fileUrl, cvFilename: data.filename }));
          } else if (docType === 'lettre') {
            setProfileLettre({ url: data.fileUrl, filename: data.filename });
            setUser((prev) => ({ ...prev, lettreMotivationUrl: data.fileUrl, lettreMotivationFilename: data.filename }));
          } else if (docType === 'diplome') {
            let updatedList = [];
            try {
              updatedList = typeof data.user.diplomesDocuments === 'string'
                ? JSON.parse(data.user.diplomesDocuments)
                : data.user.diplomesDocuments;
            } catch {}
            setProfileDiplomesDocs(updatedList || []);
            setDiplomeCustomTitle('');
            setUser((prev) => ({ ...prev, diplomesDocuments: data.user.diplomesDocuments }));
          }

          setProfileSuccess(data.message || 'Document officiel téléversé avec succès !');
          setActionNotice({ type: 'success', text: data.message || 'Document téléversé avec succès !' });
          setTimeout(() => setActionNotice(null), 4000);
        } else {
          setProfileError(data.error || 'Erreur lors du téléversement');
        }
      } catch (err) {
        setProfileError('Erreur réseau lors de l’envoi du document');
      } finally {
        setUploadingDoc(null);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Document Deletion
  const handleDeleteDocument = async (docType, diplomeId = null) => {
    const label = docType === 'cv' ? 'votre CV' : docType === 'lettre' ? 'votre lettre de motivation' : 'ce diplôme';
    if (!confirm(`Confirmez-vous la suppression de ${label} ?`)) return;

    try {
      const res = await fetch('/api/profile/delete-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, diplomeId }),
      });
      const data = await res.json();
      if (data.success) {
        if (docType === 'cv') {
          setProfileCv({ url: '', filename: '' });
          setUser((prev) => ({ ...prev, cvUrl: null, cvFilename: null }));
        } else if (docType === 'lettre') {
          setProfileLettre({ url: '', filename: '' });
          setUser((prev) => ({ ...prev, lettreMotivationUrl: null, lettreMotivationFilename: null }));
        } else if (docType === 'diplome') {
          let updatedList = [];
          try {
            updatedList = typeof data.user.diplomesDocuments === 'string'
              ? JSON.parse(data.user.diplomesDocuments)
              : data.user.diplomesDocuments;
          } catch {}
          setProfileDiplomesDocs(updatedList || []);
          setUser((prev) => ({ ...prev, diplomesDocuments: data.user.diplomesDocuments }));
        }
        setActionNotice({ type: 'success', text: data.message || 'Document supprimé avec succès' });
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  // Upload official profile photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = (file.type && file.type.startsWith('image/')) ||
                    /\.(jpe?g|png|webp|gif|bmp|jfif)$/i.test(file.name);

    if (!isImage) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG ou WebP).');
      if (e.target) e.target.value = '';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('L’image est trop volumineuse (maximum 15 Mo).');
      if (e.target) e.target.value = '';
      return;
    }

    setUploadingPhoto(true);
    setProfileSuccess('');
    setProfileError('');

    const reader = new FileReader();
    reader.onerror = () => {
      setUploadingPhoto(false);
      setProfileError('Impossible de lire le fichier image');
      if (e.target) e.target.value = '';
    };

    reader.onload = async () => {
      const base64 = reader.result;
      setProfilePhoto(base64);

      try {
        const res = await fetch('/api/profile/upload-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.success) {
          setUser((prev) => ({ ...prev, photo: data.photoUrl }));
          setProfilePhoto(data.photoUrl);
          setProfileSuccess('Photo officielle mise à jour ! Elle apparaît désormais en page d’accueil et dans votre espace.');
          setActionNotice({
            type: 'success',
            text: 'Photo officielle mise à jour ! Elle apparaît en page d’accueil et dans l’annuaire public.',
          });
          setTimeout(() => setActionNotice(null), 5000);
        } else {
          setProfileError(data.error || 'Erreur lors de l’envoi de la photo');
        }
      } catch (err) {
        setProfileError('Erreur réseau lors de l’envoi de la photo');
      } finally {
        setUploadingPhoto(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile information
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: profileNom,
          prenom: profilePrenom,
          specialite: profileSpecialite,
          institution: profileInstitution,
          pays: profilePays,
          bio: profileBio,
          phone: profilePhone,
          diplome: profileDiplome,
          universite: profileUniversite,
          anneeDiplome: profileAnneeDiplome,
          exploitsAcademiques: profileExploits,
          carrieres: profileCarrieres,
          scholarUrl: profileScholarUrl,
          orcidUrl: profileOrcidUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({ ...prev, ...data.user }));
        setProfileSuccess('Dossier académique, exploits scientifiques et parcours de carrière enregistrés avec succès !');
        setActionNotice({
          type: 'success',
          text: 'Profil officiel et parcours de carrière enregistrés avec succès.',
        });
        setTimeout(() => setActionNotice(null), 5000);
      } else {
        setProfileError(data.error || 'Erreur lors de l’enregistrement');
      }
    } catch (err) {
      setProfileError('Erreur réseau lors de l’enregistrement');
    } finally {
      setSavingProfile(false);
    }
  };

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
          fontSize: '1.2rem',
          color: 'var(--gray-400)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Chargement de votre espace...
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isCoordinator = user.role === 'COORDINATOR';
  const isLeader = user.role === 'LEADER';
  const pendingCount = stats?.users?.pending || usersList.filter((u) => !u.active).length;

  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchSearch =
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.specialite && u.specialite.toLowerCase().includes(q));
    const matchSpecialty = !filterSpecialty || u.specialite === filterSpecialty;
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchSpecialty && matchRole;
  });

  const roleMeta = ROLE_LABELS[user.role] || ROLE_LABELS.MEMBER;
  const memberMatch = members.find(
    (m) =>
      (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase()) ||
      (user.nom && m.nom.toLowerCase().includes(user.nom.toLowerCase()))
  );
  const userPhoto = user.photo || memberMatch?.image || null;

  return (
    <>
      <Head>
        <title>HCCSNE — Espace Membres & Commissions</title>
      </Head>

      <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
        {/* Top Navbar */}
        <header
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              maxWidth: 1320,
              margin: '0 auto',
              padding: '0.85rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #006233, #009950)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '1rem',
                  }}
                >
                  HC
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: '#006233', fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
                    HCCSNE
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.65rem',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    Portail Collaboratif
                  </span>
                </div>
              </Link>
            </div>

            {/* User badge and actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link
                href="/dashboard/chat"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: chatUnreadCount > 0 ? '#fef2f2' : '#f8fafc',
                  border: chatUnreadCount > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  color: chatUnreadCount > 0 ? '#dc2626' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span className="hidden sm:inline">Messagerie</span>
                {chatUnreadCount > 0 && (
                  <span
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      borderRadius: 10,
                      padding: '1px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                    }}
                  >
                    {chatUnreadCount}
                  </span>
                )}
              </Link>
              <div
                onClick={() => setActiveTab('profile')}
                title="Accéder à mon profil & photo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '4px 12px 4px 6px',
                  background: roleMeta.bg,
                  borderRadius: 24,
                  fontSize: '0.85rem',
                  border: `1px solid ${roleMeta.color}30`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={`${user.prenom} ${user.nom}`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `1.5px solid ${roleMeta.color}`,
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: roleMeta.color,
                      display: 'inline-block',
                      marginLeft: 6,
                    }}
                  />
                )}
                <span style={{ fontWeight: 700, color: roleMeta.color }}>
                  {user.prenom} {user.nom}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: '#ffffff',
                    color: roleMeta.color,
                  }}
                >
                  {roleMeta.badge}
                </span>
              </div>

              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  padding: '7px 14px',
                  background: activeTab === 'profile' ? '#006233' : '#ffffff',
                  color: activeTab === 'profile' ? '#ffffff' : '#475569',
                  border: activeTab === 'profile' ? '1px solid #006233' : '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                Mon Profil
              </button>

              <button
                onClick={() => setActiveTab('security')}
                style={{
                  padding: '7px 14px',
                  background: activeTab === 'security' ? '#006233' : '#ffffff',
                  color: activeTab === 'security' ? '#ffffff' : '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Sécurité & Mot de passe
              </button>

              <button
                onClick={handleLogout}
                style={{
                  padding: '7px 14px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* Navigation Bar / Tabs */}
          <div style={{ borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
            <div
              style={{
                maxWidth: 1320,
                margin: '0 auto',
                padding: '0 1.5rem',
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
              }}
            >
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '12px 14px',
                  fontSize: '0.88rem',
                  fontWeight: activeTab === 'overview' ? 700 : 500,
                  color: activeTab === 'overview' ? '#006233' : '#64748b',
                  borderBottom: activeTab === 'overview' ? '2.5px solid #006233' : '2.5px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Vue d'ensemble & Outils
              </button>

              <button
                onClick={() => setActiveTab('commissions')}
                style={{
                  padding: '12px 14px',
                  fontSize: '0.88rem',
                  fontWeight: activeTab === 'commissions' ? 700 : 500,
                  color: activeTab === 'commissions' ? '#006233' : '#64748b',
                  borderBottom: activeTab === 'commissions' ? '2.5px solid #006233' : '2.5px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Commissions & Groupes Spécialisés
              </button>

              <button
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
              </button>

              {(isAdmin || isCoordinator) && (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('stats');
                      loadStats();
                    }}
                    style={{
                      padding: '12px 14px',
                      fontSize: '0.88rem',
                      fontWeight: activeTab === 'stats' ? 700 : 500,
                      color: activeTab === 'stats' ? '#006233' : '#64748b',
                      borderBottom: activeTab === 'stats' ? '2.5px solid #006233' : '2.5px solid transparent',
                      background: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Statistiques Plateforme
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('tools');
                      loadTools();
                    }}
                    style={{
                      padding: '12px 14px',
                      fontSize: '0.88rem',
                      fontWeight: activeTab === 'tools' ? 700 : 500,
                      color: activeTab === 'tools' ? '#006233' : '#64748b',
                      borderBottom: activeTab === 'tools' ? '2.5px solid #006233' : '2.5px solid transparent',
                      background: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Gestion des Outils
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('users');
                      loadUsers();
                    }}
                    style={{
                      padding: '12px 14px',
                      fontSize: '0.88rem',
                      fontWeight: activeTab === 'users' ? 700 : 500,
                      color: activeTab === 'users' ? '#006233' : '#64748b',
                      borderBottom: activeTab === 'users' ? '2.5px solid #006233' : '2.5px solid transparent',
                      background: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Membres & Rôles
                    {pendingCount > 0 && (
                      <span
                        style={{
                          background: '#ef4444',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: 10,
                          marginLeft: 6,
                        }}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  padding: '12px 14px',
                  fontSize: '0.88rem',
                  fontWeight: activeTab === 'profile' ? 700 : 500,
                  color: activeTab === 'profile' ? '#006233' : '#64748b',
                  borderBottom: activeTab === 'profile' ? '2.5px solid #006233' : '2.5px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Mon Profil & Dossier
              </button>

              <button
                onClick={() => setActiveTab('security')}
                style={{
                  padding: '12px 14px',
                  fontSize: '0.88rem',
                  fontWeight: activeTab === 'security' ? 700 : 500,
                  color: activeTab === 'security' ? '#006233' : '#64748b',
                  borderBottom: activeTab === 'security' ? '2.5px solid #006233' : '2.5px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Sécurité & Mot de passe
              </button>
            </div>
          </div>
        </header>

        {/* Global Action Banner */}
        {actionNotice && (
          <div
            style={{
              background: actionNotice.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: actionNotice.type === 'success' ? '#065f46' : '#991b1b',
              borderBottom: `1px solid ${actionNotice.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              padding: '0.75rem 1.5rem',
              textAlign: 'center',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {actionNotice.text}
          </div>
        )}

        {/* Main Content Area */}
        <main style={{ maxWidth: 1320, margin: '2rem auto', padding: '0 1.5rem' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Dynamic Welcome Card based on user role */}
              <div
                style={{
                  background: isCoordinator
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #006233 100%)'
                    : isLeader
                    ? 'linear-gradient(135deg, #064e3b 0%, #006233 50%, #047857 100%)'
                    : 'linear-gradient(135deg, #004D2C 0%, #006233 60%, #007A40 100%)',
                  borderRadius: 18,
                  padding: '2.5rem',
                  color: '#ffffff',
                  marginBottom: '2rem',
                  boxShadow: '0 10px 25px -5px rgba(0, 98, 51, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '5px 14px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '0.85rem',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {isCoordinator
                      ? 'COORDINATION GÉNÉRALE — PRÉSIDENCE DU HCCSNE'
                      : isLeader
                      ? `CHEF DE COMMISSION : ${user.specialite?.toUpperCase() || 'SPÉCIALITÉ'}`
                      : isAdmin
                      ? 'ADMINISTRATION SYSTÈME'
                      : `ESPACE MEMBRE SCIENTIFIQUE — ${user.specialite?.toUpperCase() || 'COMMISSION GÉNÉRALE'}`}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {userPhoto && (
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '3px solid rgba(255,255,255,0.85)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                          flexShrink: 0,
                          background: 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <img
                          src={userPhoto}
                          alt={`${user.prenom} ${user.nom}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div>
                      <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
                        Bienvenue, {user.prenom} {user.nom}
                      </h1>
                      <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: 4 }}>
                        {user.email} • {user.institution || 'Conseil Scientifique National'}
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, opacity: 0.95, fontSize: '1rem', maxWidth: 850, lineHeight: 1.6 }}>
                    {isCoordinator ? (
                      <>
                        En tant que <strong>Coordinateur Principal</strong>, vous disposez des pleins privilèges de supervision sur l’ensemble des <strong>10 commissions stratégiques</strong>. Vous pouvez présider les séances plénières, orienter les projets nationaux et coordonner l’action de tous les chefs de groupes.
                      </>
                    ) : isLeader ? (
                      <>
                        En tant que <strong>Chef de Groupe / Spécialité</strong>, vous modérez les séances de travail, dictez et validez les projets stratégiques, et animez le forum de votre commission : <em>{user.specialite}</em>.
                      </>
                    ) : (
                      <>
                        Vous êtes affecté(e) à la commission stratégique : <strong>{user.specialite || 'Assemblée Générale'}</strong>. Participez aux travaux scientifiques, aux séances collaboratives et aux échanges documentaires.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Collaborative Tools Section */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                      Outils Collaboratifs Souverains
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      Accédez aux canaux de travail et espaces de modération de votre groupe.
                    </p>
                  </div>
                  {(isAdmin || isCoordinator) && (
                    <button
                      onClick={() => setActiveTab('tools')}
                      style={{
                        padding: '6px 14px',
                        background: '#f1f5f9',
                        color: '#006233',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Configurer les outils
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {tools.map((tool) => (
                    <div
                      key={tool.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: 14,
                        padding: '1.5rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease',
                        opacity: tool.enabled ? 1 : 0.6,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '2.4rem' }}>{tool.icon}</span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 10,
                              background: tool.enabled ? '#ecfdf5' : '#fef2f2',
                              color: tool.enabled ? '#059669' : '#dc2626',
                            }}
                          >
                            {tool.enabled ? '● ACTIF' : '○ DÉSACTIVÉ'}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{tool.name}</span>
                          {tool.id === 'chat' && chatUnreadCount > 0 && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                background: '#dc2626',
                                color: '#ffffff',
                                padding: '2px 8px',
                                borderRadius: 12,
                              }}
                            >
                              {chatUnreadCount} non lu{chatUnreadCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                          {tool.description}
                        </p>
                      </div>

                      {tool.enabled ? (
                        <div
                          style={{
                            padding: '9px 16px',
                            background: '#006233',
                            color: '#ffffff',
                            borderRadius: 8,
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            if (tool.href) {
                              router.push(tool.href);
                            } else {
                              alert(`Accès à l'outil "${tool.name}". En cours d'initialisation pour votre groupe.`);
                            }
                          }}
                        >
                          Accéder →
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: '9px 16px',
                            background: '#f1f5f9',
                            color: '#94a3b8',
                            borderRadius: 8,
                            textAlign: 'center',
                            fontSize: '0.82rem',
                            fontWeight: 500,
                          }}
                        >
                          Désactivé par l'administration
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMMISSIONS & GROUPES */}
          {activeTab === 'commissions' && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Les 10 Commissions Stratégiques & Salons de Travail
                </h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                  Chaque commission est dirigée par un Chef de Groupe chargé de modérer les séances, dicter les projets et animer les forums scientifiques.
                </p>
              </div>

              {/* MODULE DE DESIGNATION RAPIDE DE CHEF DE GROUPE (ADMIN & COORDINATEUR) */}
              {(isAdmin || isCoordinator) && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                    borderRadius: 16,
                    padding: '1.25rem 1.5rem',
                    border: '1.5px solid #a7f3d0',
                    marginBottom: '1.75rem',
                    boxShadow: '0 4px 12px rgba(0, 98, 51, 0.07)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: '#d1fae5',
                          color: '#065f46',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.3rem',
                        }}
                      >
                        
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#065f46' }}>
                          Désignation Rapide d'un Chef de Groupe (Listes déroulantes)
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                          Sélectionnez la commission puis le membre dans les listes déroulantes pour lui confier la direction du groupe.
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#065f46',
                        padding: '3px 10px',
                        borderRadius: 20,
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      Espace {isCoordinator ? 'Coordinateur' : 'Admin'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    {/* Dropdown 1: Commission */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                        1. Sélectionner la Commission Stratégique :
                      </label>
                      <select
                        value={quickSpecialty}
                        onChange={(e) => {
                          setQuickSpecialty(e.target.value);
                          const currentChef = usersList.find((u) => u.specialite === e.target.value && u.role === 'LEADER');
                          setQuickLeaderId(currentChef ? String(currentChef.id) : '');
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          background: '#ffffff',
                          fontWeight: 600,
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      >
                        <option value="">-- Choisir une commission dans la liste --</option>
                        {SPECIALTIES.map((s) => {
                          const currentChef = usersList.find((u) => u.specialite === s.name && u.role === 'LEADER');
                          return (
                            <option key={s.id} value={s.name}>
                              {s.icon} {s.shortName} {currentChef ? `(Chef actuel : ${currentChef.prenom} ${currentChef.nom})` : '(Sans chef)'}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Dropdown 2: Member */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                        2. Désigner le Membre Chef de Groupe :
                      </label>
                      <select
                        value={quickLeaderId}
                        onChange={(e) => setQuickLeaderId(e.target.value)}
                        disabled={!quickSpecialty}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: quickSpecialty ? '1.5px solid #006233' : '1.5px solid #e2e8f0',
                          fontSize: '0.85rem',
                          background: quickSpecialty ? '#ffffff' : '#f8fafc',
                          fontWeight: 600,
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      >
                        <option value="">
                          {quickSpecialty ? '-- Choisir un membre éligible --' : '← Choisissez d’abord une commission'}
                        </option>
                        {quickSpecialty && (
                          <>
                            {usersList.some((u) => u.specialite === quickSpecialty && u.active) && (
                              <optgroup label="⭐ Membres déjà rattachés à cette commission">
                                {usersList
                                  .filter((u) => u.specialite === quickSpecialty && u.active)
                                  .map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.prenom} {u.nom} {u.institution ? `(${u.institution})` : ''} {u.role === 'LEADER' ? '(Chef actuel)' : ''}
                                    </option>
                                  ))}
                              </optgroup>
                            )}
                            <optgroup label="Autres membres de la communauté">
                              {usersList
                                .filter((u) => u.specialite !== quickSpecialty && u.active)
                                .map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.prenom} {u.nom} {u.institution ? `(${u.institution})` : ''} {u.specialite ? `— [${u.specialite.substring(0, 20)}...]` : '— [Sans commission]'}
                                  </option>
                                ))}
                            </optgroup>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Button */}
                    <div>
                      <button
                        onClick={handleQuickAssignSubmit}
                        disabled={!quickSpecialty || !quickLeaderId || quickLoading}
                        style={{
                          width: '100%',
                          padding: '10px 18px',
                          background:
                            !quickSpecialty || !quickLeaderId || quickLoading
                              ? '#94a3b8'
                              : 'linear-gradient(135deg, #006233 0%, #007A40 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: !quickSpecialty || !quickLeaderId || quickLoading ? 'not-allowed' : 'pointer',
                          boxShadow:
                            !quickSpecialty || !quickLeaderId || quickLoading
                              ? 'none'
                              : '0 4px 10px rgba(0, 98, 51, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        {quickLoading ? 'Nomination en cours...' : 'Confirmer la désignation'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {SPECIALTIES.map((spec) => {
                  const assignedLeader = usersList.find(
                    (u) => u.specialite === spec.name && (u.role === 'LEADER' || u.role === 'COORDINATOR')
                  );
                  const memberCount = usersList.filter((u) => u.specialite === spec.name && u.active).length;
                  const isMyCommission = user.specialite === spec.name;

                  return (
                    <div
                      key={spec.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: 16,
                        padding: '1.5rem',
                        border: isMyCommission ? '2px solid #006233' : '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {isMyCommission && (
                          <span
                            style={{
                              position: 'absolute',
                              top: 14,
                              right: 14,
                              background: '#ecfdf5',
                              color: '#065f46',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 10,
                              border: '1px solid #a7f3d0',
                            }}
                          >
                            VOTRE COMMISSION
                          </span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.85rem' }}>
                          <span style={{ fontSize: '2.2rem' }}>{spec.icon}</span>
                          <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                              {spec.name}
                            </h3>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {memberCount} membre{memberCount > 1 ? 's' : ''} affecté{memberCount > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                          {spec.description}
                        </p>
                      </div>

                      {/* Leader section with direct dropdown designation */}
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: 12,
                          padding: '0.95rem 1.1rem',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Chef de Commission
                          </div>
                          {assignedLeader && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: '#d1fae5',
                                color: '#065f46',
                                padding: '2px 8px',
                                borderRadius: 10,
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              {assignedLeader.role === 'COORDINATOR' ? 'Coordinateur' : 'Désigné'}
                            </span>
                          )}
                        </div>

                        {assignedLeader ? (
                          <div style={{ marginBottom: (isAdmin || isCoordinator) ? '0.75rem' : 0 }}>
                            <strong style={{ fontSize: '0.92rem', color: '#006233', display: 'block' }}>
                              {assignedLeader.prenom} {assignedLeader.nom}
                            </strong>
                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                              {assignedLeader.institution || assignedLeader.email}
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginBottom: (isAdmin || isCoordinator) ? '0.75rem' : 0 }}>
                            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', display: 'block' }}>
                              Suggéré : {spec.suggestedLeader}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600 }}>
                              ⏳ Aucun chef désigné pour le moment
                            </span>
                          </div>
                        )}

                        {/* Coordinateur & Admin : Dropdown list to directly designate / change leader */}
                        {(isAdmin || isCoordinator) && (
                          <div style={{ paddingTop: '0.65rem', borderTop: '1px dashed #cbd5e1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                              <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#334155' }}>
                                Désigner dans la liste déroulante :
                              </label>
                              <button
                                onClick={() => {
                                  setLeaderModal({
                                    open: true,
                                    specialtyName: spec.name,
                                    specIcon: spec.icon,
                                    suggestedLeader: spec.suggestedLeader,
                                  });
                                  setSelectedMemberId(assignedLeader ? String(assignedLeader.id) : '');
                                  setIsCreatingNew(false);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#006233',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  padding: 0,
                                  textDecoration: 'underline',
                                }}
                              >
                                + Formulaire
                              </button>
                            </div>

                            <select
                              value={assignedLeader ? assignedLeader.id : ''}
                              disabled={assigningSpecId === spec.id}
                              onChange={(e) => handleDropdownAssignLeader(spec.name, e.target.value, spec.id)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: 8,
                                border: '1.5px solid #006233',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                background: '#ffffff',
                                color: '#0f172a',
                                cursor: assigningSpecId === spec.id ? 'wait' : 'pointer',
                                outline: 'none',
                              }}
                            >
                              <option value="">
                                {assignedLeader ? '— Retirer le chef désigné —' : '— Choisir un chef dans la liste —'}
                              </option>
                              {/* Members of this commission */}
                              {usersList.some((u) => u.specialite === spec.name && u.active) && (
                                <optgroup label={`Membres de la commission (${spec.shortName})`}>
                                  {usersList
                                    .filter((u) => u.specialite === spec.name && u.active)
                                    .map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.id === assignedLeader?.id ? '[Chef] ' : ''}
                                        {u.prenom} {u.nom}
                                        {u.institution ? ` (${u.institution})` : ''}
                                        {u.id === assignedLeader?.id ? ' (Chef actuel)' : ''}
                                      </option>
                                    ))}
                                </optgroup>
                              )}
                              {/* All other active members */}
                              <optgroup label="Autres membres de la communauté">
                                {usersList
                                  .filter((u) => u.specialite !== spec.name && u.active)
                                  .map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.prenom} {u.nom}
                                      {u.institution ? ` (${u.institution})` : ''}
                                      {u.specialite ? ` [${u.specialite.substring(0, 20)}...]` : ' [Sans commission]'}
                                      {u.role === 'LEADER' ? ' (Chef)' : u.role === 'COORDINATOR' ? ' (Coord.)' : ''}
                                    </option>
                                  ))}
                              </optgroup>
                            </select>
                          </div>
                        )}

                        {/* Action buttons: Chat room & Strategic Projects */}
                        <div style={{ marginTop: '0.85rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Link
                            href={`/dashboard/chat?room=${spec.roomId}`}
                            style={{
                              flex: 1,
                              padding: '7px 10px',
                              background: '#ffffff',
                              color: '#006233',
                              border: '1px solid #a7f3d0',
                              borderRadius: 8,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              textAlign: 'center',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                            }}
                          >
                            
                            <span>Salon</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setProjectCommissionFilter(spec.name);
                              setActiveTab('projects');
                            }}
                            title={`Voir uniquement les projets de la commission ${spec.name}`}
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
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: STATS (ADMIN & COORDINATEUR) */}
          {activeTab === 'stats' && (isAdmin || isCoordinator) && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                    Statistiques globales de la plateforme
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                    Indicateurs en direct issus de la base de données du Haut Conseil.
                  </p>
                </div>
                <button
                  onClick={loadStats}
                  style={{
                    padding: '8px 16px',
                    background: '#006233',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Actualiser
                </button>
              </div>

              {loadingStats && !stats ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Chargement des statistiques...</div>
              ) : stats ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                      
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#006233' }}>{stats.users.total}</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Total Membres</div>
                      <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.25rem' }}>
                        {stats.users.active} actifs / {stats.users.pending} en attente
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                      
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#059669' }}>{stats.users.leaders || 0}</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Chefs de Groupes</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>Modérateurs des 10 commissions</div>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                      
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#c8a951' }}>{stats.collaboration.rooms}</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Commissions & Salons</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>Espaces de travail actifs</div>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                      
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563eb' }}>{stats.collaboration.documents}</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Documents déposés</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>Publications et rapports</div>
                    </div>
                  </div>

                  {/* Breakdown by roles */}
                  <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
                      Répartition par rôles au sein du Haut Conseil
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: 10, color: '#92400e' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Administrateurs</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.users.admins}</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: 10, color: '#1e3a8a' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Coord. Principal</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.users.coordinators}</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: 10, color: '#065f46' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Chefs de Groupes</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.users.leaders || 0}</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: 10, color: '#334155' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Membres</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.users.members}</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 10, color: '#991b1b' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>En attente</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.users.pending}</div>
                      </div>
                    </div>
                  </div>
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
                            <div style={{ width: `${stats.projects.avgProgress}%`, height: '100%', background: '#006233', borderRadius: 6 }} />
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
                                    <div style={{ width: `${pct}%`, height: '100%', background: phase.color, borderRadius: 6 }} />
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
                                  <td
                                    onClick={() => {
                                      setProjectCommissionFilter(comm.name);
                                      setActiveTab('projects');
                                    }}
                                    title={`Voir les projets de ${comm.name}`}
                                    style={{ padding: '10px 12px', fontWeight: 700, color: '#006233', cursor: 'pointer', textDecoration: 'underline' }}
                                  >
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
                                        <div style={{ width: `${comm.avgProgress}%`, height: '100%', background: '#006233', borderRadius: 6 }} />
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
                                    {comm.budgetDevises ? `${(comm.budgetDevises / 1000000).toLocaleString('fr-FR')} M` : '—'}
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

                </>
              ) : null}
            </div>
          )}

          {/* TAB 4: TOOLS MANAGEMENT (ADMIN) */}
          {activeTab === 'tools' && (isAdmin || isCoordinator) && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Gestion & Contrôle des Outils Collaboratifs
                </h2>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                  Activez ou désactivez les fonctionnalités de travail collaboratif pour les commissions.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: 14,
                      padding: '1.5rem',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          background: `${tool.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                        }}
                      >
                        {tool.icon}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            {tool.name}
                          </h3>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 8,
                              background: '#f1f5f9',
                              color: '#64748b',
                            }}
                          >
                            {tool.category}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.35rem 0 0 0' }}>
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: 20,
                          background: tool.enabled ? '#ecfdf5' : '#fee2e2',
                          color: tool.enabled ? '#059669' : '#dc2626',
                        }}
                      >
                        {tool.enabled ? '● Activé pour les membres' : '○ Désactivé'}
                      </span>

                      {isAdmin && (
                        <button
                          onClick={() => handleToggleTool(tool.id, tool.enabled)}
                          style={{
                            padding: '8px 20px',
                            background: tool.enabled ? '#fef2f2' : '#006233',
                            color: tool.enabled ? '#dc2626' : '#ffffff',
                            border: tool.enabled ? '1px solid #fecaca' : 'none',
                            borderRadius: 8,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {tool.enabled ? 'Désactiver' : 'Activer'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: USERS & SPECIALTY LEADERS (ADMIN & COORDINATEUR) */}
          {activeTab === 'users' && (isAdmin || isCoordinator) && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                    Membres, Chefs de Groupes & Commissions
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                    Désignez les Chefs de Spécialités (modérateurs des séances et projets), validez les accès et affectez les commissions.
                  </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      minWidth: 180,
                    }}
                  />

                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="">Toutes les commissions</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.shortName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="">Tous les rôles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="COORDINATOR">Coordinateur</option>
                    <option value="LEADER">Chef de Groupe</option>
                    <option value="MEMBER">Membre</option>
                    <option value="GUEST">Invité</option>
                    <option value="PENDING">En attente</option>
                  </select>

                  <button
                    onClick={loadUsers}
                    style={{
                      padding: '8px 14px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    
                  </button>
                </div>
              </div>

              {/* Members Table */}
              <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '12px 16px' }}>Membre & Contact</th>
                        <th style={{ padding: '12px 16px' }}>Commission (Spécialité)</th>
                        <th style={{ padding: '12px 16px' }}>Rôle Attribué</th>
                        <th style={{ padding: '12px 16px' }}>Statut</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            Chargement des comptes...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            Aucun utilisateur trouvé.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const uRole = ROLE_LABELS[u.role] || ROLE_LABELS.MEMBER;
                          return (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                  {u.prenom} {u.nom}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                                {u.institution && (
                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    {u.institution} ({u.pays || '—'})
                                  </div>
                                )}
                              </td>

                              {/* Specialty Group selector */}
                              <td style={{ padding: '12px 16px' }}>
                                <select
                                  value={u.specialite || ''}
                                  onChange={(e) => handleUpdateUser(u.id, { specialite: e.target.value })}
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: 6,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.8rem',
                                    background: '#ffffff',
                                    maxWidth: 240,
                                  }}
                                >
                                  <option value="">-- Sans commission --</option>
                                  {SPECIALTIES.map((s) => (
                                    <option key={s.id} value={s.name}>
                                      {s.icon} {s.shortName}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Role selector */}
                              <td style={{ padding: '12px 16px' }}>
                                <select
                                  value={u.role}
                                  onChange={(e) => {
                                    const nextRole = e.target.value;
                                    if (nextRole === 'LEADER' && !u.specialite) {
                                      alert("Veuillez d'abord affecter ce membre à une commission dans la colonne 'Commission' avant de lui attribuer le rôle de Chef de Groupe.");
                                      return;
                                    }
                                    handleUpdateUser(u.id, { role: nextRole });
                                  }}
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: 6,
                                    border: `1.5px solid ${uRole.color}50`,
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    background: uRole.bg,
                                    color: uRole.color,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <option value="ADMIN">Administrateur</option>
                                  <option value="COORDINATOR">Coordinateur Principal</option>
                                  <option value="LEADER">Chef de Groupe</option>
                                  <option value="MEMBER">Membre Scientifique</option>
                                  <option value="GUEST">Invité</option>
                                  <option value="PENDING">⏳ En attente</option>
                                </select>
                              </td>

                              {/* Active status */}
                              <td style={{ padding: '12px 16px' }}>
                                <span
                                  style={{
                                    padding: '3px 9px',
                                    borderRadius: 12,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: u.active ? '#ecfdf5' : '#fee2e2',
                                    color: u.active ? '#065f46' : '#991b1b',
                                  }}
                                >
                                  {u.active ? 'Actif' : 'En attente'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {/* Quick Nominate / Remove Chef Button */}
                                  {u.active && u.specialite && u.role !== 'LEADER' && u.role !== 'ADMIN' && u.role !== 'COORDINATOR' && (
                                    <button
                                      onClick={() => handleDropdownAssignLeader(u.specialite, u.id, u.id)}
                                      title={`Nommer Chef de la commission "${u.specialite}"`}
                                      style={{
                                        padding: '5px 9px',
                                        background: '#ecfdf5',
                                        color: '#065f46',
                                        border: '1px solid #a7f3d0',
                                        borderRadius: 6,
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      Nommer Chef
                                    </button>
                                  )}
                                  {u.role === 'LEADER' && (
                                    <button
                                      onClick={() => handleUpdateUser(u.id, { role: 'MEMBER' })}
                                      title="Rétablir ce chef en tant que membre simple"
                                      style={{
                                        padding: '5px 8px',
                                        background: '#fef3c7',
                                        color: '#92400e',
                                        border: '1px solid #fde68a',
                                        borderRadius: 6,
                                        fontSize: '0.74rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      Rétrograder
                                    </button>
                                  )}
                                  {!u.active && (
                                    <button
                                      onClick={() => handleUpdateUser(u.id, { active: true, role: u.role === 'PENDING' ? 'MEMBER' : u.role })}
                                      style={{
                                        padding: '5px 12px',
                                        background: '#006233',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Valider l'accès
                                    </button>
                                  )}
                                  {u.active && (
                                    <button
                                      onClick={() => handleUpdateUser(u.id, { active: false })}
                                      style={{
                                        padding: '5px 10px',
                                        background: '#f1f5f9',
                                        color: '#64748b',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 6,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Suspendre
                                    </button>
                                  )}
                                  {u.id !== user.id && (
                                    <button
                                      onClick={() => handleDeleteUser(u.id, `${u.prenom} ${u.nom}`)}
                                      style={{
                                        padding: '5px 10px',
                                        background: '#fee2e2',
                                        color: '#991b1b',
                                        border: '1px solid #fecaca',
                                        borderRadius: 6,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STRATEGIC PROJECTS MODULE */}
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
          )}

          {/* TAB: MON PROFIL & EXPLOITS ACADÉMIQUES */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* Header Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #006233 0%, #004d26 100%)',
                  borderRadius: 18,
                  padding: '2rem 2.5rem',
                  color: 'white',
                  marginBottom: '2rem',
                  border: '1px solid #004d26',
                  boxShadow: '0 4px 20px rgba(0, 98, 51, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, color: '#fef08a', marginBottom: 12 }}>
                    <span>🇩🇿</span> République Algérienne Démocratique et Populaire • Décret N° 26-293
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                    Dossier Officiel du Membre & Parcours Académique
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0', maxWidth: 780, lineHeight: 1.5 }}>
                    Renseignez vos diplômes, exploits académiques, pièces justificatives (CV, lettre, diplômes), parcours de carrière (1er poste actuel en cours et mandats antérieurs) et votre photo officielle diffusée sur le portail d'accueil.
                  </p>

                  {/* Completion Gauge */}
                  <div style={{ marginTop: '1.5rem', maxWidth: 500, background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: '0.82rem', fontWeight: 700 }}>
                      <span>Complétion de votre dossier</span>
                      <span style={{ color: '#fde047' }}>{user.pourcentageCompletion || 30}% complété</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${user.pourcentageCompletion || 30}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #facc15, #86efac)',
                          borderRadius: 10,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {profileSuccess && (
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 12,
                    padding: '1rem 1.25rem',
                    color: '#065f46',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  
                  <div>{profileSuccess}</div>
                </div>
              )}

              {profileError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 12,
                    padding: '1rem 1.25rem',
                    color: '#dc2626',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  
                  <div>{profileError}</div>
                </div>
              )}

              {/* Main 2-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Left Column: Photo & Public Display Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Photo Card */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 18,
                      padding: '2rem 1.5rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '1.25rem' }}>
                      Photographie Officielle
                    </div>

                    {/* Avatar Circle with Camera Overlay */}
                    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 1.25rem auto' }}>
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #006233, #007A40)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          border: '4px solid #006233',
                          boxShadow: '0 0 0 3px #C8A951, 0 8px 24px rgba(0,98,51,0.2)',
                          overflow: 'hidden',
                        }}
                      >
                        {(profilePhoto || userPhoto) ? (
                          <img
                            src={profilePhoto || userPhoto}
                            alt="Photo officielle"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`
                        )}
                      </div>

                      {/* Camera Button Trigger */}
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        title="Changer ma photo officielle"
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: '#006233',
                          border: '2.5px solid #ffffff',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                          transition: 'all 0.15s ease',
                          zIndex: 10,
                        }}
                      >
                        {uploadingPhoto ? 'Chargement...' : 'Modifier la photo'}
                      </button>

                      <input
                        type="file"
                        ref={photoInputRef}
                        accept="image/*,.jpg,.jpeg,.png,.webp,.jfif"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      style={{
                        padding: '9px 18px',
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        borderRadius: 10,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: '1rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      
                      <span>{uploadingPhoto ? 'Téléversement...' : 'Téléverser une photo'}</span>
                    </button>

                    {/* Notice on homepage display */}
                    <div
                      style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: 12,
                        padding: '12px 14px',
                        textAlign: 'left',
                        fontSize: '0.78rem',
                        color: '#065f46',
                        lineHeight: 1.45,
                      }}
                    >
                      <div style={{ fontWeight: 800, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🇩🇿</span> Diffusée en Page d'Accueil
                      </div>
                      <div>
                        Cette photo est automatiquement mise en valeur dans la section <strong>Collège d'Élite & Diaspora</strong> de la page d'accueil, l'annuaire public et la messagerie collaborative.
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 10 }}>
                      Formats acceptés : JPG, PNG, WebP (max. 8 Mo)
                    </div>
                  </div>

                  {/* Status & Credential Card */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 18,
                      padding: '1.5rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '1rem' }}>
                      Attributions Officielles
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Identité</div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{user.prenom} {user.nom}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Titre au Haut Conseil</div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: 2,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 12,
                            background: roleMeta.bg,
                            color: roleMeta.color,
                          }}
                        >
                          {roleMeta.badge}
                        </span>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Email officiel (Identifiant)</div>
                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.82rem' }}>{user.email}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Statut</div>
                        <div style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
                          Membre Accrédité (Décret 26-293)
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Complete Official Profile Form */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 18,
                    padding: '2.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  }}
                >
                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* SECTION 1: IDENTITÉ & COMMISSION */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9', marginBottom: '1.25rem' }}>
                        
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                            1. Identité & Commission Souveraine
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                            Rattachement institutionnel et commission d'expertise du Haut Conseil
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Prénom
                          </label>
                          <input
                            type="text"
                            value={profilePrenom}
                            onChange={(e) => setProfilePrenom(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Nom
                          </label>
                          <input
                            type="text"
                            value={profileNom}
                            onChange={(e) => setProfileNom(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Commission Souveraine & Spécialité
                        </label>
                        <select
                          value={profileSpecialite}
                          onChange={(e) => setProfileSpecialite(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                        >
                          <option value="">-- Sélectionner une commission --</option>
                          {SPECIALTIES.map((spec) => (
                            <option key={spec.id} value={spec.name}>
                              {spec.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Institution / Université Actuelle
                          </label>
                          <input
                            type="text"
                            value={profileInstitution}
                            onChange={(e) => setProfileInstitution(e.target.value)}
                            placeholder="ex: MIT, Johns Hopkins University, Harvard..."
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Pays de Résidence Actuel
                          </label>
                          <input
                            type="text"
                            value={profilePays}
                            onChange={(e) => setProfilePays(e.target.value)}
                            placeholder="ex: États-Unis, Canada, France, Suisse..."
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Téléphone (Optionnel)
                          </label>
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="+1 (xxx) xxx-xxxx"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Google Scholar (Lien)
                          </label>
                          <input
                            type="url"
                            value={profileScholarUrl}
                            onChange={(e) => setProfileScholarUrl(e.target.value)}
                            placeholder="https://scholar.google.com/..."
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            ORCID / Identifiant Chercheur
                          </label>
                          <input
                            type="text"
                            value={profileOrcidUrl}
                            onChange={(e) => setProfileOrcidUrl(e.target.value)}
                            placeholder="0000-0002-xxxx-xxxx"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: EXPLOITS ACADÉMIQUES, DIPLÔMES & UNIVERSITÉS */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9', marginBottom: '1.25rem' }}>
                        
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                            2. Exploits Académiques, Diplômes & Universités
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                            Titres académiques supérieurs, brevets internationaux déposés et distinctions
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 0.8fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Diplôme le plus élevé (Dropdown)
                          </label>
                          <select
                            value={profileDiplome}
                            onChange={(e) => setProfileDiplome(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          >
                            <option value="Doctorat d'État / Ph.D">Doctorat d'État / Ph.D (Doctor of Philosophy)</option>
                            <option value="Doctorat en Médecine (MD / D.M.)">Doctorat en Médecine (MD / D.M.)</option>
                            <option value="Doctorat en Sciences (D.Sc / Dr. Sc.)">Doctorat en Sciences (D.Sc / Dr. Sc.)</option>
                            <option value="Habilitation à Diriger des Recherches (HDR)">Habilitation à Diriger des Recherches (HDR)</option>
                            <option value="Post-Doctorat & Fellowship International">Post-Doctorat & Fellowship International</option>
                            <option value="Master de Recherche / M.Sc">Master de Recherche / M.Sc</option>
                            <option value="Diplôme d'Ingénieur d'État">Diplôme d'Ingénieur d'État</option>
                            <option value="Autre titre académique d'excellence">Autre titre académique d'excellence</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Université / Établissement d'Obtention
                          </label>
                          <input
                            type="text"
                            value={profileUniversite}
                            onChange={(e) => setProfileUniversite(e.target.value)}
                            placeholder="ex: Johns Hopkins University, MIT, Harvard, Sorbonne..."
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Année
                          </label>
                          <input
                            type="text"
                            value={profileAnneeDiplome}
                            onChange={(e) => setProfileAnneeDiplome(e.target.value)}
                            placeholder="ex: 1995"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Exploits Académiques, Brevets & Distinctions Majeures
                        </label>
                        <textarea
                          rows={3}
                          value={profileExploits}
                          onChange={(e) => setProfileExploits(e.target.value)}
                          placeholder="Brevets d'invention déposés/accordés (ex: plus de 500 brevets), prix internationaux d'excellence, membre des Académies Nationales des Sciences, médailles honorifiques, H-Index, découvertes médicales ou technologiques majeures..."
                          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', lineHeight: 1.5, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    {/* SECTION 3: DOCUMENTS OFFICIELS & JUSTIFICATIFS (CV, LETTRE DE MOTIVATION & DIPLÔMES) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9', marginBottom: '1.25rem' }}>
                        
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                            3. Pièces Justificatives & Documents Officiels
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                            Téléversement de votre CV détaillé, lettre de motivation et copies certifiées de diplômes (PDF ou Word)
                          </p>
                        </div>
                      </div>

                      {/* 2-Column: CV and Cover Letter */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        
                        {/* Block 1: CV */}
                        <div
                          style={{
                            background: '#f8fafc',
                            border: profileCv.url ? '1.5px solid #a7f3d0' : '1px dashed #cbd5e1',
                            borderRadius: 14,
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                
                                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Curriculum Vitae (CV)</span>
                              </div>
                              {profileCv.url ? (
                                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                                  Document déposé
                                </span>
                              ) : (
                                <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                                  Requis
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                              Format PDF ou Word (max. 20 Mo). Parcours scientifique complet, brevets et publications.
                            </p>
                            {profileCv.filename && (
                              <div style={{ marginTop: 8, fontSize: '0.78rem', fontWeight: 600, color: '#006233', background: '#ecfdf5', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                 {profileCv.filename}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <input
                              type="file"
                              ref={cvInputRef}
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(e) => handleDocumentUpload(e, 'cv')}
                              style={{ display: 'none' }}
                            />
                            {profileCv.url ? (
                              <>
                                <a
                                  href={profileCv.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '7px 12px',
                                    background: '#006233',
                                    color: '#ffffff',
                                    borderRadius: 8,
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  Consulter
                                </a>
                                <button
                                  type="button"
                                  disabled={uploadingDoc === 'cv'}
                                  onClick={() => cvInputRef.current?.click()}
                                  style={{
                                    padding: '7px 12px',
                                    background: '#ffffff',
                                    color: '#334155',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 8,
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {uploadingDoc === 'cv' ? 'Envoi...' : 'Remplacer'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument('cv')}
                                  style={{
                                    padding: '7px 10px',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                  title="Supprimer mon CV"
                                >
                                  Supprimer
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                disabled={uploadingDoc === 'cv'}
                                onClick={() => cvInputRef.current?.click()}
                                style={{
                                  padding: '8px 14px',
                                  background: '#006233',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: 8,
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                
                                <span>{uploadingDoc === 'cv' ? 'Téléversement...' : 'Téléverser mon CV'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Block 2: Lettre de motivation */}
                        <div
                          style={{
                            background: '#f8fafc',
                            border: profileLettre.url ? '1.5px solid #a7f3d0' : '1px dashed #cbd5e1',
                            borderRadius: 14,
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                
                                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Lettre de Motivation</span>
                              </div>
                              {profileLettre.url ? (
                                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                                  Document déposée
                                </span>
                              ) : (
                                <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>
                                  Recommandée
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                              Déclaration d'intention ou lettre officielle adressée à la Présidence du Conseil.
                            </p>
                            {profileLettre.filename && (
                              <div style={{ marginTop: 8, fontSize: '0.78rem', fontWeight: 600, color: '#006233', background: '#ecfdf5', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                 {profileLettre.filename}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <input
                              type="file"
                              ref={lettreInputRef}
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(e) => handleDocumentUpload(e, 'lettre')}
                              style={{ display: 'none' }}
                            />
                            {profileLettre.url ? (
                              <>
                                <a
                                  href={profileLettre.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '7px 12px',
                                    background: '#006233',
                                    color: '#ffffff',
                                    borderRadius: 8,
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  Consulter
                                </a>
                                <button
                                  type="button"
                                  disabled={uploadingDoc === 'lettre'}
                                  onClick={() => lettreInputRef.current?.click()}
                                  style={{
                                    padding: '7px 12px',
                                    background: '#ffffff',
                                    color: '#334155',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 8,
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {uploadingDoc === 'lettre' ? 'Envoi...' : 'Remplacer'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument('lettre')}
                                  style={{
                                    padding: '7px 10px',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                  title="Supprimer la lettre"
                                >
                                  Supprimer
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                disabled={uploadingDoc === 'lettre'}
                                onClick={() => lettreInputRef.current?.click()}
                                style={{
                                  padding: '8px 14px',
                                  background: '#006233',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: 8,
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                
                                <span>{uploadingDoc === 'lettre' ? 'Téléversement...' : 'Téléverser ma Lettre'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Block 3: Diplômes & Certificats Upload */}
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 14,
                          padding: '1.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                Copies Certifiées de Diplômes & Certificats
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Attestations de Doctorat, HDR, Post-Doctorat ou brevets d'excellence (PDF, JPG, PNG)
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#006233', background: '#ecfdf5', padding: '3px 10px', borderRadius: 10 }}>
                            {profileDiplomesDocs.length} diplôme(s) enregistré(s)
                          </span>
                        </div>

                        {/* Add Diploma Control */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: '1rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={diplomeCustomTitle}
                            onChange={(e) => setDiplomeCustomTitle(e.target.value)}
                            placeholder="Intitulé du diplôme (ex: Doctorat Ph.D Johns Hopkins University 1995)"
                            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#ffffff' }}
                          />
                          <input
                            type="file"
                            ref={diplomeInputRef}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,image/*"
                            onChange={(e) => handleDocumentUpload(e, 'diplome')}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            disabled={uploadingDoc === 'diplome'}
                            onClick={() => diplomeInputRef.current?.click()}
                            style={{
                              padding: '9px 16px',
                              background: '#006233',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 8,
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span>+</span>
                            <span>{uploadingDoc === 'diplome' ? 'Téléversement...' : 'Ajouter un diplôme'}</span>
                          </button>
                        </div>

                        {/* Uploaded Diplomas List */}
                        {profileDiplomesDocs.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {profileDiplomesDocs.map((item, dIdx) => (
                              <div
                                key={item.id || dIdx}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 8,
                                  padding: '8px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '0.82rem',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.title || item.filename}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                      {item.filename} {item.uploadedAt ? `• ${new Date(item.uploadedAt).toLocaleDateString('fr-FR')}` : ''}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      padding: '4px 10px',
                                      background: '#ecfdf5',
                                      color: '#006233',
                                      border: '1px solid #a7f3d0',
                                      borderRadius: 6,
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                    }}
                                  >
                                    Consulter
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDocument('diplome', item.id)}
                                    title="Supprimer ce justificatif"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      padding: '4px 6px',
                                    }}
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '12px', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Aucun justificatif de diplôme téléversé. Entrez un intitulé ci-dessus et cliquez sur "Ajouter un diplôme".
                          </div>
                        )}
                      </div>

                    </div>

                    {/* SECTION 4: CARRIÈRE ET RÉALISATIONS (1ER POSTE ACTUEL EN COURS + MANDATS ANTÉRIEURS) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                              4. Carrière & Réalisations Professionnelles
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                              1 seul poste actuel en cours (Mandat #1) + mandats et fonctions de direction antérieures ({profileCarrieres.length} postes renseignés)
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddCareerPosition}
                          style={{
                            padding: '7px 14px',
                            background: '#ecfdf5',
                            border: '1.5px solid #006233',
                            borderRadius: 8,
                            color: '#006233',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>+</span>
                          <span>Ajouter un mandat antérieur</span>
                        </button>
                      </div>

                      {/* Position Cards List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {profileCarrieres.map((pos, idx) => (
                          <div
                            key={pos.id || idx}
                            style={{
                              background: idx === 0 ? '#f0fdf4' : '#f8fafc',
                              border: idx === 0 ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                              borderLeft: idx === 0 ? '5px solid #006233' : '4px solid #64748b',
                              borderRadius: 12,
                              padding: '1.25rem',
                              boxShadow: idx === 0 ? '0 2px 8px rgba(0,98,51,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {idx === 0 ? (
                                  <>
                                    <span style={{ fontWeight: 800, color: '#006233', fontSize: '0.92rem' }}>
                                      Poste Actuel (en cours)
                                    </span>
                                    <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                                      ● Fonction Actuelle en exercice
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span style={{ fontWeight: 800, color: '#475569', fontSize: '0.88rem' }}>
                                      Poste Antérieur #{idx}
                                    </span>
                                    <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>
                                      Historique
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Only positions after the first can be deleted */}
                              {idx > 0 && profileCarrieres.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCareerPosition(pos.id)}
                                  title="Supprimer ce poste antérieur"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                  }}
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '1rem', marginBottom: '1rem' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                                  {idx === 0 ? 'Intitulé du Poste Actuel / Fonction de Direction' : 'Intitulé du Poste / Fonction de Direction'}
                                </label>
                                <input
                                  type="text"
                                  value={pos.titre}
                                  onChange={(e) => handleCareerChange(pos.id, 'titre', e.target.value)}
                                  placeholder={idx === 0 ? "ex: Directeur Général, Professeur Titulaire, Chef de Département..." : "ex: Doyen, Directeur de Recherche, Vice-Président..."}
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                                  Organisme / Entreprise / Laboratoire / Hôpital
                                </label>
                                <input
                                  type="text"
                                  value={pos.organisme}
                                  onChange={(e) => handleCareerChange(pos.id, 'organisme', e.target.value)}
                                  placeholder={idx === 0 ? "ex: National Institutes of Health (NIH), Harvard, Xperi..." : "ex: Université de Montréal, CNRS, Siemens..."}
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                                  Pays & Ville
                                </label>
                                <input
                                  type="text"
                                  value={pos.paysVille}
                                  onChange={(e) => handleCareerChange(pos.id, 'paysVille', e.target.value)}
                                  placeholder="ex: États-Unis / Washington DC"
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                                  {idx === 0 ? 'Année de prise de fonction (Début)' : 'Période (Début - Fin)'}
                                </label>
                                {idx === 0 ? (
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      value={pos.anneeDebut}
                                      onChange={(e) => handleCareerChange(pos.id, 'anneeDebut', e.target.value)}
                                      placeholder="ex: 2018"
                                      style={{ width: '50%', padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                                    />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#006233', background: '#dcfce7', padding: '7px 12px', borderRadius: 8, whiteSpace: 'nowrap' }}>
                                      Présent (En cours)
                                    </span>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      value={pos.anneeDebut}
                                      onChange={(e) => handleCareerChange(pos.id, 'anneeDebut', e.target.value)}
                                      placeholder="2012"
                                      style={{ width: '50%', padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                                    />
                                    <span>-</span>
                                    <input
                                      type="text"
                                      value={pos.anneeFin}
                                      onChange={(e) => handleCareerChange(pos.id, 'anneeFin', e.target.value)}
                                      placeholder="2018"
                                      style={{ width: '50%', padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                                Réalisations Clés & Impact Majeur
                              </label>
                              <textarea
                                rows={2}
                                value={pos.realisations}
                                onChange={(e) => handleCareerChange(pos.id, 'realisations', e.target.value)}
                                placeholder="Direction de programmes scientifiques, brevets déposés, création de centres d'excellence, transferts technologiques, gestion d'équipes de pointe..."
                                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#ffffff', lineHeight: 1.45, boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Button at Bottom of Career list */}
                      <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={handleAddCareerPosition}
                          style={{
                            padding: '10px 24px',
                            background: '#ffffff',
                            border: '1.5px dashed #006233',
                            borderRadius: 10,
                            color: '#006233',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>+</span>
                          <span>Ajouter un mandat antérieur supplémentaire</span>
                        </button>
                      </div>
                    </div>

                    {/* SECTION 5: NOTICE BIOGRAPHIQUE POUR LE CONSEIL */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9', marginBottom: '1.25rem' }}>
                        
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                            5. Notice Biographique & Synthèse Stratégique
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                            Synthèse officielle rédigée pour la Présidence de la République et le portail public
                          </p>
                        </div>
                      </div>

                      <div>
                        <textarea
                          rows={4}
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          placeholder="Notice biographique complète : synthèse de carrière, axes majeurs d'expertise, vision stratégique pour la souveraineté scientifique nationale..."
                          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', lineHeight: 1.5, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        style={{
                          padding: '12px 20px',
                          background: '#ffffff',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: 10,
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Modifier mon mot de passe
                      </button>

                      <button
                        type="submit"
                        disabled={savingProfile}
                        style={{
                          padding: '14px 32px',
                          background: savingProfile ? '#cbd5e1' : 'linear-gradient(135deg, #006233 0%, #007A40 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 10,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          cursor: savingProfile ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: savingProfile ? 'none' : '0 4px 14px rgba(0, 98, 51, 0.25)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{savingProfile ? 'Enregistrement en cours...' : 'Enregistrer et publier mon profil officiel'}</span>
                      </button>
                    </div>

                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: SECURITY & PASSWORD CHANGE */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 18,
                  padding: '2.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: '#ecfdf5',
                      color: '#006233',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                    Changer votre mot de passe
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                    Connecté en tant que <strong>{user.email}</strong>.
                  </p>
                </div>

                {pwdSuccess && (
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 10,
                      padding: '0.85rem 1rem',
                      color: '#065f46',
                      fontSize: '0.88rem',
                      marginBottom: '1.5rem',
                      fontWeight: 600,
                    }}
                  >
                    {pwdSuccess}
                  </div>
                )}

                {pwdError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 10,
                      padding: '0.85rem 1rem',
                      color: '#991b1b',
                      fontSize: '0.88rem',
                      marginBottom: '1.5rem',
                      fontWeight: 600,
                    }}
                  >
                    {pwdError}
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                      Mot de passe actuel *
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe actuel"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                      Nouveau mot de passe (min. 8 caractères) *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe sécurisé"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                      Confirmer le nouveau mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez le nouveau mot de passe"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={pwdLoading}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: 'linear-gradient(135deg, #006233, #007A40)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: pwdLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(0,98,51,0.2)',
                    }}
                  >
                    {pwdLoading ? 'Mise à jour en cours...' : 'Enregistrer le nouveau mot de passe'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: DESIGNER UN CHEF DE COMMISSION (ADMIN & COORDINATEUR) */}
          {leaderModal.open && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem',
              }}
              onClick={() => setLeaderModal({ open: false, specialtyName: '', specIcon: '', suggestedLeader: '' })}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 18,
                  maxWidth: 560,
                  width: '100%',
                  padding: '2rem',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
                  border: '1px solid #e2e8f0',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                        Désigner un Chef de Groupe
                      </h3>
                      <span style={{ fontSize: '0.82rem', color: '#006233', fontWeight: 700 }}>
                        {leaderModal.specialtyName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setLeaderModal({ open: false, specialtyName: '', specIcon: '', suggestedLeader: '' })}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: 8,
                      width: 32,
                      height: 32,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Mode Switch: Existing Member Dropdown vs New Member */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: !isCreatingNew ? '#ffffff' : 'transparent',
                      color: !isCreatingNew ? '#006233' : '#64748b',
                      fontWeight: !isCreatingNew ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: !isCreatingNew ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Liste des membres
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: isCreatingNew ? '#ffffff' : 'transparent',
                      color: isCreatingNew ? '#006233' : '#64748b',
                      fontWeight: isCreatingNew ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: isCreatingNew ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Créer un nouveau compte
                  </button>
                </div>

                <form onSubmit={handleAssignLeader}>
                  {!isCreatingNew ? (
                    <div>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Sélectionnez le membre à nommer Chef dans la liste déroulante :
                        </label>
                        <select
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: 10,
                            border: '1.5px solid #006233',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            background: '#ffffff',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="">-- Choisir un membre dans la liste déroulante --</option>
                          {usersList.some((u) => u.specialite === leaderModal.specialtyName && u.active) && (
                            <optgroup label="⭐ Membres de cette commission">
                              {usersList
                                .filter((u) => u.specialite === leaderModal.specialtyName && u.active)
                                .map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.prenom} {u.nom} {u.institution ? `(${u.institution})` : ''} {u.role === 'LEADER' ? '(Chef actuel)' : ''}
                                  </option>
                                ))}
                            </optgroup>
                          )}
                          <optgroup label="Autres membres enregistrés">
                            {usersList
                              .filter((u) => u.specialite !== leaderModal.specialtyName && u.active)
                              .map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.prenom} {u.nom} {u.institution ? `(${u.institution})` : ''} {u.specialite ? `— [${u.specialite.substring(0, 20)}...]` : '— [Sans commission]'}
                                </option>
                              ))}
                          </optgroup>
                        </select>
                      </div>

                      {selectedMemberId && (() => {
                        const sel = usersList.find((u) => String(u.id) === String(selectedMemberId));
                        if (!sel) return null;
                        return (
                          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{sel.prenom} {sel.nom}</div>
                            <div style={{ color: '#64748b' }}>{sel.email}</div>
                            {sel.institution && <div style={{ color: '#64748b' }}>{sel.institution} ({sel.pays || '—'})</div>}
                            <div style={{ color: '#006233', fontWeight: 600, marginTop: 4 }}>
                              Commission actuelle : {sel.specialite || 'Aucune'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div>
                      {leaderModal.suggestedLeader && (
                        <div style={{ marginBottom: '1rem' }}>
                          <button
                            type="button"
                            onClick={() => handleAutoFillSuggested(leaderModal.suggestedLeader)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              borderRadius: 8,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            Personnalité suggérée : <strong>{leaderModal.suggestedLeader}</strong>
                          </button>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>Prénom *</label>
                          <input
                            type="text"
                            required
                            value={newLeaderForm.prenom}
                            onChange={(e) => setNewLeaderForm({ ...newLeaderForm, prenom: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>Nom *</label>
                          <input
                            type="text"
                            required
                            value={newLeaderForm.nom}
                            onChange={(e) => setNewLeaderForm({ ...newLeaderForm, nom: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>Email institutionnel *</label>
                        <input
                          type="email"
                          required
                          value={newLeaderForm.email}
                          onChange={(e) => setNewLeaderForm({ ...newLeaderForm, email: e.target.value })}
                          placeholder="ex: nom@hccsne.dz"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>Institution</label>
                          <input
                            type="text"
                            value={newLeaderForm.institution}
                            onChange={(e) => setNewLeaderForm({ ...newLeaderForm, institution: e.target.value })}
                            placeholder="ex: MIT, EPFL..."
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>Pays de résidence</label>
                          <input
                            type="text"
                            value={newLeaderForm.pays}
                            onChange={(e) => setNewLeaderForm({ ...newLeaderForm, pays: e.target.value })}
                            placeholder="ex: Algérie, France..."
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setLeaderModal({ open: false, specialtyName: '', specIcon: '', suggestedLeader: '' })}
                      style={{
                        padding: '9px 16px',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={assignLoading || (!isCreatingNew && !selectedMemberId)}
                      style={{
                        padding: '9px 20px',
                        background: (!isCreatingNew && !selectedMemberId) || assignLoading ? '#94a3b8' : 'linear-gradient(135deg, #006233, #007A40)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        cursor: (!isCreatingNew && !selectedMemberId) || assignLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 10px rgba(0,98,51,0.2)',
                      }}
                    >
                      {assignLoading ? 'Enregistrement...' : 'Confirmer la désignation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
