import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, UserCheck, ChevronLeft, ChevronRight, AlertCircle, Star, Phone, MessageCircle } from 'lucide-react';
import { formatDate, isOverdue, PACK_LABELS } from '../utils/crm';

const COLONNES = [
  { id: 'rdv_planifié', label: 'RDV planifié', color: 'border-blue-400', bg: 'bg-blue-50', dot: 'bg-blue-400' },
  { id: 'audit_fait', label: 'Audit fait', color: 'border-violet-400', bg: 'bg-violet-50', dot: 'bg-violet-400' },
  { id: 'devis_envoyé', label: 'Devis envoyé', color: 'border-amber-400', bg: 'bg-amber-50', dot: 'bg-amber-400' },
  { id: 'relance', label: 'Relance', color: 'border-orange-400', bg: 'bg-orange-50', dot: 'bg-orange-400' },
];

const PACKS = [
  { value: 'visibilité_350', label: 'Visibilité 350€' },
  { value: 'efficacite_600', label: 'Efficacité 600€' },
  { value: 'agent_ia_100', label: 'Agent IA 100€/mois' },
  { value: 'indécis', label: 'Indécis' },
];

const EMPTY_FORM = {
  nom: '', commerce: '', ville: '', telephone: '', email: '',
  statut: 'rdv_planifié', dateRdv: '', notesAudit: '',
  packInteresse: 'visibilité_350', scoreInteret: 3,
  prochainAction: '', dateProchainAction: '',
};

function ScoreBadge({ score }) {
  const color = score <= 2 ? 'text-gray-400' : score === 3 ? 'text-amber-400' : 'text-green-500';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11} className={i <= score ? color : 'text-gray-200'} fill={i <= score ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
}

