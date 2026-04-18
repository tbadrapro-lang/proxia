import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import RippleButton from '../components/RippleButton';

const plans = [
  {
    name: 'Visibilité',
    price: '350€',
    monthly: '35€/mois',
    badge: '⚡ Livré en 5 jours',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    saving: 'Économisez 2 000€ vs agence classique',
    features: [
      'Site vitrine 5 pages',
      'Google Maps optimisé',
      'Formulaire contact',
      'Responsive mobile',
      'Livraison 5 jours',
      'Formation incluse',
    ],
    highlighted: false,
  },
  {
    name: 'Efficacité',
    price: '600€',
    monthly: '60€/mois',
    badge: '🔥 Le plus choisi',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    saving: 'Rentabilisé en 1 semaine',
    features: [
      'Tout le Pack Visibilité',
      'Chatbot IA 24h/24',
      'Automatisation avis Google',
      'Relances auto clients',
      'Dashboard n8n',
      'Support 30 jours',
    ],
    highlighted: true,
  },
  {
    name: 'Agent IA',
    price: '100€/mois',
    monthly: '100€/mois',
    badge: '📈 Récurrent',
    badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    saving: 'ROI moyen : 3× en 30 jours',
    features: [
      'Tout le Pack Efficacité',
      'Agent vocal IA',
      'CRM intelligent',
      'Intégration WhatsApp',
      'Agenda synchronisé',
      'SLA prioritaire',
    ],
    highlighted: false,
  },
];

export default function Tarifs() {
  const [isMonthly, setIsMonthly] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id.replace('#', ''));
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 md:py-28 bg-[#0F172A] overflow-hidden">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-600/20 rounded-full blur-[128px]" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-[128px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Urgence banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto mb-8"
        >
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-center">
            <span className="text-amber-300 text-sm font-medium">
              📅 Agenda avril quasi complet · <span className="text-amber-400 font-bold">2 créneaux disponibles</span> cette semaine
            </span>
          </div>
        </motion.div>

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
              className="text-3xl md:text-5xl font-display font-bold text-white mb-4"
            >
              Des offres claires, sans surprise
            </motion.h2>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm ${!isMonthly ? 'text-white' : 'text-white/50'}`}>Paiement unique</span>
            <button
              onClick={() => setIsMonthly(!isMonthly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isMonthly ? 'bg-violet-600' : 'bg-white/20'}`}
            >
              <motion.div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                animate={{ x: isMonthly ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${isMonthly ? 'text-white' : 'text-white/50'}`}>Abonnement mensuel</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className={`p-8 rounded-2xl border transition-all ${
                plan.highlighted
                  ? 'bg-violet-600 border-violet-500 ring-2 ring-violet-400 ring-offset-2 ring-offset-[#0F172A]'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {/* Badge */}
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 border ${plan.badgeColor}`}>
                {plan.badge}
              </span>

              <h3 className="font-display font-bold text-xl text-white mb-2">{plan.name}</h3>
              <div className="text-4xl font-display font-bold text-white mb-1">
                {isMonthly ? plan.monthly : plan.price}
              </div>
              <p className="text-white/50 text-sm mb-3">
                {isMonthly ? 'par mois · 12 mois' : plan.name === 'Agent IA' ? 'Abonnement mensuel' : 'Paiement unique'}
              </p>

              {/* Saving mention */}
              <div className={`flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-lg text-xs font-medium ${
                plan.highlighted ? 'bg-white/10 text-white/90' : 'bg-green-500/10 border border-green-500/20 text-green-400'
              }`}>
                <span>💰</span> {plan.saving}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((f, fi) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + fi * 0.05 }}
                    className="flex items-center gap-3 text-sm text-white/80"
                  >
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    {f}
                  </motion.li>
                ))}
              </ul>

              <RippleButton
                onClick={() => {
                  const packMap = {
                    'Visibilité': 'Pack Visibilité — 350€',
                    'Efficacité': 'Pack Efficacité — 600€',
                    'Agent IA': 'Agent IA — 100€/mois',
                  };
                  localStorage.setItem('proxia_pack', packMap[plan.name] || plan.name);
                  scrollTo('reservation');
                }}
                className={`w-full py-3 text-center rounded-xl text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-violet-700 hover:bg-white/90'
                    : 'border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {plan.name === 'Agent IA' ? 'Demander un devis →' : 'Commencer →'}
              </RippleButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
