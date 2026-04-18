import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    stars: 5,
    quote: "Mon site a été livré en 5 jours. Depuis, j'ai 3 fois plus de clientes qui réservent en ligne. L'investissement a été rentabilisé en 3 semaines.",
    name: 'Fatou D.',
    role: 'Salon de coiffure · Clichy',
    initials: 'FD',
  },
  {
    stars: 5,
    quote: "Le chatbot répond aux clients même la nuit. Je n'aurais jamais cru que c'était possible pour mon petit restaurant. Mes clients adorent le service.",
    name: 'Karim B.',
    role: 'Restaurant · Saint-Denis',
    initials: 'KB',
  },
  {
    stars: 5,
    quote: "L'agent vocal gère les appels et remplit le CRM tout seul. Je gagne 10h par semaine. Badra est disponible, réactif et maîtrise son sujet.",
    name: 'Moussa T.',
    role: 'Garage · Gennevilliers',
    initials: 'MT',
  },
];

export default function Temoignages() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(c => (c + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[current];

  return (
    <section className="w-full py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Ce que disent nos clients
          </h2>
        </motion.div>

        <div className="relative min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.35 }}
              className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex gap-1 justify-center mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-900 text-base md:text-lg leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {t.initials}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                  <div className="text-gray-600 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex gap-2 justify-center mt-6">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? 'bg-violet-600 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
