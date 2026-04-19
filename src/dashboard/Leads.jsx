import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Phone, MessageCircle, UserCheck, ChevronRight, AlertCircle, Upload, RefreshCw, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { sendNotification } from '../lib/notifications';
import { formatDate, addDays, isOverdue, STATUT_LEAD_COLORS, STATUT_LEAD_LABELS } from '../utils/crm';

const EMPTY_FORM = {
  nom: '', type: 'Restaurant', ville: '', telephone: '',
  email: '', status: 'nouveau', notes: '', source: 'terrain',
};

const COMMERCES = ['Restaurant', 'Salon', 'Garage', 'Immobilier', 'Autre'];
const SOURCES = [
  { value: 'terrain', label: 'Terrain' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google_maps', label: 'Google Maps' },
  { value: 'referral', label: 'Référence' },
  { value: 'autre', label: 'Autre' },
];
const STATUTS = ['nouveau', 'contacté', 'rdv_planifié', 'perdu'];

// Normalise un lead Supabase vers le format UI
// Fallback nouvelles colonnes (type_commerce/ville/statut/canal) → anciennes (type/adresse/status/source)
function fromDb(row) {
  return {
    id: row.id,
    nom: row.nom || '',
    commerce: row.type_commerce || row.type || '',
    ville: row.ville || row.adresse || '',
    telephone: row.telephone || '',
    email: row.email || '',
    statut: row.statut || row.status || 'nouveau',
    notes: row.notes || '',
    sourceContact: row.canal || row.source || 'terrain',
    dateAjout: row.created_at,
    score: row.score || 0,
  };
}

function RelanceBadge({ dateAjout, statut }) {
  if (statut === 'perdu' || statut === 'contacté') return null;
  const r1 = addDays(dateAjout, 2);
  const r2 = addDays(dateAjout, 5);
  const r3 = addDays(dateAjout, 10);
  const next = [r1, r2, r3].find(d => !isOverdue(d));
  const overdue = [r1, r2, r3].some(d => isOverdue(d));
  if (overdue) return (
    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
      <AlertCircle size={11} /> Relance en retard
    </span>
  );
  if (next) return <span className="text-xs text-gray-400">Relance {formatDate(next)}</span>;
  return null;
}

export default function Leads({ crm }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterCommerce, setFilterCommerce] = useState('');
  const fileInputRef = useRef(null);

  // Chargement initial
  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Erreur chargement leads');
    } else {
      setLeads((data || []).map(fromDb));
    }
    setLoading(false);
  };

  // Abonnement temps réel + notification push sur INSERT
  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        const lead = payload.new || {};
        sendNotification(
          '🎯 Nouveau lead !',
          `${lead.nom || 'Sans nom'} — ${lead.type_commerce || lead.type || 'Commerce'} (${lead.ville || lead.adresse || 'Ville ?'})`
        );
        fetchLeads();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, () => fetchLeads())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'leads' }, () => fetchLeads())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = leads.filter(l => {
    if (filterStatut && l.statut !== filterStatut) return false;
    if (filterCommerce && l.commerce !== filterCommerce) return false;
    return true;
  });

  const handleAdd = async () => {
    if (!form.nom || !form.telephone) return;
    const payload = {
      nom: (form.nom || '').trim(),
      type_commerce: (form.type || '').trim(),
      ville: (form.ville || '').trim(),
      telephone: (form.telephone || '').trim(),
      statut: (form.status || 'nouveau').trim(),
      notes: (form.notes || '').trim(),
      canal: (form.source || 'terrain').trim(),
      score: parseInt(form.score) || 0,
    };
    console.log('[Leads][handleAdd] payload:', payload);
    const { data, error } = await supabase.from('leads').insert(payload).select().single();
    console.log('[Leads][handleAdd] result:', data, error);
    if (error) {
      alert('Erreur: ' + error.message + '\nCode: ' + error.code);
      return;
    }
    toast.success('✅ Lead ajouté !');
    if (data) setLeads(prev => [fromDb(data), ...prev]);
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const handleUpdate = async (id, updates) => {
    const dbUpdates = {};
    if (updates.statut !== undefined) dbUpdates.statut = updates.statut;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    const { error } = await supabase.from('leads').update(dbUpdates).eq('id', id);
    if (error) toast.error('Erreur mise à jour');
    else setSelected(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) toast.error('Erreur suppression');
    else { toast.success('Lead supprimé'); setSelected(null); }
  };

  // Lead → Client (via Supabase)
  const handleConvertToClient = async (lead) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          nom: lead.nom,
          entreprise: lead.type_commerce || lead.commerce || null,
          telephone: lead.telephone || null,
          email: null,
          ville: lead.ville || null,
          statut: 'actif',
          notes: lead.notes || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('[Leads][Convert] ERREUR:', error);
        alert('Erreur: ' + error.message);
        return;
      }

      console.log('[Leads][Convert] client créé:', data);

      await supabase
        .from('leads')
        .update({ statut: 'client' })
        .eq('id', lead.id);

      setLeads(prev => prev.map(l =>
        l.id === lead.id ? { ...l, statut: 'client' } : l
      ));

      toast.success(lead.nom + ' converti en client !');
      setSelected(null);
    } catch (err) {
      console.error('[Leads][Convert] EXCEPTION:', err);
      alert('Erreur: ' + err.message);
    }
  };

  // Lead → Prospect (crm hook localStorage + Supabase status)
  const handleConvertToProspect = async (lead) => {
    const { error } = await supabase.from('leads').update({ statut: 'qualifié' }).eq('id', lead.id);
    console.log('[Leads][convert→prospect]', lead, error);
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, statut: 'qualifié' } : l));
    if (crm?.addProspect) {
      crm.addProspect({
        nom: lead.nom,
        commerce: lead.commerce,
        ville: lead.ville,
        telephone: lead.telephone,
        email: lead.email,
        statut: 'rdv_planifié',
        scoreInteret: lead.score >= 70 ? 4 : lead.score >= 50 ? 3 : 2,
        packInteresse: 'visibilité_350',
        prochainAction: 'Appel de découverte',
        dateProchainAction: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      });
    }
    toast.success('📋 Lead passé en prospect ! Visible dans le kanban.');
    setSelected(null);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const items = JSON.parse(ev.target.result);
        if (!Array.isArray(items)) { toast.error('Format invalide'); return; }
        const payloads = items
          .filter(item => item.nom || item.name)
          .map(item => ({
            nom: item.nom || item.name || 'Sans nom',
            telephone: item.telephone || item.phone || item.formatted_phone_number || null,
            ville: item.ville || item.vicinity || item.adresse || null,
            type_commerce: item.type_commerce || item.commerce || item.type || item.secteur || null,
            canal: item.canal || item.sourceContact || item.source || 'import',
            statut: item.statut || item.status || 'nouveau',
            score: parseInt(item.score) || 0,
            notes: item.notes || item.audit_ia || null,
          }));
        const { data: inserted, error } = await supabase.from('leads').insert(payloads).select();
        console.log('[Leads][handleImport]', items.length, payloads[0], inserted, error);
        if (error) toast.error('Erreur import : ' + error.message);
        else {
          toast.success(`✅ ${payloads.length} leads importés !`, { duration: 4000 });
          setLeads(prev => [...(inserted || []).map(fromDb), ...prev]);
        }
      } catch { toast.error('Fichier JSON invalide'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm">{leads.filter(l => l.statut !== 'perdu').length} leads actifs</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLeads}
            className="flex items-center gap-2 border border-gray-200 hover:border-violet-400 text-gray-600 hover:text-violet-700 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 border border-gray-200 hover:border-violet-400 text-gray-600 hover:text-violet-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Upload size={15} /> Importer JSON
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> Nouveau Lead
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LEAD_LABELS[s]}</option>)}
        </select>
        <select value={filterCommerce} onChange={e => setFilterCommerce(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">Tous les commerces</option>
          {COMMERCES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-16 text-gray-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
            <p className="text-sm">Chargement…</p>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Aucun lead trouvé</p>
            <p className="text-sm mt-1">Ajoute ton premier prospect ou importe un fichier JSON</p>
          </div>
        )}
        {filtered.map(lead => (
          <motion.div key={lead.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer hover:border-violet-300 transition-colors"
            onClick={() => setSelected(lead)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{lead.nom}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUT_LEAD_COLORS[lead.statut] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUT_LEAD_LABELS[lead.statut] || lead.statut}
                  </span>
                  {lead.score >= 70 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                      🔥 Score {lead.score}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{lead.commerce} · {lead.ville}</p>
                <div className="flex items-center gap-3 mt-1">
                  <RelanceBadge dateAjout={lead.dateAjout} statut={lead.statut} />
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Nouveau Lead */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Nouveau lead</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Nom *', key: 'nom', type: 'text', placeholder: 'Karim B.' },
                  { label: 'Téléphone *', key: 'telephone', type: 'tel', placeholder: '06...' },
                  { label: 'Ville', key: 'ville', type: 'text', placeholder: 'Clichy' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'optionnel' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commerce</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {COMMERCES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source contact</label>
                  <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    rows={3} placeholder="Observations, contexte..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >Annuler</button>
                <button onClick={handleAdd} disabled={!form.nom || !form.telephone}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >Ajouter le lead</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer détail lead */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setSelected(null)}
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{selected.nom}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUT_LEAD_COLORS[selected.statut] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUT_LEAD_LABELS[selected.statut] || selected.statut}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{selected.commerce}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{selected.ville}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-500">Tel: <span className="text-gray-900 font-medium">{selected.telephone}</span></p>
                  {selected.email && <p className="text-gray-500">Email: <span className="text-gray-900">{selected.email}</span></p>}
                  <p className="text-gray-500">Ajouté le: <span className="text-gray-900">{formatDate(selected.dateAjout)}</span></p>
                  <p className="text-gray-500">Source: <span className="text-gray-900 capitalize">{selected.sourceContact}</span></p>
                  {selected.score > 0 && <p className="text-gray-500">Score: <span className="text-violet-600 font-bold">{selected.score}/100</span></p>}
                </div>
                {selected.notes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{selected.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Séquence de relance</p>
                  {[
                    { label: 'Relance 1', date: addDays(selected.dateAjout, 2) },
                    { label: 'Relance 2', date: addDays(selected.dateAjout, 5) },
                    { label: 'Relance 3', date: addDays(selected.dateAjout, 10) },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between text-xs py-1.5">
                      <span className="text-gray-600">{r.label}</span>
                      <span className={isOverdue(r.date) ? 'text-red-500 font-medium' : 'text-gray-500'}>
                        {formatDate(r.date)} {isOverdue(r.date) ? '⚠️' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Changer le statut</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUTS.map(s => (
                      <button key={s}
                        onClick={() => handleUpdate(selected.id, { statut: s })}
                        className={`text-xs py-2 px-3 rounded-lg border transition-colors ${
                          selected.statut === s ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-700 hover:border-violet-300'
                        }`}
                      >
                        {STATUT_LEAD_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 space-y-2">
                <div className="flex gap-2">
                  <a href={`tel:${selected.telephone}`}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Phone size={15} /> Appeler
                  </a>
                  <a href={`https://wa.me/33${selected.telephone.replace(/^0/, '')}`} target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 border border-green-200 text-green-700 py-2.5 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                </div>
                <button onClick={() => handleConvertToProspect(selected)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <TrendingUp size={15} /> Passer en prospect
                </button>
                <button onClick={() => handleConvertToClient(selected)}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <UserCheck size={15} /> Convertir en client
                </button>
                <button onClick={() => handleDelete(selected.id)}
                  className="w-full text-red-500 hover:text-red-600 text-xs py-1 transition-colors"
                >
                  Supprimer ce lead
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
