import { useState, useEffect } from 'react';
import { generateId, generateDocId, addDays } from '../utils/crm';

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const DEMO_LEADS = [
  {
    id: 'LEAD-DEMO-001',
    nom: 'Thomas B.',
    commerce: 'Restaurant',
    ville: 'Clichy',
    telephone: '0601020304',
    email: 'thomas@lesoleil.fr',
    statut: 'nouveau',
    notes: 'Rencontré lors de la prospection rue de Paris',
    dateAjout: new Date(Date.now() - 2 * 86400000).toISOString(),
    sourceContact: 'terrain',
  },
  {
    id: 'LEAD-DEMO-002',
    nom: 'Marie D.',
    commerce: 'Salon',
    ville: 'Asnières',
    telephone: '0607080910',
    email: 'marie@salonelegance.fr',
    statut: 'contacté',
    notes: 'Intéressée par le pack Visibilité, rappeler jeudi',
    dateAjout: new Date(Date.now() - 5 * 86400000).toISOString(),
    sourceContact: 'instagram',
  },
  {
    id: 'LEAD-DEMO-003',
    nom: 'Pierre T.',
    commerce: 'Garage',
    ville: 'Saint-Denis',
    telephone: '0611121314',
    email: '',
    statut: 'rdv_planifié',
    notes: 'RDV audit prévu vendredi à 14h',
    dateAjout: new Date(Date.now() - 7 * 86400000).toISOString(),
    sourceContact: 'referral',
  },
];

const DEMO_CLIENTS = [
  {
    id: 'CLIENT-DEMO-001',
    nom: 'Emma K.',
    commerce: 'Salon de beauté',
    ville: 'Clichy',
    telephone: '0622334455',
    email: 'emma@salonbeaute.fr',
    statut: 'actif',
    packAcheté: 'visibilité_350',
    montantPayé: 350,
    dateDebut: new Date(Date.now() - 15 * 86400000).toISOString(),
    dateLivraison: new Date(Date.now() + 5 * 86400000).toISOString(),
    notes: 'Très satisfaite du suivi. Souhaite potentiellement le pack Efficacité.',
    projetUrl: '',
  },
  {
    id: 'CLIENT-DEMO-002',
    nom: 'BoutiqueConnect',
    commerce: 'Plateforme e-commerce',
    ville: 'Paris',
    telephone: '0633445566',
    email: 'contact@boutiqueconnect.fr',
    statut: 'livré',
    packAcheté: 'custom',
    montantPayé: 600,
    dateDebut: new Date(Date.now() - 30 * 86400000).toISOString(),
    dateLivraison: new Date(Date.now() - 5 * 86400000).toISOString(),
    notes: 'Projet livré avec succès. Site + chatbot IA.',
    projetUrl: 'https://boutiqueconnect.fr',
  },
];

const DEMO_FACTURES = [
  {
    id: 'FAC-001',
    devisId: '',
    clientNom: 'BoutiqueConnect',
    montant: 600,
    statut: 'payée',
    dateEmission: new Date(Date.now() - 30 * 86400000).toISOString(),
    dateEcheance: new Date(Date.now() - 25 * 86400000).toISOString(),
    dateReglement: new Date(Date.now() - 28 * 86400000).toISOString(),
    modePaiement: 'stripe',
  },
  {
    id: 'FAC-002',
    devisId: '',
    clientNom: 'Emma K.',
    montant: 175,
    statut: 'payée',
    dateEmission: new Date(Date.now() - 15 * 86400000).toISOString(),
    dateEcheance: new Date(Date.now() - 10 * 86400000).toISOString(),
    dateReglement: new Date(Date.now() - 14 * 86400000).toISOString(),
    modePaiement: 'virement',
  },
  {
    id: 'FAC-003',
    devisId: '',
    clientNom: 'Emma K.',
    montant: 175,
    statut: 'en_attente',
    dateEmission: new Date(Date.now() - 5 * 86400000).toISOString(),
    dateEcheance: addDays(new Date().toISOString(), 25),
    dateReglement: null,
    modePaiement: 'stripe',
  },
];

