export const generateId = (prefix = 'ID') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const generateDocId = (prefix, existing = []) => {
  const nums = existing
    .map(d => parseInt(d.id?.replace(`${prefix}-`, '') || '0'))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
};

export const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const addDays = (isoDate, days) => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const isOverdue = (isoDate) => {
  if (!isoDate) return false;
  return new Date(isoDate) < new Date();
};

export const isSameDay = (iso1, iso2) => {
  const a = new Date(iso1);
  const b = new Date(iso2);
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
};

export const getWeekDays = (date = new Date()) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

export const STATUT_LEAD_COLORS = {
  nouveau: 'bg-blue-100 text-blue-700',
  contacté: 'bg-amber-100 text-amber-700',
  rdv_planifié: 'bg-green-100 text-green-700',
  perdu: 'bg-gray-100 text-gray-500',
};

export const STATUT_LEAD_LABELS = {
  nouveau: 'Nouveau',
  contacté: 'Contacté',
  rdv_planifié: 'RDV planifié',
  perdu: 'Perdu',
};

export const STATUT_CLIENT_COLORS = {
  actif: 'bg-green-100 text-green-700',
  livré: 'bg-blue-100 text-blue-700',
  pause: 'bg-amber-100 text-amber-700',
  churned: 'bg-red-100 text-red-600',
};

export const PACK_LABELS = {
  visibilité_350: 'Visibilité 350€',
  efficacite_600: 'Efficacité 600€',
  agent_ia_100mois: 'Agent IA 100€/mois',
  custom: 'Sur mesure',
};

export const STATUT_DEVIS_COLORS = {
  brouillon: 'bg-gray-100 text-gray-600',
  envoyé: 'bg-blue-100 text-blue-700',
  signé: 'bg-green-100 text-green-700',
  refusé: 'bg-red-100 text-red-600',
};

export const STATUT_FACTURE_COLORS = {
  en_attente: 'bg-amber-100 text-amber-700',
  payée: 'bg-green-100 text-green-700',
  retard: 'bg-red-100 text-red-600',
};

export const AVATAR_COLORS = [
  'bg-violet-500', 'bg-pink-500', 'bg-amber-500', 'bg-green-500',
  'bg-blue-500', 'bg-cyan-500', 'bg-rose-500', 'bg-indigo-500',
];

export const getAvatarColor = (name = '') => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};
