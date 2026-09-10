---
trigger: always_on
description: Contesto architetturale, vincoli e linee guida di TheView, con istruzioni esplicite sull'utilizzo delle skill e dell'MCP.
---

# 🪐 TheView - Antigravity Vibecoding Context

Benvenuto! Questo file contiene il contesto architetturale, i vincoli di sicurezza e il metodo di lavoro per **TheView**, progettato per massimizzare la tua autonomia e accuratezza tramite le **Skill locali** e il **Server MCP** integrati nel workspace.

## 📌 Cos'è TheView?

**TheView** è una dashboard web moderna per homelab e self-hosting. Utilizza un layout "Bento Grid" (Tetris-style) per organizzare link e widget interattivi in formati dinamici (1x1, 1x2, 2x1, 2x2). I widget integrati (qBittorrent, AdGuard Home) offrono controllo diretto sui servizi tramite proxy SvelteKit e polling con TanStack Query.

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

- `src/routes/+page.svelte`: Dashboard pubblica — Flexbox wrapping con spacer items per DnD verticale. Celle responsive (`--cols` CSS variable, 1→5 colonne). Altezza minima `136px` per riga, auto-crescita per widget.
- `src/routes/admin/...`: Pannello di amministrazione (tab: Servizi, Categorie, Discovery, **Widget**, Impostazioni).
- `src/lib/components/widgets/`: Widget interattivi (`QBittorrentWidget.svelte`, `AdGuardWidget.svelte`).
- `src/lib/components/ui/TimeWheelPicker.svelte`: Selettore tempo a rotella per pausa temporizzata AdGuard.
- `src/lib/queries/`: Hook TanStack Query (`usePing.ts`, `useQbittorrent.ts`, `useAdGuard.ts`).
- `src/lib/config/widgetConstraints.ts`: Vincoli dimensionali per widget nella Bento Grid.
- `src/routes/api/widgets/`: Proxy endpoint per qBittorrent e AdGuard (bypass CORS, autenticazione server-side).
- `data/`: Volume persistente unico. Contiene:
  - `sqlite.db`: Database SQLite.
  - `icons/`: Cartella per upload fisici (garbage collector al logout). **Divieto:** Mai scrivere file persistenti in `static/uploads`.

## 🏗️ ARCHITETTURA WIDGET

I widget seguono un pattern architetturale rigoroso a 4 livelli:

1. **Admin Settings** (`src/routes/admin/components/Settings*Widget.svelte`): Form credenziali con crittografia AES-256-GCM.
2. **Proxy API** (`src/routes/api/widgets/*/+server.ts`): Endpoint SvelteKit che decripta le credenziali, si autentica col servizio target e restituisce dati puliti. Gestisce TLS self-signed con `undici` Agent custom (MAI bypass globale).
3. **TanStack Query Hook** (`src/lib/queries/use*.ts`): `createQuery` con `refetchInterval` configurato (3s per velocità, 30s per ping). Gestisce `isPending`, `isError`, `isSuccess`.
4. **Widget UI** (`src/lib/components/widgets/*Widget.svelte`): Componente Svelte 5 che consuma il query hook e renderizza stati (Skeleton → Errore → Dati).

### Drag & Drop (Bento Grid)

- **Libreria:** `svelte-dnd-action` v0.9.x.
- **Layout:** Flexbox con `flex-wrap` (NON CSS Grid) per compatibilità DnD. Larghezze celle calcolate via CSS custom property `--cols`.
- **Spacer Items:** In edit mode, 10 item invisibili (`_isSpacer: true`) vengono iniettati per creare target di rilascio su righe aggiuntive. Vengono filtrati nel salvataggio (`handleDndFinalize`).
- **Stato separato:** `localGroups` (view mode, senza spacer) e `dndGroups` (edit mode, con spacer). Transizione gestita da `$effect.pre` con `untrack()`.

## 🛡️ REGOLE BACKEND E SICUREZZA (TASSATIVE)

