import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Code, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Search,
    color: 'violet',
    title: 'Audit gratuit (30 min)',
    description: 'On analyse votre présence en ligne, on identifie les opportunités IA. Sans engagement.',
  },
  {
    icon: FileText,
    color: 'violet',
    title: 'Proposition (48h)',
    description: 'Périmètre précis, outils choisis, planning, prix fixe. Pas de surprises.',
  },
  {
    icon: Code,
    color: 'violet',
    title: 'Développement (5-10j)',
    description: "On construit votre solution. Vous suivez l'avancement en temps réel.",
  },
  {
    icon: Rocket,
    color: 'amber',
    title: 'Livraison + suivi (30j)',
    description: 'Déploiement, formation, 30 jours de support inclus. Vous êtes autonome.',
  },
];

export default function Process() {
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const ratio = entry.intersectionRatio;
          setProgress(Math.min(ratio * 2, 1));
        }
      },
      { threshold: Array.from({ length: 20 }, (_, i) => i / 20) }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-4"
            >
              Votre site vitrine, livré en <span className="gradient-text">5 jours ouvrés</span>
            </motion.h2>
          </div>
          <p className="text-gray-600 text-lg">Une méthode éprouvée, sans surprise.</p>
        </motion.div>

        <div className="relative">
          {/* Desktop progress line */}
          <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-amber-400"
              style={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="grid md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, i) => {
              const isAmber = step.color === 'amber';
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative text-center bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
                >
                  <div className={`relative z-10 w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg ${
                    isAmber ? 'bg-amber-500 shadow-amber-500/30' : 'bg-violet-600 shadow-violet-500/30'
                  }`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                    isAmber ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'
                  }`}>
                    Étape {i + 1}
                  </div>

                  <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
