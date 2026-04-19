import { useEffect, useState, useCallback } from 'react';
import { Users, FileText, Clock, Euro, Calendar, ExternalLink, Bell, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function buildChart(factures) {
  const map = {};
  (factures || []).forEach(f => {
    if (f.statut !== 'payée') return;
    const d = new Date(f.date_reglement || f.date_emission || f.created_at);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + (Number(f.total_ttc || f.montant) || 0);
  });
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { mois: MOIS_LABELS[d.getMonth()], ca: map[key] || 0 };
  });
}

export default function DashboardHome({ setActiveView }) {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalClients: 0,
    caTotal: 0,
    facturesAttente: 0,
  });
  const [chartData, setChartData] = useState(buildChart([]));
  const [rdvToday, setRdvToday] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);

      const [leadsCountRes, clientsCountRes, facturesPayeesRes, facturesAttenteRes, agendaRes] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('factures').select('*').eq('statut', 'payée'),
        supabase.from('factures').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
        supabase.from('agenda').select('*').gte('date_debut', todayStr).lt('date_debut', tomorrowStr).order('date_debut'),
      ]);

      const facturesPayees = facturesPayeesRes.data || [];
      const caTotal = facturesPayees.reduce((s, f) => s + (Number(f.total_ttc || f.montant) || 0), 0);

      setStats({
        totalLeads: leadsCountRes.count || 0,
        totalClients: clientsCountRes.count || 0,
        caTotal,
        facturesAttente: facturesAttenteRes.count || 0,
      });
      setChartData(buildChart(facturesPayees));
      setRdvToday(agendaRes.data || []);
    } catch (err) {
      console.error('[DashboardHome][loadAll]', err);
      toast.error('Erreur chargement dashboard : ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications non supportées par ce navigateur');
      return;
    }
    if (Notification.permission === 'granted') {
      toast.success('Notifications déjà activées');
      return;
    }
    if (Notification.permission === 'denied') {
      toast.error('Notifications bloquées — débloque-les dans les réglages du navigateur');
      return;
    }
    const result = await Notification.requestPermission();
    if (result === 'granted') toast.success('🔔 Notifications activées !');
    else toast.error('Notifications refusées');
  };

  const openCalendly = () => {
    window.open('https://calendly.com/tbadrapro/appel-decouverte-gratuit', '_blank', 'noopener,noreferrer');
  };

  const goToLeads = () => {
    if (typeof setActiveView === 'function') setActiveView('leads');
  };

  const kpis = [
    { label: 'Total leads', value: stats.totalLeads, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Clients', value: stats.totalClients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'CA total payé', value: `${stats.caTotal.toLocaleString('fr-FR')} €`, icon: Euro, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Factures en attente', value: stats.facturesAttente, icon: Clock, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour Badra 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Voici un résumé de ton activité Proxia</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleNotifications}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-violet-300 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Bell size={14} /> Activer notifications
          </button>
          <button
            onClick={openCalendly}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Calendar size={15} />
            Planifier un appel client
            <ExternalLink size={12} className="opacity-70" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`bg-white border ${kpi.border} rounded-2xl p-5 shadow-sm`}>
              <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={kpi.color} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{loading ? '…' : kpi.value}</div>
              <div className="text-gray-500 text-xs mt-1">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Graphique CA */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Évolution CA — 6 mois</h2>
          {chartData.some(d => d.ca > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                <Tooltip formatter={(v) => [`${v} €`, 'CA']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="ca" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              Aucune facture payée pour le moment
            </div>
          )}
        </div>

        {/* RDV aujourd'hui */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-violet-600" /> RDV aujourd'hui
          </h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Chargement…</p>
          ) : rdvToday.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun RDV programmé aujourd'hui</p>
          ) : (
            <div className="space-y-3">
              {rdvToday.map(rdv => (
                <div key={rdv.id} className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rdv.titre || 'Événement'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(rdv.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {rdv.description ? ` · ${rdv.description}` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
                    {rdv.type || 'rdv'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Voir tous les leads */}
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 shadow-sm lg:col-span-2 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-violet-200 text-sm font-medium">Objectif août 2026</p>
            <p className="text-white text-3xl font-bold mt-1">
              {stats.caTotal.toLocaleString('fr-FR')} € <span className="text-violet-300 text-lg font-normal">/ 10 000 €</span>
            </p>
            <div className="mt-4 h-2 w-64 max-w-full bg-violet-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${Math.min((stats.caTotal / 10000) * 100, 100)}%` }}
              />
            </div>
          </div>
          <button
            onClick={goToLeads}
            className="flex items-center gap-2 bg-white text-violet-700 hover:bg-violet-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            Voir tous les leads <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
