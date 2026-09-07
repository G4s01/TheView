# UI Audit Report: TheView

A seguito di un'ispezione approfondita della UI basata sugli standard di **shadcn-svelte** e sulle direttive architetturali del progetto (Bento Grid readiness, Theming assoluto), ecco il report aggiornato.

## 1. Ispezione shadcn-svelte e Bonifica Legacy

L'audit ha confermato un diffuso utilizzo di classi utility Tailwind hardcodate (spesso relative a spaziature, form e colori non semantici) in vari componenti chiave, evidenziando alcune lacune nella precedente ispezione.

- **Classi Tailwind Legacy (Colori non semantici):**
  - `src/routes/+layout.svelte`: Estremamente legato alle classi vecchie. Utilizza ampiamente `bg-white`, `dark:bg-gray-*`, `text-gray-*`, `border-gray-*`, `shadow-sm`, `bg-blue-*`. (Es. riga 80, 94, 103, 118, 154, 190+).
  - `src/routes/+page.svelte`: Include fallback visivi legacy (`text-gray-900`, `dark:text-white`, `bg-blue-100`) alle righe 78, 80 e 124.
  - `src/routes/setup/+page.svelte`: Il card di setup usa `bg-white dark:bg-gray-800 shadow-xl border-gray-200 text-gray-900` (righe 51, 54, 55).
  - `src/lib/components/LoginModal.svelte`: Fa un forte uso di classi legacy per definire la finestra (`bg-white dark:bg-gray-800 border-gray-200 text-gray-900`) e usa `bg-black/50 z-50` al posto della gestione nativa del backdrop (riga 51 e 59).
  - `src/routes/admin/components/AdminDiscovery.svelte`: Pur usando in alcuni punti `bg-card` e `text-foreground`, ricorre a classi hardcodate come `bg-yellow-50`, `text-yellow-800` (riga 116), `bg-emerald-100` (riga 163) e un modale fatto a mano con `bg-gray-900/50 dark:bg-black/60` (riga 234). Utilizza anche `bg-gray-500` per i bottoni (riga 185).
  - **[NUOVO]** `src/lib/components/widgets/QBittorrentWidget.svelte`: Il componente ha ereditato classi cromatiche fisse come `border-gray-100 dark:border-gray-700/50`, `text-red-500`, `text-emerald-600` e `text-blue-600` (righe 42-55), ignorando i semantici `text-destructive` o `text-muted-foreground`.
  - **[NUOVO]** `src/lib/components/ServiceForm.svelte`: Utilizza bottoni con colori legacy come `bg-green-500 hover:bg-green-600 text-white` (righe 277, 281).
  - **[NUOVO]** `src/routes/admin/components/SettingsQBittorrentWidget.svelte`: Utilizza `bg-gray-500` su stati espansi (riga 41).

- **Incoerenze Form e Spaziature (Violazioni Best Practice shadcn):**
  - **Spaziature (`space-y-*`):** Il workflow nativo richiede `flex` e `gap-*`. Troviamo l'uso improprio di `space-y-*` in `LoginModal.svelte` (riga 69) e `AdminCategories.svelte` (riga 82).
  - **Form e Input:** `LoginModal.svelte` utilizza form markup nativo anziché `Field.FieldGroup` o l'`Input` di shadcn. 
  - **Dimensioni Esplicite:** In `AdminCategories.svelte` (riga 114) si usa `h-6 w-6` invece della utility moderna unificata `size-6`.

## 2. Proposte di Unificazione (Principio DRY)

L'analisi ha rivelato blocchi di codice duplicati che generano frizione. 

- **Modali Custom Duplicati:**
  Ci sono tre modali custom gestiti a mano con logiche del tutto disgiunte e background sovrapposti:
  - `LoginModal.svelte`
  - `AdminDiscovery.svelte` (Modale "Disconnetti NPM", riga 233)
  - `AdminCategories.svelte` (Modale "Elimina Categoria", riga 178)
  *Proposta:* Sostituire interamente con i primitivi **`AlertDialog`** (per alert distruttivi) e **`Dialog`** di shadcn-svelte.

- **Renderizzazione delle Icone dei Servizi (Estesa):**
  L'intera catena di fallback per le icone (`{#if ds.iconDetails} ... {:else if ds.icon} ... {:else} ...`) è copiata identicamente in **4** file distinti:
  - `AdminDiscovery.svelte` (righe 140-155)
  - `AdminCategories.svelte` (righe 123-134 e 142-153)
  - `AdminServices.svelte` (righe 172-187)
  - **[NUOVO]** `ServiceCard.svelte` (righe 160-173 e 233-246 - sfuggito all'ispezione precedente)
  *Proposta:* Creare un singolo componente `ServiceIcon.svelte` puro che gestisca logica di fallback, fallback su lettere e custom image styling, utilizzabile sia lato client (dashboard) che nel pannello admin.

## 3. Readiness per Temi Custom e Palette

Il report precedente aveva sollevato un **problema architetturale critico**, che confermo appieno:
- I temi definiti in `src/routes/layout.css` (`[data-theme="dracula"]`, `[data-theme="catppuccin-mocha"]`, ecc., da riga 83) vanno a sovrascrivere i colori legacy (`--color-gray-900: #282a36;`), ma **non rimappano le variabili semantiche di shadcn** (`--background`, `--foreground`, `--card`, `--border`).
- **Implicazione:** Passando al paradigma semantic-first (Fase 1), l'intero sistema di temi si romperà. I selettori di tema dovranno essere riscritti per sovrascrivere direttamente le HSL root di shadcn (`--background: 220 10% 10%`, ecc.).

## 4. Domande per lo Sviluppatore (Action Items)

Per procedere in modo sicuro con le modifiche Svelte e UI:

1. **Unificazione Modali:** Vuoi che adotti i primitivi `AlertDialog` / `Dialog` di shadcn-svelte **in-place** per ogni occorrenza, oppure preferisci un componente wrapper centralizzato (es. `<ConfirmModal>`) per astrarne la logica?
2. **Icone Centralizzate (`ServiceIcon.svelte`):** Il componente isolato dovrà gestire dinamicamente le dimensioni (es. tramite prop `size="sm" | "md" | "lg"`) per scalare da liste compatte (Admin) alla visualizzazione Bento, oppure vuoi imporre dimensioni basate sul layout parent (`w-full h-full`)?
3. **Colori di Stato e Badge (Warning/Success/Error):** Nelle aree come `QBittorrentWidget` e `AdminDiscovery` si usano blocchi colorati hardcodati (verdi/rossi). Posso mapparli utilizzando il primitivo `Badge` / `Alert` di shadcn (es. variant `destructive`), e aggiungere varianti semantiche al CSS (come `--success`, `--warning`), o preferisci evitare primitivi shadcn per i widget e usare solo text-color semantici nativi?
