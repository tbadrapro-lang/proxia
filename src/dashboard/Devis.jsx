import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Eye, Copy, Trash2, Search, CheckCircle2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { formatDate } from '../utils/crm';
import { supabase } from '../lib/supabaseClient';

// TODO: remplacer par vrais liens Stripe production au 1er client
const STRIPE_LINKS = {
  350: 'https://buy.stripe.com/test_proxia_350',
  600: 'https://buy.stripe.com/test_proxia_600',
  100: 'https://buy.stripe.com/test_proxia_100',
};

const getStripeLink = (total) => {
  const amounts = [100, 350, 600];
  const closest = amounts.reduce((prev, curr) => Math.abs(curr - total) < Math.abs(prev - total) ? curr : prev);
  return STRIPE_LINKS[closest];
};

const EMPTY_LIGNE = { description: '', quantite: 1, prixUnitaire: 0 };
const EMPTY_FORM = {
  clientNom: '', clientEmail: '', clientCommerce: '', clientVille: '',
  lignes: [{ ...EMPTY_LIGNE }],
  notes: '', statut: 'brouillon', signatureData: null,
};

const STATUT_COLORS = {
  brouillon: 'bg-gray-100 text-gray-600',
  envoyé: 'bg-blue-100 text-blue-700',
  signé: 'bg-green-100 text-green-700',
  refusé: 'bg-red-100 text-red-600',
};

function calcTotal(lignes) {
  return lignes.reduce((sum, l) => sum + (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0), 0);
}

