import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Globe, AlertCircle, Plus, Download, Copy, Loader2, Zap, MapPin, Phone, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const GEMINI_KEY = 'AIzaSyApzkyeI2GsaNSLM3W8xdfw7bOVl5lAP9c';

function calculerScore(commerce) {
  let score = 0;
  if (!commerce.website) score += 35;
  if (commerce.rating < 4.0) score += 20;
  else if (commerce.rating < 4.5) score += 10;
  if ((commerce.user_ratings_total || 0) < 50) score += 20;
  else if ((commerce.user_ratings_total || 0) < 100) score += 10;
  const secteursPrio = ['restaurant', 'salon', 'coiffure', 'garage', 'kebab', 'traiteur', 'esthétique', 'pressing'];
  if (secteursPrio.some(s => (commerce.name || '').toLowerCase().includes(s))) score += 25;
  if (!commerce.website && score < 70) score = 70;
  return Math.min(score, 100);
}

function getServicesRecommandes(commerce) {
  const services = [];
  if (!commerce.website) services.push({ label: 'Création de site web', urgent: true });
  if ((commerce.user_ratings_total || 0) < 50) services.push({ label: 'Gestion des avis Google', urgent: true });
  if ((commerce.rating || 0) < 4.2) services.push({ label: 'Amélioration réputation', urgent: false });
  services.push({ label: 'Automatisation WhatsApp', urgent: false });
  if ((commerce.user_ratings_total || 0) < 100) services.push({ label: 'Agent IA réservation', urgent: false });
  return services.slice(0, 4);
}

function scoreColor(s) {
  if (s >= 70) return '#22C55E';
  if (s >= 41) return '#F97316';
  return '#EF4444';
}

function ScoreCircle({ score }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1E293B" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      {score >= 70 && (
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-500/30 px-3 py-1 rounded-full"
        >
          🔥 HAUTE PRIORITÉ
        </motion.span>
      )}
      {score >= 41 && score < 70 && (
        <span className="text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-500/30 px-3 py-1 rounded-full">
          ⚡ PRIORITÉ MOYENNE
        </span>
      )}
      {score < 41 && (
        <span className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-500/30 px-3 py-1 rounded-full">
          Faible priorité
        </span>
      )}
    </div>
  );
}

