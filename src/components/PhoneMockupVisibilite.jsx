import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: 'url', delay: 0 },
  { id: 'logo', delay: 1200 },
  { id: 'rating', delay: 2800 },
  { id: 'badge', delay: 4200 },
  { id: 'cta', delay: 5600 },
];

export default function PhoneMockupVisibilite() {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [urlText, setUrlText] = useState('');
  const [ratingCount, setRatingCount] = useState(0);
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
    const fullUrl = 'restaurant-chez-ahmed.fr';

    const startAnimation = () => {
      setVisibleSteps([]);
      setUrlText('');
      setRatingCount(0);
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];

      // Type URL
      fullUrl.split('').forEach((char, i) => {
        const t = setTimeout(() => setUrlText(prev => prev + char), 60 * i);
        timeoutsRef.current.push(t);
      });

      steps.forEach(step => {
        const t = setTimeout(() => setVisibleSteps(prev => [...prev, step.id]), step.delay);
        timeoutsRef.current.push(t);
      });

      // Animate rating counter
      const ratingStart = setTimeout(() => {
        let current = 0;
        const interval = setInterval(() => {
          current += 0.1;
          if (current >= 4.8) { setRatingCount(4.8); clearInterval(interval); }
          else setRatingCount(Math.round(current * 10) / 10);
        }, 40);
        timeoutsRef.current.push(interval);
      }, 2800);
      timeoutsRef.current.push(ratingStart);

      // Loop
      const resetT = setTimeout(() => startAnimation(), 9000);
      timeoutsRef.current.push(resetT);
    };

    startAnimation();
    return () => timeoutsRef.current.forEach(t => clearTimeout(t));
  }, []);

  const has = (id) => visibleSteps.includes(id);

  return (
    <div ref={wrapperRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.3s ease', transformStyle: 'preserve-3d' }} className="relative">
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30 rounded-full"
        style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />

      <div className="relative w-[280px] h-[480px] bg-[#FAFBFC] rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
        {/* Browser chrome */}
        <div className="bg-gray-100 border-b border-gray-200 px-3 py-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
          </div>
          {/* URL bar */}
          <div className="flex items-center bg-white rounded-lg px-3 py-1.5 border border-gray-200">
            <span className="text-green-600 text-[10px] mr-1.5">🔒</span>
            <span className="text-gray-800 text-[11px] font-mono">
              {urlText}<span className="animate-pulse text-cyan-500">|</span>
            </span>
          </div>
        </div>

        {/* Site content */}
        <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-hidden">
          {/* Logo + name */}
          <AnimatePresence>
            {has('logo') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-2">
                  <span className="text-white text-lg font-bold">A</span>
                </div>
                <h3 className="text-gray-900 font-bold text-sm">Chez Marcel</h3>
                <p className="text-gray-500 text-[10px]">Restaurant traditionnel · Clichy</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google rating */}
          <AnimatePresence>
            {has('rating') && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, type: 'spring' }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2.5 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-sm ${s <= 4 ? 'text-amber-400' : 'text-amber-300'}`}>★</span>
                  ))}
                </div>
                <span className="text-gray-900 font-bold text-lg">{ratingCount.toFixed(1)}</span>
                <span className="text-gray-500 text-[10px] ml-1">/ 5 sur Google</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Open badge */}
          <AnimatePresence>
            {has('badge') && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <motion.div animate={{ boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 12px rgba(34,197,94,0.4)', '0 0 0px rgba(34,197,94,0)'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-700 text-xs font-medium">Ouvert maintenant · 11h-22h</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero image placeholder */}
          <AnimatePresence>
            {has('logo') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full h-20 rounded-xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #06B6D4, #3B82F6)' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/80 text-[10px]">📷 Photo du restaurant</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA button */}
          <AnimatePresence>
            {has('cta') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, type: 'spring' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/30"
                >
                  Réserver une table →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