1. **Nessun Bypass TLS Globale:** Vietato usare `process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"`. Per interrogare servizi self-signed, inietta un `Agent` custom di `undici` (`rejectUnauthorized: false`) solo nella specifica chiamata `fetch`.
2. **Integrità Database e Migrazioni (Retrocompatibilità):** Per supportare il caricamento di vecchi backup `sqlite.db` che non possiedono la tabella `__drizzle_migrations`, **È VIETATO usare `migrate()`** di Drizzle in avvio. Ogni modifica allo schema deve essere fatta in due passaggi:
   - Aggiornare `src/lib/server/db/schema.ts` per Drizzle.
   - Aggiungere il codice di migrazione manuale in `src/lib/server/db/index.ts` usando `PRAGMA table_info(nome_tabella)` per verificare l'esistenza delle colonne prima di eseguire `ALTER TABLE ... ADD COLUMN ...`. Questo garantisce l'aggiornamento sicuro di istanze o backup esistenti. Le nuove tabelle vanno aggiunte al blocco `CREATE TABLE IF NOT EXISTS`.
3. **API Documentation:** Qualsiasi endpoint in `src/routes/api/` deve essere documentato nel file `ARCHITECTURE_AUDIT.md`.
4. **Proxy Multipart Streaming:** Per upload `multipart/form-data` via proxy SvelteKit (es. file `.torrent`), NON usare `new FormData()` lato Node — distrugge il boundary. Estrarre il `Content-Type` originale e streamare il body raw con `duplex: 'half'`.

## 🎨 STRATEGIA UI E THEMING

1. **Theming Assoluto (Zero Legacy):** L'app usa variabili HSL root. È SEVERAMENTE VIETATO usare classi cromatiche hardcodate (es. `bg-white`, `text-green-500`). Usa ESCLUSIVAMENTE variabili semantiche shadcn: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-destructive`.
2. **Layout e Spaziature:**
   - Evita classi come `space-y-*` o `space-x-*`. Usa `flex` combinato con `gap-*` per prevedibilità.
   - Usa `size-*` (es. `size-6`) al posto di `w-6 h-6`.
3. **Bento Grid Fluidity:** I contenuti delle Card devono essere fluidi (`w-full h-full`) e usare Flexbox per adattarsi dinamicamente ai formati espansi/verticali, preservando i padding. Le celle devono auto-crescere in altezza per il contenuto (MAI scrollbar nei widget).
4. **Modali e Dialoghi:** Mai modali custom sovrapposti. Usa i primitivi `<Dialog>` per UI o `<AlertDialog>` per conferme distruttive.
5. **Componenti DRY:** L'icona va delegata a `<ServiceIcon>`. I form di inserimento/modifica devono condividere `<ServiceForm>`, differenziando per `mode`.
6. **Iconografia:** Usa esclusivamente `lucide-svelte` per la UI strutturale.

## ⚙️ REGOLE DI VIBECODING

1. **Zero Regex:** Vietato usare `sed`, `awk` o script Python per iniettare codice. Analizza, comprendi il contesto e sovrascrivi l'intero componente in modo pulito.
2. **Lavoro Modulare & Verifica:** Lavora su un file alla volta. Prima di alterare lo stato reattivo (`$state`), valuta sempre l'impatto sulle librerie terze (come `svelte-dnd-action` o TanStack Query).
3. **Inizializza con la Ricerca:** Prima di ipotizzare come implementare una feature in Svelte 5 o Tailwind v4, usa i tool a tua disposizione (Skill + MCP) per verificare la sintassi corretta ed evitare allucinazioni su versioni vecchie dei framework.
4. **Root Pulita (Zero Spazzatura):** È SEVERAMENTE VIETATO creare file temporanei, script di test/debug, documenti di appoggio, lock file o qualsiasi artefatto IA nella directory principale del progetto. Se hai bisogno di file scratch, test one-off, note, o qualsiasi file di supporto, creali ESCLUSIVAMENTE nella directory `.gemini/` (es. `.gemini/scratch/`). La root del progetto deve contenere solo file che fanno parte integrante del codebase.
5. **Widget Pattern:** Per aggiungere un nuovo widget, segui SEMPRE il pattern a 4 livelli (Admin Settings → Proxy API → TanStack Hook → Widget UI). Non deviare dalla separazione delle responsabilità.
