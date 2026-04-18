// ─── Mentions Légales ─────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-violet-400 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-violet-500 rounded-full flex-shrink-0" />
        {title}
      </h2>
      <div className="text-white/55 text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.08),transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium tracking-widest uppercase mb-6">
            Légal
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Mentions légales</h1>
          <p className="text-white/40 text-sm">Dernière mise à jour : avril 2026</p>
        </div>
      </section>

      {/* ── Contenu ── */}
      <section className="pb-32 px-4">
        <div className="max-w-3xl mx-auto bg-white/3 border border-white/8 rounded-3xl p-8 md:p-12">

          <Section title="Éditeur du site">
            <p><strong className="text-white/80">Raison sociale :</strong> Proxia IA</p>
            <p><strong className="text-white/80">Responsable de la publication :</strong> Badra Traoré</p>
            <p><strong className="text-white/80">Statut :</strong> Auto-entrepreneur / Micro-entreprise</p>
            <p><strong className="text-white/80">Adresse :</strong> Clichy (92110), Île-de-France, France</p>
            <p><strong className="text-white/80">Email :</strong>{" "}
              <a href="mailto:tbadrapro@gmail.com" className="text-violet-400 hover:underline">tbadrapro@gmail.com</a>
            </p>
            <p><strong className="text-white/80">Téléphone :</strong>{" "}
              <a href="tel:+33674314575" className="text-violet-400 hover:underline">06 74 31 45 75</a>
            </p>
          </Section>

          <div className="border-t border-white/8 my-6" />

          <Section title="Hébergement">
            <p><strong className="text-white/80">Hébergeur :</strong> Vercel Inc.</p>
            <p><strong className="text-white/80">Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
            <p><strong className="text-white/80">Site :</strong>{" "}
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">vercel.com</a>
            </p>
          </Section>

          <div className="border-t border-white/8 my-6" />

          <Section title="Propriété intellectuelle">
            <p>
              L'ensemble de ce site — textes, graphismes, logos, icônes, images, clips audio et vidéo, ainsi que la charte graphique — constitue une œuvre protégée par les lois françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit et sur quelque support que ce soit, est interdite sans l'autorisation écrite préalable de Proxia IA.
            </p>
          </Section>

          <div className="border-t border-white/8 my-6" />

          <Section title="Données personnelles (RGPD)">
            <p>
              Proxia IA s'engage à protéger la vie privée des utilisateurs de son site. Les données collectées via le formulaire de contact (nom, email, téléphone) sont utilisées uniquement pour répondre à vos demandes et ne sont jamais transmises à des tiers.
            </p>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.
            </p>
            <p>
              Pour exercer ces droits, contactez-nous à :{" "}
              <a href="mailto:tbadrapro@gmail.com" className="text-violet-400 hover:underline">tbadrapro@gmail.com</a>
            </p>
          </Section>

          <div className="border-t border-white/8 my-6" />

          <Section title="Cookies">
            <p>
              Ce site n'utilise pas de cookies de traçage ou publicitaires. Seuls des cookies techniques indispensables au bon fonctionnement du site peuvent être utilisés (ex : préférences de session).
            </p>
          </Section>

          <div className="border-t border-white/8 my-6" />

          <Section title="Limitation de responsabilité">
            <p>
              Proxia IA s'efforce de maintenir les informations de ce site à jour. Toutefois, la société ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées sur ce site.
            </p>
            <p>
              Les liens hypertextes mis en place vers d'autres sites n'engagent pas la responsabilité de Proxia IA quant aux contenus de ces sites.
            </p>
          </Section>

          <div className="border-t border-white/8 my-6" />

          <Section title="Droit applicable">
            <p>
              Le présent site et ses mentions légales sont soumis au droit français. En cas de litige, les tribunaux compétents seront ceux du ressort de la Cour d'appel de Paris.
            </p>
          </Section>

        </div>
      </section>
    </div>
  );
}
