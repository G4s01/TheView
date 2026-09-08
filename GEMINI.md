---
trigger: always_on
description: Contesto architetturale, vincoli e linee guida di TheView, con istruzioni esplicite sull'utilizzo delle skill e dell'MCP.
---

# 🪐 TheView - Antigravity Vibecoding Context

Benvenuto! Questo file contiene il contesto architetturale, i vincoli di sicurezza e il metodo di lavoro per **TheView**, progettato per massimizzare la tua autonomia e accuratezza tramite le **Skill locali** e il **Server MCP** integrati nel workspace.

## 📌 Cos'è TheView?

**TheView** è una dashboard web moderna per homelab e self-hosting. Utilizza un layout "Bento Grid" (Tetris-style) per organizzare link e widget interattivi in formati dinamici (1x1, 1x2, 2x1, 2x2).

## 🧠 INTEGRAZIONE SKILL E MCP (OBBLIGATORIA)

Per garantirti sempre il contesto più aggiornato e idiomatico, devi **SEMPRE** consultare e attivare le seguenti Skill a seconda del task in corso:

- 🟠 **Svelte 5 & SvelteKit**:
  - **Tooling (MCP):** Usa sempre il tool MCP `@sveltejs/mcp` (in `.agents/plugins/svelte-ai/`) per interrogare la documentazione ufficiale se hai dubbi sulle API.
  - **Skill:** Attiva `svelte-core-bestpractices` e `svelte-code-writer` per garantire un uso corretto e idiomatico di Runes (`$state`, `$derived`, `$props`, `$effect`).
- 🎨 **UI, Styling & Componenti**:
  - **Skill:** Attiva `shadcn-svelte` e `tailwind-v4-shadcn`. Usa la CLI di shadcn-svelte per aggiungere primitivi. Usa esplicitamente le utility v4 di Tailwind (es. `size-*`, gap flessibili) senza incappare in pattern legacy di v3.
- 🗄️ **Database (SQLite)**:
  - **Skill:** Attiva `drizzle` quando lavori sullo schema o sulle query.
- 🔄 **Data Fetching (in transizione)**:
  - **Skill:** Attiva `tanstack-query-best-practices` per gestire il caching, i polling e le mutazioni lato client.

## 📂 Struttura e Volumi (Docker)

- `src/routes/+page.svelte`: Dashboard pubblica (CSS Grid `grid-flow-dense` con `auto-rows-[136px]`).
- `src/routes/admin/...`: Pannello di amministrazione globale.
- `data/`: Volume persistente unico. Contiene:
  - `sqlite.db`: Database SQLite.
  - `icons/`: Cartella per upload fisici (garbage collector al logout). **Divieto:** Mai scrivere file persistenti in `static/uploads`.

## 🛡️ REGOLE BACKEND E SICUREZZA (TASSATIVE)

1. **Nessun Bypass TLS Globale:** Vietato usare `process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"`. Per interrogare servizi self-signed, inietta un `Agent` custom di `undici` (`rejectUnauthorized: false`) solo nella specifica chiamata `fetch`.
2. **Integrità Database (Drizzle-Only):** Non eseguire MAI query SQL grezze (`CREATE TABLE`, `ALTER TABLE`) per manipolare lo schema. Usa sempre e solo `migrate()` di `drizzle-orm/better-sqlite3/migrator`. Modifiche allo schema richiedono `drizzle-kit generate` come descritto nella skill.
3. **API Documentation:** Qualsiasi endpoint in `src/routes/api/` deve essere documentato nel file `ARCHITECTURE_AUDIT.md`.

## 🎨 STRATEGIA UI E THEMING

1. **Theming Assoluto (Zero Legacy):** L'app usa variabili HSL root. È SEVERAMENTE VIETATO usare classi cromatiche hardcodate (es. `bg-white`, `text-green-500`). Usa ESCLUSIVAMENTE variabili semantiche shadcn: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-destructive`.
2. **Layout e Spaziature:**
   - Evita classi come `space-y-*` o `space-x-*`. Usa `flex` combinato con `gap-*` per prevedibilità.
   - Usa `size-*` (es. `size-6`) al posto di `w-6 h-6`.
3. **Bento Grid Fluidity:** I contenuti delle Card devono essere fluidi (`w-full h-full`) e usare Flexbox per adattarsi dinamicamente ai formati espansi/verticali, preservando i padding.
4. **Modali e Dialoghi:** Mai modali custom sovrapposti. Usa i primitivi `<Dialog>` per UI o `<AlertDialog>` per conferme distruttive.
5. **Componenti DRY:** L'icona va delegata a `<ServiceIcon>`. I form di inserimento/modifica devono condividere `<ServiceForm>`, differenziando per `mode`.
6. **Iconografia:** Usa esclusivamente `lucide-svelte` per la UI strutturale.

## ⚙️ REGOLE DI VIBECODING

1. **Zero Regex:** Vietato usare `sed`, `awk` o script Python per iniettare codice. Analizza, comprendi il contesto e sovrascrivi l'intero componente in modo pulito.
2. **Lavoro Modulare & Verifica:** Lavora su un file alla volta. Prima di alterare lo stato reattivo (`$state`), valuta sempre l'impatto sulle librerie terze (come `svelte-dnd-action` o TanStack Query).
3. **Inizializza con la Ricerca:** Prima di ipotizzare come implementare una feature in Svelte 5 o Tailwind v4, usa i tool a tua disposizione (Skill + MCP) per verificare la sintassi corretta ed evitare allucinazioni su versioni vecchie dei framework.
4. **Root Pulita (Zero Spazzatura):** È SEVERAMENTE VIETATO creare file temporanei, script di test/debug, documenti di appoggio, lock file o qualsiasi artefatto IA nella directory principale del progetto. Se hai bisogno di file scratch, test one-off, note, o qualsiasi file di supporto, creali ESCLUSIVAMENTE nella directory `.gemini/` (es. `.gemini/scratch/`). La root del progetto deve contenere solo file che fanno parte integrante del codebase.
