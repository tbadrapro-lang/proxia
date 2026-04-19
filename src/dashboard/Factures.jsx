import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle, Clock, AlertTriangle, Euro, Search } from 'lucide-react';
import { formatDate, isOverdue, STATUT_FACTURE_COLORS } from '../utils/crm';
import { supabase } from '../lib/supabaseClient';

const EMPTY_FORM = {
  clientNom: '', clientId: null, montant: '', modePaiement: 'stripe', notes: '',
};

const MODES = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'virement', label: 'Virement' },
  { value: 'espèces', label: 'Espèces' },
  { value: 'autre', label: 'Autre' },
];

export default function Factures({ crm }) {
  const { factures, addFacture, marquerPayee } = crm;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [clientQuery, setClientQuery] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Recherche clients Supabase avec debounce
  useEffect(() => {
    if (clientQuery.length < 2) { setClientSuggestions([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('clients')
        .select('id, nom, prenom, email, telephone, adresse, entreprise')
        .or(`nom.ilike.%${clientQuery}%,entreprise.ilike.%${clientQuery}%,email.ilike.%${clientQuery}%`)
        .limit(6);
      setClientSuggestions(data || []);
      setShowSuggestions(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [clientQuery]);

  // Fermer suggestions au clic extérieur
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectClient = (client) => {
    setForm(p => ({ ...p, clientNom: `${client.nom}${client.prenom ? ' ' + client.prenom : ''}`, clientId: client.id }));
    setClientQuery(`${client.nom}${client.prenom ? ' ' + client.prenom : ''}`);
    setShowSuggestions(false);
  };

  const totalPayé = factures.filter(f => f.statut === 'payée').reduce((s, f) => s + (f.montant || 0), 0);
  const totalAttente = factures.filter(f => f.statut === 'en_attente').reduce((s, f) => s + (f.montant || 0), 0);
  const totalRetard = factures.filter(f => f.statut === 'retard').reduce((s, f) => s + (f.montant || 0), 0);

  // Auto-marquer en retard
  const enriched = factures.map(f => ({
    ...f,
    statut: f.statut !== 'payée' && isOverdue(f.dateEcheance) ? 'retard' : f.statut,
  }));

  const sorted = [...enriched].sort((a, b) => new Date(b.dateEmission) - new Date(a.dateEmission));

  const handleAdd = () => {
    if (!form.clientNom || !form.montant) return;
    addFacture({ ...form, client_id: form.clientId, montant: Number(form.montant) });
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-500 text-sm">{factures.length} factures</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Nouvelle Facture
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-xs font-medium text-gray-500">Payées</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{totalPayé.toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-xs font-medium text-gray-500">En attente</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{totalAttente.toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-xs font-medium text-gray-500">En retard</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{totalRetard.toLocaleString('fr-FR')} €</p>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {sorted.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Aucune facture</p>
          </div>
        )}
        {sorted.map(f => (
          <motion.div key={f.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-gray-700">{f.id}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUT_FACTURE_COLORS[f.statut] || 'bg-gray-100 text-gray-600'}`}>
                    {f.statut === 'en_attente' ? 'En attente' : f.statut === 'payée' ? 'Payée' : 'En retard'}
                  </span>
                </div>
                <p className="font-medium text-gray-900 mt-0.5">{f.clientNom}</p>
                <p className="text-xs text-gray-500">
                  Émise {formatDate(f.dateEmission)} · Échéance {formatDate(f.dateEcheance)}
                  {f.statut === 'payée' && f.dateReglement && ` · Payée ${formatDate(f.dateReglement)}`}
                </p>
                <p className="text-xs text-gray-400 capitalize">{f.modePaiement}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-900">{f.montant?.toLocaleString('fr-FR')} €</span>
                {f.statut !== 'payée' && (
                  <button onClick={() => marquerPayee(f.id)}
                    className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <CheckCircle size={13} /> Marquer payée
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Récap total */}
      {factures.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <Euro size={20} className="text-violet-200" />
            <div>
              <p className="text-violet-200 text-sm">CA total encaissé</p>
              <p className="text-2xl font-bold">{totalPayé.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal nouvelle facture */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Nouvelle facture</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Autocomplete client */}
                <div ref={searchRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un client existant…"
                      value={clientQuery}
                      onChange={e => { setClientQuery(e.target.value); setForm(p => ({ ...p, clientNom: e.target.value, clientId: null })); }}
                      onFocus={() => clientSuggestions.length > 0 && setShowSuggestions(true)}
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <AnimatePresence>
                    {showSuggestions && clientSuggestions.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 w-full bg-gray-800 border border-purple-500 rounded-xl shadow-lg mt-1 overflow-hidden"
                      >
                        {clientSuggestions.map(c => (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => selectClient(c)}
                              className="w-full text-left px-4 py-3 hover:bg-purple-900/50 transition-colors border-b border-gray-700/50 last:border-0"
                            >
                              <p className="text-sm font-medium text-white">{c.nom} {c.prenom}</p>
                              {c.entreprise && <p className="text-xs text-purple-300">{c.entreprise}</p>}
                              {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                  {form.clientId && (
                    <p className="text-xs text-green-600 mt-1">✓ Client sélectionné depuis la base</p>
                  )}
                </div>
                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
                  <input type="number" value={form.montant} onChange={e => setForm(p => ({ ...p, montant: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
                  <select value={form.modePaiement} onChange={e => setForm(p => ({ ...p, modePaiement: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >Annuler</button>
                <button onClick={handleAdd} disabled={!form.clientNom || !form.montant}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >Créer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
