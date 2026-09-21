Sei un AI specializzata in Svelte 5, Tailwind v4 e UI/UX design (shadcn-svelte).
Devi analizzare in modo approfondito e sistemare l'architettura dei Widget nella nostra dashboard "TheView" (Bento Grid basata su Gridstack.js).

### OBIETTIVO E STATO ATTUALE
Attualmente abbiamo un'architettura ibrida e confusa. Esistono le `ServiceCard` (che rappresentano un servizio web con icona e URL) che possono avere un widget espandibile collegato. Abbiamo recentemente introdotto l'idea di **"Widget Standalone"**: widget indipendenti che non sono legati a nessun URL o icona di servizio (es. Orologio, Meteo, risorse Docker), che dovrebbero comportarsi come pure "WidgetCards" (simili alla `BlankCard`).

**Il problema:** I Widget Standalone sono stati forzati all'interno dell'entità database `services` impostando una flag `isWidget: true` (e `widgetType`), ma ereditano ancora UI e flussi pensati per le `ServiceCard`. 
Questo causa continui bug di UI (es. modali di modifica che vanno in crash, form che mostrano URL e icone per widget standalone, filtraggi errati nella lista servizi Admin).

### COSA VOGLIAMO OTTENERE
1. **Netta separazione UI/UX:**
   - **ServiceCard (con o senza Widget):** Ha un link, un'icona, un nome. Se ha un widget configurato, lo mostra nell'espansione. Il suo Edit Sheet permette di modificare nome, URL, icona (tramite `ServiceForm`) E le impostazioni del widget ad esso allegato (tramite `EditWidgetSettingsCard`).
   - **Widget Standalone:** È *solo* un widget. Non ha URL, non ha un'icona di servizio cliccabile. Occupa il 100% della cella nella griglia. Il suo Edit Sheet DEVE essere minimale: permette solo di eliminarlo o di modificarne le impostazioni globali (tramite `EditWidgetSettingsCard`), senza caricare `ServiceForm`.
2. **Coerenza nel Drag & Drop (Gridstack):** I widget standalone devono poter essere aggiunti dalla UI (tramite il Widget Modal), trascinati nella griglia e mantenere le loro coordinate (`x`, `y`, `w`, `h`) senza glitch.
3. **Pannello Admin Pulito:** I widget standalone **NON** devono apparire nella lista dei servizi in `AdminServices.svelte`. Devono esistere solo visivamente nella Bento Grid.
4. **Globale "Require Auth":** Tutti i widget (sia attaccati ai servizi, sia standalone) devono rispettare la regola `requireAuth` nascosti agli utenti non loggati, basandosi sul file `WidgetRegistry.ts`.

### TASK RICHIESTI
1. Usa gli strumenti a tua disposizione per analizzare i seguenti file e trovare i colli di bottiglia e i bug logici attuali:
   - `src/lib/components/ServiceCard.svelte` (Analizza come discrimina `isStandalone` e come chiama `startEdit`).
   - `src/lib/components/card/CardWidget.svelte` (Analizza la presenza o assenza del pulsante "matita" per i widget standalone).
   - `src/lib/components/EditServiceSheet.svelte` (Analizza la logica di apertura, lo stato `$derived` vs `$state` e come renderizza i form per le diverse entità per evitare crash).
   - `src/routes/api/services/create/+server.ts` (Verifica come vengono creati nel DB i widget standalone).
2. Scrivi un **Implementation Plan** strutturato per unificare e ripulire questa architettura, in modo che il codice smetta di "combattere" con se stesso.
3. Attendi la mia approvazione, poi procedi a sistemare il codice un file alla volta, applicando le best practice di Svelte 5 (Runes).

Non usare workaround: voglio un'architettura solida, stabile e logica.
