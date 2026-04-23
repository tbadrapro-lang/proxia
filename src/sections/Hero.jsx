import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Zap, Globe, Bot, Clock } from 'lucide-react';
import { useCounter } from '../hooks/useCounter';
import RippleButton from '../components/RippleButton';

const sectors = ['Restaurants', 'Salons de coiffure', 'Garages auto', 'Agences immo', 'Artisans', 'Commerçants'];

const floatingCards = [
  { icon: Globe, label: 'Site livré', value: 'En 5 jours', color: '#7C3AED', className: 'float-1' },
  { icon: Zap, label: 'Réservations', value: '+65% auto', color: '#F59E0B', className: 'float-2' },
  { icon: Bot, label: 'Agent vocal', value: '24h/24 actif', color: '#06B6D4', className: 'float-3' },
];

export default function Hero() {
  const [sectorIndex, setSectorIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const typeRef = useRef(null);

  useEffect(() => {
    const current = sectors[sectorIndex];
    const speed = isDeleting ? 40 : 80;

    typeRef.current = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(current.slice(0, displayed.length + 1));
        if (displayed.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setDisplayed(current.slice(0, displayed.length - 1));
        if (displayed.length - 1 === 0) {
          setIsDeleting(false);
          setSectorIndex(i => (i + 1) % sectors.length);
        }
      }
    }, speed);
    return () => clearTimeout(typeRef.current);
  }, [displayed, isDeleting, sectorIndex]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  const { count: countProjets, ref: refProjets } = useCounter(50);
  const { count: countJours, ref: refJours } = useCounter(5);
  const { count: countSatisf, ref: refSatisf } = useCounter(100);
  const { count: countHeures, ref: refHeures } = useCounter(120);

  const particles = useMemo(() =>
    Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
      background: Math.random() > 0.5 ? '#7C3AED' : '#F59E0B',
      duration: 5 + Math.random() * 8,
      delay: Math.random() * 5,
    })),
  []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0F172A] scanlines">

      {/* COUCHE 1 : Grille cyber */}
      <div className="cyber-grid" />

      {/* COUCHE 2 : Orbes animés */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full blur-[80px]"
        style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }}
      />

      {/* COUCHE 3 : Particules (mémorisées) */}
      {particles.map((p) => (
        <motion.div key={p.id}
          animate={{ y: [-20, 20, -20], opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay }}
          className="absolute rounded-full"
          style={{ left: p.left, top: p.top, width: p.width, height: p.height, background: p.background }}
        />
      ))}

      {/* CONTENU PRINCIPAL — 2 colonnes sur lg */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-16" ref={refProjets}>

        {/* Colonne gauche — texte */}
        <div className="flex-1 min-w-0 text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 holo-card rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Disponible en Île-de-France</span>
          </motion.div>

          {/* Titre H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-black text-white mb-4 leading-tight glitch"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            L&apos;IA à votre service
          </motion.h1>

          {/* Typewriter secteur */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold mb-6 h-14 flex items-center justify-center lg:justify-start overflow-hidden"
          >
            <span className="gradient-text neon-text min-w-0 truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
              {displayed}<span className="animate-pulse text-violet-400">|</span>
            </span>
          </motion.div>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-400 text-lg lg:text-2xl max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
          >
            <span className="text-white font-semibold">Votre site vitrine, livré en 5 jours ouvrés.</span>{' '}
            Agence IA de proximité en Île-de-France.{' '}
            <span className="text-violet-400 font-medium">On se déplace chez vous.</span>
          </motion.p>

          {/* Stats badges glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-10"
          >
            {[
              { icon: Clock, value: `${countHeures}h`, label: 'économisées/an par commerce', color: '#06B6D4', ref: refHeures },
              { icon: Zap, value: `${countJours} jours`, label: 'délai de livraison garanti', color: '#F59E0B', ref: refJours },
              { icon: Bot, value: '24h/24', label: "disponibilité de l'IA", color: '#7C3AED', ref: refProjets },
            ].map((stat, i) => (
              <motion.div key={i} ref={stat.ref}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="holo-card rounded-2xl px-4 py-3 flex items-center gap-3 w-full sm:w-auto"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stat.color}22`, border: `1px solid ${stat.color}44` }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{stat.value}</p>
                  <p className="text-white/50 text-[10px] leading-tight">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Compteurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center lg:justify-start gap-8 md:gap-16 mb-10"
          >
            {[
              { ref: refProjets, count: countProjets, suffix: '+', label: 'Projets livrés' },
              { ref: refJours, count: countJours, suffix: 'j', label: 'Délai livraison' },
              { ref: refSatisf, count: countSatisf, suffix: '%', label: 'Satisfaction' },
            ].map((c, i) => (
              <div key={i} ref={c.ref} className="text-center lg:text-left">
                <div className="text-4xl md:text-5xl font-black gradient-text neon-text" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {c.count}{c.suffix}
                </div>
                <div className="text-gray-400 text-sm mt-1">{c.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Séparateur */}
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-10">
            <div className="h-px flex-1 max-w-[100px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5))' }} />
            <div className="flex gap-1">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-600" style={{ opacity: 1 - i * 0.3 }} />)}
            </div>
            <div className="h-px flex-1 max-w-[100px]" style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.5), transparent)' }} />
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
          >
            <RippleButton
              onClick={() => scrollTo('services')}
              className="border-glow bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all"
            >
              Voir nos services
            </RippleButton>
            <RippleButton
              onClick={() => scrollTo('contact')}
              className="holo-card text-white font-bold px-8 py-4 rounded-2xl text-lg border border-amber-400/50 hover:border-amber-400"
            >
              <span className="gradient-text">Réserver un appel gratuit</span>
            </RippleButton>
          </motion.div>
        </div>

        {/* Colonne droite — cards visuelles (lg+) */}
        <div className="hidden lg:flex flex-col gap-4 flex-shrink-0 z-10">
          {floatingCards.map((card, i) => (
            <div key={i} className={`holo-card rounded-2xl px-4 py-3 flex items-center gap-3 w-[200px] ${card.className}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${card.color}22`, border: `1px solid ${card.color}44` }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-white/50 text-[10px] leading-none mb-0.5">{card.label}</p>
                <p className="text-white text-xs font-semibold">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Chevron */}
      <motion.div
        animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        onClick={() => scrollTo('services')}
      >
        <ChevronDown className="text-violet-400/60" size={28} />
      </motion.div>
    </section>
  );
}
