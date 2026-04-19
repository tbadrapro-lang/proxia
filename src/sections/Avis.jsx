import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const avis = [
  {
    nom: 'Martin D.',
    commerce: 'Restaurant à Clichy',
    note: 5,
    texte: 'Proxia a créé notre site en 4 jours chrono. Depuis, on reçoit des réservations en ligne tous les jours. Incroyable !',
    avatar: 'M',
    color: 'from-orange-500 to-amber-500',
  },
  {
    nom: 'Sophie L.',
    commerce: 'Salon de coiffure, Asnières',
    note: 5,
    texte: 'Très professionnel et réactif. Mon site est magnifique et mes clientes peuvent prendre RDV directement en ligne.',
    avatar: 'S',
    color: 'from-pink-500 to-violet-500',
  },
  {
    nom: 'Thomas B.',
    commerce: 'Garage, Saint-Denis',
    note: 5,
    texte: "Je n'y croyais pas trop au début, mais depuis mon site je reçois des demandes de devis chaque semaine.",
    avatar: 'T',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    nom: 'Emma S.',
    commerce: 'Institut esthétique, Levallois',
    note: 5,
    texte: 'Site livré en 5 jours exactement comme promis. Le formulaire de réservation en ligne a changé mon business.',
    avatar: 'E',
    color: 'from-violet-500 to-indigo-500',
  },
];

function Stars({ note }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

export default function Avis() {
  return (
    <section className="w-full py-20 md:py-28 bg-[#0A0F1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-sm font-medium">+50 commerçants satisfaits</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Ils nous font <span className="gradient-text">confiance</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Des commerçants locaux qui ont transformé leur présence digitale grâce à Proxia IA.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {avis.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="holo-card rounded-2xl p-6 flex flex-col gap-4"
            >
              <Stars note={a.note} />
              <p className="text-white/80 text-sm leading-relaxed flex-1">"{a.texte}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">{a.avatar}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{a.nom}</p>
                  <p className="text-white/40 text-xs">{a.commerce}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badge Google */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <div className="flex -space-x-1">
            {['M', 'S', 'T', 'E'].map((l, i) => (
              <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${avis[i].color} border-2 border-[#0A0F1E] flex items-center justify-center`}>
                <span className="text-white text-[10px] font-bold">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-white/50 text-sm">
            <span className="text-amber-400 font-semibold">5.0 ★</span> — Note moyenne sur Google
          </p>
        </motion.div>
      </div>
    </section>
  );
}
