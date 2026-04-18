import { useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { Send, Phone, Mail } from 'lucide-react';
import RippleButton from '../components/RippleButton';

const initialQuick = { prenom: '', phone: '', commerce: '' };
const initialFull = {
  prenom: '', nom: '', email: '', phone: '',
  type: '', ville: '', message: '', consent: false,
};

export default function Contact() {
  const [quick, setQuick] = useState(initialQuick);
  const [form, setForm] = useState(initialFull);
  const [sendingQuick, setSendingQuick] = useState(false);
  const [sendingFull, setSendingFull] = useState(false);

  const updateQuick = (field, value) => setQuick(prev => ({ ...prev, [field]: value }));
  const updateFull = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (!quick.prenom.trim() || !quick.phone.trim()) {
      toast.error('Prénom et téléphone requis.');
      return;
    }
    setSendingQuick(true);
    try {
      await emailjs.send('service_ppbehii', 'template_lgfewva', {
        from_name: quick.prenom,
        phone: quick.phone,
        commerce_type: quick.commerce || 'Non précisé',
        email: '',
        ville: '',
        message: `[RAPPEL RAPIDE] ${quick.prenom} — ${quick.phone} — Commerce: ${quick.commerce || 'Non précisé'}`,
      }, 'fMP5Tbm2p8wc6qQlM');
      toast.success(`Parfait ${quick.prenom} ! On vous rappelle aujourd\u0027hui 🎯`);
      setQuick(initialQuick);
    } catch {
      toast.error('Erreur. Appelez-nous au 06 74 31 45 75');
    } finally {
      setSendingQuick(false);
    }
  };

  const handleFullSubmit = async (e) => {
    e.preventDefault();
    if (!form.consent) {
      toast.error("Veuillez accepter d\u0027être contacté.");
      return;
    }
    setSendingFull(true);
    try {
      await emailjs.send('service_ppbehii', 'template_lgfewva', {
        from_name: `${form.prenom} ${form.nom}`,
        email: form.email,
        phone: form.phone,
        commerce_type: form.type,
        ville: form.ville,
        message: form.message,
      }, 'fMP5Tbm2p8wc6qQlM');
      toast.success('Demande envoyée ! On vous contacte sous 24h.');
      setForm(initialFull);
    } catch {
      toast.error('Erreur. Contactez-nous sur tbadrapro@gmail.com');
    } finally {
      setSendingFull(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-violet-400 focus:outline-none rounded-xl text-sm transition-colors';
  const selectClass = `${inputClass} [&>option]:bg-[#1e1b4b] [&>option]:text-white`;

  return (
    <section className="relative py-20 md:py-28 bg-[#0F172A] overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-[128px]" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-400/10 rounded-full blur-[128px]" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Contactez-nous
          </h2>

          {/* Contact info */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <a href="tel:0674314575" className="flex items-center gap-2 text-violet-300 hover:text-violet-200 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">06 74 31 45 75</span>
            </a>
            <a href="mailto:tbadrapro@gmail.com" className="flex items-center gap-2 text-violet-300 hover:text-violet-200 transition-colors">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">tbadrapro@gmail.com</span>
            </a>
          </div>

          {/* Badge pulse */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-green-400 text-xs font-medium">Répond en moins de 2h</span>
          </div>
        </motion.div>

        {/* ===== QUICK FORM — "Je veux être rappelé" ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="holo-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-white font-bold text-lg mb-1 text-center">Je veux être rappelé aujourd&apos;hui</h3>
          <p className="text-gray-400 text-xs text-center mb-5">3 champs, 10 secondes, on vous rappelle.</p>

          <form onSubmit={handleQuickSubmit} className="space-y-3">
            <motion.input
              whileFocus={{ borderColor: '#7C3AED', boxShadow: '0 0 0 2px rgba(124,58,237,0.2)' }}
              type="text" required placeholder="Votre prénom"
              value={quick.prenom} onChange={e => updateQuick('prenom', e.target.value)}
              className={inputClass}
            />
            <motion.input
              whileFocus={{ borderColor: '#7C3AED', boxShadow: '0 0 0 2px rgba(124,58,237,0.2)' }}
              type="tel" required placeholder="Votre téléphone"
              value={quick.phone} onChange={e => updateQuick('phone', e.target.value)}
              className={inputClass}
            />
            <select value={quick.commerce} onChange={e => updateQuick('commerce', e.target.value)}
              className={`${selectClass} ${!quick.commerce ? 'text-white/40' : ''}`}>
              <option value="">Mon commerce (optionnel)</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Salon">Salon</option>
              <option value="Garage">Garage</option>
              <option value="Boutique">Boutique</option>
              <option value="Autre">Autre</option>
            </select>

            <RippleButton
              type="submit"
              disabled={sendingQuick}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-500/30 transition-colors disabled:opacity-50"
            >
              {sendingQuick ? 'Envoi...' : 'Je veux être rappelé aujourd\u0027hui →'}
            </RippleButton>
          </form>

          {/* Trust signals */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            {[
              { icon: '📞', text: 'Réponse garantie sous 2h' },
              { icon: '🔒', text: 'Aucun engagement' },
              { icon: '⚡', text: 'Premier audit gratuit' },
            ].map((t, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-gray-400 text-[11px] flex items-center gap-1"
              >
                {t.icon} {t.text}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Separator */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-white/30 text-xs">ou formulaire détaillé</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* ===== FULL FORM ===== */}
        <motion.form
          onSubmit={handleFullSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <input type="text" required placeholder="Prénom" value={form.prenom}
              onChange={e => updateFull('prenom', e.target.value)} className={inputClass} />
            <input type="text" required placeholder="Nom" value={form.nom}
              onChange={e => updateFull('nom', e.target.value)} className={inputClass} />
          </div>
          <input type="email" required placeholder="Email professionnel" value={form.email}
            onChange={e => updateFull('email', e.target.value)} className={inputClass} />
          <input type="tel" placeholder="Téléphone" value={form.phone}
            onChange={e => updateFull('phone', e.target.value)} className={inputClass} />
          <select required value={form.type}
            onChange={e => updateFull('type', e.target.value)}
            className={`${selectClass} ${!form.type ? 'text-white/40' : ''}`}>
            <option value="" disabled>Type de commerce</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Salon & Beauté">Salon &amp; Beauté</option>
            <option value="Garage & Artisan">Garage &amp; Artisan</option>
            <option value="Immobilier">Immobilier</option>
            <option value="Autre">Autre</option>
          </select>
          <input type="text" placeholder="Ville" value={form.ville}
            onChange={e => updateFull('ville', e.target.value)} className={inputClass} />
          <textarea rows={4} placeholder="Décrivez votre situation..." value={form.message}
            onChange={e => updateFull('message', e.target.value)}
            className={`${inputClass} resize-none`} />

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.consent}
              onChange={e => updateFull('consent', e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-violet-600 focus:ring-violet-500" />
            <span className="text-white/60 text-sm">J&apos;accepte d&apos;être contacté par Proxia</span>
          </label>

          <motion.button
            type="submit"
            disabled={sendingFull}
            whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(124,58,237,0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-violet-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sendingFull ? 'Envoi en cours...' : (
              <>Réserver mon audit gratuit <Send className="w-5 h-5" /></>
            )}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}
