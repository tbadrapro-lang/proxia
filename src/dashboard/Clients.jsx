import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Phone, ExternalLink, CheckSquare, Square, FileText, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime, STATUT_CLIENT_COLORS, PACK_LABELS, getAvatarColor } from '../utils/crm';
import { supabase } from '../lib/supabaseClient';

const EMPTY_FORM = {
  nom: '', commerce: '', ville: '', telephone: '', email: '',
  statut: 'actif', packAcheté: 'visibilité_350', montantPayé: '',
  dateLivraison: '', notes: '', projetUrl: '',
};

const STATUTS = [
  { value: 'actif', label: 'Actif' },
  { value: 'livré', label: 'Livré' },
  { value: 'pause', label: 'En pause' },
  { value: 'churned', label: 'Churned' },
];

const PACKS = [
  { value: 'visibilité_350', label: 'Visibilité 350€' },
  { value: 'efficacite_600', label: 'Efficacité 600€' },
  { value: 'agent_ia_100mois', label: 'Agent IA 100€/mois' },
  { value: 'custom', label: 'Sur mesure' },
];

const CHECKLIST_ITEMS = [
  'Site créé et déployé',
  'Google Maps optimisé',
  'Formulaire de contact testé',
  'Mobile vérifié',
  'Présentation client faite',
  'Facture envoyée',
  'Avis Google demandé',
  'Upsell proposé',
];

