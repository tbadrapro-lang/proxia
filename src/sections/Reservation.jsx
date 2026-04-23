import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

const types = [
  { label: 'Audit gratuit', duration: '30 min' },
  { label: 'Démo IA', duration: '45 min' },
  { label: 'Devis personnalisé', duration: '1h' },
];

const creneaux = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

function getNextWorkdays(count) {
  const days = [];
  const d = new Date();
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      days.push(new Date(d));
    }
  }
  return days;
}

const formatDay = (d) => {
  const opts = { weekday: 'short', day: 'numeric', month: 'short' };
  return d.toLocaleDateString('fr-FR', opts);
};

export default function Reservation() {
  const [step, setStep] = useState(0);
  const [typeIndex, setTypeIndex] = useState(null);
  const [dayIndex, setDayIndex] = useState(null);
  const [creneau, setCreneau] = useState(null);
  const [form, setForm] = useState({ nom: '', email: '', tel: '', message: '' });
  const [sending, setSending] = useState(false);
  const [packName, setPackName] = useState('');

  const workdays = getNextWorkdays(7);

  useEffect(() => {
    const pack = localStorage.getItem('proxia_pack');
    if (pack) {
      setPackName(pack);
      localStorage.removeItem('proxia_pack');
    }
  }, []);

  const canNext = () => {
    if (step === 0) return typeIndex !== null;
    if (step === 1) return dayIndex !== null;
    if (step === 2) return creneau !== null;
    if (step === 3) return form.nom && form.email && form.tel;
    return false;
  };

  const handleSubmit = async () => {
    setSending(true);
    try {
      await emailjs.send('service_ppbehii', 'template_reservation', {
        type_appel: types[typeIndex].label,
        jour: formatDay(workdays[dayIndex]),
        creneau,
        nom: form.nom,
        email: form.email,
        phone: form.tel,
        message: form.message,
        pack: packName || 'Non précisé',
        reply_to: 'contact@proxia-ia.fr',
      }, 'fMP5Tbm2p8wc6qQlM');
      toast.success('Rendez-vous confirmé ! On vous envoie un email de confirmation.');
      setStep(0);
      setTypeIndex(null);
      setDayIndex(null);
      setCreneau(null);
      setForm({ nom: '', email: '', tel: '', message: '' });
    } catch {
      toast.error('Erreur. Appelez-nous au 06 74 31 45 75');
    } finally {
      setSending(false);
    }
  };

  const progressWidth = `${((step + 1) / 4) * 100}%`;

  return (
    <section className="py-20 md:py-28 bg-[#0F172A]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Réservez votre <span className="gradient-text">appel gratuit</span>
          </h2>
          <p className="text-white/60 text-lg">30 minutes pour transformer votre commerce. Sans engagement.</p>
        </motion.div>

        {/* Stepper progress */}
        <div className="h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-amber-400 rounded-full"
            animate={{ width: progressWidth }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
        >
          {/* Step 0: Type */}
          {step === 0 && (
            <div>
              {packName && (
                <div className="mb-4 px-4 py-2.5 bg-violet-600/20 border border-violet-500/30 rounded-xl text-violet-300 text-sm">
                  🎯 Pack présélectionné : <span className="font-semibold text-white">{packName}</span>
                </div>
              )}
              <p className="text-white font-medium mb-4">1. Type d&apos;appel</p>
              <div className="grid gap-3">
                {types.map((t, i) => (
                  <button key={t.label}
                    onClick={() => setTypeIndex(i)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      typeIndex === i
                        ? 'border-violet-500 bg-violet-600/20 text-white'
                        : 'border-white/10 text-white/70 hover:border-white/30'
                    }`}
                  >
                    <span className="font-medium">{t.label}</span>
                    <span className="text-white/40 ml-2 text-sm">({t.duration})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Day */}
          {step === 1 && (
            <div>
              <p className="text-white font-medium mb-4">2. Choisissez un jour</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {workdays.map((d, i) => (
                  <button key={i}
                    onClick={() => setDayIndex(i)}
                    className={`p-3 rounded-xl border text-sm text-center transition-all ${
                      dayIndex === i
                        ? 'border-violet-500 bg-violet-600/20 text-white'
                        : 'border-white/10 text-white/70 hover:border-white/30'
                    }`}
                  >
                    {formatDay(d)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Time */}
          {step === 2 && (
            <div>
              <p className="text-white font-medium mb-4">3. Choisissez un créneau</p>
              <div className="grid grid-cols-3 gap-3">
                {creneaux.map(c => (
                  <button key={c}
                    onClick={() => setCreneau(c)}
                    className={`p-3 rounded-xl border text-sm text-center transition-all ${
                      creneau === c
                        ? 'border-violet-500 bg-violet-600/20 text-white'
                        : 'border-white/10 text-white/70 hover:border-white/30'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Form */}
          {step === 3 && (
            <div>
              <p className="text-white font-medium mb-4">4. Vos coordonnées</p>
              <div className="space-y-3">
                <input type="text" required placeholder="Nom complet" value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-violet-400 focus:outline-none rounded-xl text-sm" />
                <input type="email" required placeholder="Email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-violet-400 focus:outline-none rounded-xl text-sm" />
                <input type="tel" required placeholder="Téléphone" value={form.tel}
                  onChange={e => setForm(f => ({ ...f, tel: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-violet-400 focus:outline-none rounded-xl text-sm" />
                <textarea rows={3} placeholder="Message (optionnel)" value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-violet-400 focus:outline-none rounded-xl text-sm resize-none" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 border border-white/20 text-white/70 rounded-xl text-sm hover:bg-white/5 transition-colors">
                Retour
              </button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => canNext() && setStep(s => s + 1)}
                disabled={!canNext()}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Suivant →
              </button>
            ) : (
              <button onClick={handleSubmit}
                disabled={!canNext() || sending}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {sending ? 'Envoi...' : 'Confirmer le RDV ✓'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