const DEMO_PROSPECTS = [
  {
    id: 'PROSPECT-DEMO-001',
    nom: 'Marie M.',
    commerce: 'Salon Nails & Beauty',
    ville: 'Levallois',
    telephone: '0644556677',
    email: 'marie@nailsbeauty.fr',
    statut: 'audit_fait',
    dateContact: new Date(Date.now() - 4 * 86400000).toISOString(),
    dateRdv: new Date(Date.now() - 3 * 86400000).toISOString(),
    notesAudit: 'Pas de site, Google Maps non revendiqué, très motivée',
    packInteresse: 'visibilité_350',
    scoreInteret: 4,
    prochainAction: 'Envoyer devis cette semaine',
    dateProchainAction: addDays(new Date().toISOString(), 2),
  },
  {
    id: 'PROSPECT-DEMO-002',
    nom: 'Lucas S.',
    commerce: 'Restaurant Le Bistrot du Coin',
    ville: 'Clichy',
    telephone: '0655667788',
    email: '',
    statut: 'rdv_planifié',
    dateContact: new Date(Date.now() - 1 * 86400000).toISOString(),
    dateRdv: addDays(new Date().toISOString(), 3),
    notesAudit: '',
    packInteresse: 'efficacite_600',
    scoreInteret: 3,
    prochainAction: 'RDV mardi 14h',
    dateProchainAction: addDays(new Date().toISOString(), 3),
  },
];

