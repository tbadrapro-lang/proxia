import { motion } from 'framer-motion';
import { ExternalLink, Workflow, Globe, Wrench, Bot, CreditCard, Cpu } from 'lucide-react';
import RippleButton from '../components/RippleButton';

const projects = [
  {
    title: 'Automatisation n8n DiaspoConnect',
    description: "Workflow automatique complet : scraping flux RSS quotidien → nettoyage IA → stockage Airtable → affichage site en temps réel. Déclenché à 00h chaque nuit. Zéro intervention humaine.",
    url: 'https://diaspoconnect.vercel.app',
    tags: ['n8n', 'Airtable', 'IA', 'Automation', 'RSS'],
    metrics: ['100% automatisé', 'Déclenché à 00h/nuit', '0 intervention humaine'],
    icon: Workflow,
    featured: true,
    color: 'from-amber-500 to-violet-600',
  },
  {
    title: 'DiaspoConnect Mali',
    description: "Portail communautaire diaspora avec agent vocal IA, actualités automatiques n8n et paiements Stripe.",
    url: 'https://diaspoconnect.vercel.app',
    tags: ['React', 'Vapi', 'Airtable', 'Stripe', 'Gemini'],
    metrics: ['Livré en 7 jours', '12 fonctionnalités IA', 'Score 94/100'],
    icon: Globe,
    featured: false,
    color: 'from-violet-600 to-violet-400',
  },
  {
    title: 'Salon Beauté Clichy',
    description: 'Site vitrine + agent vocal pour prise de RDV automatique.',
    tags: ['Site Web', 'Google Maps', 'Chatbot'],
    metrics: ['Site en 5 jours', 'Réservations +65%', 'ROI en 3 semaines'],
    icon: Globe,
    featured: false,
    color: 'from-pink-500 to-violet-500',
  },
  {
    title: 'Garage Auto Express',
    description: 'Automatisation complète des devis et relances clients.',
    tags: ['Agent Vocal', 'CRM', 'Automatisation'],
    metrics: ['Devis automatiques', 'CRM intégré', '-10h/semaine'],
    icon: Wrench,
    featured: false,
    color: 'from-cyan-500 to-violet-500',
  },
];

// Services intégrés pour DiaspoConnect
const diaspoServices = [
  { icon: Bot, label: 'Chatbot Koné IA', color: '#7C3AED' },
  { icon: Cpu, label: 'Agent vocal Vapi', color: '#06B6D4' },
  { icon: CreditCard, label: 'Paiements Stripe', color: '#F59E0B' },
  { icon: Workflow, label: 'Automatisation n8n', color: '#10B981' },
];

export default function Realisations() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  return (
    <section className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      <div className="cyber-grid" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-3xl md:text-5xl font-display font-bold text-white mb-4"
            >
              Nos clients
            </motion.h2>
          </div>
          <p className="text-gray-400 text-lg">
            Des projets livrés, des <span className="gradient-text">résultats</span> mesurables.
          </p>
        </motion.div>

        {/* FEATURED — DiaspoConnect card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-glow holo-card rounded-3xl p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full mb-4 border border-amber-500/30">
                Client #1 — Livré en 7 jours
              </span>
              <h3 className="font-display font-bold text-2xl text-white mb-2">
                Plateforme communautaire diaspora malienne
              </h3>
              <a href="https://diaspoconnect.vercel.app" target="_blank" rel="noopener noreferrer"
                className="text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors mb-4 inline-flex items-center gap-1">
                diaspoconnect.vercel.app <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Services intégrés */}
              <div className="grid grid-cols-2 gap-2 my-4">
                {diaspoServices.map((s, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-2 border border-white/10"
                  >
                    <s.icon size={14} style={{ color: s.color }} />
                    <span className="text-white/70 text-[11px] font-medium">{s.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 mt-4">
                {['400+ membres', 'Chatbot 24h/24', 'Actualités automatiques'].map((stat, i) => (
                  <span key={i} className="px-2.5 py-1 bg-violet-500/15 border border-violet-500/30 rounded-full text-violet-300 text-[11px] font-medium">
                    {stat}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview card */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/10"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #F59E0B)' }}>
                <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                  <span className="text-white text-3xl">🇲🇱</span>
                  <span className="text-white font-bold text-sm">DiaspoConnect</span>
                  <span className="text-white/60 text-[10px]">Super-app diaspora malienne</span>
                </div>
              </div>
              <a href="https://diaspoconnect.vercel.app" target="_blank" rel="noopener noreferrer"
                className="mt-3 w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1">
                Voir le site live → <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Other projects */}
        <div className="grid md:grid-cols-3 gap-6">
          {projects.filter(p => !p.featured && p.title !== 'DiaspoConnect Mali').map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="holo-card rounded-2xl p-5 flex flex-col"
            >
              <div className={`h-1 rounded-full bg-gradient-to-r ${p.color} mb-3`} />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <p.icon size={16} className="text-violet-400" />
                </div>
                <h3 className="font-display font-bold text-base text-white">{p.title}</h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-white/5 text-gray-300 text-[10px] rounded font-medium border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
              <div className="space-y-1 mb-3">
                {p.metrics.map(m => (
                  <div key={m} className="flex items-center gap-1.5 text-xs text-violet-400 font-medium">
                    <span className="w-1 h-1 rounded-full bg-violet-400" />
                    {m}
                  </div>
                ))}
              </div>
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-violet-400 text-xs font-semibold hover:text-violet-300 transition-colors mt-auto">
                  Voir le site <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-lg mb-4">
            Vous pouvez être notre <span className="gradient-text font-bold">prochain client</span>
          </p>
          <RippleButton
            onClick={() => scrollTo('contact')}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-violet-500/30 transition-all"
          >
            Discutons de votre projet →
          </RippleButton>
        </motion.div>
      </div>
    </section>
  );
}
