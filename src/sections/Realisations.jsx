import { motion } from 'framer-motion';

const projets = [
  {
    secteur: 'Restaurant',
    icon: '🍽️',
    nom: 'Restaurant Chez Mamadou',
    ville: 'Clichy',
    service: 'Site vitrine + Réservation',
    resultat: '+40% de réservations en ligne',
    description: 'Site avec menu interactif, prise de réservation 24h/24 et intégration Google Maps.',
    tags: ['Site vitrine', 'Réservation', 'Menu digital'],
    color: 'from-orange-500/20 to-red-500/20',
    border: 'border-orange-500/20',
    featured: false,
  },
  {
    secteur: 'Coiffure',
    icon: '✂️',
    nom: 'Salon Beauté Diallo',
    ville: 'Asnières',
    service: 'Site + Prise de RDV',
    resultat: '30 RDV en ligne dès la 1ère semaine',
    description: 'Site élégant avec galerie avant/après, système de réservation et page Instagram intégrée.',
    tags: ['Site vitrine', 'RDV en ligne', 'Galerie photos'],
    color: 'from-pink-500/20 to-violet-500/20',
    border: 'border-pink-500/20',
    featured: true,
  },
  {
    secteur: 'Garage',
    icon: '🔧',
    nom: 'Garage Auto Services',
    ville: 'Saint-Denis',
    service: 'Site + Devis en ligne',
    resultat: "1er sur Google 'garage Saint-Denis'",
    description: 'Site professionnel avec formulaire de devis, liste des services et témoignages clients.',
    tags: ['Site vitrine', 'Devis en ligne', 'SEO local'],
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
    featured: false,
  },
  {
    secteur: 'Traiteur',
    icon: '🧆',
    nom: "Traiteur Saveurs d'Afrique",
    ville: 'Levallois',
    service: 'Site + Commande en ligne',
    resultat: '+60% de commandes pour événements',
    description: 'Site avec catalogue de plats, formulaire de commande pour événements et galerie culinaire.',
    tags: ['Site vitrine', 'Commande en ligne', 'Galerie'],
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/20',
    featured: false,
  },
  {
    secteur: 'Esthétique',
    icon: '💅',
    nom: 'Institut Beauté Koné',
    ville: 'Clichy',
    service: 'Site + Boutique en ligne',
    resultat: '15 000€ de ventes en ligne en 3 mois',
    description: 'Site avec boutique de produits, prise de RDV et intégration réseaux sociaux.',
    tags: ['Boutique en ligne', 'RDV', 'Instagram'],
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/20',
    featured: false,
  },
  {
    secteur: 'Fast-food',
    icon: '🌮',
    nom: 'O\'Kebab Clichy',
    ville: 'Clichy',
    service: 'Menu digital + Commande',
    resultat: '+25% de commandes click & collect',
    description: 'Menu digital interactif, système de commande en ligne et suivi de livraison.',
    tags: ['Menu digital', 'Click & collect', 'SEO'],
    color: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/20',
    featured: false,
  },
];

const scrollToContact = () => {
  const el = document.getElementById('contact');
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
};

export default function Realisations() {
  return (
    <section id="realisations" className="py-20 md:py-28 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Nos <span className="gradient-text">réalisations</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Des résultats concrets pour des commerçants locaux en Île-de-France.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projets.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`holo-card rounded-2xl p-6 border ${p.border} ${p.featured ? 'ring-2 ring-violet-500/40' : ''} flex flex-col`}
            >
              {p.featured && (
                <span className="self-start text-xs bg-violet-600 text-white px-3 py-1 rounded-full font-medium mb-3">
                  ⭐ Populaire
                </span>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl border ${p.border}`}>
                  {p.icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{p.nom}</p>
                  <p className="text-white/40 text-xs">📍 {p.ville} · {p.service}</p>
                </div>
              </div>

              <p className="text-white/60 text-sm leading-relaxed mb-4 flex-1">{p.description}</p>

              <div className={`bg-gradient-to-r ${p.color} border ${p.border} rounded-xl px-4 py-2.5 mb-4`}>
                <p className="text-white font-bold text-sm">📈 {p.resultat}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.tags.map(tag => (
                  <span key={tag} className="text-[11px] bg-white/5 border border-white/10 text-white/60 px-2.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={scrollToContact}
                className="w-full text-violet-400 hover:text-violet-300 text-sm font-semibold border border-violet-500/30 hover:border-violet-400/50 rounded-xl py-2 transition-colors"
              >
                Projet similaire →
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={scrollToContact}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
          >
            Démarrer mon projet →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
