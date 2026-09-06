# 🪐 TheView - Antigravity Vibecoding Context

Benvenuto! Se stai leggendo questo file, sei una nuova istanza di Antigravity incaricata di lavorare su **TheView**.
Questo file contiene tutto il contesto, l'architettura e il metodo di lavoro per questo progetto, in modo da poterti allineare immediatamente allo stack e alle preferenze dello sviluppatore.

## 📌 Cos'è TheView?

**TheView** è una dashboard web moderna per homelab e self-hosting, concepita come alternativa leggera, esteticamente appagante e dinamica. Il suo scopo è raccogliere i link ai vari servizi (Docker, web apps, ecc.) in un'unica pagina organizzata per categorie.
Sta affrontando una transizione architetturale verso un layout a "Bento Box" per supportare futuri widget interattivi (es. AdGuard Home, qBittorrent, Jellyfin), controlli drag & drop ottimizzati e Discovery automatica (da Docker e NPM).

## 🛠️ Tech Stack & Standard

- **Framework:** SvelteKit (con Node Adapter)
- **Motore UI:** Svelte 5 (uso estensivo di Runes: `$state`, `$derived`, `$effect`, `onclick`)
- **Libreria Componenti:** `shadcn-svelte` (Primitivi accessibili, bordi netti, design minimale)
- **Stile:** Tailwind CSS (con variabili CSS per gestire temi multipli e dinamici)
- **Iconografia Rigorosa:**
  - **Servizi/Brand:** ESCLUSIVAMENTE `dashboard-icons` (walkxcode). La logica di fallback per trovare l'icona è: Immagine Container -> Nome Container -> Alias nel dizionario -> Dominio.
  - **UI Strutturale & Fallback:** ESCLUSIVAMENTE `lucide-svelte` (per Navbar, bottoni, search bar, modali e come icona generica se un servizio non ha un logo).
- **Database:** SQLite tramite `better-sqlite3` e `drizzle-orm`
- **Autenticazione:** Sessioni JWT salvate in cookie (`admin_session`)

## 📂 Struttura del Progetto (Punti Chiave)

- `src/routes/+page.svelte`: La dashboard pubblica principale. Sfrutta CSS Grid per un layout "Bento Box" dove le tile possono assumere dimensioni dinamiche (1x1, 2x1, 2x2) in base al campo `size` del DB.
- `src/routes/admin/...`: Pannello di amministrazione. Include la gestione dei backup SQLite in "Impostazioni".
- `src/lib/server/discovery.ts`: Core logic per interrogare il demone Docker. Le verifiche degli update dei container avvengono ESCLUSIVAMENTE confrontando il digest SHA256 locale con quello remoto (su GHCR o DockerHub), interrogando i registry tramite il nome dell'immagine (es. `ghcr.io/user/repo:latest`). Non usare mai il `container_id`.
- `data/`: Cartella persistita fuori dal container. Contiene ESCLUSIVAMENTE il DB SQLite (`sqlite.db`) che funge da Single Source of Truth per impostazioni, servizi e credenziali crittografate, e le icone caricate dagli utenti (`icons/`). Non introdurre file di configurazione JSON secondari.
- `.gemini/`: Cartella **dedicata all'agente Antigravity**. Usala per generare script di prova, salvare backup temporanei di file da modificare, prendere note, o lasciare artefatti testuali (`scratch files`). **Non inquinare mai la root del progetto**.

## ⚙️ Metodologia di Lavoro e Workflow

Quando scrivi codice per TheView, segui _strettamente_ queste linee guida:

1. **Codice Pulito (Clean Slate):** Stiamo migrando verso shadcn-svelte. Se modifichi un componente, non creare codice ibrido. Rimuovi le vecchie utility classi Tailwind custom e usa i primitivi puliti di shadcn.
2. **Svelte 5 Runes:** Utilizza ESCLUSIVAMENTE la sintassi di Svelte 5.
   - Variabili reattive: `let count = $state(0);`
   - Props: `let { myProp } = $props();`
   - Eventi: `onclick={(e: Event) => handler()}` (Usa tipi stretti per gli eventi inline!)
3. **Protezione CSRF:** Affidiamoci alla protezione CSRF nativa di SvelteKit. Non disabilitare `checkOrigin` in `svelte.config.js`.
4. **UX Mobile e Interazione:**
   - Limita sempre il drag & drop esclusivamente a un apposito drag-handle (icona Lucide) per non bloccare lo scroll su smartphone.
   - Modifica "In-Place": Le card si convertono nel form di modifica espandendosi all'interno della griglia cliccando sull'icona delle impostazioni, senza lanciare popup modali o quickedit rapidi da chiuse.
5. **Drizzle ORM e Migrazioni:** Non alterare mai lo schema SQLite a mano. Usa sempre `drizzle-kit generate` e assicurati che la funzione `migrate()` venga eseguita all'avvio dell'app o dopo il ripristino di un backup del database caricato dall'utente.
6. **Accessibilità Svelte (A11y):** Svelte 5 è molto severo con l'accessibilità. Usa `role="presentation"` o `role="none"` per sopprimere errori su div non interattivi usati per la propagazione degli eventi. Unisci i commenti `svelte-ignore` se multipli.

Buon vibecoding! Mantieni il codice pulito, non avere paura di fare "tabula rasa" di vecchi componenti per abbracciare shadcn-svelte, testa sempre con build locali e prediligi un approccio iterativo.
