import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Calendar, ExternalLink, Copy, Trash2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const API_KEY = 'AIzaSyApzkyeI2GsaNSLM3W8xdfw7bOVl5lAP9c';
const CALENDLY_URL = 'https://calendly.com/tbadrapro/appel-decouverte-gratuit';

// Détecte si la réponse de l'IA mentionne un RDV / appel
const mentionsRdv = (text) => {
  if (!text) return false;
  return /\b(rdv|rendez[- ]?vous|calendly|prendre.{0,10}appel|réserver.{0,10}appel|planifier.{0,10}appel|appel.{0,15}découverte)\b/i.test(text);
};

const SYSTEM_PROMPT = `Tu es Proxia Assistant, l'assistant business de Badra Traoré, fondateur de Proxia.
Proxia est une agence IA pour commerçants locaux à Clichy/Île-de-France.
Tu aides Badra à gérer son activité : rédiger des devis, préparer des scripts de prospection, gérer ses clients, analyser son CA, préparer ses relances.
Tu connais ses packs : Visibilité 350€, Efficacité 600€, Agent IA 100€/mois.
Son objectif : 10 000€ de CA avant fin août 2026.
Si Badra (ou un client) demande un rendez-vous, propose explicitement de réserver un appel via Calendly (https://calendly.com/tbadrapro/appel-decouverte-gratuit). Le bouton de réservation s'affichera automatiquement.
Réponds toujours en français, de manière directe et actionnable. Sois concis et opérationnel.`;

const SUGGESTIONS = [
  '📋 Qui relancer aujourd\'hui ?',
  '📅 Mes RDV du jour ?',
  '💰 Mes factures en attente ?',
  '🎯 Conseil de prospection',
];

function buildSystemContext(ctx) {
  if (!ctx) return '';
  const parts = ['\n\n=== CONTEXTE BUSINESS LIVE (Supabase) ==='];
  parts.push(`Total leads: ${ctx.countLeads ?? 0} | Total clients: ${ctx.countClients ?? 0}`);

  if (ctx.leads?.length) {
    parts.push('\nDerniers leads (max 20) :');
    ctx.leads.forEach(l => {
      parts.push(`- ${l.nom || 'Sans nom'} (${l.type_commerce || l.type || '?'}, ${l.ville || l.adresse || '?'}) — statut: ${l.statut || l.status || 'nouveau'} — ajouté: ${l.created_at?.slice(0, 10) || '?'}`);
    });
  }

  if (ctx.agendaToday?.length) {
    parts.push('\nAgenda du jour :');
    ctx.agendaToday.forEach(a => {
      parts.push(`- ${a.titre || a.title || 'Événement'} (type: ${a.type || '?'}) — ${a.date_debut || '?'} → ${a.date_fin || '?'}`);
    });
  } else {
    parts.push('\nAgenda du jour : aucun événement.');
  }

  if (ctx.facturesAttente?.length) {
    parts.push('\nFactures en attente :');
    ctx.facturesAttente.forEach(f => {
      parts.push(`- Facture ${f.id || ''} client ${f.client_nom || f.client || '?'} montant ${f.montant || f.total || '?'}€`);
    });
  }

  if (ctx.appelsRelance?.length) {
    parts.push('\nAppels nécessitant relance (J+2/J+5/J+10) :');
    ctx.appelsRelance.forEach(a => {
      parts.push(`- ${a.nom_lead || a.lead_nom || '?'} — résultat: ${a.resultat} — date appel: ${a.date_appel?.slice(0, 10) || '?'}`);
    });
  }

  parts.push('\nUtilise ces données réelles pour répondre. Cite les noms et chiffres exacts.');
  return parts.join('\n');
}

export default function AssistantIA({ crm }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Salut Badra ! Je suis Proxia Assistant, ton IA business. Je peux t'aider à prospecter, rédiger des devis, préparer tes relances ou analyser ton activité. Comment je peux t'aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Charge le contexte Supabase au mount
  useEffect(() => {
    const loadContext = async () => {
      try {
        const todayISO = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowISO = tomorrow.toISOString().slice(0, 10);

        const [leadsRes, agendaRes, facturesRes, appelsRes, leadsCountRes, clientsCountRes] = await Promise.all([
          supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('agenda').select('*').gte('date_debut', todayISO).lt('date_debut', tomorrowISO),
          supabase.from('factures').select('*').eq('statut', 'en_attente'),
          supabase.from('appels').select('*').in('resultat', ['relance_j2', 'relance_j5', 'relance_j10']),
          supabase.from('leads').select('*', { count: 'exact', head: true }),
          supabase.from('clients').select('*', { count: 'exact', head: true }),
        ]);

        setContext({
          leads: leadsRes.data || [],
          agendaToday: agendaRes.data || [],
          facturesAttente: facturesRes.data || [],
          appelsRelance: appelsRes.data || [],
          countLeads: leadsCountRes.count || 0,
          countClients: clientsCountRes.count || 0,
        });
      } catch (err) {
        console.warn('AssistantIA context load error:', err?.message);
        setContext({});
      }
    };
    loadContext();
  }, []);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT + buildSystemContext(context) }] },
            contents: [
              ...history,
              { role: 'user', parts: [{ text: userMsg }] },
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu répondre. Réessaie.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion. Vérifie ta connexion internet." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditSite = async () => {
    const url = window.prompt('URL du site à auditer (https://...) :');
    if (!url) return;
    const auditPrompt = `Audite ce site web : ${url}
Donne un rapport en français avec :
- Score global /100 (SEO, design, vitesse, conversion)
- Points forts
- Points faibles
- Recommandations concrètes Proxia IA
- Quel pack recommander (Visibilité 350€ / Efficacité 600€ / Agent IA)`;
    sendMessage(auditPrompt);
  };

  const handleClear = () => {
    if (!window.confirm('Effacer toute la conversation ?')) return;
    setMessages([{
      role: 'assistant',
      content: "Salut Badra ! Conversation effacée. Comment je peux t'aider ?",
    }]);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copié dans le presse-papier');
    } catch {
      toast.error('Copie impossible');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900">Proxia Assistant</h1>
          <p className="text-xs text-gray-500">Assistant business IA · Powered by Gemini</p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAuditSite}
            className="flex items-center gap-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            title="Auditer un site web"
          >
            <Globe size={13} /> Auditer un site
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            title="Effacer la conversation"
          >
            <Trash2 size={13} /> Effacer
          </button>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            <Calendar size={13} /> 📅 Prendre RDV
          </a>
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            En ligne
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              m.role === 'assistant' ? 'bg-violet-600' : 'bg-gray-200'
            }`}>
              {m.role === 'assistant'
                ? <Bot size={15} className="text-white" />
                : <User size={15} className="text-gray-600" />
              }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-violet-600 text-white rounded-tr-none'
                : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none shadow-sm'
            }`}>
              {m.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < m.content.split('\n').length - 1 && <br />}</span>
              ))}
              {m.role === 'assistant' && (
                <button
                  onClick={() => handleCopy(m.content)}
                  title="Copier la réponse"
                  className="mt-2 mr-2 inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-violet-600 transition-colors"
                >
                  <Copy size={11} /> Copier
                </button>
              )}
              {m.role === 'assistant' && mentionsRdv(m.content) && (
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Calendar size={13} /> Réserver un appel sur Calendly <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot size={15} className="text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Sparkles size={11} /> Suggestions
          </p>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl hover:border-violet-300 hover:text-violet-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message à Proxia Assistant... (Entrée pour envoyer)"
            rows={1}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 max-h-32"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
