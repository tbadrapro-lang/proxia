// ─────────────────────────────────────────────────────────────────────────────
// ServiceCard.jsx — Carte de service avec lien vers /reservation?service=xxx
// Utilisez ce composant dans votre ServicesPage.jsx existant
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";

/**
 * Exemple d'utilisation dans ServicesPage.jsx :
 *
 * import ServiceCard from "../components/ServiceCard";
 *
 * const services = [
 *   { id: "site-vitrine", icon: "🌐", title: "Site vitrine", desc: "...", prix: "490€" },
 *   { id: "site-reservation", icon: "📅", title: "Site + Réservation", desc: "...", prix: "790€" },
 *   ...
 * ];
 *
 * // Dans votre JSX :
 * {services.map((s) => <ServiceCard key={s.id} {...s} />)}
 */

export function ServiceCard({ id, icon, title, desc, prix, duree, features = [] }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/reservation?service=${id}`);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className="group relative p-6 bg-white/3 border border-white/8 rounded-2xl cursor-pointer
        hover:border-violet-500/50 hover:bg-violet-500/5 hover:-translate-y-1
        transition-all duration-300 focus:outline-none focus:border-violet-500"
    >
      {/* Icône */}
      <div className="text-3xl mb-4">{icon}</div>

      {/* Titre */}
      <h3 className="text-lg font-bold mb-2 text-white group-hover:text-violet-300 transition-colors">
        {title}
      </h3>

      {/* Description */}
      {desc && <p className="text-white/50 text-sm leading-relaxed mb-4">{desc}</p>}

      {/* Features */}
      {features.length > 0 && (
        <ul className="space-y-1.5 mb-5">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-white/60 text-xs">
              <span className="text-violet-400 mt-0.5 flex-shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Prix + CTA */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/8">
        <div>
          {prix && <p className="text-xl font-black text-violet-400">{prix}</p>}
          {duree && <p className="text-white/35 text-xs mt-0.5">⏱ Livré en {duree}</p>}
        </div>
        <div className="flex items-center gap-1 text-violet-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200">
          Réserver <span>→</span>
        </div>
      </div>

      {/* Badge "populaire" (optionnel) */}
      {id === "site-vitrine" && (
        <div className="absolute -top-3 -right-3 px-3 py-1 bg-violet-600 rounded-full text-xs font-bold text-white shadow-lg shadow-violet-500/30">
          ⭐ Populaire
        </div>
      )}
    </div>
  );
}

// ─── Grille de services complète (remplacer dans ServicesPage.jsx) ─────────────
export const PROXIA_SERVICES = [
  {
    id: "site-vitrine",
    icon: "🌐",
    title: "Site vitrine",
    desc: "Votre présence en ligne professionnelle, livrée en 5 jours.",
    prix: "490€",
    duree: "5 jours",
    features: [
      "Design sur mesure",
      "Mobile-first & rapide",
      "Formulaire de contact",
      "Référencement local (SEO)",
      "Nom de domaine inclus 1 an",
    ],
  },
  {
    id: "site-reservation",
    icon: "📅",
    title: "Site + Réservation en ligne",
    desc: "Permettez à vos clients de réserver directement sur votre site.",
    prix: "790€",
    duree: "7 jours",
    features: [
      "Tout ce que comprend le site vitrine",
      "Prise de rendez-vous en ligne",
      "Notifications SMS / email",
      "Calendrier de gestion",
      "Intégration Google Calendar",
    ],
  },
  {
    id: "ecommerce",
    icon: "🛒",
    title: "Boutique en ligne",
    desc: "Vendez vos produits ou services directement sur internet.",
    prix: "1 200€+",
    duree: "14 jours",
    features: [
      "Catalogue produits illimité",
      "Paiement sécurisé (Stripe)",
      "Gestion des commandes",
      "Livraison & zones configurables",
      "Tableau de bord vendeur",
    ],
  },
  {
    id: "audit-ia",
    icon: "🤖",
    title: "Audit IA offert",
    desc: "Analyse complète de votre présence en ligne par notre IA.",
    prix: "Gratuit",
    duree: "30 min",
    features: [
      "Score de visibilité Google",
      "Analyse de vos avis clients",
      "Recommandations personnalisées",
      "Rapport PDF détaillé",
      "Sans engagement",
    ],
  },
  {
    id: "seo-local",
    icon: "📍",
    title: "SEO Local",
    desc: "Apparaissez en premier sur Google dans votre ville.",
    prix: "299€/mois",
    duree: "—",
    features: [
      "Optimisation Google My Business",
      "Mots-clés locaux ciblés",
      "Rapport mensuel de performance",
      "Gestion des avis Google",
      "Création de contenu local",
    ],
  },
  {
    id: "reseaux-sociaux",
    icon: "📱",
    title: "Réseaux sociaux",
    desc: "Publications régulières créées par notre IA pour Instagram et Facebook.",
    prix: "199€/mois",
    duree: "—",
    features: [
      "12 publications/mois",
      "Stories et Reels inclus",
      "Création des visuels",
      "Rédaction des légendes",
      "Planification automatique",
    ],
  },
  {
    id: "maintenance",
    icon: "🛠️",
    title: "Maintenance mensuelle",
    desc: "Votre site toujours à jour, sécurisé et performant.",
    prix: "49€/mois",
    duree: "—",
    features: [
      "Mises à jour de sécurité",
      "Sauvegardes hebdomadaires",
      "Modifications de contenu (2h/mois)",
      "Support par WhatsApp",
      "Rapport mensuel",
    ],
  },
  {
    id: "chatbot-ia",
    icon: "💬",
    title: "Chatbot IA",
    desc: "Répondez automatiquement aux questions de vos clients, 24h/24.",
    prix: "149€/mois",
    duree: "—",
    features: [
      "Réponses automatiques en français",
      "Prise de RDV intégrée",
      "Connecté à votre site web",
      "Personnalisé à votre commerce",
      "Rapports hebdomadaires",
    ],
  },
];

export default ServiceCard;