// ── helpers localStorage par client ──────────────────────────────────────────
const loadClientData = (key, clientId, fallback) => {
  try {
    const v = localStorage.getItem(`${key}_${clientId}`);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const saveClientData = (key, clientId, data) => {
  localStorage.setItem(`${key}_${clientId}`, JSON.stringify(data));
};

// ── Onglet Projet ─────────────────────────────────────────────────────────────
function OngletProjet({ clientId }) {
  const defaultProjet = {
    urlSite: '', urlMaps: '', urlGBP: '', loginAdmin: '', mdpAdmin: '',
    statutProjet: 'en_cours',
    checklist: Object.fromEntries(CHECKLIST_ITEMS.map(k => [k, false])),
  };
  const [projet, setProjet] = useState(() => loadClientData('proxia_projet', clientId, defaultProjet));

  const update = (updates) => {
    const next = { ...projet, ...updates };
    setProjet(next);
    saveClientData('proxia_projet', clientId, next);
  };

  const toggleCheck = (item) => {
    const next = { ...projet, checklist: { ...projet.checklist, [item]: !projet.checklist[item] } };
    setProjet(next);
    saveClientData('proxia_projet', clientId, next);
  };

  const done = Object.values(projet.checklist).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Statut projet</label>
        <div className="flex gap-2">
          {['en_cours', 'livré', 'maintenance'].map(s => (
            <button key={s}
              onClick={() => update({ statutProjet: s })}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                projet.statutProjet === s ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-600 hover:border-violet-300'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'URL site livré', key: 'urlSite', icon: '🌐' },
          { label: 'Google Maps', key: 'urlMaps', icon: '📍' },
          { label: 'Google Business Profile', key: 'urlGBP', icon: '🏪' },
          { label: 'Login admin', key: 'loginAdmin', icon: '👤' },
          { label: 'Mot de passe admin', key: 'mdpAdmin', icon: '🔑' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.icon} {f.label}</label>
            <div className="flex gap-2">
              <input value={projet[f.key]} onChange={e => update({ [f.key]: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder={f.key.startsWith('url') ? 'https://...' : ''}
              />
              {f.key.startsWith('url') && projet[f.key] && (
                <a href={projet[f.key]} target="_blank" rel="noreferrer"
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-violet-600"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Checklist livraison</label>
          <span className="text-xs text-gray-400">{done}/{CHECKLIST_ITEMS.length}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(done / CHECKLIST_ITEMS.length) * 100}%` }} />
        </div>
        <div className="space-y-2">
          {CHECKLIST_ITEMS.map(item => (
            <button key={item} onClick={() => toggleCheck(item)}
              className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              {projet.checklist[item]
                ? <CheckSquare size={16} className="text-violet-600 flex-shrink-0" />
                : <Square size={16} className="text-gray-300 flex-shrink-0" />
              }
              <span className={`text-xs ${projet.checklist[item] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Onglet Documents ──────────────────────────────────────────────────────────
function OngletDocuments({ clientId }) {
  const [docs, setDocs] = useState(() => loadClientData('proxia_docs', clientId, []));
  const [form, setForm] = useState({ titre: '', url: '' });
  const [adding, setAdding] = useState(false);

  const addDoc = () => {
    if (!form.titre) return;
    const next = [...docs, { ...form, date: new Date().toISOString(), id: Date.now().toString() }];
    setDocs(next);
    saveClientData('proxia_docs', clientId, next);
    setForm({ titre: '', url: '' });
    setAdding(false);
  };

  const removeDoc = (id) => {
    const next = docs.filter(d => d.id !== id);
    setDocs(next);
    saveClientData('proxia_docs', clientId, next);
  };

  return (
    <div className="space-y-3">
      {docs.length === 0 && !adding && (
        <p className="text-xs text-gray-400 text-center py-4">Aucun document</p>
      )}
      {docs.map(doc => (
        <div key={doc.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
          <FileText size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{doc.titre}</p>
            {doc.url && (
              <a href={doc.url.startsWith('http') ? doc.url : `https://${doc.url}`}
                target="_blank" rel="noreferrer"
                className="text-xs text-violet-600 hover:underline truncate block"
              >
                {doc.url}
              </a>
            )}
            <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(doc.date)}</p>
          </div>
          <button onClick={() => removeDoc(doc.id)} className="text-gray-300 hover:text-red-400 transition-colors">
            <X size={13} />
          </button>
        </div>
      ))}
      {adding ? (
        <div className="space-y-2 bg-violet-50 rounded-xl p-3">
          <input value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))}
            placeholder="Titre (ex: Devis signé)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
            placeholder="URL ou note (optionnel)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-lg text-xs hover:bg-white">Annuler</button>
            <button onClick={addDoc} disabled={!form.titre} className="flex-1 bg-violet-600 text-white py-1.5 rounded-lg text-xs disabled:opacity-50">Ajouter</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 text-gray-500 py-2 rounded-xl text-xs hover:border-violet-400 hover:text-violet-600 transition-colors"
        >
          <Plus size={13} /> Ajouter un document
        </button>
      )}
    </div>
  );
}

// ── Onglet Notes ──────────────────────────────────────────────────────────────
function OngletNotes({ clientId }) {
  const [notes, setNotes] = useState(() => loadClientData('proxia_notes', clientId, []));
  const [text, setText] = useState('');

  const addNote = () => {
    if (!text.trim()) return;
    const next = [{ texte: text.trim(), date: new Date().toISOString(), id: Date.now().toString() }, ...notes];
    setNotes(next);
    saveClientData('proxia_notes', clientId, next);
    setText('');
  };

  const removeNote = (id) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    saveClientData('proxia_notes', clientId, next);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <textarea value={text} onChange={e => setText(e.target.value)}
          rows={3} placeholder="Ajouter une note..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
        <button onClick={addNote} disabled={!text.trim()}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <StickyNote size={13} /> Ajouter la note
        </button>
      </div>
      {notes.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Aucune note</p>}
      <div className="space-y-2">
        {notes.map(note => (
          <div key={note.id} className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-gray-800 flex-1 whitespace-pre-wrap">{note.texte}</p>
              <button onClick={() => removeNote(note.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                <X size={13} />
              </button>
            </div>
            <p className="text-[10px] text-amber-500 mt-1">{formatDateTime(note.date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function Clients({ crm }) {
  const { clients, addClient, updateClient, deleteClient } = crm;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('infos');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.nom || !form.telephone) return;
    setSaving(true);
    try {
      const payload = {
        nom: (form.nom || '').trim(),
        prenom: null,
        entreprise: (form.commerce || '').trim() || null,
        email: (form.email || '').trim() || null,
        telephone: (form.telephone || '').trim() || null,
        adresse: (form.ville || '').trim() || null,
        ville: (form.ville || '').trim() || null,
        statut: form.statut || 'actif',
        notes: (form.notes || '').trim() || null,
      };
      console.log('[Clients][handleAdd] payload:', payload);
      const { data, error } = await supabase.from('clients').insert(payload).select().single();
      console.log('[Clients][handleAdd] result:', data, error);
      if (error) throw error;
      addClient({ ...form, montantPayé: Number(form.montantPayé) || 0 });
      toast.success('✅ Client ajouté !');
      setForm(EMPTY_FORM);
      setShowModal(false);
    } catch (err) {
      console.error('[Clients][handleAdd]', err);
      toast.error('Erreur : ' + (err.message || 'inconnue'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (client) => {
    if (!window.confirm(`Supprimer définitivement le client ${client.nom} ?`)) return;
    deleteClient(client.id);
    setSelected(null);
    toast.success('Client supprimé');
  };

  const sorted = [...clients].sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut));

  const TABS = [
    { id: 'infos', label: 'Infos' },
    { id: 'projet', label: 'Projet' },
    { id: 'documents', label: 'Documents' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm">{clients.filter(c => c.statut === 'actif').length} clients actifs</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Nouveau Client
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {sorted.length === 0 && (
          <div className="sm:col-span-2 text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Aucun client</p>
            <p className="text-sm mt-1">Ajoutez ou convertissez un lead</p>
          </div>
        )}
        {sorted.map(client => {
          const avatarColor = getAvatarColor(client.nom);
          return (
            <motion.div key={client.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => { setSelected(client); setActiveTab('infos'); }}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm cursor-pointer hover:border-violet-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${avatarColor} rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                  {client.nom.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{client.nom}</p>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUT_CLIENT_COLORS[client.statut] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUTS.find(s => s.value === client.statut)?.label || client.statut}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{client.commerce} · {client.ville}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg font-medium">
                      {PACK_LABELS[client.packAcheté] || client.packAcheté}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{client.montantPayé?.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal nouveau client */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Nouveau client</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Nom *', key: 'nom', type: 'text' },
                  { label: 'Commerce', key: 'commerce', type: 'text' },
                  { label: 'Ville', key: 'ville', type: 'text' },
                  { label: 'Téléphone *', key: 'telephone', type: 'tel' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Montant payé (€)', key: 'montantPayé', type: 'number' },
                  { label: 'Date de livraison', key: 'dateLivraison', type: 'date' },
                  { label: 'URL du projet', key: 'projetUrl', type: 'url' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pack</label>
                  <select value={form.packAcheté} onChange={e => setForm(p => ({ ...p, packAcheté: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {PACKS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >Annuler</button>
                <button onClick={handleAdd} disabled={!form.nom || !form.telephone || saving}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >{saving ? 'Enregistrement…' : 'Ajouter'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer client avec onglets */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelected(null)} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${getAvatarColor(selected.nom)} rounded-xl flex items-center justify-center text-white font-bold`}>
                      {selected.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm">{selected.nom}</h2>
                      <p className="text-xs text-gray-500">{selected.commerce} · {selected.ville}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}><X size={20} className="text-gray-400" /></button>
                </div>
                {/* Onglets */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                  {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                        activeTab === tab.id ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenu onglet */}
              <div className="flex-1 overflow-y-auto p-5">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {activeTab === 'infos' && (
                      <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUT_CLIENT_COLORS[selected.statut] || 'bg-gray-100 text-gray-600'}`}>
                            {STATUTS.find(s => s.value === selected.statut)?.label}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-700">
                            {PACK_LABELS[selected.packAcheté]}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-500">Tel: <span className="text-gray-900 font-medium">{selected.telephone}</span></p>
                          {selected.email && <p className="text-gray-500">Email: <span className="text-gray-900">{selected.email}</span></p>}
                          <p className="text-gray-500">Montant payé: <span className="text-gray-900 font-bold">{selected.montantPayé?.toLocaleString('fr-FR')} €</span></p>
                          <p className="text-gray-500">Début: <span className="text-gray-900">{formatDate(selected.dateDebut)}</span></p>
                          {selected.dateLivraison && <p className="text-gray-500">Livraison: <span className="text-gray-900">{formatDate(selected.dateLivraison)}</span></p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-2">Changer le statut</label>
                          <div className="grid grid-cols-2 gap-2">
                            {STATUTS.map(s => (
                              <button key={s.value}
                                onClick={() => { updateClient(selected.id, { statut: s.value }); setSelected(p => ({ ...p, statut: s.value })); }}
                                className={`text-xs py-2 px-3 rounded-lg border transition-colors ${
                                  selected.statut === s.value ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-700 hover:border-violet-300'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === 'projet' && <OngletProjet clientId={selected.id} />}
                    {activeTab === 'documents' && <OngletDocuments clientId={selected.id} />}
                    {activeTab === 'notes' && <OngletNotes clientId={selected.id} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer actions */}
              <div className="p-5 border-t border-gray-100 space-y-2">
                <div className="flex gap-2">
                  <a href={`tel:${selected.telephone}`}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Phone size={15} /> Appeler
                  </a>
                  {selected.projetUrl && (
                    <a href={selected.projetUrl} target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 border border-violet-200 text-violet-700 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-50 transition-colors"
                    >
                      <ExternalLink size={15} /> Voir projet
                    </a>
                  )}
                </div>
                <button onClick={() => handleDelete(selected)}
                  className="w-full text-red-500 hover:text-red-600 text-xs py-1 transition-colors"
                >Supprimer ce client</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
