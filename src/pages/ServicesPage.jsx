import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AvatarKone from '../components/AvatarKone';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, Star, MessageSquare, Phone, Mail, Calendar, Heart,
         Users, BarChart3, Image, FileText, Bot, Zap, CreditCard, Share2 } from 'lucide-react';
import RippleButton from '../components/RippleButton';
import CalendlyButton from '../components/CalendlyButton';

const categories = [
  {
    id: 'presence',
    title: 'Présence Digitale',
    subtitle: 'Exister en ligne, être trouvé par vos clients',
    color: 'from-violet-600 to-violet-400',
    services: [
      { icon: Globe, name: 'Site vitrine professionnel', desc: 'Site React responsive livré en 5 jours. Mobile-first, rapide, SEO optimisé. Vos clients vous trouvent sur Google.', price: '350€', type: 'unique', badge: 'Bestseller', roi: '3x plus de visibilité locale' },
      { icon: Star, name: 'Fiche Google My Business', desc: "Création et optimisation complète de votre fiche Google. Photos IA, horaires, description, catégories — tout est géré pour vous.", price: '50€/mois', type: 'abonnement', roi: '+180% vues Google Maps' },
      { icon: Star, name: 'Gestion des avis Google', desc: "Réponses automatiques aux avis clients. Relances par SMS pour obtenir plus d'avis 5 étoiles.", price: '50€/mois', type: 'abonnement', roi: 'Note moyenne +0.8 étoile' },
      { icon: CreditCard, name: 'Carte de visite digitale NFC', desc: "Une carte physique NFC + page digitale personnalisée. Vos clients tappent, voient vos infos, réservent directement.", price: '80€', type: 'unique', roi: 'Partagée à vie, 0 renouvellement' },
    ]
  },
  {
    id: 'ia',
    title: 'Intelligence Artificielle',
    subtitle: 'Des agents IA qui travaillent pour vous 24h/24',
    color: 'from-amber-500 to-violet-600',
    services: [
      { icon: Bot, name: 'Chatbot IA personnalisé', desc: "Un agent IA qui répond à vos clients la nuit, le week-end, les jours fériés. Connaît votre menu, vos horaires, vos prix.", price: '100€/mois', type: 'abonnement', badge: 'Populaire', roi: '80% questions résolues auto' },
      { icon: Phone, name: 'Agent vocal IA', desc: "Décroche à votre place quand vous êtes occupé. Répond aux questions, prend les RDV, filtre les appels.", price: '100€/mois', type: 'abonnement', roi: '0 appel manqué' },
      { icon: Zap, name: 'Automatisation devis/emails', desc: "Vos devis se génèrent automatiquement. Vos relances clients partent seules. Vous gagnez 10h par semaine.", price: '200€ setup + 50€/mois', type: 'mixte', roi: '-10h travail/semaine' },
      { icon: Calendar, name: 'Prise de RDV automatique', desc: "Vos clients réservent directement sur votre site ou par WhatsApp. Confirmation automatique + rappel SMS J-1.", price: '80€/mois', type: 'abonnement', roi: '-40% no-shows' },
      { icon: Mail, name: 'Rappels SMS & email auto', desc: "Rappels automatiques avant RDV, relances après visite, messages anniversaire.", price: '50€/mois', type: 'abonnement', roi: '+35% clients qui reviennent' },
      { icon: Share2, name: 'Contenu réseaux sociaux IA', desc: "Posts Instagram, Facebook, LinkedIn générés et publiés automatiquement. 1 à 2 posts par jour.", price: '150€/mois', type: 'abonnement', roi: '+200% engagement moyen' },
    ]
  },
  {
    id: 'fidelite',
    title: 'Fidélisation Clients',
    subtitle: 'Faire revenir vos clients, encore et encore',
    color: 'from-violet-400 to-pink-500',
    services: [
      { icon: Heart, name: 'Carte fidélité digitale', desc: "Fini les cartes papier perdues ! Vos clients cumulent leurs points sur leur téléphone.", price: '30€/mois', type: 'abonnement', badge: 'Bestseller', roi: '+45% clients fidèles' },
      { icon: Users, name: 'Programme parrainage IA', desc: "Vos clients deviennent vos commerciaux. Lien de parrainage unique, suivi automatique.", price: '80€/mois', type: 'abonnement', roi: '+30% nouveaux clients/mois' },
      { icon: Mail, name: 'Newsletter automatisée', desc: "Emails mensuels envoyés à tous vos clients avec vos actualités. Rédigés par l'IA, validés par vous.", price: '50€/mois', type: 'abonnement', roi: '25% de réouverture moyenne' },
    ]
  },
  {
    id: 'gestion',
    title: 'Gestion & Pilotage',
    subtitle: 'Voir, comprendre et décider avec des données claires',
    color: 'from-teal-500 to-violet-600',
    services: [
      { icon: BarChart3, name: 'CRM commerçants sur mesure', desc: "Tous vos clients dans un seul endroit. Historique des achats, préférences, dernière visite.", price: 'Sur devis', type: 'devis', roi: 'Connaissance client ×3' },
      { icon: BarChart3, name: 'Dashboard analytics IA', desc: "Tableau de bord clair : fréquentation, chiffre d'affaires, heure de pointe, produits stars.", price: 'Inclus pack Pro+', type: 'inclus', roi: 'Décisions basées sur données' },
      { icon: Image, name: 'Photos & visuels IA', desc: "Photos de vos plats, produits, services générées ou retouchées par IA.", price: '80€', type: 'unique', roi: '+60% clics sur vos posts' },
      { icon: FileText, name: 'Audit digital complet', desc: "On analyse votre présence en ligne, vos concurrents locaux, vos points d'amélioration.", price: 'Gratuit', type: 'gratuit', badge: 'Offert', roi: 'Feuille de route claire' },
    ]
  },
];

