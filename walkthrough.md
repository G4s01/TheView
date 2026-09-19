
### Fix Aggiunta Rapida Widget Singoli
- Risolto il problema con i form Meteo e Orologio per le impostazioni e la mancanza delle rispettive icone.
- **Aggiunta Rapida Widget**: Aggiunto un nuovo pulsante fluttuante (con l'icona di un pannello/dashboard) alla barra laterale destra/sinistra che compare durante l'`Edit Mode` in Home. Facendo clic, apre una piccola finestra modale di selezione rapida che mostra tutti i widget supportati (Orologio, Meteo, qBittorrent, AdGuard, ecc.). Facendo clic su uno di essi si crea e si posiziona automaticamente la "ServiceCard" configurata col widget, pronta per il ridimensionamento.

### Widget Settings Registry & Drag-and-Drop
- **Widget Settings Registry**: Creato `src/lib/config/widgetRegistry.ts` per centralizzare la definizione dei widget supportati e dei rispettivi campi di configurazione (URL, username, timezone, ecc.).
- **Dynamic Widget Form**: Introdotto un nuovo componente `DynamicWidgetForm.svelte` in grado di autogenerare form reattivi basati sulle definizioni del Registry, rimuovendo la necessità di hard-codare decine di file ogni volta che viene aggiunto un widget.
- **Refactoring AdminWidgets ed EditWidgetSettingsCard**: Entrambi i file sono stati semplificati e ridotti drastically, passando da lunghe catene di `if/else` a un semplice ciclo/mapping dei dati che passa il form generico alle view.
- **Drag & Drop Diretto su Griglia**: Cambiato il funzionamento del pulsante "Aggiungi Widget" per non limitarsi a cliccare e sperare che il widget finisca nell'inbox. Ora, all'interno del menù modale, i widget sono trascinabili. Trascinando l'icona di un widget in un punto qualsiasi di una griglia (anche creata al momento), Gridstack cattura il Drop (grazie a `setupDragIn`) ed effettua istantaneamente una POST al nuovo endpoint `/api/services/create` piazzando il widget fisicamente nel layout.
- **Nuova icona Aggiunta Widget**: Sostituita la controversa icona della dashboard con un'icona `Blocks` che risulta più intellegibile per l'utente.
- **Fix pulsante Aggiunta Widget**: Sostituita l'icona con `CloudSun` combinata a un piccolo badge `+` (come avviene per la Discovery). Aggiunto l'evento `$effect` reattivo che riesegue correttamente `GridStackClass.setupDragIn` ogni volta che viene aperto lo sheet, permettendo al sistema di catturare i widget come draggabili invece di selezionarne solo il testo.
