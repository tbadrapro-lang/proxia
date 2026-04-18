import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, isSameDay } from '../utils/crm';

const TYPE_COLORS = {
  rdv_audit: 'bg-violet-500',
  livraison: 'bg-green-500',
  relance: 'bg-amber-500',
  appel: 'bg-blue-500',
};

const TYPE_LABELS = {
  rdv_audit: 'RDV Audit',
  livraison: 'Livraison',
  relance: 'Relance',
  appel: 'Appel',
};

const STATUT_LABELS = {
  planifié: 'Planifié',
  fait: 'Fait',
  annulé: 'Annulé',
};

const EMPTY_FORM = {
  titre: '', type: 'rdv_audit', clientNom: '',
  date: new Date().toISOString().split('T')[0],
  heure: '10:00', notes: '', statut: 'planifié',
};

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function Agenda({ crm }) {
  const { agenda, addEvent, updateEvent, deleteEvent } = crm;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const today = new Date();
  const todayEvents = agenda.filter(e => isSameDay(e.date, today.toISOString()));

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day) => {
    const d = new Date(year, month, day);
    return agenda.filter(e => isSameDay(e.date, d.toISOString()));
  };

  const handleAdd = () => {
    if (!form.titre || !form.date) return;
    addEvent({ ...form, date: new Date(form.date).toISOString() });
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 text-sm">{todayEvents.length} événement(s) aujourd'hui</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Événement
        </button>
      </div>

      {/* Aujourd'hui */}
      {todayEvents.length > 0 && (
        <div className="mb-6 bg-violet-50 border border-violet-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-3">Aujourd'hui</p>
          <div className="space-y-2">
            {todayEvents.map(e => (
              <div key={e.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
                <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[e.type] || 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{e.heure} · {e.titre}</p>
                  {e.clientNom && <p className="text-xs text-gray-500">{e.clientNom}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  e.statut === 'fait' ? 'bg-green-100 text-green-700' :
                  e.statut === 'annulé' ? 'bg-gray-100 text-gray-500' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {STATUT_LABELS[e.statut]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-semibold text-gray-900">
            {MOIS_LABELS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {JOURS.map(j => (
            <div key={j} className="text-center text-xs font-medium text-gray-400 py-2">{j}</div>
          ))}
        </div>

        {/* Grille du mois */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 border-r border-b border-gray-50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayDate = new Date(year, month, day);
            const isToday = isSameDay(dayDate.toISOString(), today.toISOString());
            const events = getEventsForDay(day);
            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`h-16 border-r border-b border-gray-50 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday ? 'bg-violet-50' : ''
                }`}
              >
                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-violet-600 text-white' : 'text-gray-700'
                }`}>
                  {day}
                </span>
                <div className="flex gap-0.5 flex-wrap mt-0.5">
                  {events.slice(0, 3).map(e => (
                    <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[e.type] || 'bg-gray-400'}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[k]}`} />
            <span className="text-xs text-gray-500">{v}</span>
          </div>
        ))}
      </div>

      {/* Drawer événements du jour */}
      <AnimatePresence>
        {selectedDay !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelectedDay(null)} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">
                  {selectedDay} {MOIS_LABELS[month]} {year}
                </h2>
                <button onClick={() => setSelectedDay(null)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {getEventsForDay(selectedDay).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">Aucun événement ce jour</p>
                ) : (
                  <div className="space-y-3">
                    {getEventsForDay(selectedDay).map(e => (
                      <div key={e.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[e.type]}`} />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{e.heure} · {e.titre}</p>
                              {e.clientNom && <p className="text-xs text-gray-500">{e.clientNom}</p>}
                            </div>
                          </div>
                          <button onClick={() => deleteEvent(e.id)} className="text-gray-300 hover:text-red-400">
                            <X size={14} />
                          </button>
                        </div>
                        {e.notes && <p className="text-xs text-gray-500 mt-2">{e.notes}</p>}
                        <div className="flex gap-2 mt-3">
                          {['planifié', 'fait', 'annulé'].map(s => (
                            <button key={s}
                              onClick={() => updateEvent(e.id, { statut: s })}
                              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                                e.statut === s ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                              }`}
                            >
                              {STATUT_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-5 border-t border-gray-100">
                <button
                  onClick={() => {
                    setForm({ ...EMPTY_FORM, date: new Date(year, month, selectedDay).toISOString().split('T')[0] });
                    setSelectedDay(null);
                    setShowModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus size={15} /> Ajouter un événement ce jour
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Modal création événement */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Nouvel événement</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Titre *', key: 'titre', type: 'text' },
                  { label: 'Client', key: 'clientNom', type: 'text' },
                  { label: 'Date', key: 'date', type: 'date' },
                  { label: 'Heure', key: 'heure', type: 'time' },
                  { label: 'Notes', key: 'notes', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >Annuler</button>
                <button onClick={handleAdd} disabled={!form.titre}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >Ajouter</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
