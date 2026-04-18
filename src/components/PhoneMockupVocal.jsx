import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const callSteps = [
  { id: 'incoming', delay: 0 },
  { id: 'pickup', delay: 2000 },
  { id: 'waveform', delay: 2800 },
  { id: 'transcript1', delay: 3500 },
  { id: 'transcript2', delay: 5500 },
  { id: 'rdv', delay: 7500 },
  { id: 'stat', delay: 9000 },
];

// Waveform bar component
function WaveformBar({ index, active }) {
  return (
    <motion.div
      className="w-[3px] rounded-full"
      style={{ background: active ? '#F59E0B' : '#F59E0B44' }}
      animate={active ? {
        height: [8, 20 + Math.random() * 16, 6, 24 + Math.random() * 12, 10],
      } : { height: 4 }}
      transition={active ? {
        repeat: Infinity,
        duration: 0.6 + Math.random() * 0.4,
        delay: index * 0.05,
        ease: 'easeInOut',
      } : {}}
    />
  );
}

export default function PhoneMockupVocal() {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [callTimer, setCallTimer] = useState(0);
  const timeoutsRef = useRef([]);
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
      setVisibleSteps([]);
      setCallTimer(0);
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];

      callSteps.forEach(step => {
        const t = setTimeout(() => setVisibleSteps(prev => [...prev, step.id]), step.delay);
        timeoutsRef.current.push(t);
      });

      // Call timer
      const timerStart = setTimeout(() => {
        let seconds = 0;
        const interval = setInterval(() => {
          seconds++;
          setCallTimer(seconds);
          if (seconds >= 35) clearInterval(interval);
        }, 1000);
        timeoutsRef.current.push(interval);
      }, 2800);
      timeoutsRef.current.push(timerStart);

      const resetT = setTimeout(() => startAnimation(), 12000);
      timeoutsRef.current.push(resetT);
    };

    startAnimation();
    return () => timeoutsRef.current.forEach(t => clearTimeout(t));
  }, []);

  const has = (id) => visibleSteps.includes(id);
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div ref={wrapperRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.3s ease', transformStyle: 'preserve-3d' }} className="relative">
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30 rounded-full"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

      <div className="relative w-[260px] h-[520px] rounded-[36px] border-[3px] border-amber-900/40 shadow-2xl overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(180deg, #1a0533 0%, #0a0118 100%)', boxShadow: '0 0 40px rgba(245,158,11,0.15)' }}>
        {/* Encoche */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-10" />
        {/* Status bar */}
        <div className="flex justify-between items-center px-5 pt-7 pb-1 text-white text-[10px]">
          <span>09:41</span>
          <div className="flex gap-1 items-center"><span>WiFi</span><span>🔋</span></div>
        </div>

        {/* Call screen content */}
        <div className="flex-1 flex flex-col items-center justify-start px-4 pt-4 gap-3 overflow-hidden">

          {/* Incoming call header */}
          <AnimatePresence>
            {has('incoming') && !has('pickup') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                  className="text-amber-400 text-[10px] font-medium mb-2 uppercase tracking-widest">
                  📞 Appel entrant
                </motion.div>
                <p className="text-white font-bold text-sm">Client inconnu</p>
                <p className="text-white/40 text-[10px]">06 XX XX XX XX</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Koné avatar after pickup */}
          <AnimatePresence>
            {has('pickup') && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-amber-400/30" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">K</span>
                  </div>
                </div>
                <p className="text-white font-bold text-sm">Koné — Agent Vocal</p>
                <p className="text-amber-400 text-[10px] font-medium">{formatTime(callTimer)}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waveform */}
          <AnimatePresence>
            {has('waveform') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-[3px] h-10 w-full">
                {Array.from({ length: 20 }).map((_, i) => (
                  <WaveformBar key={i} index={i} active={has('waveform') && !has('rdv')} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcription 1 */}
          <AnimatePresence>
            {has('transcript1') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <p className="text-amber-400/60 text-[9px] uppercase tracking-wide mb-1 font-medium">Transcription live</p>
                <p className="text-white/80 text-[11px] leading-relaxed italic">
                  &quot;Bonjour, je suis Koné, l&apos;assistant vocal de Chez Ahmed. Comment puis-je vous aider ?&quot;
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcription 2 - Client + Koné */}
          <AnimatePresence>
            {has('transcript2') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-2">
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <p className="text-white/40 text-[9px] mb-1">👤 Client</p>
                  <p className="text-white/70 text-[11px] italic">&quot;Je voudrais un RDV jeudi à 14h&quot;</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                  <p className="text-amber-400/60 text-[9px] mb-1">🤖 Koné</p>
                  <p className="text-amber-200 text-[11px] italic">&quot;C&apos;est noté ! Jeudi 14h confirmé.&quot;</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RDV confirmed badge */}
          <AnimatePresence>
            {has('rdv') && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-full bg-green-900/50 border border-green-500/40 rounded-xl px-3 py-2.5 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                  className="text-green-400 text-lg inline-block mr-1">✓</motion.span>
                <span className="text-green-300 text-xs font-medium">RDV enregistré · SMS envoyé</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stat */}
          <AnimatePresence>
            {has('stat') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-center mt-auto mb-2">
                <span className="text-amber-300 text-[10px] font-medium">🌙 Répond 24h/24 · Même les dimanches</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom call controls (visible during incoming) */}
        <AnimatePresence>
          {has('incoming') && !has('pickup') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex justify-center gap-8 pb-6 pt-2">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-lg">✕</span>
              </div>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-lg">📞</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
