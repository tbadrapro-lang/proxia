import { useParams, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CalendlyButton from '../../components/CalendlyButton';

const SECTEURS = {
  'restaurant-clichy': {
    metier: 'Restaurant',
    ville: 'Clichy',
    h1: 'Site internet pour restaurant à Clichy',
    intro: "Vos clients à Clichy cherchent leur prochain restaurant sur Google. Avec Proxia, votre restaurant est trouvé en 1 clic, vos réservations arrivent en automatique et votre menu est toujours à jour.",
    benefits: [
      'Réservations en ligne 24h/24 sans commission',
      'Fiche Google My Business optimisée pour Clichy',
      'Menu digital + photos professionnelles IA',
      'Avis clients automatiquement collectés',
    ],
  },
  'coiffeur-asnieres': {
    metier: 'Salon de coiffure',
    ville: 'Asnières',
    h1: 'Site internet pour coiffeur à Asnières',
    intro: "Les Asniéroises réservent leur coiffeur en ligne. Proxia crée votre site avec prise de RDV automatique, rappels SMS et galerie de coupes pour transformer Instagram en clients réels.",
    benefits: [
      'Prise de RDV en ligne synchronisée à votre agenda',
      'Rappels SMS automatiques (-40% no-show)',
      'Galerie de réalisations + lien Instagram',
      'Carte fidélité digitale intégrée',
    ],
  },
  'garage-saint-denis': {
    metier: 'Garage automobile',
    ville: 'Saint-Denis',
    h1: 'Site internet pour garage à Saint-Denis',
    intro: "Vos clients à Saint-Denis tombent en panne et cherchent un garagiste de confiance sur Google. Avec Proxia, votre garage apparaît en premier, les demandes de devis arrivent par SMS et email.",
    benefits: [
      'Formulaire devis en ligne 24h/24',
      'Référencement local Saint-Denis (SEO)',
      'Photos avant/après automatiques',
      'Avis Google relancés en automatique',
    ],
  },
  'restaurant-asnieres': {
    metier: 'Restaurant',
    ville: 'Asnières',
    h1: 'Site internet pour restaurant à Asnières',
    intro: "À Asnières, les clients comparent les restaurants en 30 secondes sur leur téléphone. Proxia vous donne le site qui convertit : menu, photos pro, réservation immédiate.",
    benefits: [
      'Réservations en ligne sans commission',
      'Menu PDF auto-généré + photos IA',
      'Page Google optimisée Asnières',
      'Click-to-call pour les commandes à emporter',
    ],
  },
  'coiffeur-clichy': {
    metier: 'Salon de coiffure',
    ville: 'Clichy',
    h1: 'Site internet pour coiffeur à Clichy',
    intro: "Les Clichoises veulent réserver leur coiffeur entre midi et deux. Proxia crée votre site avec calendrier en ligne, rappels SMS et programme fidélité.",
    benefits: [
      'Calendrier de réservation 24h/24',
      'Rappels SMS J-1 (-40% no-show)',
      'Programme fidélité digital',
      'Galerie Instagram intégrée',
    ],
  },
  'esthetique-clichy': {
    metier: 'Institut esthétique',
    ville: 'Clichy',
    h1: "Site internet pour institut d'esthétique à Clichy",
    intro: "Votre institut à Clichy mérite un site élégant qui reflète votre univers. Proxia crée le site qui rassure, présente vos soins et permet de réserver en ligne.",
    benefits: [
      'Réservation en ligne par soin',
      'Bons cadeaux digitaux',
      'Galerie photo soins + protocole',
      'Page Google + avis automatisés',
    ],
  },
};

export default function SecteurPage() {
  const { slug } = useParams();
  const secteur = SECTEURS[slug];

  useEffect(() => {
    if (!secteur) return;
    document.title = `${secteur.h1} | Proxia IA`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', secteur.intro.slice(0, 160));
  }, [secteur]);

  if (!secteur) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-[#0F172A] pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-violet-600/20 text-violet-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6"
          >
            {secteur.metier} · {secteur.ville}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {secteur.h1}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {secteur.intro}
          </motion.p>
          <CalendlyButton className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-colors">
            📅 Audit gratuit pour mon {secteur.metier.toLowerCase()}
          </CalendlyButton>
        </div>
      </section>

      <section className="max-w-5xl mx-auto py-20 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: 'Sora, sans-serif' }}>
          Ce que Proxia apporte à votre {secteur.metier.toLowerCase()} à {secteur.ville}
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {secteur.benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-violet-300 hover:shadow-lg transition-all flex items-start gap-3"
            >
              <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                {i + 1}
              </span>
              <p className="text-gray-700 text-sm leading-relaxed">{b}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/" className="text-violet-600 hover:text-violet-800 text-sm underline underline-offset-4">
            ← Retour à l'accueil Proxia
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export { SECTEURS };