export default function useCRM() {
  const [leads, setLeads] = useState(() => load('proxia_leads', DEMO_LEADS));
  const [clients, setClients] = useState(() => load('proxia_clients', DEMO_CLIENTS));
  const [devis, setDevis] = useState(() => load('proxia_devis', []));
  const [factures, setFactures] = useState(() => load('proxia_factures', DEMO_FACTURES));
  const [agenda, setAgenda] = useState(() => load('proxia_agenda', []));
  const [prospects, setProspects] = useState(() => load('proxia_prospects', DEMO_PROSPECTS));

  useEffect(() => { localStorage.setItem('proxia_leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('proxia_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('proxia_devis', JSON.stringify(devis)); }, [devis]);
  useEffect(() => { localStorage.setItem('proxia_factures', JSON.stringify(factures)); }, [factures]);
  useEffect(() => { localStorage.setItem('proxia_agenda', JSON.stringify(agenda)); }, [agenda]);
  useEffect(() => { localStorage.setItem('proxia_prospects', JSON.stringify(prospects)); }, [prospects]);

  // LEADS
  const addLead = (lead) => {
    const now = new Date().toISOString();
    setLeads(prev => [...prev, {
      ...lead,
      id: generateId('LEAD'),
      dateAjout: now,
    }]);
  };

  const updateLead = (id, updates) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLead = (id) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const convertLeadToClient = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const newClient = {
      id: generateId('CLIENT'),
      nom: lead.nom,
      commerce: lead.commerce,
      ville: lead.ville,
      telephone: lead.telephone,
      email: lead.email || '',
      statut: 'actif',
      packAcheté: 'visibilité_350',
      montantPayé: 0,
      dateDebut: new Date().toISOString(),
      dateLivraison: addDays(new Date().toISOString(), 10),
      notes: lead.notes || '',
      projetUrl: '',
    };
    setClients(prev => [...prev, newClient]);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    return newClient;
  };

  // CLIENTS
  const addClient = (client) => {
    setClients(prev => [...prev, {
      ...client,
      id: generateId('CLIENT'),
      dateDebut: new Date().toISOString(),
    }]);
  };

  const updateClient = (id, updates) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // PROSPECTS
  const addProspect = (p) => {
    setProspects(prev => [...prev, {
      ...p,
      id: generateId('PROSPECT'),
      dateContact: new Date().toISOString(),
    }]);
  };

  const updateProspect = (id, updates) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProspect = (id) => {
    setProspects(prev => prev.filter(p => p.id !== id));
  };

  const convertProspectToClient = (prospectId) => {
    const p = prospects.find(x => x.id === prospectId);
    if (!p) return;
    addClient({
      nom: p.nom,
      commerce: p.commerce,
      ville: p.ville,
      telephone: p.telephone,
      email: p.email || '',
      statut: 'actif',
      packAcheté: p.packInteresse === 'visibilité_350' ? 'visibilité_350'
        : p.packInteresse === 'efficacite_600' ? 'efficacite_600'
        : p.packInteresse === 'agent_ia_100' ? 'agent_ia_100mois'
        : 'custom',
      montantPayé: 0,
      dateDebut: new Date().toISOString(),
      dateLivraison: addDays(new Date().toISOString(), 10),
      notes: p.notesAudit || '',
      projetUrl: '',
    });
    setProspects(prev => prev.filter(x => x.id !== prospectId));
  };

  // DEVIS
  const addDevis = (d) => {
    const now = new Date().toISOString();
    const newId = generateDocId('DEV', devis);
    const newDevis = {
      ...d,
      id: newId,
      dateCreation: now,
      dateValidite: addDays(now, 30),
      statut: d.statut || 'brouillon',
    };
    setDevis(prev => [...prev, newDevis]);
    return newDevis;
  };

  const updateDevis = (id, updates) => {
    setDevis(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDevis = (id) => {
    setDevis(prev => prev.filter(d => d.id !== id));
  };

  // FACTURES
  const addFacture = (f) => {
    const now = new Date().toISOString();
    const newId = generateDocId('FAC', factures);
    setFactures(prev => [...prev, {
      ...f,
      id: newId,
      dateEmission: now,
      dateEcheance: addDays(now, 30),
      statut: f.statut || 'en_attente',
      dateReglement: null,
    }]);
  };

  const updateFacture = (id, updates) => {
    setFactures(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const marquerPayee = (id) => {
    updateFacture(id, { statut: 'payée', dateReglement: new Date().toISOString() });
  };

  // AGENDA
  const addEvent = (event) => {
    setAgenda(prev => [...prev, { ...event, id: generateId('EVT') }]);
  };

  const updateEvent = (id, updates) => {
    setAgenda(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvent = (id) => {
    setAgenda(prev => prev.filter(e => e.id !== id));
  };

  // COMPUTED
  const getCATotal = () =>
    factures.filter(f => f.statut === 'payée').reduce((sum, f) => sum + (f.montant || 0), 0);

  const getCAMois = () => {
    const mois = new Date().getMonth();
    const annee = new Date().getFullYear();
    return factures
      .filter(f => f.statut === 'payée' && new Date(f.dateReglement || f.dateEmission).getMonth() === mois && new Date(f.dateReglement || f.dateEmission).getFullYear() === annee)
      .reduce((sum, f) => sum + (f.montant || 0), 0);
  };

  const getLeadsEnRetard = () => {
    const now = new Date();
    return leads.filter(l => {
      if (l.statut === 'contacté' || l.statut === 'perdu') return false;
      const relance1 = new Date(l.dateAjout);
      relance1.setDate(relance1.getDate() + 2);
      return relance1 < now;
    });
  };

  const getCAParMois = () => {
    const map = {};
    factures.filter(f => f.statut === 'payée').forEach(f => {
      const d = new Date(f.dateReglement || f.dateEmission);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + (f.montant || 0);
    });
    const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return { mois: moisLabels[d.getMonth()], ca: map[key] || 0 };
    });
  };

  return {
    leads, clients, devis, factures, agenda, prospects,
    addLead, updateLead, deleteLead, convertLeadToClient,
    addClient, updateClient, deleteClient,
    addProspect, updateProspect, deleteProspect, convertProspectToClient,
    addDevis, updateDevis, deleteDevis,
    addFacture, updateFacture, marquerPayee,
    addEvent, updateEvent, deleteEvent,
    getCATotal, getCAMois, getLeadsEnRetard, getCAParMois,
  };
}
