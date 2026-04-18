import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap, Bot, Check } from 'lucide-react';
import PhoneMockupVisibilite from '../components/PhoneMockupVisibilite';
import PhoneMockupEfficacite from '../components/PhoneMockupEfficacite';
import PhoneMockupVocal from '../components/PhoneMockupVocal';
import RippleButton from '../components/RippleButton';

const services = [
  {
    id: 'visibilite',
    icon: Globe,
    label: 'Visibilité',
    title: 'Pack Visibilité',
    price: '350€',
    delay: '5 jours',
    popular: false,
    mockup: 'visibilite',
    roi: '3x plus de clients via Google en 30 jours',
    features: [
      'Site vitrine 5 pages responsive',
      'Google Maps optimisé',
      'Formulaire de contact',
      'Formation utilisation',
      'Livraison en 5 jours',
    ],
  },
  {
    id: 'efficacite',
    icon: Zap,
    label: 'Efficacité',
    title: 'Pack Efficacité',
    price: '600€',
    delay: '7 jours',
    popular: true,
    mockup: 'efficacite',
    roi: '-12h de travail/semaine, réservations 24h/24',
    features: [
      'Tout le Pack Visibilité',
      'Chatbot IA 24h/24',
      'Automatisation avis Google',
      'Relances clients auto',
      'Dashboard de suivi',
      'Support 30 jours',
    ],
  },
  {
    id: 'ia',
    icon: Bot,
    label: 'Agent IA',
    title: 'Pack Agent IA',
    price: '100€/mois',
    delay: '10 jours',
    popular: false,
    mockup: 'vocal',
    roi: 'ROI positif dès le 2ème mois garanti',
    features: [
      'Tout le Pack Efficacité',
      'Agent vocal IA (appels)',
      'CRM intelligent auto-rempli',
      'Intégration WhatsApp',
      'Agenda synchronisé',
      'SLA prioritaire',
    ],
  },
];

const MockupComponents = {
  visibilite: PhoneMockupVisibilite,
  efficacite: PhoneMockupEfficacite,
  vocal: PhoneMockupVocal,
};

export default function Services() {
  const [activeIdx, setActiveIdx] = useState(1);
  const active = services[activeIdx];

  const scrollTo = (id) => {
    const el = document.getElementById(id.replace('#', ''));
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const ActiveMockup = MockupComponents[active.mockup];

  return (
    <section className="w-full py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-3xl md:text-5xl font-display font-bold text-[#1E293B] mb-4"
            >
              Ce qu&apos;on fait pour vous
            </motion.h2>
          </div>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto">
            Des solutions concrètes, <span className="gradient-text">livrées</span> en jours — pas en mois.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-12">
          {services.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIdx(i)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeIdx === i
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'border border-gray-200 text-gray-600 hover:border-violet-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left — Description */}
            <div>
              {active.popular && (
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full mb-4">
                  🔥 Le plus choisi
                </span>
              )}
              <h3 className="font-display font-bold text-2xl md:text-3xl text-[#1E293B] mb-2">
                {active.title}
              </h3>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-bold text-violet-600">{active.price}</span>
                <span className="text-gray-400 text-sm">· {active.delay}</span>
              </div>

              {/* ROI metric */}
              <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-600 text-sm font-medium">📈 {active.roi}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {active.features.map((f, i) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2 text-sm text-[#1E293B]"
                  >
                    <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />
                    {f}
                  </motion.li>
                ))}
              </ul>

              <RippleButton
                onClick={() => scrollTo('contact')}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 transition-colors"
              >
                Choisir ce pack →
              </RippleButton>
            </div>

            {/* Right — Mockup */}
            <div className="flex justify-center">
              <div className="relative max-w-[300px]">
                <ActiveMockup />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
