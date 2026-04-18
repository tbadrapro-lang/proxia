import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'Combien coûte un site web ?',
    a: 'Nos sites vitrine démarrent à partir de 490€, livrés en 5 jours ouvrés. Le prix varie selon vos besoins (boutique en ligne, réservation en ligne, SEO local…). Devis gratuit sous 24h.',
  },
  {
    q: 'Quels commerces accompagnez-vous ?',
    a: 'On travaille avec tous les commerces locaux : restaurants, salons de coiffure, garages automobiles, artisans, boutiques, agences immobilières, instituts de beauté, pressings… Si vous avez un commerce, on a une solution.',
  },
  {
    q: 'Comment se passe la création de mon site ?',
    a: "C'est simple : 1) On vous appelle pour comprendre vos besoins (30 min). 2) On crée le design et vous le validez. 3) On livre votre site en 5 jours ouvrés. Formation incluse.",
  },
  {
    q: 'Y a-t-il des frais récurrents après la livraison ?',
    a: "Oui, uniquement l'hébergement et le nom de domaine, soit environ 10€/mois. Pas de surprise, pas d'abonnement caché. Vous êtes propriétaire de votre site.",
  },
  {
    q: 'Dans quelles villes intervenez-vous ?',
    a: "On intervient principalement à Clichy, Asnières-sur-Seine, Saint-Denis, Levallois-Perret et toute l'Île-de-France. On se déplace chez vous sans frais supplémentaires.",
  },
  {
    q: 'Puis-je modifier mon site après la livraison ?',
    a: 'Oui ! On vous forme à la gestion de votre site. Vous pouvez modifier vos textes, photos et tarifs vous-même. Pour les modifications plus complexes, on est disponibles.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="w-full py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-gray-900 text-sm md:text-base">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="text-gray-400 text-xl ml-4 flex-shrink-0"
                  >
                    ▾
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
