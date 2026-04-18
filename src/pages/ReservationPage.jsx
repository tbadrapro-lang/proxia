import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// ─── ⚠️  Remplace cette URL par ton lien Calendly ─────────────────────────────
// 1. Crée un compte sur https://calendly.com (gratuit)
// 2. Configure ta disponibilité (ex: lun-ven 9h-18h)
// 3. Copie ton lien et colle-le ici :
const CALENDLY_URL = "https://calendly.com/tbadrapro"; // ← À modifier

// ─── Services disponibles ─────────────────────────────────────────────────────
const SERVICES = [
  { id: "site-vitrine",       label: "🌐 Site vitrine",              prix: "490€",  duree: "5 jours" },
  { id: "site-reservation",   label: "📅 Site + Réservation en ligne", prix: "790€",  duree: "7 jours" },
  { id: "ecommerce",          label: "🛒 Site e-commerce",            prix: "1 200€+", duree: "14 jours" },
  { id: "audit-ia",           label: "🤖 Audit IA de votre commerce", prix: "Gratuit", duree: "30 min" },
  { id: "maintenance",        label: "🛠️ Maintenance mensuelle",      prix: "49€/mois", duree: "—" },
  { id: "autre",              label: "💬 Autre (à définir)",           prix: "Sur devis", duree: "—" },
];

// ─── Chargement widget Calendly ───────────────────────────────────────────────
function CalendlyWidget({ url, prefill }) {
  useEffect(() => {
    // Inject Calendly script
    const existing = document.getElementById("calendly-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "calendly-script";
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }
    // Inject Calendly CSS
    if (!document.getElementById("calendly-css")) {
      const link = document.createElement("link");
      link.id = "calendly-css";
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }
  }, []);

  const fullUrl = prefill
    ? `${url}?name=${encodeURIComponent(prefill.name || "")}&email=${encodeURIComponent(prefill.email || "")}&a1=${encodeURIComponent(prefill.service || "")}`
    : url;

  return (
    <div
      className="calendly-inline-widget rounded-2xl overflow-hidden"
      data-url={fullUrl}
      style={{ minWidth: "320px", height: "700px" }}
    />
  );
}

// ─── Page Réservation ─────────────────────────────────────────────────────────
export default function ReservationPage() {
  const [searchParams] = useSearchParams();
  const serviceFromUrl = searchParams.get("service") || "";

  const [selectedService, setSelectedService] = useState(
    SERVICES.find((s) => s.id === serviceFromUrl) || null
  );
  const [step, setStep] = useState(serviceFromUrl ? 2 : 1); // 1=choix service, 2=calendrier
  const [prefill, setPrefill] = useState({ name: "", email: "", service: serviceFromUrl });

  const handleSelectService = (service) => {
    setSelectedService(service);
    setPrefill((f) => ({ ...f, service: service.label }));
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium tracking-widest uppercase mb-6">
            Réservation gratuite
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Prenez rendez-vous
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400"> en ligne</span>
          </h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            30 minutes pour comprendre votre projet et vous proposer la meilleure solution.
            <strong className="text-white/80"> Gratuit et sans engagement.</strong>
          </p>
        </div>
      </section>

      {/* ── Étapes ── */}
      <section className="pb-32 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[
              { n: 1, label: "Choisir un service" },
              { n: 2, label: "Choisir un créneau" },
            ].map(({ n, label }) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= n ? "bg-violet-600 text-white" : "bg-white/10 text-white/40"
                }`}>
                  {step > n ? "✓" : n}
                </div>
                <span className={`text-sm font-medium transition-colors hidden sm:block ${
                  step >= n ? "text-white" : "text-white/40"
                }`}>{label}</span>
                {n < 2 && <div className="w-12 h-px bg-white/15 mx-1" />}
              </div>
            ))}
          </div>

          {/* ─ Étape 1 : Choix du service ─ */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-center mb-8">Quel service vous intéresse ?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleSelectService(service)}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left
                      hover:border-violet-500/60 hover:bg-violet-500/8 hover:-translate-y-0.5
                      transition-all duration-200 group"
                  >
                    <p className="text-base font-semibold mb-3 group-hover:text-violet-300 transition-colors">
                      {service.label}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-violet-400">{service.prix}</span>
                      {service.duree !== "—" && (
                        <span className="text-xs text-white/40 bg-white/8 px-2 py-1 rounded-lg">
                          ⏱ {service.duree}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-white/30 text-sm mt-8">
                Vous pouvez aussi nous appeler directement :{" "}
                <a href="tel:+33674314575" className="text-violet-400 hover:underline">06 74 31 45 75</a>
              </p>
            </div>
          )}

          {/* ─ Étape 2 : Calendly ─ */}
          {step === 2 && (
            <div>
              {selectedService && (
                <div className="flex items-center justify-between mb-6 p-4 bg-violet-500/10 border border-violet-500/25 rounded-2xl">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Service sélectionné</p>
                    <p className="font-semibold text-violet-300">{selectedService.label}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors"
                  >
                    Modifier
                  </button>
                </div>
              )}

              {/* Widget Calendly */}
              <div className="bg-white/3 border border-white/8 rounded-3xl overflow-hidden">
                <CalendlyWidget url={CALENDLY_URL} prefill={prefill} />
              </div>

              {/* Fallback si Calendly pas encore configuré */}
              <div className="mt-6 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center">
                <p className="text-amber-400 text-sm font-medium mb-1">⚠️ Calendly non encore configuré</p>
                <p className="text-white/50 text-xs mb-3">
                  En attendant, contactez-nous directement pour réserver un créneau.
                </p>
                <div className="flex gap-3 justify-center">
                  <a href="tel:+33674314575"
                    className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/15 transition-colors">
                    📱 Appeler
                  </a>
                  <a href="https://wa.me/33674314575"
                    target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-sm font-bold text-green-400 hover:bg-green-500/30 transition-colors">
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
