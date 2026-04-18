import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const chatSequence = [
  { type: 'client', text: 'Vous avez de la place demain midi ?', delay: 0 },
  { type: 'typing', delay: 1200 },
  { type: 'bot', text: 'Bonjour ! Oui, table libre 12h-14h. 2 personnes ?', delay: 2400 },
  { type: 'client', text: 'Parfait pour 3 personnes', delay: 4000 },
  { type: 'typing', delay: 5000 },
  { type: 'confirm', text: 'Réservation confirmée ! Rappel SMS envoyé.', delay: 6200 },
  { type: 'stat', delay: 7800 },
];

export default function PhoneMockupEfficacite() {
  const [messages, setMessages] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  const [showStat, setShowStat] = useState(false);
  const timeoutsRef = useRef([]);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    wrapperRef.current.style.transform = `perspective(1000px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`;
  };
  const handleMouseLeave = () => {
    if (wrapperRef.current) wrapperRef.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
  };

  useEffect(() => {
    const startAnimation = () => {
      setMessages([]);
      setShowTyping(false);
      setShowStat(false);
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];

      chatSequence.forEach(item => {
        const t = setTimeout(() => {
          if (item.type === 'typing') {
            setShowTyping(true);
            const hideT = setTimeout(() => setShowTyping(false), 1000);
            timeoutsRef.current.push(hideT);
          } else if (item.type === 'stat') {
            setShowStat(true);
          } else {
            setShowTyping(false);
            setMessages(prev => [...prev, item]);
          }
        }, item.delay);
        timeoutsRef.current.push(t);
      });

      const resetT = setTimeout(() => startAnimation(), 11000);
      timeoutsRef.current.push(resetT);
    };

    startAnimation();
    return () => timeoutsRef.current.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, showTyping]);

  return (
    <div ref={wrapperRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.3s ease', transformStyle: 'preserve-3d' }} className="relative">
      <div className="absolute inset-0 -z-10 blur-3xl opacity-40 rounded-full"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

      <div className="relative w-[260px] h-[520px] bg-[#0F172A] rounded-[36px] border-[3px] border-violet-900/60 shadow-2xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 0 40px rgba(124,58,237,0.2)' }}>
        {/* Encoche */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-10" />
        {/* Status bar */}
        <div className="flex justify-between items-center px-5 pt-7 pb-1 text-white text-[10px]">
          <span>09:41</span>
          <div className="flex gap-1 items-center"><span>WiFi</span><span>🔋</span></div>
        </div>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-violet-900/40">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">K</div>
          <div>
            <p className="text-white text-xs font-medium">Koné — Assistant IA</p>
            <p className="text-violet-400 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block animate-pulse" />Répond en 1.2s
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2 no-scrollbar">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`px-3 py-2 text-[11px] leading-relaxed max-w-[80%] ${
                  msg.type === 'client'
                    ? 'bg-white/10 text-white self-start rounded-[18px_18px_18px_4px]'
                    : msg.type === 'confirm'
                      ? 'bg-green-900/60 border border-green-500/40 rounded-xl w-full text-green-300 max-w-full'
                      : 'bg-violet-600 text-white self-end rounded-[18px_18px_4px_18px]'
                }`}
              >
                {msg.type === 'confirm' && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    className="inline-block mr-1">✓</motion.span>
                )}
                {msg.text}
              </motion.div>
            ))}
            {showTyping && (
              <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-violet-900/60 rounded-[18px_18px_18px_4px] px-3 py-2 self-start flex gap-1 items-center">
                <span className="text-violet-300 text-[10px] mr-1">Koné tape</span>
                {[0,1,2].map(i => (
                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 block"
                    animate={{ scale: [1, 1.5, 1] }} transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.6 }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stat badge */}
        <AnimatePresence>
          {showStat && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-3 mb-2 px-3 py-2 bg-violet-500/20 border border-violet-500/30 rounded-xl text-center">
              <span className="text-violet-300 text-[10px] font-medium">⚡ Économise 12h/semaine</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-violet-900/40">
          <div className="flex-1 bg-white/5 rounded-full px-3 py-1.5 text-white/30 text-[11px] border border-white/10">Message...</div>
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xs">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
