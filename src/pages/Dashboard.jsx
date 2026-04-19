import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, UserSearch, Users, FileText, Receipt,
  Calendar, Bot, LogOut, Menu, Target, Download, Crosshair, ClipboardList,
  Sun, Moon
} from 'lucide-react';
import useCRM from '../hooks/useCRM';
import DashboardHome from '../dashboard/DashboardHome';
import Leads from '../dashboard/Leads';
import Prospects from '../dashboard/Prospects';
import Clients from '../dashboard/Clients';
import Devis from '../dashboard/Devis';
import Factures from '../dashboard/Factures';
import Agenda from '../dashboard/Agenda';
import AssistantIA from '../dashboard/AssistantIA';
import Prospection from '../dashboard/Prospection';
import SuiviAppels from '../dashboard/SuiviAppels';

const PIN_KEY = 'proxia_auth';
const CORRECT_PIN = '2611';

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: UserSearch },
  { id: 'prospects', label: 'Prospects', icon: Target },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'devis', label: 'Devis', icon: FileText },
  { id: 'factures', label: 'Factures', icon: Receipt },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'assistant', label: 'Assistant IA', icon: Bot },
  { id: 'prospection', label: 'Prospection IA', icon: Crosshair },
  { id: 'suivi-appels', label: 'Suivi Appels', icon: ClipboardList },
];

const LEADS_TEMPLATE = [
  {
    nom: 'Exemple Restaurant',
    commerce: 'Restaurant',
    ville: 'Clichy',
    telephone: '0600000001',
    email: 'contact@exemple.fr',
    sourceContact: 'google_maps',
    notes: '4.2 étoiles Google, 47 avis, pas de site web',
  },
  {
    nom: 'Salon Beauté Exemple',
    commerce: 'Salon',
    ville: 'Levallois',
    telephone: '0600000002',
    email: '',
    sourceContact: 'terrain',
    notes: 'Rencontré en prospection, très intéressée',
  },
];

function downloadTemplate() {
  const blob = new Blob([JSON.stringify(LEADS_TEMPLATE, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads_template.json';
  a.click();
  URL.revokeObjectURL(url);
}

function PinScreen({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKey = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === CORRECT_PIN) {
            localStorage.setItem(PIN_KEY, CORRECT_PIN);
            onSuccess();
          } else {
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 1500);
          }
        }, 100);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-2xl">P</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Proxia CRM</h1>
          <p className="text-gray-400 text-sm mt-1">Entrez votre code PIN</p>
        </div>

        <div className={`flex gap-3 justify-center mb-8 ${error ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all ${
              i < pin.length ? (error ? 'bg-red-500' : 'bg-violet-500') : 'bg-gray-700'
            }`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1,2,3,4,5,6,7,8,9].map(d => (
            <button key={d} onClick={() => handleKey(String(d))}
              className="h-14 bg-gray-800 hover:bg-gray-700 text-white text-xl font-semibold rounded-xl transition-colors active:bg-violet-700"
            >
              {d}
            </button>
          ))}
          <div />
          <button onClick={() => handleKey('0')}
            className="h-14 bg-gray-800 hover:bg-gray-700 text-white text-xl font-semibold rounded-xl transition-colors active:bg-violet-700"
          >
            0
          </button>
          <button onClick={() => setPin(p => p.slice(0, -1))}
            className="h-14 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-xl transition-colors"
          >
            ⌫
          </button>
        </div>

        {error && <p className="text-red-400 text-center text-sm mt-2">Code incorrect</p>}
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(PIN_KEY) === CORRECT_PIN);
  const [activeView, setActiveView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('proxia-theme') || 'dark');
  const crm = useCRM();

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('proxia-theme', theme);
    return () => {
      // Au démontage du dashboard on retire le thème pour ne pas polluer le site vitrine
      document.documentElement.classList.remove('light');
    };
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const VIEWS = {
    home: DashboardHome,
    leads: Leads,
    prospects: Prospects,
    clients: Clients,
    devis: Devis,
    factures: Factures,
    agenda: Agenda,
    assistant: AssistantIA,
    prospection: Prospection,
    'suivi-appels': SuiviAppels,
  };

  if (!authed) return <PinScreen onSuccess={() => setAuthed(true)} />;

  const logout = () => {
    localStorage.removeItem(PIN_KEY);
    setAuthed(false);
  };

  const ActiveComponent = VIEWS[activeView] || DashboardHome;

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">P</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Proxia CRM</p>
            <p className="text-gray-400 text-xs">Badra Traoré</p>
          </div>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-1">
        <button
          onClick={downloadTemplate}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
        >
          <Download size={15} />
          Template import leads
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F172A] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile (drawer) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#0F172A] z-50 flex flex-col md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-700" />
          </button>
          <span className="font-bold text-gray-900 text-sm">
            {NAV_ITEMS.find(n => n.id === activeView)?.label}
          </span>
          <div className="w-9" />
        </div>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ActiveComponent crm={crm} setActiveView={setActiveView} />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav — 5 premiers items */}
        <nav className="md:hidden flex bg-white border-t border-gray-200">
          {[NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[3], NAV_ITEMS[7]].map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex-1 flex flex-col items-center py-2 gap-1 text-[10px] transition-colors ${
                  isActive ? 'text-violet-600' : 'text-gray-400'
                }`}
              >
                <Icon size={18} />
                {item.label.split(' ')[0]}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
