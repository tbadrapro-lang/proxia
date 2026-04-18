import { useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    category: "🚀 Nos services",
    questions: [
      {
        q: "Qu'est-ce que Proxia IA propose exactement ?",
        a: "Proxia IA crée des sites web professionnels pour les commerçants locaux (restaurants, coiffeurs, garages, etc.), intègre des outils d'intelligence artificielle pour automatiser votre présence en ligne, et vous aide à attirer plus de clients. Nous livrons en 5 jours ouvrés.",
      },
      {
        q: "Quels types de commerces accompagnez-vous ?",
        a: "Nous intervenons principalement auprès des restaurants, salons de coiffure, instituts d'esthétique, garages, kebabs, traiteurs, pressings et épiceries. Mais nous acceptons tout type de commerce local souhaitant développer sa présence digitale.",
      },
      {
        q: "Pourquoi mon commerce a-t-il besoin d'un site web ?",
        a: "Aujourd'hui, 76% des consommateurs cherchent un commerce sur Google avant de se déplacer. Sans site web, vous êtes invisible. Un site professionnel vous permet d'apparaître dans les recherches locales, de présenter vos services, et de recevoir des clients 24h/24 même quand votre commerce est fermé.",
      },
    ],
  },
  {
    category: "⏱️ Délais & Processus",
    questions: [
      {
        q: "Comment se passe la création de mon site en 5 jours ?",
        a: "Jour 1 : Appel de découverte et collecte de vos informations (logo, photos, textes). Jour 2-3 : Développement du site. Jour 4 : Présentation et retours. Jour 5 : Corrections finales et mise en ligne. Vous validez chaque étape.",
      },
      {
        q: "Que se passe-t-il si je n'ai pas de photos ou de logo ?",
        a: "Pas de problème. Nous pouvons utiliser des images libres de droits adaptées à votre secteur, et créer un logo simple pour vous. Des options premium sont disponibles si vous souhaitez un shooting photo professionnel.",
      },
      {
        q: "Puis-je modifier mon site après la livraison ?",
        a: "Oui. Nous vous formons à la gestion basique de votre site. Pour les modifications importantes, nous proposons des forfaits de maintenance mensuelle à partir de 49€/mois incluant les mises à jour, la sécurité et le support.",
      },
    ],
  },
  {
    category: "💰 Tarifs & Paiement",
    questions: [
      {
        q: "Combien coûte un site web avec Proxia IA ?",
        a: "Nos tarifs démarrent à 490€ pour un site vitrine simple. Les forfaits varient selon vos besoins : site vitrine (490€), site avec prise de réservation (790€), e-commerce (1 200€+). Chaque devis est personnalisé et gratuit.",
      },
      {
        q: "Quand dois-je payer ?",
        a: "Nous demandons 30% à la signature du devis pour lancer le projet, et les 70% restants à la livraison finale. Vous ne payez le solde que quand votre site vous convient.",
      },
      {
        q: "Y a-t-il des frais récurrents ?",
        a: "L'hébergement et le nom de domaine représentent environ 120€/an (soit 10€/mois). Nous gérons cela pour vous ou vous guidons pour le faire vous-même. Les mises à jour et la maintenance sont optionnelles.",
      },
      {
        q: "Proposez-vous un paiement en plusieurs fois ?",
        a: "Oui, pour les projets au-dessus de 500€, nous pouvons aménager un paiement en 2 ou 3 fois sans frais. Contactez-nous pour en discuter.",
      },
    ],
  },
  {
    category: "🤖 Intelligence Artificielle",
    questions: [
      {
        q: "Comment l'IA peut-elle aider mon commerce ?",
        a: "L'IA peut automatiser la réponse aux questions fréquentes de vos clients, générer du contenu pour vos réseaux sociaux, analyser vos avis Google, et vous suggérer comment améliorer votre présence en ligne. Tout cela tourne 24h/24 sans effort de votre part.",
      },
      {
        q: "L'IA est-elle difficile à utiliser pour un non-technicien ?",
        a: "Non. Nous configurons tout pour vous et vous formons en 30 minutes. Vous interagissez avec une interface simple en français. Pas besoin de connaissance technique.",
      },
    ],
  },
  {
    category: "📍 Zone géographique",
    questions: [
      {
        q: "Dans quelles villes intervenez-vous ?",
        a: "Nous intervenons principalement à Clichy (92), Asnières-sur-Seine (92), Saint-Denis (93) et Levallois-Perret (92). Le développement se fait à distance, donc nous pouvons intervenir partout en France.",
      },
      {
        q: "Proposez-vous des rendez-vous physiques ?",
        a: "Oui, pour les clients situés en région parisienne, nous pouvons nous déplacer dans votre commerce pour le premier rendez-vous. Pour les autres, nous travaillons efficacement par visioconférence.",
      },
    ],
  },
];

// ─── Accordéon Item ───────────────────────────────────────────────────────────
function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
      isOpen ? "border-violet-500/50 bg-violet-500/5" : "border-white/8 bg-white/3 hover:border-white/15"
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left px-6 py-5 gap-4"
      >
        <span className={`font-semibold text-sm md:text-base transition-colors ${isOpen ? "text-violet-300" : "text-white/90"}`}>
          {question}
        </span>
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen ? "bg-violet-500/30 text-violet-300 rotate-45" : "bg-white/8 text-white/40"
        }`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </button>

      <div
        style={{
          maxHeight: isOpen ? "600px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <p className="px-6 pb-5 text-white/55 text-sm leading-relaxed border-t border-white/5 pt-4">
          {answer}
        </p>
      </div>
    </div>
  );
}

// ─── Page FAQ ─────────────────────────────────────────────────────────────────
export default function FAQPage() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium tracking-widest uppercase mb-6">
            FAQ
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight">
            Questions
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400"> fréquentes</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Tout ce que vous devez savoir avant de nous contacter.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pb-32 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">
          {FAQ_DATA.map((category, ci) => (
            <div key={ci}>
              <h2 className="text-lg font-bold mb-5 text-white/80 flex items-center gap-2">
                <span className="w-px h-5 bg-violet-500 rounded-full" />
                {category.category}
              </h2>
              <div className="flex flex-col gap-3">
                {category.questions.map((item, qi) => {
                  const id = `${ci}-${qi}`;
                  return (
                    <AccordionItem
                      key={id}
                      question={item.q}
                      answer={item.a}
                      isOpen={openId === id}
                      onToggle={() => toggle(id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="p-8 bg-gradient-to-br from-violet-900/30 to-indigo-900/20 border border-violet-500/20 rounded-3xl text-center">
            <p className="text-2xl font-bold mb-3">Vous n'avez pas trouvé votre réponse ?</p>
            <p className="text-white/50 mb-6">Appelez-nous directement, nous répondons en quelques minutes.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+33674314575"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                📱 Appeler maintenant
              </a>
              <a
                href="/contact"
                className="px-6 py-3 rounded-xl bg-white/8 border border-white/10 text-white font-bold text-sm hover:bg-white/12 transition-colors"
              >
                ✉️ Envoyer un message
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
