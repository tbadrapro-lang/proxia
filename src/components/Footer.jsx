import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  } else {
    window.location.href = `/#${id}`;
  }
};

const MENTIONS = `Proxia IA — Agence digitale. Siège : Île-de-France. Contact : tbadrapro@gmail.com · 06 74 31 45 75. Les données collectées via le formulaire de contact sont utilisées uniquement pour vous recontacter (RGPD). Vous pouvez exercer vos droits d'accès, de rectification et de suppression en nous contactant par email. Hébergement : Vercel Inc., 340 Pine St, San Francisco, CA. Directeur de publication : Badra T.`;

export default function Footer() {
  const [showMentions, setShowMentions] = useState(false);
  const year = new Date().getFullYear();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleAnchor = (id) => {
    if (isHome) {
      scrollTo(id);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <footer className="border-t border-white/8 bg-black">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-violet-900/40 to-indigo-900/30 border-b border-violet-500/15">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xl font-black mb-1">Prêt à développer votre commerce ?</p>
            <p className="text-white/50 text-sm">Site livré en 5 jours ouvrés. Devis gratuit sous 24h.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a
              href="https://calendly.com/tbadrapro/appel-decouverte-gratuit"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Prendre RDV gratuitement →
            </a>
            <a
              href="https://wa.me/33674314575"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 font-bold text-sm hover:bg-green-500/25 transition-colors"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Corps du footer */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="text-2xl font-black mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Proxia</span>
            <span className="text-white"> IA</span>
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-5">
            Agence digitale spécialisée pour les commerçants locaux d'Île-de-France.
            Sites web, SEO et outils IA.
          </p>
          <div className="flex flex-col gap-2">
            <a href="tel:+33674314575" className="text-white/50 hover:text-violet-400 text-sm transition-colors flex items-center gap-2">
              📱 06 74 31 45 75
            </a>
            <a href="mailto:tbadrapro@gmail.com" className="text-white/50 hover:text-violet-400 text-sm transition-colors flex items-center gap-2">
              ✉️ tbadrapro@gmail.com
            </a>
            <p className="text-white/30 text-sm flex items-center gap-2">
              📍 Clichy · Asnières · Saint-Denis · Levallois
            </p>
          </div>
          {/* Réseaux sociaux */}
          <div className="flex gap-3 mt-4">
            <a href="https://www.instagram.com/proxia.ia" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-violet-400 hover:border-violet-500/40 transition-colors text-xs">
              IG
            </a>
            <a href="https://www.linkedin.com/company/proxia-ia" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-violet-400 hover:border-violet-500/40 transition-colors text-xs">
              in
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <p className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-5">Services</p>
          <ul className="space-y-3">
            {['Site vitrine', 'Site + Réservation', 'Boutique en ligne', 'SEO Local', 'Maintenance'].map(label => (
              <li key={label}>
                <button onClick={() => handleAnchor('contact')}
                  className="text-white/40 hover:text-violet-400 text-sm transition-colors text-left">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Entreprise */}
        <div>
          <p className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-5">Entreprise</p>
          <ul className="space-y-3">
            <li>
              <Link to="/services" className="text-white/40 hover:text-violet-400 text-sm transition-colors">
                Nos services
              </Link>
            </li>
            <li>
              <button onClick={() => handleAnchor('contact')}
                className="text-white/40 hover:text-violet-400 text-sm transition-colors text-left">
                Contact
              </button>
            </li>
            <li>
              <button onClick={() => handleAnchor('faq')}
                className="text-white/40 hover:text-violet-400 text-sm transition-colors text-left">
                FAQ
              </button>
            </li>
            <li>
              <a
                href="https://calendly.com/tbadrapro/appel-decouverte-gratuit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-violet-400 text-sm transition-colors"
              >
                Prendre RDV — Calendly
              </a>
            </li>
          </ul>
        </div>

        {/* Légal */}
        <div>
          <p className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-5">Légal</p>
          <ul className="space-y-3">
            <li>
              <button onClick={() => setShowMentions(v => !v)}
                className="text-white/40 hover:text-violet-400 text-sm transition-colors text-left">
                Mentions légales
              </button>
            </li>
            <li>
              <button onClick={() => setShowMentions(v => !v)}
                className="text-white/40 hover:text-violet-400 text-sm transition-colors text-left">
                Politique de confidentialité
              </button>
            </li>
            <li>
              <button onClick={() => setShowMentions(v => !v)}
                className="text-white/40 hover:text-violet-400 text-sm transition-colors text-left">
                RGPD
              </button>
            </li>
          </ul>

          {/* Mentions légales inline */}
          {showMentions && (
            <div className="mt-4 p-4 bg-white/3 border border-white/10 rounded-xl">
              <p className="text-white/40 text-[11px] leading-relaxed">{MENTIONS}</p>
              <button onClick={() => setShowMentions(false)}
                className="mt-2 text-violet-400 text-xs hover:underline">
                Fermer
              </button>
            </div>
          )}

          {/* Badge confiance */}
          <div className="mt-6 p-4 bg-white/3 border border-white/8 rounded-xl">
            <p className="text-white/50 text-xs font-medium mb-2">🔒 Paiement sécurisé</p>
            <p className="text-white/30 text-xs">50% à la commande · 50% à la livraison</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © {year} Proxia IA. Tous droits réservés. · tbadrapro@gmail.com · 06 74 31 45 75
          </p>
          <p className="text-white/20 text-xs">
            Fait avec ❤️ pour les commerçants locaux d'Île-de-France
          </p>
        </div>
      </div>
    </footer>
  );
}