function StarRating({ rating }) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13}
          className={i <= full ? 'text-yellow-400 fill-yellow-400' : (i === full + 1 && half ? 'text-yellow-400' : 'text-gray-600')}
          fill={i <= full ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const TRI_OPTIONS = [
  { id: 'score', label: 'Score ↓' },
  { id: 'note', label: 'Note ↓' },
  { id: 'avis', label: 'Avis ↓' },
  { id: 'sans_site', label: 'Sans site' },
];

export default function Prospection() {
  const [secteur, setSecteur] = useState('');
  const [ville, setVille] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [audit, setAudit] = useState(null);
  const [auditError, setAuditError] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [tri, setTri] = useState('score');

  // AMÉLIORATION 1 — Tri et filtre des résultats
  const resultatsTries = useMemo(() => {
    let arr = [...results];
    if (tri === 'score') arr.sort((a, b) => calculerScore(b) - calculerScore(a));
    else if (tri === 'note') arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (tri === 'avis') arr.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));
    else if (tri === 'sans_site') arr = arr.filter(r => !r.website);
    return arr;
  }, [results, tri]);

  const handleSearch = useCallback(async () => {
    if (!secteur.trim() || !ville.trim()) {
      toast.error('Remplis le secteur et la ville');
      return;
    }
    setLoading(true);
    setResults([]);
    setSelected(null);
    setAudit(null);
    setSearchError(null);

    try {
      const geocodeRes = await fetch(
        `/api/geocode?address=${encodeURIComponent(ville)}`
      );
      const geocodeData = await geocodeRes.json();

      if (!geocodeData.results || geocodeData.results.length === 0) {
        setSearchError('Ville introuvable.');
        toast.error('Ville introuvable');
        setLoading(false);
        return;
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;

      const placesRes = await fetch(
        `/api/places?lat=${lat}&lng=${lng}&keyword=${encodeURIComponent(secteur)}`
      );
      const placesData = await placesRes.json();

      if (placesData.status === 'REQUEST_DENIED') {
        setSearchError('Clé API invalide. Vérifiez Google Cloud Console.');
        toast.error('Clé API refusée');
        setLoading(false);
        return;
      }

      if (!placesData.results || placesData.results.length === 0) {
        setSearchError('Aucun résultat. Essayez un autre secteur ou ville.');
        toast('Aucun résultat', { icon: '🔍' });
        setLoading(false);
        return;
      }

      const formatted = placesData.results.slice(0, 10).map(r => ({
        name: r.name,
        formatted_address: r.vicinity || '',
        rating: r.rating ?? 0,
        user_ratings_total: r.user_ratings_total ?? 0,
        website: r.website ?? null,
        place_id: r.place_id,
      }));

      setResults(formatted);
    } catch (err) {
      const msg = 'Erreur : ' + err.message;
      setSearchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [secteur, ville]);

  const handleSelect = async (commerce) => {
    setSelected(commerce);
    setScore(calculerScore(commerce));
    setAudit(null);
    setAuditError('');

    // Récupère le téléphone via Place Details API si pas déjà connu
    if (commerce.place_id && !commerce.formatted_phone_number) {
      try {
        const res = await fetch(`/api/place-details?place_id=${commerce.place_id}`);
        const data = await res.json();
        if (data?.result) {
          const enriched = {
            ...commerce,
            formatted_phone_number: data.result.formatted_phone_number || '',
            international_phone_number: data.result.international_phone_number || '',
            website: commerce.website || data.result.website || '',
          };
          setSelected(enriched);
          // Met à jour aussi dans la liste pour persister
          setResults(prev => prev.map(r => r.place_id === commerce.place_id ? enriched : r));
        }
      } catch (err) {
        console.error('Place details error:', err);
      }
    }
  };

  const formatPhoneIntl = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '').replace(/^0/, '33');
  };

  const buildWhatsappLink = (commerce) => {
    const phone = commerce.international_phone_number || commerce.formatted_phone_number;
    if (!phone) return '#';
    const intl = formatPhoneIntl(phone);
    const msg = `Bonjour 👋 Je suis Badra de Proxia IA. J'ai vu votre commerce ${commerce.name} et j'aimerais vous proposer un audit gratuit pour booster votre visibilité en ligne. Disponible cette semaine ? Badra | 06 74 31 45 75`;
    return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
  };

  const handleAudit = async () => {
    if (!selected) return;
    setAuditLoading(true);
    setAudit(null);
    setAuditError('');
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Tu es consultant expert en automatisation IA pour commerçants locaux français.

Analyse ce commerce et génère un audit commercial :
- Nom : ${selected.name}
- Adresse : ${selected.formatted_address || selected.vicinity || ''}
- Note Google : ${selected.rating}/5 (${selected.user_ratings_total} avis)
- Site web : ${selected.website || 'AUCUN SITE WEB'}
- Score de besoin IA : ${score}/100

Réponds UNIQUEMENT avec ce JSON valide (sans markdown, sans backticks) :
{
  "points_friction": ["point 1", "point 2", "point 3"],
  "services_recommandes": ["service 1", "service 2"],
  "pack_conseille": "Pack Visibilité 350€",
  "accroche_pitch": "Phrase d'accroche courte et percutante",
  "script_vente": "Script complet mot pour mot 150 mots max"
}`
              }]
            }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur API Gemini');
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAudit(parsed);
    } catch (err) {
      console.error(err);
      setAuditError(err.message || 'Erreur lors de la génération de l\'audit');
      toast.error('Erreur audit IA');
    } finally {
      setAuditLoading(false);
    }
  };

  const extraitVille = (adresse) => {
    if (!adresse) return '';
    const m = adresse.match(/\d{5}\s+([^,]+)/);
    return m ? m[1].trim() : '';
  };

  const handleAddToCRM = async () => {
    if (!selected) return;

    const payload = {
      nom: selected.name,
      telephone: selected.formatted_phone_number || selected.international_phone_number || '',
      ville: extraitVille(selected.formatted_address || selected.vicinity || ''),
      type_commerce: selected.types?.[0] || 'autre',
      canal: 'prospection_ia',
      score: score || 50,
      statut: 'nouveau',
      notes: `Score Proxia: ${score} · ${selected.rating ? selected.rating + '★' : ''} · ${selected.user_ratings_total || 0} avis · ${selected.website ? 'Avec site' : '🚨 SANS SITE'} · place_id: ${selected.place_id}`,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('leads').insert([payload]);

    if (error) {
      console.log(error);
      toast.error('Erreur : ' + error.message);
      return;
    }
    toast.success('Prospect ajouté au CRM ✓');
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast.error('Aucun résultat à exporter');
      return;
    }
    const data = results.map(r => ({
      nom: r.name,
      commerce: r.name,
      ville: ville,
      telephone: '',
      email: '',
      adresse: r.formatted_address || r.vicinity || '',
      siteWeb: r.website || '',
      score: calculerScore(r),
      notes: `Score: ${calculerScore(r)}/100 — ${r.rating}⭐ (${r.user_ratings_total} avis)${r.website ? ` — ${r.website}` : ' — Pas de site web'}`,
      sourceContact: 'google_maps',
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxia_leads_${ville.replace(/\s/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`📥 ${data.length} leads exportés`);
  };

  const handleCopyScript = () => {
    if (!audit?.script_vente) return;
    navigator.clipboard.writeText(audit.script_vente);
    toast.success('📋 Script copié !');
  };

  // AMÉLIORATION 2 — Services recommandés pour le commerce sélectionné
  const servicesRecommandes = selected ? getServicesRecommandes(selected) : [];

  return (
    <div className="min-h-full bg-[#0A0F1E] p-4 md:p-6">
      <motion.div {...fadeUp} className="mb-6">
        <h1 className="text-2xl font-black text-white">🎯 Prospection IA</h1>
        <p className="text-gray-400 text-sm mt-1">Trouvez, scorez et convertissez des commerçants locaux en prospects qualifiés</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── COLONNE GAUCHE ─── */}
        <div className="space-y-6">

          {/* ZONE 1 — RECHERCHE */}
          <motion.div {...fadeUp} transition={{ delay: 0.05 }}
            className="bg-[#0F172A] border border-violet-500/20 rounded-xl p-5">
            <p className="text-violet-400 font-bold uppercase text-xs tracking-widest mb-4">🔍 Recherche Google Maps</p>
            <div className="flex flex-col gap-3">
              <input
                value={secteur}
                onChange={e => setSecteur(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Secteur (ex: restaurant, salon...)"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
              <input
                value={ville}
                onChange={e => setVille(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Ville (ex: Clichy, Saint-Denis...)"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                {loading ? 'Recherche en cours...' : '🔍 Rechercher'}
              </button>
            </div>

            {/* Erreur recherche */}
            {searchError && (
              <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs">
                {searchError}
              </div>
            )}

            {/* Export button */}
            {results.length > 0 && (
              <button
                onClick={handleExport}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-600/30 transition-colors"
              >
                <Download size={14} />
                📥 Exporter {results.length} résultats JSON
              </button>
            )}
          </motion.div>

          {/* ZONE 1 — RÉSULTATS */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {/* AMÉLIORATION 1 — Pills de tri */}
                <div className="flex items-center justify-between mb-1">
                  <p className="text-violet-400 font-bold uppercase text-xs tracking-widest">
                    {resultatsTries.length} résultats
                    {tri === 'sans_site' && results.length !== resultatsTries.length
                      ? ` (filtrés sur ${results.length})`
                      : ''}
                  </p>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {TRI_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setTri(opt.id)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-colors ${
                          tri === opt.id
                            ? 'bg-violet-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {resultatsTries.map((r, i) => {
                  const s = calculerScore(r);
                  const rId = r.place_id || r.name;
                  const isSelected = (selected?.place_id || selected?.name) === rId;
                  return (
                    <motion.div
                      key={rId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleSelect(r)}
                      className={`cursor-pointer bg-[#0F172A] border rounded-xl p-4 transition-all ${
                        isSelected
                          ? 'border-violet-500 ring-2 ring-violet-500/30 scale-[1.01]'
                          : 'border-violet-500/20 hover:border-violet-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">{r.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5 truncate">{r.formatted_address || r.vicinity || ''}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <StarRating rating={r.rating} />
                              <span className="text-gray-300 text-xs font-medium">{r.rating || '—'}</span>
                              <span className="text-gray-500 text-xs">({r.user_ratings_total} avis)</span>
                            </div>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {r.website
                              ? <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">✅ Site web</span>
                              : <span className="text-xs text-red-400 bg-red-500/15 border border-red-500/40 px-2 py-0.5 rounded-full font-semibold">🚨 SANS SITE - PRIORITÉ</span>
                            }
                          </div>
                        </div>
                        {/* Mini score */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <span className="text-xs text-gray-500 mb-1">Score</span>
                          <span className="text-base font-black" style={{ color: scoreColor(s) }}>{s}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── COLONNE DROITE ─── */}
        <div className="space-y-6">
          <AnimatePresence>
            {selected && (
              <>
                {/* ZONE 2 — SCORE + FICHE */}
                <motion.div
                  key="score"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0F172A] border border-violet-500/20 rounded-xl p-5"
                >
                  <p className="text-violet-400 font-bold uppercase text-xs tracking-widest mb-4">📊 Score & Fiche prospect</p>
                  <div className="flex items-center gap-6 flex-wrap">
                    <ScoreCircle score={score} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-base leading-tight">{selected.name}</p>
                      <p className="text-gray-400 text-xs mt-1">{selected.formatted_address || selected.vicinity || ''}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <StarRating rating={selected.rating} />
                        <span className="text-gray-300 text-xs font-semibold">{selected.rating}</span>
                        <span className="text-gray-500 text-xs">· {selected.user_ratings_total} avis</span>
                      </div>

                      {/* AMÉLIORATION 3 — Liens site web + Google Maps */}
                      <div className="flex flex-col gap-1 mt-2">
                        {selected.website ? (
                          <a href={selected.website} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                            <Globe size={11} /> Voir le site web
                          </a>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-red-400">
                            <AlertCircle size={11} /> Aucun site web détecté
                          </div>
                        )}
                        {selected.place_id && (
                          <a
                            href={`https://www.google.com/maps/place/?q=place_id:${selected.place_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <MapPin size={11} /> Voir sur Google Maps
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AMÉLIORATION 2 — Services recommandés auto-calculés */}
                  {servicesRecommandes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">⚡ Services recommandés</p>
                      <div className="flex flex-wrap gap-1.5">
                        {servicesRecommandes.map((svc, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                              svc.urgent
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-violet-600/15 text-violet-400 border-violet-500/30'
                            }`}
                          >
                            {svc.urgent ? '🔴' : '🟣'} {svc.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Téléphone */}
                  {selected.formatted_phone_number && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">📱 Téléphone</p>
                      <p className="text-white text-sm font-mono">{selected.formatted_phone_number}</p>
                    </div>
                  )}

                  {/* Actions rapides */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                    {selected.formatted_phone_number && (
                      <a
                        href={`tel:${selected.formatted_phone_number}`}
                        className="flex items-center gap-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-blue-600/30 transition-colors"
                      >
                        <Phone size={13} /> 📞 Appeler
                      </a>
                    )}
                    {selected.formatted_phone_number && (
                      <a
                        href={buildWhatsappLink(selected)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-green-600/20 text-green-400 border border-green-500/40 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-green-600/30 transition-colors"
                      >
                        <MessageCircle size={13} /> 💬 WhatsApp
                      </a>
                    )}
                    <button
                      onClick={handleAddToCRM}
                      className="flex items-center gap-1.5 bg-violet-600/20 text-violet-300 border border-violet-500/40 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-violet-600/30 transition-colors"
                    >
                      <Plus size={13} /> ➕ Ajouter au CRM
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-blue-600/30 transition-colors"
                    >
                      <Download size={13} /> 📥 Exporter JSON
                    </button>
                  </div>
                </motion.div>

                {/* ZONE 3 — AUDIT IA */}
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-[#0F172A] border border-violet-500/20 rounded-xl p-5"
                >
                  <p className="text-violet-400 font-bold uppercase text-xs tracking-widest mb-4">🤖 Audit IA</p>

                  {!audit && !auditLoading && (
                    <button
                      onClick={handleAudit}
                      className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors"
                    >
                      <Zap size={15} />
                      🤖 Générer l'audit IA
                    </button>
                  )}

                  {auditLoading && (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <Loader2 size={28} className="animate-spin text-violet-400" />
                      <p className="text-gray-400 text-sm">🤖 Proxia Assistant analyse ce commerce...</p>
                    </div>
                  )}

                  {auditError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                      {auditError}
                      <button onClick={handleAudit} className="block mt-2 text-xs underline hover:text-red-300">
                        Réessayer
                      </button>
                    </div>
                  )}

                  <AnimatePresence>
                    {audit && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {/* Points de friction */}
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">🔴 Points de friction</p>
                          <ul className="space-y-1">
                            {(audit.points_friction || []).map((p, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Services recommandés (depuis audit IA) */}
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">✅ Services recommandés (IA)</p>
                          <div className="flex flex-wrap gap-2">
                            {(audit.services_recommandes || []).map((s, i) => (
                              <span key={i} className="text-xs bg-violet-600/20 text-violet-400 border border-violet-500/30 px-2.5 py-1 rounded-full">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Pack conseillé */}
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">💼 Pack conseillé</p>
                          <span className="text-lg font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-1.5 rounded-full inline-block">
                            {audit.pack_conseille}
                          </span>
                        </div>

                        {/* Accroche pitch */}
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">💬 Accroche pitch</p>
                          <div className="border border-violet-500/40 bg-violet-900/20 rounded-lg p-3">
                            <p className="text-violet-200 text-sm italic leading-relaxed">
                              "{audit.accroche_pitch}"
                            </p>
                          </div>
                        </div>

                        {/* Script de vente */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">📞 Script de vente</p>
                            <button
                              onClick={handleCopyScript}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy size={12} /> 📋 Copier
                            </button>
                          </div>
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <p className="font-mono text-sm text-green-400 leading-relaxed whitespace-pre-wrap">
                              {audit.script_vente}
                            </p>
                          </div>
                        </div>

                        {/* Régénérer */}
                        <button
                          onClick={handleAudit}
                          className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-2"
                        >
                          ↻ Régénérer l'audit
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Placeholder si rien sélectionné */}
          {!selected && results.length === 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}
              className="bg-[#0F172A] border border-white/5 rounded-xl p-10 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-gray-400 text-sm">Lance une recherche pour trouver des prospects</p>
              <p className="text-gray-600 text-xs mt-1">Google Maps · Score automatique · Audit IA · Export CRM</p>
            </motion.div>
          )}

          {!selected && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-[#0F172A] border border-violet-500/10 rounded-xl p-8 text-center"
            >
              <div className="text-3xl mb-2">👈</div>
              <p className="text-gray-400 text-sm">Sélectionne un commerce pour voir le score et l'audit IA</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
