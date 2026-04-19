import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, UserCheck, Phone, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const COLONNES = [
  { id: 'qualifié', label: 'Qualifié', color: 'border-blue-400', bg: 'bg-blue-50', dot: 'bg-blue-400' },
  { id: 'contacté', label: 'Contacté', color: 'border-violet-400', bg: 'bg-violet-50', dot: 'bg-violet-400' },
  { id: 'rdv', label: 'RDV', color: 'border-amber-400', bg: 'bg-amber-50', dot: 'bg-amber-400' },
  { id: 'devis', label: 'Devis', color: 'border-orange-400', bg: 'bg-orange-50', dot: 'bg-orange-400' },
];

const STATUTS_PROSPECT = COLONNES.map(c => c.id);

const EMPTY_FORM = {
  nom: '', telephone: '', email: '', ville: '', type_commerce: 'Restaurant',
  notes: '', score: 50, statut: 'qualifié', canal: 'manuel',
};

function ProspectCard({ p, onSelect, onMove, colIdx }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 cursor-pointer hover:border-violet-300 transition-colors"
      onClick={() => onSelect(p)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{p.nom}</p>
          <p className="text-xs text-gray-500 truncate">
            {p.type_commerce || 'Commerce'} · {p.ville || '—'}
          </p>
        </div>
        <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">
          {p.score || 0}
        </span>
      </div>
      {p.telephone && (
        <a
          href={`tel:${p.telephone}`}
          onClick={e => e.stopPropagation()}
          className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-violet-600"
        >
          <Phone size={11} /> {p.telephone}
        </a>
      )}
      <div className="flex gap-1 mt-2 pt-2 border-t border-gray-50" onClick={e => e.stopPropagation()}>
        {colIdx > 0 && (
          <button
            onClick={() => onMove(p, COLONNES[colIdx - 1].id)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft size={12} />
          </button>
        )}
        <span className="flex-1" />
        {colIdx < COLONNES.length - 1 && (
          <button
            onClick={() => onMove(p, COLONNES[colIdx + 1].id)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function Prospects() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .in('statut', STATUTS_PROSPECT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProspects(data || []);
    } catch (err) {
      console.error('[Prospects][fetch]', err);
      toast.error('Erreur chargement : ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProspects();
    const channel = supabase
      .channel('prospects-leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchProspects())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchProspects]);

  const handleAdd = async () => {
    if (!form.nom || !form.telephone) {
      toast.error('Nom et téléphone requis');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nom: form.nom.trim(),
        telephone: form.telephone.trim() || null,
        email: form.email.trim() || null,
        ville: form.ville.trim() || null,
        type_commerce: form.type_commerce.trim() || null,
        notes: form.notes.trim() || null,
        score: parseInt(form.score) || 0,
        statut: form.statut,
        canal: form.canal || 'manuel',
      };
      const { error } = await supabase.from('leads').insert(payload);
      if (error) throw error;
      toast.success('✅ Prospect ajouté');
      setForm(EMPTY_FORM);
      setShowModal(false);
      fetchProspects();
    } catch (err) {
      console.error('[Prospects][handleAdd]', err);
      toast.error('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (p, newStatut) => {
    try {
      const { error } = await supabase.from('leads').update({ statut: newStatut }).eq('id', p.id);
      if (error) throw error;
      toast.success(`Déplacé vers ${newStatut}`);
    } catch (err) {
      console.error('[Prospects][handleMove]', err);
      toast.error('Erreur : ' + err.message);
    }
  };

  const handleConvert = async (p) => {
    if (!window.confirm(`Convertir ${p.nom} en client ?`)) return;
    try {
      const { error: insErr } = await supabase.from('clients').insert({
        nom: p.nom,
        telephone: p.telephone || null,
        email: p.email || null,
        adresse: p.ville || null,
        statut: 'actif',
        notes: p.notes || null,
      });
      if (insErr) throw insErr;
      const { error: updErr } = await supabase.from('leads').update({ statut: 'client' }).eq('id', p.id);
      if (updErr) throw updErr;
      toast.success('✅ Converti en client');
      setSelected(null);
      fetchProspects();
    } catch (err) {
      console.error('[Prospects][handleConvert]', err);
      toast.error('Erreur conversion : ' + err.message);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Supprimer ${p.nom} ?`)) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', p.id);
      if (error) throw error;
      toast.success('Prospect supprimé');
      setSelected(null);
      fetchProspects();
    } catch (err) {
      console.error('[Prospects][handleDelete]', err);
      toast.error('Erreur : ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-500 text-sm">
            {loading ? 'Chargement…' : `${prospects.length} prospects en pipeline`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Ajouter prospect
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
        {COLONNES.map((col, colIdx) => {
          const cards = prospects.filter(p => p.statut === col.id);
          return (
            <div key={col.id} className="flex flex-col min-w-[220px]">
              <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl ${col.bg} border ${col.color} border-opacity-50`}>
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                <span className="ml-auto text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {cards.map(p => (
                  <ProspectCard key={p.id} p={p} onSelect={setSelected} onMove={handleMove} colIdx={colIdx} />
                ))}
                {cards.length === 0 && (
                  <div className="text-center py-6 text-gray-300 text-xs border-2 border-dashed border-gray-100 rounded-xl">
                    Aucun prospect
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal nouveau prospect */}
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
                <h2 className="font-bold text-gray-900 text-lg">Nouveau prospect</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Nom *', key: 'nom', type: 'text' },
                  { label: 'Téléphone *', key: 'telephone', type: 'tel' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Ville', key: 'ville', type: 'text' },
                  { label: 'Type commerce', key: 'type_commerce', type: 'text' },
                  { label: 'Score (0-100)', key: 'score', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {COLONNES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowModal(false)} disabled={saving}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >Annuler</button>
                <button onClick={handleAdd} disabled={saving || !form.nom || !form.telephone}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >{saving ? '…' : 'Ajouter'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer détail */}
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
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-gray-900">{selected.nom}</h2>
                  <p className="text-xs text-gray-500">{selected.type_commerce} · {selected.ville}</p>
                </div>
                <button onClick={() => setSelected(null)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="space-y-2 text-sm">
                  {selected.telephone && <p className="text-gray-500">Tél: <span className="text-gray-900 font-medium">{selected.telephone}</span></p>}
                  {selected.email && <p className="text-gray-500">Email: <span className="text-gray-900">{selected.email}</span></p>}
                  <p className="text-gray-500">Score: <span className="text-gray-900 font-medium">{selected.score || 0}</span></p>
                  <p className="text-gray-500">Canal: <span className="text-gray-900">{selected.canal || '—'}</span></p>
                </div>
                {selected.notes && (
                  <div className="bg-violet-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-violet-600 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.notes}</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Statut</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLONNES.map(col => (
                      <button key={col.id}
                        onClick={() => { handleMove(selected, col.id); setSelected(p => ({ ...p, statut: col.id })); }}
                        className={`text-xs py-2 px-3 rounded-lg border transition-colors ${
                          selected.statut === col.id ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-700 hover:border-violet-300'
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 space-y-2">
                <div className="flex gap-2">
                  {selected.telephone && (
                    <a href={`tel:${selected.telephone}`}
                      className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Phone size={15} /> 📞 Appeler
                    </a>
                  )}
                  {selected.telephone && (
                    <a href={`https://wa.me/33${selected.telephone.replace(/^0/, '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 border border-green-200 text-green-700 py-2.5 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors"
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  )}
                </div>
                <button onClick={() => handleConvert(selected)}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <UserCheck size={15} /> Convertir en client
                </button>
                <button onClick={() => handleDelete(selected)}
                  className="w-full text-red-500 hover:text-red-600 text-xs py-1 transition-colors"
                >Supprimer ce prospect</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
