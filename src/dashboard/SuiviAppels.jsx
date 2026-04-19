import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Phone, MessageCircle, Edit2, Trash2, Copy,
  CheckCircle, Calendar, AlertCircle, Filter, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const TYPES_COMMERCE = ['restaurant', 'coiffure', 'garage', 'kebab', 'esthétique', 'pressing', 'épicerie', 'autre'];
const VILLES = ['Clichy', 'Asnières', 'Saint-Denis', 'Levallois', 'Autre'];
const CANAUX = ['terrain', 'téléphone', 'whatsapp', 'email'];

const RESULTATS = [
  { value: 'pas_interesse', label: '🔴 Pas intéressé', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'rappeler_plus_tard', label: '🟡 Rappeler plus tard', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'relance_j2', label: '🟡 À relancer J+2', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'relance_j5', label: '🟡 À relancer J+5', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'relance_j10', label: '🟡 À relancer J+10', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'rdv_fixe', label: '🟣 RDV fixé', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'devis_envoye', label: '🔵 Devis envoyé', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'signe', label: '🟢 Signé ✅', color: 'bg-green-100 text-green-700 border-green-200' },
];

const EMPTY_FORM = {
  date_contact: new Date().toISOString().split('T')[0],
  nom_commerce: '',
  type_commerce: 'restaurant',
  ville: 'Clichy',
  telephone: '',
  prenom_contact: '',
  a_site_web: false,
  note_google: '',
  nb_avis: '',
  score_proxia: 0,
  canal_contact: 'terrain',
  resultat: 'pas_interesse',
  date_rdv: '',
  notes: '',
};

const PROXIA_URL = 'https://proxia-smoky.vercel.app';

const TEMPLATES_WHATSAPP = {
  premier: (prenom) =>
    `Bonjour ${prenom || ''} 👋 C'est Badra de Proxia IA — on s'est vus tout à l'heure dans votre commerce. Voici notre site : ${PROXIA_URL} On crée des sites pro en 5 jours à partir de 490€. Disponible cette semaine pour en parler ? Badra | 06 74 31 45 75`,
  relance: (prenom) =>
    `Bonjour ${prenom || ''} 😊 Je me permets de revenir vers vous — avez-vous eu le temps de voir notre site ? J'ai des pistes concrètes pour vous ramener plus de clients. Je peux passer cette semaine. Badra | Proxia IA`,
  rdv: (prenom, date, heure) =>
    `Bonjour ${prenom || ''} ✅ Je confirme notre RDV ${date || '[DATE]'} à ${heure || '[HEURE]'} dans votre commerce. À bientôt ! Badra | Proxia IA | 06 74 31 45 75`,
};

function calculerScore(form) {
  let score = 0;
  if (!form.a_site_web) score += 35;
  const note = parseFloat(form.note_google) || 0;
  if (note > 0 && note < 4.0) score += 20;
  else if (note >= 4.0 && note < 4.5) score += 10;
  const nb = parseInt(form.nb_avis) || 0;
  if (nb < 50) score += 20;
  else if (nb < 100) score += 10;
  if (TYPES_COMMERCE.slice(0, 5).includes(form.type_commerce)) score += 25;
  return Math.min(score, 100);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  toast.success('Message WhatsApp copié !');
}

