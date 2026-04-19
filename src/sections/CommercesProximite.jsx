import { motion } from 'framer-motion';

const commerces = [
  { icon: '🍽️', nom: 'Restaurant', desc: 'Menu en ligne, réservation, avis Google', type: 'Restaurant' },
  { icon: '✂️', nom: 'Coiffure', desc: 'Prise de RDV, galerie photos, Instagram', type: 'Salon & Beauté' },
  { icon: '💅', nom: 'Esthétique', desc: 'Prestations, RDV en ligne, boutique', type: 'Salon & Beauté' },
  { icon: '🔧', nom: 'Garage', desc: 'Devis en ligne, services, SEO local', type: 'Garage & Artisan' },
  { icon: '🌮', nom: 'Fast-food', desc: 'Menu digital, commande, livraison', type: 'Restaurant' },
  { icon: '🧆', nom: 'Traiteur', desc: 'Catalogue, commandes, événements', type: 'Restaurant' },
  { icon: '👔', nom: 'Pressing', desc: 'Tarifs, RDV, zone de livraison', type: 'Autre' },
  { icon: '🛒', nom: 'Épicerie', desc: 'Catalogue produits, horaires, contact', type: 'Autre' },
];

const scrollToContact = (type) => {
  const select = document.getElementById('type-commerce');
  if (select) {
    select.value = type;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const el = document.getElementById('contact');
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
};

export default function CommercesProximite() {
  return (
    <section className="w-full py-16 md:py-20 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-3">
            Votre commerce mérite un site <span className="gradient-text">professionnel</span>
          </h2>
          <p className="text-gray-400 text-base max-w-lg mx-auto">
            Cliquez sur votre secteur pour un devis personnalisé.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {commerces.map((c, i) => (
            <motion.button
              key={c.nom}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToContact(c.type)}
              className="holo-card rounded-2xl p-5 text-center cursor-pointer group"
            >
              <div className="text-4xl mb-3">{c.icon}</div>
              <p className="text-white font-semibold text-sm mb-1 group-hover:text-violet-300 transition-colors">{c.nom}</p>
              <p className="text-white/40 text-xs leading-relaxed">{c.desc}</p>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-white/30 text-xs mt-8"
        >
          📍 Intervention à Clichy · Asnières · Saint-Denis · Levallois · et toute l'Île-de-France
        </motion.p>
      </div>
    </section>
  );
}
