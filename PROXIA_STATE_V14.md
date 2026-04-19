# Proxia State V14

## Bugs corrigés
- BUG 1 — Bouton "+ Ajouter aux Leads" (SuiviAppels) : insert Supabase leads avec payload {nom, telephone, ville, type_commerce, canal, score, statut, created_at} + toast succès/erreur + console.log + fermeture modal + reload
- BUG 2 — Recherche client Devis/Factures : autocomplete Supabase clients (ilike), client_id stocké et envoyé dans payload (`addDevis` / `addFacture`), dropdown stylé dark `bg-gray-800 border-purple-500`, hover `bg-purple-900/50`, texte blanc
- BUG 3 — Modal SuiviAppels : overlay `items-start pt-4 pb-4 overflow-y-auto`, conteneur `max-h-[90vh] my-4`, titre toujours visible sticky
- BUG 4 — Bouton "Ajouter au CRM" Prospection IA : `handleAddToCRM` async, insert Supabase `leads` avec payload simplifié {nom, telephone, ville, type_commerce, canal: 'prospection_ia', score, statut: 'nouveau', notes, created_at}, fonction `extraitVille` regex `\d{5}\s+([^,]+)`, toast + console.log

## Migration Supabase
À exécuter dans SQL Editor :
```sql
ALTER TABLE devis ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE factures ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
```

## Audit dashboard
- DashboardHome.jsx : OK — KPIs, chart recharts, lien Calendly externe (target/rel) OK
- Leads.jsx : OK — fetch Supabase realtime, add/update/delete/import JSON/convert all wired
- Prospects.jsx : OK — kanban, add/move/convert/delete via crm hook localStorage
- Clients.jsx : OK — onglets infos/projet/documents/notes, CRUD via crm hook + localStorage
- Devis.jsx : OK + correction client_id + dropdown dark
- Factures.jsx : OK + correction client_id + dropdown dark
- Agenda.jsx : OK — FullCalendar, dateClick/eventClick gérés via Supabase
- AssistantIA.jsx : OK — Gemini chat, contexte Supabase live, bouton Calendly
- Prospection.jsx : OK + handleAddToCRM réécrit simple + payload spec utilisateur
- SuiviAppels.jsx : OK — CRUD Supabase, relances auto, WhatsApp templates

## Commit
Voir `git log -1` après push.
