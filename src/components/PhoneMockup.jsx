import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const visibiliteMessages = [
  { type: 'recu', text: 'Bonjour, je cherche à avoir un site pour mon salon ✂️', delay: 0 },
  { type: 'typing', delay: 1000 },
  { type: 'envoye', text: "Bonjour Sophie ! Je suis Proxia Assistant. Je vous rappelle dans l'heure pour votre devis gratuit 👋", delay: 2200 },
  { type: 'notif', icon: '🌐', title: 'Site mis en ligne !', text: 'salon-sophie-clichy.fr est en ligne', delay: 4000 },
  { type: 'typing', delay: 5200 },
  { type: 'recu', text: "Mon site est magnifique ! J'ai déjà 3 appels ce matin 🔥", delay: 6400 },
  { type: 'action', title: 'Google My Business', text: 'Fiche salon optimisée · 147 vues ce jour', delay: 7600 },
  { type: 'typing', delay: 9000 },
  { type: 'envoye', text: 'Normal ! Votre fiche Google est maintenant dans le top 3 Clichy ✅', delay: 10200 },
];

const efficaciteMessages = [
  { type: 'recu', text: 'Bonsoir, vous êtes ouverts demain midi ?', delay: 0 },
  { type: 'typing', delay: 600 },
  { type: 'envoye', text: 'Bonsoir ! Oui, de 12h à 15h et de 19h à 23h. Souhaitez-vous réserver ? 🍽️', delay: 1500 },
  { type: 'recu', text: 'Oui pour 4 personnes samedi à 20h', delay: 2700 },
  { type: 'typing', delay: 3300 },
  { type: 'envoye', text: "C'est réservé ! Table pour 4 samedi 12 avr. à 20h00. Confirmation envoyée par email ✅", delay: 4400 },
  { type: 'action', title: 'Proxia Assistant a géré pour vous', text: '23h14 · Réservation confirmée · Thomas est libre', delay: 5800 },
  { type: 'notif', icon: '📩', title: 'Email automatique envoyé', text: 'Confirmation + rappel J-1 programmé', delay: 7200 },
];

const iaMessages = [
  { type: 'notif', icon: '📞', title: 'Appel entrant — Agent vocal Proxia', text: 'Décroché automatiquement', delay: 0 },
  { type: 'action', title: 'Transcription live', text: '"Bonjour j\'ai une Clio qui fait un bruit bizarre..."', delay: 1800 },
  { type: 'typing', delay: 2800 },
  { type: 'envoye', text: "Bonjour ! Pour votre Renault Clio, je vous propose un diagnostic mercredi à 9h. Ça vous convient ?", delay: 3800 },
  { type: 'action', title: 'CRM mis à jour', text: 'Nouveau contact · Devis diagnostic · RDV mer. 9h', delay: 5200 },
  { type: 'notif', icon: '📅', title: 'Agenda synchronisé', text: 'RDV ajouté · SMS de rappel programmé', delay: 6600 },
  { type: 'typing', delay: 7800 },
  { type: 'envoye', text: 'Parfait, à mercredi ! Votre devis estimatif vous sera envoyé ce soir 🔧', delay: 9000 },
];

const scenarioMap = {
  visibilite: visibiliteMessages,
  efficacite: efficaciteMessages,
  ia: iaMessages,
};

export default function PhoneMockup({ scenario = 'visibilite' }) {
  const [messagesVisibles, setMessagesVisibles] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  const timeoutsRef = useRef([]);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    wrapperRef.current.style.transform =
      `perspective(1000px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`;
  };

  const handleMouseLeave = () => {
    if (!wrapperRef.current) return;
    wrapperRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
  };

  useEffect(() => {
    const messages = scenarioMap[scenario] || visibiliteMessages;

    const startAnimation = () => {
      setMessagesVisibles([]);
      setShowTyping(false);
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];

      messages.forEach((msg) => {
        const t = setTimeout(() => {
          if (msg.type === 'typing') {
            setShowTyping(true);
            const hideT = setTimeout(() => setShowTyping(false), 800);
            timeoutsRef.current.push(hideT);
          } else {
            setShowTyping(false);
            setMessagesVisibles(prev => [...prev, msg]);
          }
        }, msg.delay);
        timeoutsRef.current.push(t);
      });

      const lastDelay = messages[messages.length - 1].delay;
      const resetT = setTimeout(() => {
        startAnimation();
      }, lastDelay + 3000);
      timeoutsRef.current.push(resetT);
    };

    startAnimation();
    return () => timeoutsRef.current.forEach(t => clearTimeout(t));
  }, [scenario]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messagesVisibles, showTyping]);

  const getBubbleStyle = (type) => {
    if (type === 'recu') return 'bg-gray-700 text-white self-start rounded-[18px_18px_18px_4px] max-w-[75%]';
    if (type === 'envoye') return 'bg-violet-600 text-white self-end rounded-[18px_18px_4px_18px] max-w-[75%]';
    if (type === 'notif') return 'bg-green-900/60 border border-green-500/40 rounded-xl w-full text-green-300';
    if (type === 'action') return 'bg-violet-900/60 border border-violet-500/40 rounded-xl w-full text-violet-200';
    return '';
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.3s ease', transformStyle: 'preserve-3d' }}
      className="relative"
    >
    {/* Glow derrière le téléphone */}
    <div className="absolute inset-0 -z-10 blur-3xl opacity-40 rounded-full"
      style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
    <div className="relative w-[260px] h-[520px] bg-gray-900 rounded-[36px] border-[3px] border-gray-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Encoche */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-10" />
      {/* Barre statut */}
      <div className="flex justify-between items-center px-5 pt-7 pb-1 text-white text-[10px]">
        <span>09:41</span>
        <div className="flex gap-1 items-center">
          <span>WiFi</span><span>🔋</span>
        </div>
      </div>
      {/* Contact header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">P</div>
        <div>
          <p className="text-white text-xs font-medium">Proxia Assistant — Proxia IA</p>
          <p className="text-green-400 text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />En ligne
          </p>
        </div>
      </div>
      {/* Zone messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <AnimatePresence>
          {messagesVisibles.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`px-3 py-2 text-[11px] leading-relaxed ${getBubbleStyle(msg.type)}`}
            >
              {msg.type === 'notif' && <p className="font-medium mb-0.5">{msg.icon} {msg.title}</p>}
              {msg.type === 'action' && <p className="text-[10px] text-violet-400 mb-0.5 font-medium uppercase tracking-wide">{msg.title}</p>}
              <p>{msg.text}</p>
            </motion.div>
          ))}
          {showTyping && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-gray-700 rounded-[18px_18px_18px_4px] px-3 py-2 self-start flex gap-1 items-center"
            >
              {[0, 1, 2].map(i => (
                <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 block"
                  animate={{ scale: [1, 1.5, 1] }} transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.6 }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Barre de saisie */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-800">
        <div className="flex-1 bg-gray-800 rounded-full px-3 py-1.5 text-gray-500 text-[11px]">Message...</div>
        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
          <span className="text-white text-xs">→</span>
        </div>
      </div>
    </div>
    </div>
  );
}