const typeLabels = {
  abonnement: 'Sans engagement',
  unique: 'Paiement unique',
  gratuit: 'Offert',
  devis: 'Devis personnalisé',
  inclus: 'Inclus dans le pack',
  mixte: 'Setup + mensuel',
};

export default function ServicesPage() {
  const navigate = useNavigate();

  const scrollToContact = () => {
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('reservation');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Nos services IA pour commerces | Proxia IA</title>
        <meta name="description" content="Site web, agent vocal IA, automatisation avis Google. Packs à partir de 350€. 1ère consultation gratuite." />
        <meta property="og:title" content="Nos services IA pour commerces | Proxia IA" />
        <meta property="og:description" content="Site web, agent vocal IA, automatisation avis Google. Packs à partir de 350€. 1ère consultation gratuite." />
        <meta property="og:url" content="https://proxia-ia.fr/services" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://proxia-ia.fr/services" />
      </Helmet>
      <Navbar />

      {/* Hero page services */}
      <div className="bg-[#0F172A] pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-violet-600/20 text-violet-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              16 services disponibles
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Tous nos services IA
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Choisissez exactement ce dont vous avez besoin. Un service, plusieurs, ou un pack complet — on s&apos;adapte à votre budget et vos priorités.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/" className="text-sm text-gray-400 hover:text-white underline underline-offset-4 transition-colors">
                ← Retour à l&apos;accueil
              </a>
              <span className="text-gray-600">|</span>
              <RippleButton onClick={() => { localStorage.setItem('proxia_pack', 'Devis personnalisé'); scrollToContact(); }}
                className="bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2 rounded-full">
                Demander un devis gratuit
              </RippleButton>
              <CalendlyButton className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
                📅 Réserver un appel
              </CalendlyButton>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenu par catégorie */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {categories.map((cat, catIndex) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: catIndex * 0.1 }}
            className="mb-20">

            {/* Header catégorie */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${cat.color}`} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {cat.title}
                </h2>
                <p className="text-gray-500 text-sm">{cat.subtitle}</p>
              </div>
            </div>

            {/* Grid services */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.services.map((svc, i) => (
                <motion.div key={svc.name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100 transition-all duration-300 flex flex-col">

                  {/* Badge */}
                  {svc.badge && (
                    <span className="self-start text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full mb-4">
                      {svc.badge}
                    </span>
                  )}

                  {/* Icône + nom */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <svc.icon size={20} className="text-violet-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{svc.name}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{svc.desc}</p>

                  {/* ROI */}
                  <div className="flex items-center gap-1.5 mb-4 bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-green-600 text-xs">✓</span>
                    <span className="text-green-700 text-xs font-medium">{svc.roi}</span>
                  </div>

                  {/* Prix + CTA */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-lg font-bold text-violet-700">{svc.price}</div>
                      <div className="text-xs text-gray-400">{typeLabels[svc.type]}</div>
                    </div>
                    <RippleButton onClick={() => { localStorage.setItem('proxia_pack', svc.name); scrollToContact(); }}
                      className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors">
                      Demander
                    </RippleButton>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* CTA final */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#0F172A] rounded-3xl p-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
            Pas sûr de ce qu&apos;il vous faut ?
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            On se déplace chez vous gratuitement. En 30 minutes, on identifie ensemble les 2-3 services qui auront le plus d&apos;impact pour votre activité.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <RippleButton onClick={() => { localStorage.setItem('proxia_pack', 'Audit gratuit'); scrollToContact(); }}
              className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-full text-sm">
              Audit gratuit en 30 min
            </RippleButton>
            <a href="tel:+33674314575"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-full text-sm transition-colors">
              📞 06 74 31 45 75
            </a>
          </div>
        </motion.div>
      </div>

      <Footer />
      <AvatarKone />
    </div>
  );
}