function formatPhone(p) {
  if (!p) return '';
  return p.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

function whatsappLink(phone, text) {
  if (!phone) return '#';
  const clean = phone.replace(/\D/g, '');
  const intl = clean.startsWith('0') ? '33' + clean.slice(1) : clean;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text || '')}`;
}

export default function SuiviAppels() {
  const [appels, setAppels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterResultat, setFilterResultat] = useState('tous');
  const [filterVille, setFilterVille] = useState('toutes');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');

  // Score auto
  useEffect(() => {
    setForm(f => ({ ...f, score_proxia: calculerScore(f) }));
  }, [form.a_site_web, form.note_google, form.nb_avis, form.type_commerce]);

  // Charger les appels
  const fetchAppels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appels')
      .select('*')
      .order('date_contact', { ascending: false });
    if (error) { toast.error('Erreur chargement appels'); console.error(error); setLoading(false); return; }
    const unique = Array.from(new Map((data || []).map(a => [a.id, a])).values());
    console.log('[SuiviAppels][fetchAppels]', data?.length);
    setAppels(unique);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppels();
    const ch = supabase.channel('appels-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appels' }, () => fetchAppels())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  const stats = useMemo(() => ({
    total: appels.length,
    rdv: appels.filter(a => a.resultat === 'rdv_fixe').length,
    devis: appels.filter(a => a.resultat === 'devis_envoye').length,
    signes: appels.filter(a => a.resultat === 'signe').length,
  }), [appels]);

  const today = new Date().toISOString().split('T')[0];

  const relances = useMemo(() => {
    return appels.filter(a => {
      const dates = [a.date_relance_j2, a.date_relance_j5, a.date_relance_j10].filter(Boolean);
      return dates.some(d => d <= today) && !['signe', 'pas_interesse'].includes(a.resultat);
    });
  }, [appels, today]);

  const filtered = useMemo(() => {
    return appels.filter(a => {
      if (filterResultat === 'a_relancer') {
        if (!['relance_j2', 'relance_j5', 'relance_j10', 'rappeler_plus_tard'].includes(a.resultat)) return false;
      } else if (filterResultat === 'rdv') {
        if (a.resultat !== 'rdv_fixe') return false;
      } else if (filterResultat === 'signes') {
        if (a.resultat !== 'signe') return false;
      } else if (filterResultat !== 'tous' && a.resultat !== filterResultat) return false;

      if (filterVille !== 'toutes' && a.ville !== filterVille) return false;
      if (filterDate && a.date_contact !== filterDate) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(a.nom_commerce?.toLowerCase().includes(q) || a.prenom_contact?.toLowerCase().includes(q) || a.telephone?.includes(q))) return false;
      }
      return true;
    });
  }, [appels, filterResultat, filterVille, filterDate, search]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      ...EMPTY_FORM,
      ...a,
      note_google: a.note_google ?? '',
      nb_avis: a.nb_avis ?? '',
      date_rdv: a.date_rdv ? a.date_rdv.slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const buildPayload = () => {
    const now = new Date();
    const addDays = (d) => {
      const x = new Date(now); x.setDate(x.getDate() + d);
      return x.toISOString().split('T')[0];
    };
    return {
      date_contact: form.date_contact,
      nom_commerce: form.nom_commerce,
      type_commerce: form.type_commerce,
      ville: form.ville,
      telephone: form.telephone,
      prenom_contact: form.prenom_contact,
      a_site_web: form.a_site_web,
      note_google: form.note_google ? parseFloat(form.note_google) : null,
      nb_avis: form.nb_avis ? parseInt(form.nb_avis) : null,
      score_proxia: form.score_proxia,
      canal_contact: form.canal_contact,
      resultat: form.resultat,
      date_rdv: form.resultat === 'rdv_fixe' && form.date_rdv ? new Date(form.date_rdv).toISOString() : null,
      notes: form.notes,
      relance_j2: form.resultat === 'relance_j2',
      relance_j5: form.resultat === 'relance_j5',
      relance_j10: form.resultat === 'relance_j10',
      date_relance_j2: form.resultat === 'relance_j2' ? addDays(2) : null,
      date_relance_j5: form.resultat === 'relance_j5' ? addDays(5) : null,
      date_relance_j10: form.resultat === 'relance_j10' ? addDays(10) : null,
    };
  };

  const handleSave = async (alsoToLeads = false) => {
    if (!form.nom_commerce) { toast.error('Nom du commerce requis'); return; }
    const payload = buildPayload();

    let result;
    if (editingId) {
      result = await supabase.from('appels').update(payload).eq('id', editingId);
    } else {
      result = await supabase.from('appels').insert([payload]);
    }
    if (result.error) { toast.error('Erreur enregistrement'); console.error(result.error); return; }

    toast.success(editingId ? 'Appel mis à jour' : 'Appel enregistré ✅');

    const resultatValue = form.resultat;
    const dateRdv = form.date_rdv;

    if (
      (resultatValue === 'rdv_fixe' || resultatValue === 'rdv fixé')
      && dateRdv
    ) {
      console.log('[SuiviAppels][Agenda] Ajout RDV:', dateRdv);
      const { error: agendaError } = await supabase
        .from('agenda')
        .insert([{
          titre: 'RDV — ' + form.nom_commerce,
          description: 'Contact: ' + (form.prenom_contact || '')
            + ' | Tél: ' + (form.telephone || ''),
          date_debut: new Date(dateRdv).toISOString(),
          type: 'rdv',
        }]);
      if (agendaError) {
        console.error('[Agenda] ERREUR:', agendaError);
      } else {
        toast.success('RDV ajouté à l\'agenda !');
      }
    }

    if (alsoToLeads && !editingId) {
      const leadPayload = {
        nom: form.nom_commerce,
        telephone: form.telephone,
        ville: form.ville,
        type_commerce: form.type_commerce,
        canal: 'terrain',
        score: form.score_proxia || 50,
        statut: 'nouveau',
        created_at: new Date().toISOString(),
      };
      const { error: leadError } = await supabase.from('leads').insert([leadPayload]);
      if (leadError) {
        console.log(leadError);
        toast.error('Erreur : ' + leadError.message);
        return;
      }
      toast.success('Lead ajouté avec succès ✓');
    }

    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    fetchAppels();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet appel ?')) return;
    const { error } = await supabase.from('appels').delete().eq('id', id);
    if (error) toast.error('Erreur suppression'); else { toast.success('Supprimé'); fetchAppels(); }
  };

  const getResultatMeta = (val) => RESULTATS.find(r => r.value === val) || RESULTATS[0];

  const templateForResult = (a) => {
    if (a.resultat === 'rdv_fixe') {
      const d = a.date_rdv ? new Date(a.date_rdv) : null;
      return TEMPLATES_WHATSAPP.rdv(
        a.prenom_contact,
        d ? d.toLocaleDateString('fr-FR') : '',
        d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
      );
    }
    if (['relance_j2', 'relance_j5', 'relance_j10', 'rappeler_plus_tard'].includes(a.resultat)) {
      return TEMPLATES_WHATSAPP.relance(a.prenom_contact);
    }
    return TEMPLATES_WHATSAPP.premier(a.prenom_contact);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Suivi Appels</h1>
          <p className="text-gray-500 text-sm">Fiche de suivi des appels terrain</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Nouvel appel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total contactés', value: stats.total, color: 'text-gray-900', icon: '📞' },
          { label: 'RDV fixés', value: stats.rdv, color: 'text-violet-600', icon: '🟣' },
          { label: 'Devis envoyés', value: stats.devis, color: 'text-blue-600', icon: '🔵' },
          { label: 'Signés', value: stats.signes, color: 'text-green-600', icon: '🟢' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-1">{s.icon} {s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Relances du jour */}
      {relances.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <h2 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <AlertCircle size={16} /> ⚡ À relancer aujourd'hui ({relances.length})
          </h2>
          <div className="space-y-2">
            {relances.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-100 flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{a.nom_commerce} <span className="text-gray-400 text-xs">· {a.ville}</span></p>
                  <p className="text-xs text-gray-500">{a.prenom_contact} · {formatPhone(a.telephone)}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${a.telephone}`} className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Phone size={12} /> Appeler
                  </a>
                  <a href={whatsappLink(a.telephone, templateForResult(a))} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex items-center gap-3 flex-wrap">
        <Filter size={15} className="text-gray-400" />
        <select value={filterResultat} onChange={e => setFilterResultat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-violet-400">
          <option value="tous">Tous les résultats</option>
          <option value="a_relancer">🟡 À relancer</option>
          <option value="rdv">🟣 RDV fixés</option>
          <option value="signes">🟢 Signés</option>
        </select>
        <select value={filterVille} onChange={e => setFilterVille(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-violet-400">
          <option value="toutes">Toutes villes</option>
          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-violet-400" />
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher commerce, prénom, téléphone..."
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-violet-400" />
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {loading && <p className="text-gray-400 text-center py-8">Chargement...</p>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Aucun appel pour ces filtres</p>
          </div>
        )}
        {filtered.map(a => {
          const meta = getResultatMeta(a.resultat);
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">{new Date(a.date_contact).toLocaleDateString('fr-FR')}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${meta.color}`}>{meta.label}</span>
                    {a.score_proxia > 0 && (
                      <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold">Score {a.score_proxia}</span>
                    )}
                  </div>
                  <p className="font-bold text-gray-900 mt-1">{a.nom_commerce}</p>
                  <p className="text-xs text-gray-500">
                    {a.type_commerce} · 📍 {a.ville} {a.prenom_contact && `· ${a.prenom_contact}`}
                  </p>
                  {a.telephone && (
                    <a href={`tel:${a.telephone}`} className="text-xs text-violet-600 hover:underline">{formatPhone(a.telephone)}</a>
                  )}
                  {a.notes && <p className="text-xs text-gray-600 mt-1 italic">"{a.notes}"</p>}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {a.telephone && (
                    <a href={`tel:${a.telephone}`} title="Appeler"
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
                      <Phone size={14} />
                    </a>
                  )}
                  <a href={whatsappLink(a.telephone, templateForResult(a))} target="_blank" rel="noopener noreferrer" title="WhatsApp"
                    className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors">
                    <MessageCircle size={14} />
                  </a>
                  <button onClick={() => copyToClipboard(templateForResult(a))} title="Copier template WhatsApp"
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => openEdit(a)} title="Modifier"
                    className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} title="Supprimer"
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Formulaire */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-4 pb-4 px-4 overflow-y-auto"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh] my-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                <h2 className="font-bold text-gray-900 text-lg">
                  {editingId ? 'Modifier l\'appel' : 'Nouvel appel terrain'}
                </h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-5">
                {/* Colonne gauche */}
                <div className="space-y-4">
                  <Field label="Date du contact *">
                    <input type="date" value={form.date_contact} onChange={e => setForm(f => ({ ...f, date_contact: e.target.value }))}
                      className="input" />
                  </Field>
                  <Field label="Nom du commerce *">
                    <input type="text" value={form.nom_commerce} onChange={e => setForm(f => ({ ...f, nom_commerce: e.target.value }))}
                      placeholder="Le Bistrot du Coin" className="input" />
                  </Field>
                  <Field label="Type de commerce">
                    <select value={form.type_commerce} onChange={e => setForm(f => ({ ...f, type_commerce: e.target.value }))} className="input">
                      {TYPES_COMMERCE.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Ville">
                    <select value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} className="input">
                      {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="Téléphone">
                    <input type="tel" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                      placeholder="06 XX XX XX XX" className="input" />
                  </Field>
                  <Field label="Prénom du contact">
                    <input type="text" value={form.prenom_contact} onChange={e => setForm(f => ({ ...f, prenom_contact: e.target.value }))}
                      placeholder="Marc" className="input" />
                  </Field>
                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  <Field label="A un site web ?">
                    <button type="button" onClick={() => setForm(f => ({ ...f, a_site_web: !f.a_site_web }))}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
                        form.a_site_web
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                      {form.a_site_web ? '✅ OUI' : '❌ NON'}
                    </button>
                  </Field>
                  <Field label="Note Google (0–5)">
                    <input type="number" min="0" max="5" step="0.1" value={form.note_google}
                      onChange={e => setForm(f => ({ ...f, note_google: e.target.value }))} className="input" />
                  </Field>
                  <Field label="Nombre d'avis">
                    <input type="number" min="0" value={form.nb_avis}
                      onChange={e => setForm(f => ({ ...f, nb_avis: e.target.value }))} className="input" />
                  </Field>
                  <Field label="Score Proxia (auto)">
                    <div className="bg-gradient-to-r from-violet-50 to-violet-100 border border-violet-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                      <span className="text-violet-700 font-bold text-lg">{form.score_proxia} / 100</span>
                      <span className="text-xs text-violet-500">
                        {form.score_proxia >= 70 ? '🔥 Hot lead' : form.score_proxia >= 41 ? '🟠 Tiède' : '❄️ Froid'}
                      </span>
                    </div>
                  </Field>
                  <Field label="Canal de contact">
                    <select value={form.canal_contact} onChange={e => setForm(f => ({ ...f, canal_contact: e.target.value }))} className="input">
                      {CANAUX.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                {/* Pleine largeur */}
                <div className="md:col-span-2 space-y-4">
                  <Field label="Résultat">
                    <select value={form.resultat} onChange={e => setForm(f => ({ ...f, resultat: e.target.value }))} className="input">
                      {RESULTATS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </Field>
                  {form.resultat === 'rdv_fixe' && (
                    <Field label="Date et heure du RDV">
                      <input type="datetime-local" value={form.date_rdv}
                        onChange={e => setForm(f => ({ ...f, date_rdv: e.target.value }))} className="input" />
                    </Field>
                  )}
                  <Field label="Notes">
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      rows={3} placeholder="Observations, contexte..." className="input resize-none" />
                  </Field>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3 sticky bottom-0 bg-white rounded-b-2xl">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={() => handleSave(false)}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  💾 Enregistrer
                </button>
                {!editingId && (
                  <button onClick={() => handleSave(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    💾 + Ajouter aux Leads
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #E5E7EB;
          border-radius: 0.75rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 2px rgba(139,92,246,0.2); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
