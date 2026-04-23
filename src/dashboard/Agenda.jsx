import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, RefreshCw, UserPlus, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '../lib/supabaseClient';

const TYPE_COLORS = {
  rdv: '#7C3AED',
  relance: '#F59E0B',
  livraison: '#10B981',
};

const TYPE_LABELS = {
  rdv: 'RDV',
  relance: 'Relance',
  livraison: 'Livraison',
};

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [confirmClient, setConfirmClient] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('agenda')
      .select('*')
      .order('date_debut', { ascending: true });
    if (error) {
      toast.error('Erreur chargement agenda');
      setEvents([]);
    } else {
      setEvents(
        (data || []).map((row) => ({
          id: String(row.id),
          title: row.titre || 'Événement',
          start: row.date_debut,
          end: row.date_fin || row.date_debut,
          backgroundColor: TYPE_COLORS[row.type] || '#7C3AED',
          borderColor: TYPE_COLORS[row.type] || '#7C3AED',
          extendedProps: {
            description: row.description || '',
            type: row.type || 'rdv',
          },
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
    const channel = supabase
      .channel('agenda-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda' }, () => fetchEvents())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  const handleDateClick = async (arg) => {
    const titre = window.prompt('Titre de l\'événement ?');
    if (!titre) return;
    const type = window.prompt('Type ? (rdv / relance / livraison)', 'rdv') || 'rdv';
    const description = window.prompt('Description (optionnel) ?') || '';

    const start = arg.dateStr.length === 10
      ? `${arg.dateStr}T10:00:00`
      : arg.dateStr;
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const { error } = await supabase.from('agenda').insert({
      titre,
      type: ['rdv', 'relance', 'livraison'].includes(type) ? type : 'rdv',
      description,
      date_debut: startDate.toISOString(),
      date_fin: endDate.toISOString(),
    });
    if (error) toast.error('Erreur création : ' + error.message);
    else toast.success('✅ Événement ajouté');
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      description: info.event.extendedProps.description || '',
      type: info.event.extendedProps.type || 'rdv',
    });
    setConfirmClient(false);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!window.confirm(`Supprimer "${selectedEvent.title}" ?`)) return;
    const { error } = await supabase.from('agenda').delete().eq('id', selectedEvent.id);
    if (error) toast.error('Erreur suppression');
    else { toast.success('Événement supprimé'); setSelectedEvent(null); }
  };

  const handleCreateLead = async () => {
    if (!selectedEvent) return;
    const nomCommerce = selectedEvent.title
      .replace('RDV — ', '')
      .replace('RDV - ', '')
      .trim();

    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('nom', nomCommerce)
      .maybeSingle();

    if (existing) {
      toast.error(`"${nomCommerce}" est déjà dans les leads`);
      return;
    }

    const { error } = await supabase.from('leads').insert([{
      nom: nomCommerce,
      statut: 'rdv',
      canal: 'agenda',
      score: 0,
    }]);

    if (error) {
      console.error('[Agenda][CreateLead]', error);
      toast.error('Erreur : ' + error.message);
    } else {
      toast.success('👤 Lead créé : ' + nomCommerce);
      setSelectedEvent(null);
    }
  };

  const handleConvertToClient = async () => {
    if (!selectedEvent) return;
    const nomCommerce = selectedEvent.title
      .replace('RDV — ', '')
      .replace('RDV - ', '')
      .trim();

    const { error } = await supabase.from('clients').insert([{
      nom: nomCommerce,
      statut: 'actif',
    }]);

    if (error) {
      console.error('[Agenda][ConvertClient]', error);
      toast.error('Erreur : ' + error.message);
    } else {
      toast.success('⭐ Client créé : ' + nomCommerce);
      setSelectedEvent(null);
      setConfirmClient(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 text-sm">
            {loading ? 'Chargement...' : `${events.length} événement(s)`} · Cliquez sur une date pour ajouter
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-violet-300 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} /> Rafraîchir
          </button>
          <button
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Link2 size={15} /> 🔗 Sync Google Calendar
          </button>
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: TYPE_COLORS[k] }} />
            <span className="text-xs text-gray-600">{v}</span>
          </div>
        ))}
      </div>

      {/* Calendrier */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          locale="fr"
          buttonText={{
            today: "Aujourd'hui",
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
          }}
          firstDay={1}
          height="auto"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={false}
          selectable
        />
      </div>

      {/* Modal détail événement */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{selectedEvent.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedEvent.start
                      ? new Date(selectedEvent.start).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </p>
                </div>
                <button onClick={() => setSelectedEvent(null)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-3">
                {selectedEvent.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{selectedEvent.description}</p>
                )}
                <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: TYPE_COLORS[selectedEvent.type] + '20', color: TYPE_COLORS[selectedEvent.type] }}
                >
                  {TYPE_LABELS[selectedEvent.type] || selectedEvent.type}
                </span>

                {/* Boutons actions RDV */}
                {selectedEvent.type === 'rdv' && !confirmClient && (
                  <div className="flex flex-col gap-2 pt-2">
                    <button onClick={handleCreateLead}
                      className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <UserPlus size={15} /> 👤 Créer un lead
                    </button>
                    <button onClick={() => setConfirmClient(true)}
                      className="flex items-center justify-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <UserCheck size={15} /> ⭐ Convertir en client
                    </button>
                  </div>
                )}

                {/* Confirmation client */}
                {confirmClient && (
                  <div className="bg-violet-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-violet-800 font-medium">
                      Créer le client "{selectedEvent.title.replace('RDV — ', '').replace('RDV - ', '').trim()}" ?
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmClient(false)}
                        className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
                      >Annuler</button>
                      <button onClick={handleConvertToClient}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-sm font-semibold"
                      >Confirmer</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100">
                <button onClick={handleDeleteEvent}
                  className="w-full border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  🗑 Supprimer l'événement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Sync Google Calendar */}
      <AnimatePresence>
        {showSyncModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSyncModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">🔗 Sync Google Calendar</h2>
                <button onClick={() => setShowSyncModal(false)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Pour synchroniser avec Google Calendar, contactez le support Proxia.
                </p>
                <a
                  href="mailto:contact@proxia-ia.fr?subject=Sync%20Google%20Calendar"
                  className="mt-4 inline-block text-violet-600 hover:underline text-sm font-medium"
                >
                  contact@proxia-ia.fr
                </a>
              </div>
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Compris
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
