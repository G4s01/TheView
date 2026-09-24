# 🪐 TheView - Antigravity Vibecoding Context

Benvenuto! Questo file contiene il contesto architetturale, i vincoli di sicurezza e il metodo di lavoro per **TheView**, progettato per massimizzare la tua autonomia e accuratezza tramite le **Skill locali** e il **Server MCP** integrati nel workspace.

## 📌 Cos'è TheView?

**TheView** è una dashboard web moderna per homelab e self-hosting. Utilizza un layout "Bento Grid" (Tetris-style) per organizzare link e widget interattivi in formati dinamici (1x1, 1x2, 2x1, 2x2). I widget integrati (Meteo, Docker, Dockhand, qBittorrent, AdGuard Home, FileBrowser, Beszel, WgEasy, Duplicati, Jellyfin, Clock, OpenWRT) offrono controllo diretto sui servizi tramite proxy SvelteKit e polling con TanStack Query.

## 🧠 INTEGRAZIONE SKILL E MCP (OBBLIGATORIA)

Per garantirti sempre il contesto più aggiornato e idiomatico, devi **SEMPRE** consultare e attivare le seguenti Skill a seconda del task in corso:

- 🟠 **Svelte 5 & SvelteKit**:
  - **Tooling (MCP):** Usa sempre il tool MCP `@sveltejs/mcp` (in `.agents/plugins/svelte-ai/`) per interrogare la documentazione ufficiale se hai dubbi sulle API.
  - **Skill:** Attiva `svelte-core-bestpractices` e `svelte-code-writer` per garantire un uso corretto e idiomatico di Runes (`$state`, `$derived`, `$props`, `$effect`, `$effect.pre`).
- 🎨 **UI, Styling & Componenti**:
  - **Skill:** Attiva `shadcn-svelte` e `tailwind-v4-shadcn`. Usa la CLI di shadcn-svelte per aggiungere primitivi. Usa esplicitamente le utility v4 di Tailwind (es. `size-*`, gap flessibili) senza incappare in pattern legacy di v3.
- 🗄️ **Database (SQLite)**:
  - **Skill:** Attiva `drizzle` quando lavori sullo schema o sulle query.
- 🔄 **Data Fetching**:
  - **Skill:** Attiva `tanstack-query-best-practices` per gestire il caching, i polling e le mutazioni lato client. TanStack Query è già integrato (`@tanstack/svelte-query`) e configurato nel layout.

### Skill Disponibili (`.agents/skills/`)

| Skill                           | Quando Attivarla                                   |
| ------------------------------- | -------------------------------------------------- |
| `svelte-core-bestpractices`     | Qualsiasi modifica a file `.svelte` o `.svelte.ts` |
| `svelte-code-writer`            | Creazione/analisi componenti Svelte 5              |
| `shadcn-svelte`                 | Aggiunta/modifica componenti UI, uso CLI shadcn    |
| `tailwind-v4-shadcn`            | Styling, theming, classi Tailwind v4               |
| `drizzle`                       | Schema DB, query, migrazioni                       |
| `tanstack-query-best-practices` | Polling, caching, mutazioni, `createQuery`         |

## 📂 Struttura e Volumi (Docker)

- `src/routes/+page.svelte`: Dashboard pubblica — Su Desktop usa Gridstack (Drag & Drop), mentre su Mobile applica overrrides CSS per imporre una flexbox a colonna che consente crescita e scroll verticali naturali. Altezza base `136px` per riga su Desktop.
- `src/routes/admin/...`: Pannello di amministrazione (tab: Servizi, Categorie, Discovery, **Widget**, Impostazioni).
- `src/lib/components/widgets/`: Widget interattivi.
- `src/lib/queries/`: Hook TanStack Query (`usePing.ts`, `useQbittorrent.ts`, `useAdGuard.ts`).
- `src/lib/config/widgetConstraints.ts`: Vincoli dimensionali per widget nella Bento Grid.
- `src/routes/api/widgets/`: Proxy endpoint per i widget (bypass CORS, autenticazione server-side).
- `data/`: Volume persistente unico. Contiene:
  - `sqlite.db`: Database SQLite.
  - `icons/`: Cartella per upload fisici (garbage collector al logout). **Divieto:** Mai scrivere file persistenti in `static/uploads`.

## 🏗️ ARCHITETTURA WIDGET

I widget seguono un pattern architetturale rigoroso a 4 livelli:

1. **Widget Registry** (`src/lib/config/widgetRegistry.ts`): Configurazione dei campi del widget. La UI (`/admin`) li legge e genera dinamicamente i form. I dati vengono poi salvati sulla tabella `settings` globale (es. `dockhand_require_auth`).
2. **Proxy API** (`src/routes/api/widgets/*/+server.ts`): Endpoint SvelteKit che decripta le credenziali, si autentica col servizio target e restituisce dati puliti. Gestisce TLS self-signed con `undici` Agent custom. **Deve implementare il blocco di sicurezza (Access Control).**
3. **TanStack Query Hook** (`src/lib/queries/use*.ts`): `createQuery` con `refetchInterval` configurato. Gestisce `isPending`, `isError`, `isSuccess`. Passa SEMPRE l'identificativo del servizio (`id`) e mai l'URL al backend, per evitare vulnerabilità SSRF.
4. **Widget UI** (`src/lib/components/widgets/*Widget.svelte`): Componente Svelte 5 che consuma il query hook e renderizza stati. Sfrutta il resize fisico (`bind:clientWidth`).

