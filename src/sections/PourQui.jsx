import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Scissors, Wrench, Home } from 'lucide-react';

const sectors = [
  {
    icon: Utensils,
    color: '#7C3AED',
    title: 'Restauration & Hôtellerie',
    accroche: '3x plus de réservations en ligne',
    description: 'Site avec menu, prise de réservation automatique, gestion des avis Google — votre restaurant visible avant vos concurrents.',
    cta: 'Découvrir le pack Restaurant',
    scrollTarget: 'contact',
  },
  {
    icon: Scissors,
    color: '#EC4899',
    title: 'Salons & Beauté',
    accroche: "Zéro appel manqué grâce à l'IA",
    description: 'Agent vocal qui prend les RDV 24h/24. Plus jamais un client perdu. Intégration avec votre agenda existant.',
    cta: 'Découvrir le pack Salon',
    scrollTarget: 'contact',
  },
  {
    icon: Wrench,
    color: '#F59E0B',
    title: 'Garages & Artisans',
    accroche: 'Devis automatiques en 2 minutes',
    description: 'Formulaire de devis IA, relances clients, site vitrine professionnel. Concentrez-vous sur votre métier.',
    cta: 'Découvrir le pack Garage',
    scrollTarget: 'contact',
  },
  {
    icon: Home,
    color: '#10B981',
    title: 'Immobilier',
    accroche: 'Qualification de prospects automatique',
    description: 'Descriptions générées par IA, chatbot qualification, automatisation des relances mandats.',
    cta: 'Découvrir le pack Immo',
    scrollTarget: 'contact',
  },
];

export default function PourQui() {
  const [openIndex, setOpenIndex] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollBy(0, -80);
  };

  return (
    <section id="pour-qui" className="w-full py-20 md:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E1040 100%)' }}>
      <div className="cyber-grid" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-3xl md:text-5xl font-display font-bold text-white mb-4"
            >
              Nous accompagnons les commerçants de{' '}
              <span className="gradient-text">proximité</span>
            </motion.h2>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {sectors.map((s, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="holo-card rounded-2xl p-6 md:p-8 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}22`, border: `1px solid ${s.color}44` }}>
                    <s.icon className="w-7 h-7" style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg text-white mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-400">{s.accroche}</p>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="text-gray-500 text-xl mt-1"
                  >
                    ▾
                  </motion.span>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-400 text-sm leading-relaxed mt-4 mb-4">{s.description}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); scrollTo(s.scrollTarget); }}
                        className="text-violet-400 text-sm font-semibold hover:text-violet-300 transition-colors"
                      >
                        {s.cta} →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-gray-500 text-sm"
        >
          📍 Basé à Clichy — Intervention dans toute l&apos;Île-de-France
        </motion.p>
      </div>
    </section>
  );
}
