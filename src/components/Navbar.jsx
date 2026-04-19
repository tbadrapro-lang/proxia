import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom'; // Link utilisé pour /services
import { Menu, X, Phone } from 'lucide-react';
import RippleButton from './RippleButton';
import CalendlyButton from './CalendlyButton';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
};

const navLinks = [
  { label: 'Accueil', id: 'accueil' },
  { label: 'Services', id: 'services' },
  { label: 'Pour qui', id: 'pour-qui' },
  { label: 'Réalisations', id: 'realisations' },
  { label: 'Tarifs', id: 'tarifs' },
];

// Liens ancres supplémentaires
const anchorLinks = [
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('accueil');
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
      if (!isHome) return;
      const sections = navLinks.map(l => document.getElementById(l.id)).filter(Boolean);
      const current = sections.find(s => {
        const rect = s.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom > 100;
      });
      if (current) setActive(current.id);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const handleNavClick = (id) => {
    setMenuOpen(false);
    if (isHome) {
      scrollTo(id);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  // Style commun pour les liens
  const linkStyle = (isActive) =>
    `relative px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
      isActive
        ? 'text-violet-400'
        : scrolled
          ? 'text-gray-600 hover:text-violet-700 hover:bg-violet-50'
          : 'text-white/80 hover:text-white hover:bg-white/10'
    }`;

  return (
    <>
      {/* Barre progression scroll */}
      <div
        className="fixed top-0 left-0 z-[100] h-[3px] bg-gradient-to-r from-violet-600 to-amber-400 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md border-b border-violet-100 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => isHome ? scrollTo('accueil') : (window.location.href = '/')}
            className="flex-shrink-0 focus:outline-none flex items-center gap-2.5"
          >
            <img
              src="/proxia-logo.png"
              alt="Proxia agence IA Clichy Île-de-France"
              className="h-11 w-auto"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <span
              className="font-bold text-2xl tracking-tight hidden sm:block"
              style={{
                fontFamily: 'Sora, sans-serif',
                background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PROXIA
            </span>
          </button>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-1">

            {/* Ancres page d'accueil */}
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={linkStyle(isHome && active === link.id)}
              >
                {link.label}
                {isHome && active === link.id && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-violet-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}

            {/* Liens ancres FAQ / Contact */}
            {anchorLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={linkStyle(isHome && active === link.id)}
              >
                {link.label}
              </button>
            ))}

            {/* Tous nos services */}
            <Link
              to="/services"
              className={`px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                location.pathname === '/services'
                  ? 'text-violet-400 bg-violet-900/30 border-violet-500/50'
                  : scrolled
                    ? 'text-violet-600 hover:text-violet-800 border-violet-200 hover:bg-violet-50'
                    : 'text-violet-300 hover:text-white border-violet-400/40 hover:bg-white/10'
              }`}
            >
              Nos services →
            </Link>
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+33674314575"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                scrolled ? 'text-violet-600 hover:text-violet-800' : 'text-violet-300 hover:text-white'
              }`}
            >
              <Phone size={14} />
              06 74 31 45 75
            </a>

            {/* Bouton RDV → Calendly (pop-up widget) */}
            <CalendlyButton className="bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              Réserver un appel
            </CalendlyButton>
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-violet-50"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-violet-100 overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col gap-1">

                {/* Ancres */}
                {navLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isHome && active === link.id
                        ? 'text-violet-700 bg-violet-50'
                        : 'text-gray-700 hover:text-violet-700 hover:bg-violet-50'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}

                {/* Ancres FAQ / Contact */}
                {anchorLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-violet-700 hover:bg-violet-50"
                  >
                    {link.label}
                  </button>
                ))}

                <Link
                  to="/services"
                  onClick={() => setMenuOpen(false)}
                  className={`text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/services'
                      ? 'text-violet-700 bg-violet-50'
                      : 'text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  Nos services →
                </Link>

                <div className="pt-2 mt-2 border-t border-violet-100 flex flex-col gap-2">
                  <a
                    href="tel:+33674314575"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-violet-600 font-medium"
                  >
                    <Phone size={14} /> 06 74 31 45 75
                  </a>
                  <CalendlyButton className="bg-amber-400 text-white text-sm font-semibold px-4 py-2.5 rounded-full w-full">
                    Réserver un appel gratuit
                  </CalendlyButton>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
