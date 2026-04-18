import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";

// ─── Config EmailJS ───────────────────────────────────────────────────────────
const EMAILJS_SERVICE  = "service_ppbehii";
const EMAILJS_TEMPLATE = "template_lgfewva";
const EMAILJS_KEY      = "fMP5Tbm2p8wc6qQlM";

// ─── Styles partagés ──────────────────────────────────────────────────────────
const inputClass = `
  w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
  text-white placeholder-white/30 text-sm
  focus:outline-none focus:border-violet-500 focus:bg-white/8
  transition-all duration-200
`;

const selectClass = `
  w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3
  text-white text-sm appearance-none
  focus:outline-none focus:border-violet-500
  transition-all duration-200 cursor-pointer
`;

// ─── Composant Info Card ──────────────────────────────────────────────────────
function InfoCard({ icon, label, value, href }) {
  const inner = (
    <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-violet-500/50 hover:bg-white/8 transition-all duration-200 group">
      <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 text-xl flex-shrink-0 group-hover:bg-violet-500/25 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-white font-medium text-sm">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} className="block">{inner}</a> : inner;
}

// ─── Page Contact ─────────────────────────────────────────────────────────────
export default function ContactPage() {
  const formRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", telephone: "",
    commerce: "", secteur: "", message: "",
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          from_name: `${form.prenom} ${form.nom}`,
          from_email: form.email,
          phone: form.telephone,
          commerce: form.commerce,
          secteur: form.secteur,
          message: form.message,
        },
        EMAILJS_KEY
      );
      setStatus("success");
      setForm({ prenom: "", nom: "", email: "", telephone: "", commerce: "", secteur: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium tracking-widest uppercase mb-6">
            Contact
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight">
            Parlons de votre
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400"> projet</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Réponse garantie sous <strong className="text-white/80">24h ouvrées</strong>.
            Devis gratuit et sans engagement.
          </p>
        </div>
      </section>

      {/* ── Corps ── */}
      <section className="pb-32 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ─ Infos ─ */}
          <aside className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2">Informations de contact</h2>

            <InfoCard icon="📱" label="Téléphone / WhatsApp" value="06 74 31 45 75" href="tel:+33674314575" />
            <InfoCard icon="✉️" label="Email" value="tbadrapro@gmail.com" href="mailto:tbadrapro@gmail.com" />
            <InfoCard icon="📍" label="Zone d'intervention" value="Clichy · Asnières · Saint-Denis · Levallois" />
            <InfoCard icon="⏱️" label="Délai de livraison" value="Site vitrine livré en 5 jours ouvrés" />

            {/* Engagements */}
            <div className="mt-4 p-5 bg-gradient-to-br from-violet-900/30 to-indigo-900/20 border border-violet-500/20 rounded-2xl">
              <p className="text-white/70 font-semibold mb-3 text-sm uppercase tracking-wider">Nos engagements</p>
              {[
                "✅ Devis gratuit sous 24h",
                "✅ Sans engagement",
                "✅ Accompagnement inclus",
                "✅ Paiement à la livraison",
              ].map((e) => (
                <p key={e} className="text-white/60 text-sm py-1">{e}</p>
              ))}
            </div>
          </aside>

          {/* ─ Formulaire ─ */}
          <div className="lg:col-span-3">
            <div className="bg-white/3 border border-white/8 rounded-3xl p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6">Envoyez-nous un message</h2>

              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center text-4xl">✅</div>
                  <h3 className="text-2xl font-bold">Message envoyé !</h3>
                  <p className="text-white/50 max-w-sm">Nous vous répondons sous 24h ouvrées. En attendant, n'hésitez pas à nous appeler.</p>
                  <button onClick={() => setStatus("idle")} className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm transition-colors">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Nom / Prénom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Prénom *</label>
                      <input name="prenom" required value={form.prenom} onChange={handleChange}
                        placeholder="Mohamed" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Nom *</label>
                      <input name="nom" required value={form.nom} onChange={handleChange}
                        placeholder="Diallo" className={inputClass} />
                    </div>
                  </div>

                  {/* Email / Téléphone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Email *</label>
                      <input name="email" type="email" required value={form.email} onChange={handleChange}
                        placeholder="vous@exemple.com" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Téléphone</label>
                      <input name="telephone" type="tel" value={form.telephone} onChange={handleChange}
                        placeholder="06 XX XX XX XX" className={inputClass} />
                    </div>
                  </div>

                  {/* Commerce */}
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Nom de votre commerce</label>
                    <input name="commerce" value={form.commerce} onChange={handleChange}
                      placeholder="Ex: Restaurant Chez Mamadou" className={inputClass} />
                  </div>

                  {/* Secteur */}
                  <div className="relative">
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Type de commerce *</label>
                    <select name="secteur" required value={form.secteur} onChange={handleChange} className={selectClass}>
                      <option value="" disabled hidden>Sélectionnez votre secteur…</option>
                      <option value="restaurant">🍽️ Restaurant</option>
                      <option value="coiffure">✂️ Salon de coiffure</option>
                      <option value="esthetique">💅 Institut d'esthétique</option>
                      <option value="garage">🔧 Garage / Auto</option>
                      <option value="kebab">🌮 Kebab / Fast-food</option>
                      <option value="traiteur">🧆 Traiteur</option>
                      <option value="pressing">👔 Pressing / Laverie</option>
                      <option value="epicerie">🛒 Épicerie / Commerce</option>
                      <option value="artisan">🛠️ Artisan</option>
                      <option value="autre">📦 Autre</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-[calc(50%+10px)] transform -translate-y-1/2 text-white/40">
                      ▾
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Votre message *</label>
                    <textarea name="message" required rows={4} value={form.message} onChange={handleChange}
                      placeholder="Décrivez votre projet ou posez vos questions…"
                      className={`${inputClass} resize-none`} />
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      ⚠️ Une erreur s'est produite. Appelez-nous directement au 06 74 31 45 75.
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide
                      bg-gradient-to-r from-violet-600 to-indigo-600
                      hover:from-violet-500 hover:to-indigo-500
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
                      hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Envoi en cours…
                      </span>
                    ) : "Envoyer le message →"}
                  </button>

                  <p className="text-white/30 text-xs text-center">
                    En soumettant ce formulaire, vous acceptez d'être recontacté par Proxia IA.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
