export const PROJECT_STATUSES = {
  IDEATION: {
    code: 'IDEATION',
    label: 'Idéation & TDR',
    color: '#4f46e5',
    bg: '#eef2ff',
    border: '#c7d2fe',
    badge: 'Idéation & TDR',
    phaseNumber: 1,
  },
  CONSORTIUM: {
    code: 'CONSORTIUM',
    label: 'Consortium en cours',
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    badge: 'Consortium en cours',
    phaseNumber: 2,
  },
  VALIDATION_CONSEIL: {
    code: 'VALIDATION_CONSEIL',
    label: 'Validation Conseil & Tutelle',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    badge: 'Validation Conseil & Tutelle',
    phaseNumber: 3,
  },
  APPEL_OFFRES: {
    code: 'APPEL_OFFRES',
    label: 'Passation & Appel d’Offres',
    color: '#7e22ce',
    bg: '#faf5ff',
    border: '#e9d5ff',
    badge: 'Passation & Appel d’Offres',
    phaseNumber: 4,
  },
  EN_REALISATION: {
    code: 'EN_REALISATION',
    label: 'En Réalisation & Pilote',
    color: '#006233',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    badge: 'En Réalisation & Pilote',
    phaseNumber: 5,
  },
  FINALISE: {
    code: 'FINALISE',
    label: 'Finalisé & Déployé',
    color: '#15803d',
    bg: '#dcfce7',
    border: '#86efac',
    badge: 'Finalisé & Déployé',
    phaseNumber: 6,
  },
};

export const PASSATION_TYPES = [
  { id: 'APPEL_PROJETS_NATIONAL', label: 'Appel à Projets National (FNR / MESRS)' },
  { id: 'APPEL_PROJETS_INTERNATIONAL', label: 'Appel à Projets International Mixte (Diaspora - Algérie)' },
  { id: 'APPEL_OFFRES_OUVERT', label: 'Marché Public / Appel d’Offres Ouvert National & International' },
  { id: 'APPEL_OFFRES_RESTREINT', label: 'Consultation Sélective / Appel d’Offres Restreint (Haut niveau tech)' },
  { id: 'PARTENARIAT_PPP', label: 'Partenariat Public-Privé (PPP Investissement)' },
  { id: 'CONVENTION_DIRECTE', label: 'Convention Stratégique de Co-développement (Gré à gré après décret)' },
];

export const ECONOMIC_MODELS = [
  { id: 'TRANSFERT_TECH', label: 'Transfert Technologique & Brevets d’Invention Souverains' },
  { id: 'SUBSTITUTION_IMPORT', label: 'Substitution aux Importations & Autosuffisance Industrielle' },
  { id: 'FILIERE_LOCALE', label: 'Création d’une Filière Industrielle Locale & Spin-offs Universitaires' },
  { id: 'POLE_FORMATION', label: 'Pôle d’Excellence de Recherche & Formation Avancée (Master/Ph.D)' },
  { id: 'INFRASTRUCTURE_CRITIQUE', label: 'Déploiement d’une Infrastructure Nationale Critique' },
];

export const PRIORITIES = [
  { id: 'STRATEGIQUE', label: 'Souveraineté Stratégique', color: '#006233', bg: '#ecfdf5' },
  { id: 'URGENT', label: 'Haute Priorité Présidentielle', color: '#dc2626', bg: '#fef2f2' },
  { id: 'STRUCTURANT', label: 'Projet Structurant Moyen/Long Terme', color: '#4338ca', bg: '#eef2ff' },
];

export const DEFAULT_PROJECT_MILESTONES = [
  {
    id: 1,
    code: 'TDR_REDIGES',
    label: '1. Cadrage préliminaire et rédaction des Termes de Référence (TDR)',
    phase: 'Cadrage',
    weight: 10,
    completed: true,
    completedAt: '2026-03-01',
    note: 'TDR élaborés conjointement par le groupe de travail sectoriel.',
  },
  {
    id: 2,
    code: 'CONSORTIUM_FORME',
    label: '2. Identification et engagement du consortium (Universités algériennes & diaspora)',
    phase: 'Consortium',
    weight: 15,
    completed: false,
    completedAt: null,
    note: '',
  },
  {
    id: 3,
    code: 'VALIDATION_COMMISSION',
    label: '3. Examen technique et validation par la Commission sectorielle du HCCSNE',
    phase: 'Validation',
    weight: 15,
    completed: false,
    completedAt: null,
    note: '',
  },
  {
    id: 4,
    code: 'AVIS_COORDINATION',
    label: '4. Arbitrage stratégique et validation par le Coordinateur Général',
    phase: 'Validation',
    weight: 10,
    completed: false,
    completedAt: null,
    note: '',
  },
  {
    id: 5,
    code: 'ACCORD_TUTELLE',
    label: '5. Saisine institutionnelle et accord de principe du Ministère de tutelle',
    phase: 'Institutionnel',
    weight: 15,
    completed: false,
    completedAt: null,
    note: '',
  },
  {
    id: 6,
    code: 'LANCEMENT_MARCHE',
    label: '6. Structuration économique : Appel à projets / Appel d’offres / Convention PPP',
    phase: 'Marché & Financement',
    weight: 15,
    completed: false,
    completedAt: null,
    note: '',
  },
  {
    id: 7,
    code: 'PILOTE_OPERATIONNEL',
    label: '7. Démarrage de la phase pilote & transfert technologique vers l’Algérie',
    phase: 'Exécution',
    weight: 10,
    completed: false,
    completedAt: null,
    note: '',
  },
  {
    id: 8,
    code: 'EVALUATION_DEPLOIEMENT',
    label: '8. Évaluation d’impact national, extension à l’échelle et pérennisation',
    phase: 'Clôture',
    weight: 10,
    completed: false,
    completedAt: null,
    note: '',
  },
];

export function calculateProgressFromMilestones(milestones) {
  if (!Array.isArray(milestones) || milestones.length === 0) return 10;
  const completedWeight = milestones
    .filter((m) => m.completed)
    .reduce((sum, m) => sum + (Number(m.weight) || 12.5), 0);
  return Math.min(100, Math.max(0, Math.round(completedWeight)));
}

export function determineStatusFromProgress(progress) {
  if (progress >= 100) return 'FINALISE';
  if (progress >= 75) return 'EN_REALISATION';
  if (progress >= 50) return 'APPEL_OFFRES';
  if (progress >= 35) return 'VALIDATION_CONSEIL';
  if (progress >= 20) return 'CONSORTIUM';
  return 'IDEATION';
}