function DevisPreview({ devis, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-3">
                <span className="text-white font-black text-xl">P</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900">Proxia</h1>
              <p className="text-gray-500 text-sm">Agence IA · Clichy, Île-de-France</p>
              <p className="text-gray-500 text-sm">tbadrapro@gmail.com · 06 74 31 45 75</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-violet-600">{devis.id}</p>
              <p className="text-sm text-gray-500 mt-1">Émis le {formatDate(devis.dateCreation)}</p>
              <p className="text-sm text-gray-500">Valide jusqu'au {formatDate(devis.dateValidite)}</p>
            </div>
          </div>

          {/* Client */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Destinataire</p>
            <p className="font-semibold text-gray-900">{devis.clientNom}</p>
            {devis.clientCommerce && <p className="text-gray-600 text-sm">{devis.clientCommerce}</p>}
            {devis.clientVille && <p className="text-gray-600 text-sm">{devis.clientVille}</p>}
            {devis.clientEmail && <p className="text-gray-600 text-sm">{devis.clientEmail}</p>}
          </div>

          {/* Lignes */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-2">Prestation</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase pb-2">Qté</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase pb-2">P.U.</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {devis.lignes?.map((l, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 text-sm text-gray-900">{l.description}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{l.quantite}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{Number(l.prixUnitaire).toLocaleString('fr-FR')} €</td>
                  <td className="py-3 text-sm font-medium text-gray-900 text-right">
                    {(Number(l.quantite) * Number(l.prixUnitaire)).toLocaleString('fr-FR')} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total HT</span>
                <span>{devis.total?.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>TVA (auto-entrepreneur)</span>
                <span>0 €</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total TTC</span>
                <span>{devis.total?.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>

          {devis.notes && (
            <div className="mt-6 bg-violet-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-600 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{devis.notes}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-6 text-center">
            Proxia — Auto-entrepreneur — SIRET en cours — tbadrapro@gmail.com
          </p>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Devis({ crm }) {
  const { devis, addDevis, updateDevis, deleteDevis } = crm;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState(null);
  const [clientQuery, setClientQuery] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const sigPadRef = useRef(null);
  const [signatureValid, setSignatureValid] = useState(false);

  useEffect(() => {
    if (clientQuery.length < 2) { setClientSuggestions([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('clients')
        .select('id, nom, prenom, email, telephone, adresse, entreprise')
        .or(`nom.ilike.%${clientQuery}%,entreprise.ilike.%${clientQuery}%,email.ilike.%${clientQuery}%`)
        .limit(6);
      setClientSuggestions(data || []);
      setShowSuggestions(true);
    }, 300);
    return () => clearTimeout(t);
  }, [clientQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectClient = (c) => {
    const nom = `${c.nom}${c.prenom ? ' ' + c.prenom : ''}`;
    setClientQuery(nom);
    setForm(p => ({
      ...p,
      clientNom: nom,
      clientEmail: c.email || '',
      clientCommerce: c.entreprise || '',
      clientVille: c.adresse || '',
    }));
    setShowSuggestions(false);
  };

  const resetModal = () => {
    setShowModal(false);
    setClientQuery('');
    setForm(EMPTY_FORM);
    setSignatureValid(false);
    sigPadRef.current?.clear?.();
  };

  const clearSignature = () => {
    sigPadRef.current?.clear?.();
    setSignatureValid(false);
    setForm((p) => ({ ...p, signatureData: null }));
  };

  const validateSignature = () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty?.()) {
      setSignatureValid(false);
      setForm((p) => ({ ...p, signatureData: null }));
      return;
    }
    const data = sigPadRef.current.getTrimmedCanvas
      ? sigPadRef.current.getTrimmedCanvas().toDataURL('image/png')
      : sigPadRef.current.toDataURL('image/png');
    setForm((p) => ({ ...p, signatureData: data, statut: 'signé' }));
    setSignatureValid(true);
  };

  const total = calcTotal(form.lignes);

  const handleAddLigne = () => setForm(p => ({ ...p, lignes: [...p.lignes, { ...EMPTY_LIGNE }] }));
  const handleRemoveLigne = (i) => setForm(p => ({ ...p, lignes: p.lignes.filter((_, idx) => idx !== i) }));
  const handleLigneChange = (i, key, val) => {
    setForm(p => ({
      ...p,
      lignes: p.lignes.map((l, idx) => idx === i ? { ...l, [key]: val } : l),
    }));
  };

  const handleCreate = () => {
    if (!form.clientNom) return;
    addDevis({ ...form, total, sousTotal: total, tva: 0, signatureData: form.signatureData });
    resetModal();
  };

  const copyStripeLink = (d) => {
    const link = getStripeLink(d.total);
    navigator.clipboard.writeText(link);
    setCopied(d.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sorted = [...devis].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-500 text-sm">{devis.length} devis total</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Nouveau Devis
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Aucun devis</p>
          <p className="text-sm mt-1">Crée ton premier devis</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(d => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-violet-600">{d.id}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUT_COLORS[d.statut]}`}>
                      {d.statut}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 mt-0.5">{d.clientNom}</p>
                  <p className="text-xs text-gray-500">{formatDate(d.dateCreation)} · Valide jusqu'au {formatDate(d.dateValidite)}</p>
                  {d.signatureData && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Devis signé électroniquement
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900">{d.total?.toLocaleString('fr-FR')} €</span>
                  <div className="flex gap-2">
                    <select value={d.statut} onChange={e => updateDevis(d.id, { statut: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      {['brouillon', 'envoyé', 'signé', 'refusé'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setPreview(d)}
                      className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      title="Aperçu"
                    >
                      <Eye size={15} />
                    </button>
                    <button onClick={() => copyStripeLink(d)}
                      className={`p-2 rounded-lg transition-colors ${copied === d.id ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'}`}
                      title="Copier le lien Stripe"
                    >
                      <Copy size={15} />
                    </button>
                    <button onClick={() => deleteDevis(d.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal création */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Nouveau devis</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-6">
                {/* Client info */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Informations client</p>

                  {/* Autocomplete client */}
                  <div ref={searchRef} className="relative mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Rechercher un client existant</label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tapez un nom pour rechercher..."
                        value={clientQuery}
                        onChange={e => { setClientQuery(e.target.value); setForm(p => ({ ...p, clientNom: e.target.value })); }}
                        onFocus={() => clientSuggestions.length > 0 && setShowSuggestions(true)}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <AnimatePresence>
                      {showSuggestions && clientSuggestions.length > 0 && (
                        <motion.ul
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden"
                        >
                          {clientSuggestions.map(c => (
                            <li key={c.id}>
                              <button type="button" onClick={() => selectClient(c)}
                                className="w-full text-left px-4 py-2.5 hover:bg-violet-50 transition-colors border-b border-gray-50 last:border-0"
                              >
                                <p className="text-sm font-medium text-gray-900">{c.nom} {c.prenom}</p>
                                {c.entreprise && <p className="text-xs text-violet-600">{c.entreprise}</p>}
                                {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Nom client *', key: 'clientNom' },
                      { label: 'Email', key: 'clientEmail' },
                      { label: 'Commerce / Entreprise', key: 'clientCommerce' },
                      { label: 'Ville', key: 'clientVille' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                        <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lignes */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Lignes de devis</p>
                  <div className="space-y-2">
                    {form.lignes.map((l, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                          <input value={l.description}
                            onChange={e => handleLigneChange(i, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input type="number" value={l.quantite}
                            onChange={e => handleLigneChange(i, 'quantite', e.target.value)}
                            placeholder="Qté"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div className="col-span-3">
                          <input type="number" value={l.prixUnitaire}
                            onChange={e => handleLigneChange(i, 'prixUnitaire', e.target.value)}
                            placeholder="Prix €"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          {form.lignes.length > 1 && (
                            <button onClick={() => handleRemoveLigne(i)} className="text-red-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleAddLigne}
                    className="mt-2 text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                  >
                    <Plus size={14} /> Ajouter une ligne
                  </button>
                </div>

                {/* Total */}
                <div className="bg-violet-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total TTC (TVA 0%)</span>
                    <span className="text-xl font-bold text-violet-600">{total.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>

                {/* Signature électronique */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Signature client (optionnel)</p>
                  <div className="border border-gray-200 rounded-xl bg-gray-50 p-2">
                    <SignatureCanvas
                      ref={sigPadRef}
                      penColor="#1E293B"
                      canvasProps={{
                        className: 'w-full h-32 bg-white rounded-lg border border-dashed border-gray-300',
                      }}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium hover:bg-gray-50"
                    >
                      Effacer
                    </button>
                    <button
                      type="button"
                      onClick={validateSignature}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Valider la signature
                    </button>
                  </div>
                  {signatureValid && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Devis signé électroniquement
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={resetModal}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >Annuler</button>
                <button onClick={handleCreate} disabled={!form.clientNom}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >Créer le devis</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && <DevisPreview devis={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </div>
  );
}
