# 🪐 TheView - Antigravity Vibecoding Context

Benvenuto! Questo file contiene il contesto architetturale e il metodo di lavoro per **TheView**, in modo da poterti allineare immediatamente allo stack e alle preferenze dello sviluppatore.

## 📌 Cos'è TheView?
**TheView** è una dashboard web moderna per homelab e self-hosting, concepita come alternativa leggera, esteticamente appagante e dinamica. Il suo scopo è raccogliere i link ai vari servizi in un'unica pagina organizzata per categorie. 

## 🛠️ Tech Stack & Standard
- **Framework:** SvelteKit (Node Adapter) + Svelte 5 (uso estensivo di Runes: `$state`, `$derived`, `$props`).
- **Motore UI:** `shadcn-svelte` + Tailwind CSS v4.
- **Skill Attiva:** Hai a disposizione il comando `/shadcn-svelte`. Usalo SEMPRE come fonte di verità per generare, modificare o impaginare i primitivi UI, lasciandoti guidare dalle sue best practice per proporzioni e layout.
- **Iconografia:**
  - Servizi/Brand: ESCLUSIVAMENTE `dashboard-icons` (walkxcode).
  - UI Strutturale: ESCLUSIVAMENTE `lucide-svelte`.
- **Database:** SQLite tramite `better-sqlite3` e `drizzle-orm`. (Mai alterare lo schema a mano, usa sempre `drizzle-kit generate`).

## 📂 Struttura del Progetto
- `src/routes/+page.svelte`: Dashboard principale (layout "Bento Box" con CSS Grid).
- `src/routes/admin/...`: Pannello di amministrazione e impostazioni.
- `src/lib/server/discovery.ts`: Core logic per interrogare il demone Docker (update basati su digest SHA256).
- `data/`: Cartella persistita fuori dal container. Contiene `sqlite.db` (Single Source of Truth).
- `.gemini/`: Cartella per l'agente Antigravity. Non inquinare la root del progetto.

## 🧹 STRATEGIA ARCHITETTURALE E STILE (FASI 2, 3 & 4)
Stiamo ultimando la bonifica UI e preparando l'infrastruttura per la Bento Grid, il Theming dinamico e i futuri Widget. Segui queste direttive:
1. **Theming Assoluto (Zero Classi Legacy):** L'app deve supportare l'iniezione di palette custom a runtime. Distruggi attivamente classi come `bg-white`, `bg-gray-800`, `dark:bg-slate-900`. Usa SOLO variabili semantiche shadcn (`bg-card`, `bg-background`, `text-foreground`, `border-border`).
2. **Standardizzazione Dinamica (Skill-Led):** Abbandona i vecchi flex disallineati per i form. Usa CSS Grid per impaginare i campi, ma affidati alla tua skill `/shadcn-svelte` per stabilire le altezze ideali e i gap ottimali.
3. **Bento Grid Readiness:** Progetta i componenti, le card e i widget in modo che siano fluidi e pronti a inserirsi in un layout con span di righe/colonne dinamici (es. 1x1, 2x1, 2x2).
4. **Unificazione Componenti (DRY):** Usa un singolo componente riutilizzabile (es. `ServiceForm.svelte`) per aggiunta, modifica e Discovery. Gestisci le differenze tramite props (es. `mode="discovery"` pre-compila e nasconde il tasto elimina; `mode="edit"` mostra il tasto elimina). I tasti per annullare devono essere bottoni testuali (`variant="outline"`), non icone "X".
5. **Floating Labels:** Se usi etichette galleggianti, la `<Label>` in `absolute` DEVE avere `bg-card px-1` (o background equivalente del parent) per mascherare elegantemente il bordo dell'input.

## ⚙️ REGOLE DI VIBECODING TASSATIVE
1. **ZERO REGEX:** È severamente vietato usare `sed`, `awk` o script Python per "iniettare" codice. Analizza il file e sovrascrivilo per intero.
2. **Esecuzione Isolata:** Quando ricevi un task di UI, lavora su un componente alla volta per evitare di rompere il layout.