### Multi-Grid Drag & Drop (Gridstack.js)
- **Libreria Desktop:** `gridstack` integrato nativamente.
- **Layout Mobile:** Bypass a Flexbox a colonna su schermi piccoli (max-width: 1024px).
- **Cleanup Memoria:** Assicurati sempre di smontare esplicitamente i componenti orfani (con `unmount()`) quando Gridstack distrugge un nodo, per evitare leak di memoria e polling TanStack infiniti in background.

## 🛡️ REGOLE BACKEND E SICUREZZA (TASSATIVE)

1. **Access Control sui Widget (Fail-Closed):** Qualsiasi endpoint (`GET`, `POST`, `PUT`, `DELETE`) sotto `src/routes/api/widgets/` DEVE verificare l'autenticazione. 
   - I metodi `POST/PUT/DELETE` devono sempre avere come prima riga `if (!locals.isAdmin) return new Response('Unauthorized', { status: 401 });`.
   - I metodi `GET` devono recuperare le impostazioni globali e verificare la condizione di "Privilegiato":
     `const requireAuth = settings['WIDGET_require_auth'] === 'true' || settings['WIDGET_require_auth'] === true;`
     `if (requireAuth && !locals.isAdmin) return new Response('Unauthorized', { status: 401 });`
2. **Prevenzione SSRF:** Gli endpoint di fetch interni (come `ping/+server.ts` o proxy widget) devono obbligatoriamente ricevere l'`id` del database dal client, e mai URL raw, per poi risolvere internamente l'IP o il dominio interrogando SQLite.
3. **Nessun Bypass TLS Globale:** Vietato usare `process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"`. Inietta un `Agent` custom di `undici` solo nella specifica chiamata `fetch`.
4. **Mascheramento Password:** Gli endpoint di export o salvataggio configurazioni (es. `/api/settings`) non devono inviare password in chiaro al client; invia sempre la stringa `"********"`. In ricezione (salvataggio), escludi `"********"` dall'update crittografico.
5. **Integrità Database e Booleani SQLite:** Su Drizzle + SQLite i campi booleani possono a volte essere interpretati come numerici (0 o 1). Utilizza cast espliciti o letture attente se controlli campi della tabella `services`. 
6. **Migrazioni Safe:** Vietato usare `migrate()` in avvio su DB esistenti. Per aggiunta colonne, esegui query manuali con `PRAGMA table_info` per retrocompatibilità sui backup vecchi.

## 🎨 STRATEGIA UI E THEMING

1. **Theming Assoluto (Zero Legacy):** L'app usa variabili HSL root. È SEVERAMENTE VIETATO usare classi cromatiche hardcodate (es. `bg-white`, `text-green-500`). Usa ESCLUSIVAMENTE variabili semantiche shadcn (es. `bg-background`, `bg-card`, `text-muted-foreground`).
2. **Layout e Spaziature:** Usa `flex` combinato con `gap-*` (evita `space-y-*`). Usa `size-*` per width/height uguali.
3. **Bento Grid Fluidity (Physical Pixels):** I widget devono basare la responsività interna sulle loro dimensioni fisiche su schermo e non sulle coordinate Gridstack logiche. Usa sempre `bind:clientWidth={rectW}` e `bind:clientHeight={rectH}`.
4. **Modali e Dialoghi:** Mai modali custom sovrapposti. Usa i primitivi `<Dialog>` (Shadcn) per UI e `<AlertDialog>` per distruzioni.
5. **Stati di Caricamento (Skeleton):** Qualsiasi fetch (TanStack, SSR, lazy) DEVE essere accompagnato da uno `<Skeleton>` reattivo e non testo grezzo. 

## ⚙️ REGOLE DI VIBECODING

1. **Zero Regex:** Vietato usare `sed`, `awk` o script Python per iniettare codice, salvo piccoli fix chirurgici o task multipli su refactor dove `replace_file_content` fallisce. Cerca sempre l'analisi strutturale.
2. **Lavoro Modulare & Verifica:** Lavora su un file alla volta. Attento agli effetti collaterali del Runes `$effect`.
3. **Inizializza con la Ricerca:** Usa il tool MCP Svelte se non conosci le novità di Svelte 5 (es. unmount manuale, prop forwarding).
4. **Root Pulita (Zero Spazzatura):** MAI creare file temporanei (`script.ts`, `test.js`, `.txt`) nella root. Creali in `.gemini/scratch/`.
5. **Widget Pattern:** Segui SEMPRE i 4 livelli. Gestisci la formattazione dei boolean (che arrivano come stringhe) con precisione letale in fase di validazione.
