import { Users, FileText, Clock, Euro } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate, STATUT_LEAD_COLORS, STATUT_LEAD_LABELS } from '../utils/crm';

export default function DashboardHome({ crm }) {
  const { leads, clients, devis, factures, getCATotal, getCAParMois } = crm;

  const caTotal = getCATotal();
  const devisNonSignes = devis.filter(d => d.statut === 'envoyé' || d.statut === 'brouillon').length;
  const facturesImpayees = factures.filter(f => f.statut === 'en_attente' || f.statut === 'retard').length;
  const clientsActifs = clients.filter(c => c.statut === 'actif').length;
  const chartData = getCAParMois();

  const kpis = [
    {
      label: 'Clients actifs',
      value: clientsActifs,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
    },
    {
      label: 'CA total payé',
      value: `${caTotal.toLocaleString('fr-FR')} €`,
      icon: Euro,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Devis non signés',
      value: devisNonSignes,
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
    {
      label: 'Factures impayées',
      value: facturesImpayees,
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
  ];

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.dateAjout) - new Date(a.dateAjout))
    .slice(0, 5);

  const recentDevis = [...devis]
    .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
    .slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bonjour Badra 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Voici un résumé de ton activité Proxia</p>
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
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
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

        {/* Activité récente — Leads */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Derniers leads</h2>
          {recentLeads.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun lead pour le moment</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.nom}</p>
                    <p className="text-xs text-gray-500">{lead.commerce} · {lead.ville} · {formatDate(lead.dateAjout)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUT_LEAD_COLORS[lead.statut]}`}>
                    {STATUT_LEAD_LABELS[lead.statut]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devis récents */}
        {recentDevis.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Derniers devis</h2>
            <div className="space-y-3">
              {recentDevis.map(d => (
                <div key={d.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.id} — {d.clientNom}</p>
                    <p className="text-xs text-gray-500">{formatDate(d.dateCreation)} · Valide jusqu'au {formatDate(d.dateValidite)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">{d.total?.toLocaleString('fr-FR')} €</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      d.statut === 'signé' ? 'bg-green-100 text-green-700'
                      : d.statut === 'envoyé' ? 'bg-blue-100 text-blue-700'
                      : d.statut === 'refusé' ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                      {d.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Objectif */}
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-200 text-sm font-medium">Objectif août 2026</p>
              <p className="text-white text-3xl font-bold mt-1">
                {caTotal.toLocaleString('fr-FR')} € <span className="text-violet-300 text-lg font-normal">/ 10 000 €</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-violet-200 text-sm">{Math.round((caTotal / 10000) * 100)}% atteint</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-violet-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${Math.min((caTotal / 10000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