function ProspectCard({ prospect, onSelect, onMove, colonneIndex }) {
  const overdue = prospect.dateProchainAction && isOverdue(prospect.dateProchainAction);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border shadow-sm p-3 cursor-pointer hover:border-violet-300 transition-colors ${
        overdue ? 'border-red-300' : 'border-gray-200'
      }`}
      onClick={() => onSelect(prospect)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{prospect.nom}</p>
          <p className="text-xs text-gray-500 truncate">{prospect.commerce} · {prospect.ville}</p>
        </div>
        <ScoreBadge score={prospect.scoreInteret} />
      </div>
      {prospect.packInteresse && (
        <span className="mt-2 inline-block text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">
          {PACK_LABELS[prospect.packInteresse] || prospect.packInteresse}
        </span>
      )}
      {prospect.prochainAction && (
        <div className={`mt-2 flex items-center gap-1 text-[10px] ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
          {overdue && <AlertCircle size={10} />}
          {prospect.prochainAction}
        </div>
      )}
      {/* Flèches déplacement */}
      <div className="flex gap-1 mt-2 pt-2 border-t border-gray-50" onClick={e => e.stopPropagation()}>
        {colonneIndex > 0 && (
          <button onClick={() => onMove(prospect.id, COLONNES[colonneIndex - 1].id)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={12} />
          </button>
        )}
        <span className="flex-1" />
        {colonneIndex < COLONNES.length - 1 && (
          <button onClick={() => onMove(prospect.id, COLONNES[colonneIndex + 1].id)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function Prospects({ crm }) {
  const { prospects, addProspect, updateProspect, deleteProspect, convertProspectToClient } = crm;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);

  const chauds = prospects.filter(p => p.scoreInteret >= 4 && p.statut !== 'perdu').length;

  const handleAdd = () => {
    if (!form.nom || !form.telephone) return;
    addProspect(form);
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const handleMove = (id, newStatut) => {
    updateProspect(id, { statut: newStatut });
  };

  const handleConvert = (id) => {
    convertProspectToClient(id);
    setSelected(null);
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-500 text-sm">
            {prospects.length} prospects · <span className="text-green-600 font-medium">{chauds} chauds 🔥</span>
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Nouveau Prospect
        </button>
      </div>

      {/* Kanban */}
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
                  <ProspectCard
                    key={p.id}
                    prospect={p}
                    onSelect={setSelected}
                    onMove={handleMove}
                    colonneIndex={colIdx}
                  />
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
                  { label: 'Nom *', key: 'nom', type: 'text', placeholder: 'Leila M.' },
                  { label: 'Commerce', key: 'commerce', type: 'text', placeholder: 'Salon de coiffure' },
                  { label: 'Ville', key: 'ville', type: 'text', placeholder: 'Clichy' },
                  { label: 'Téléphone *', key: 'telephone', type: 'tel', placeholder: '06...' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'optionnel' },
                  { label: 'Date RDV', key: 'dateRdv', type: 'datetime-local', placeholder: '' },
                  { label: 'Prochaine action', key: 'prochainAction', type: 'text', placeholder: 'Rappeler jeudi' },
                  { label: 'Date prochaine action', key: 'dateProchainAction', type: 'date', placeholder: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pack intéressé</label>
                    <select value={form.packInteresse} onChange={e => setForm(p => ({ ...p, packInteresse: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {PACKS.map(pk => <option key={pk.value} value={pk.value}>{pk.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score intérêt (1-5)</label>
                    <div className="flex gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button"
                          onClick={() => setForm(p => ({ ...p, scoreInteret: n }))}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                            form.scoreInteret >= n ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes audit</label>
                  <textarea value={form.notesAudit} onChange={e => setForm(p => ({ ...p, notesAudit: e.target.value }))}
                    rows={3} placeholder="Ce qu'on a découvert lors de l'audit..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >Annuler</button>
                <button onClick={handleAdd} disabled={!form.nom || !form.telephone}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >Ajouter</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer détail prospect */}
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
                  <p className="text-xs text-gray-500">{selected.commerce} · {selected.ville}</p>
                </div>
                <button onClick={() => setSelected(null)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <ScoreBadge score={selected.scoreInteret} />
                  <span className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium">
                    {PACK_LABELS[selected.packInteresse] || selected.packInteresse}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-500">Tél: <span className="text-gray-900 font-medium">{selected.telephone}</span></p>
                  {selected.email && <p className="text-gray-500">Email: <span className="text-gray-900">{selected.email}</span></p>}
                  <p className="text-gray-500">1er contact: <span className="text-gray-900">{formatDate(selected.dateContact)}</span></p>
                  {selected.dateRdv && <p className="text-gray-500">RDV: <span className="text-gray-900">{formatDate(selected.dateRdv)}</span></p>}
                </div>
                {selected.notesAudit && (
                  <div className="bg-violet-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-violet-600 mb-1">Notes audit</p>
                    <p className="text-sm text-gray-700">{selected.notesAudit}</p>
                  </div>
                )}
                {selected.prochainAction && (
                  <div className={`rounded-xl p-3 ${isOverdue(selected.dateProchainAction) ? 'bg-red-50' : 'bg-amber-50'}`}>
                    <p className={`text-xs font-semibold mb-1 ${isOverdue(selected.dateProchainAction) ? 'text-red-600' : 'text-amber-600'}`}>
                      {isOverdue(selected.dateProchainAction) ? '⚠️ Action en retard' : 'Prochaine action'}
                    </p>
                    <p className="text-sm text-gray-700">{selected.prochainAction}</p>
                    {selected.dateProchainAction && (
                      <p className="text-xs text-gray-500 mt-1">{formatDate(selected.dateProchainAction)}</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Déplacer vers</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLONNES.map(col => (
                      <button key={col.id}
                        onClick={() => { updateProspect(selected.id, { statut: col.id }); setSelected(p => ({ ...p, statut: col.id })); }}
                        className={`text-xs py-2 px-3 rounded-lg border transition-colors ${
                          selected.statut === col.id ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-700 hover:border-violet-300'
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Score intérêt</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n}
                        onClick={() => { updateProspect(selected.id, { scoreInteret: n }); setSelected(p => ({ ...p, scoreInteret: n })); }}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                          selected.scoreInteret >= n ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {n}
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
                <button onClick={() => handleConvert(selected.id)}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <UserCheck size={15} /> Convertir en client
                </button>
                <button onClick={() => { deleteProspect(selected.id); setSelected(null); }}
                  className="w-full text-red-500 hover:text-red-600 text-xs py-1 transition-colors"
                >
                  Supprimer ce prospect
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
