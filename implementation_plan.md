# Widget Filebrowser Quantum

Il piano prevede l'integrazione di un nuovo widget per mostrare lo spazio disco di Filebrowser Quantum tramite una progress bar circolare, seguendo rigorosamente l'architettura a 4 livelli imposta dalle regole di TheView.

## User Review Required
Il piano richiede l'approvazione per procedere. Eventuali aggiunte (es. visualizzazione ultimi file) possono essere fatte, ma `/api/usage` di Filebrowser è lo standard per lo spazio. Filebrowser non espone API complesse native, quindi mi concentrerò sullo spazio disco.

## Proposed Changes

### [Database & Admin Settings]
- **MODIFY** `src/lib/server/db/schema.ts`
  - Aggiunta campi `filebrowser_url`, `filebrowser_username`, `filebrowser_password`, `filebrowser_require_auth` nella tabella `settings`.
- **MODIFY** `src/lib/server/db/index.ts`
  - Aggiunta logica di migrazione manuale retrocompatibile con `PRAGMA table_info` per creare le nuove colonne senza usare Drizzle `migrate()`.
- **MODIFY** `src/routes/admin/components/AdminWidgets.svelte`
  - Inserimento del form `WidgetSettingsForm` per configurare le credenziali di Filebrowser con crittografia.

### [Proxy API (Backend)]
- **NEW** `src/routes/api/widgets/filebrowser/+server.ts`
  - Login protetto `POST {url}/api/login` per ottenere il token JWT (`X-Auth`).
  - Fetch `GET {url}/api/usage` per recuperare total e used space.
  - Risposta JSON pulita per il client con il calcolo percentuale dello spazio.
  - Gestione di TLS self-signed tramite custom `undici` Agent.

### [TanStack Query & Constraints]
- **NEW** `src/lib/queries/useFilebrowser.ts`
  - Hook TanStack `createQuery` con intervallo 30s.
- **MODIFY** `src/lib/config/widgetConstraints.ts`
  - Registrazione del vincolo widget `filebrowser` (es. `1x1`).
- **MODIFY** `src/lib/components/ServiceForm.svelte`
  - Aggiunta dell'opzione `FILEBROWSER` al selettore del widget.

### [Widget UI (Frontend)]
- **NEW** `src/lib/components/widgets/FilebrowserWidget.svelte`
  - Integrazione Svelte 5 con `$props` per ricevere il `service`.
  - Stato di Skeleton animato (`animate-pulse`) durante il fetch.
  - Stato di Errore (badge o icona).
  - Progress bar circolare (SVG o conic-gradient Tailwind v4) che mostra la percentuale di occupazione.
  - Info testuale formattata (es. `45 GB / 100 GB`).

## Verification Plan
1. Modifica del file `ServiceForm.svelte` per verificare che l'opzione widget sia visibile.
2. Inserimento credenziali mock in AdminWidgets per testare il form.
3. Test dummy su una route API locale o verifica del codice scritto per assicurare robustezza e formattazione con Tailwind v4.
